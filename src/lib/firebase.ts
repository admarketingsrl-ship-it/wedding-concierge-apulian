import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  where
} from 'firebase/firestore';
import type { WeddingData, ChatMessage, TouristWishRequest } from '../data/weddingStore';
import defaultAppletConfig from '../../firebase-applet-config.json';

// Configurazione unificata Firebase:
// Priorità 1: variabili d'ambiente Vite (import.meta.env.VITE_FIREBASE_*)
// Priorità 2: firebase-applet-config.json
// Priorità 3: fallback sicuri per evitare qualsiasi blocco/schermata bianca all'avvio
const appletConfig = defaultAppletConfig as any;
export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || 'AIzaSyAPUrC6FHE2HpYU_dh8gP7saIr52RE5KlY').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || 'gen-lang-client-0402587731.firebaseapp.com').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || 'gen-lang-client-0402587731').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || 'gen-lang-client-0402587731.firebasestorage.app').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || '61212087334').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || '1:61212087334:web:25cabe0269ac60cadb02e7').trim(),
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || import.meta.env.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || 'ai-studio-apulianweddingco-1ff15041-9436-40c7-b041-d0fc01d844b8').trim(),
};

// Inizializzazione sicura di Firebase App (evita doppie inizializzazioni o crash se chiavi incomplete)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inizializzazione Firestore con database ID personalizzato se fornito
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Inizializzazione Firebase Auth
export const auth = getAuth(app);

// Test non-bloccante di connessione a Firestore
async function testConnection() {
  try {
    if (db) {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch (error) {
    // Non bloccante: l'app funziona regolarmente in modalità locale o con cache se offline
    console.warn("Verifica connessione Firebase (offline / fallback locale attivo):", error instanceof Error ? error.message : error);
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Pulisce l'oggetto rimuovendo campi undefined per Firestore
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';

/**
 * Assicura che un matrimonio non superi mai il limite Firestore di 1,048,576 bytes (1 MiB).
 * Se il documento è troppo pesante (es. foto base64 ad alta risoluzione), comprime o ripulisce le immagini.
 */
export function ensureWeddingUnderFirestoreLimit(wedding: WeddingData): WeddingData {
  const docCopy: WeddingData = JSON.parse(JSON.stringify(wedding));

  // Soglia di massima sicurezza: 750 KB (limite Firestore: 1,048,576 bytes)
  const MAX_SAFE_CHARS = 750 * 1024;
  let currentSize = JSON.stringify(docCopy).length;

  if (currentSize <= MAX_SAFE_CHARS) {
    return docCopy;
  }

  // 1. Controlla e ottimizza foto della galleria base64 pesanti (> 100KB)
  if (Array.isArray(docCopy.galleryPhotos) && docCopy.galleryPhotos.length > 0) {
    docCopy.galleryPhotos = docCopy.galleryPhotos.map((photo, idx) => {
      if (photo.url && photo.url.startsWith('data:image') && photo.url.length > 100 * 1024) {
        return {
          ...photo,
          url: `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80&sig=${idx}`
        };
      }
      return photo;
    });
    currentSize = JSON.stringify(docCopy).length;
  }

  // 2. Controlla e ottimizza immagine di copertina (bannerImage) se è un base64 enorme (> 150KB)
  if (currentSize > MAX_SAFE_CHARS && docCopy.bannerImage && docCopy.bannerImage.startsWith('data:image') && docCopy.bannerImage.length > 150 * 1024) {
    docCopy.bannerImage = FALLBACK_HERO_IMAGE;
    currentSize = JSON.stringify(docCopy).length;
  }

  // 3. Se ancora oltre soglia, limita la galleria alle ultime 10 foto
  if (currentSize > MAX_SAFE_CHARS && Array.isArray(docCopy.galleryPhotos) && docCopy.galleryPhotos.length > 10) {
    docCopy.galleryPhotos = docCopy.galleryPhotos.slice(0, 10);
    currentSize = JSON.stringify(docCopy).length;
  }

  // 4. Se ancora oltre soglia, controlla immagini dentro hotels o experiences
  if (currentSize > MAX_SAFE_CHARS && Array.isArray(docCopy.hotels)) {
    docCopy.hotels = docCopy.hotels.map(h => ({
      ...h,
      image: (h.image && h.image.startsWith('data:image') && h.image.length > 80 * 1024) ? FALLBACK_HERO_IMAGE : h.image
    }));
    currentSize = JSON.stringify(docCopy).length;
  }

  // 5. Se ancora oltre soglia, sostituisci tutte le immagini base64 rimanenti con fallback leggibile
  if (currentSize > MAX_SAFE_CHARS) {
    if (docCopy.bannerImage && docCopy.bannerImage.startsWith('data:image')) {
      docCopy.bannerImage = FALLBACK_HERO_IMAGE;
    }
    if (Array.isArray(docCopy.galleryPhotos)) {
      docCopy.galleryPhotos = docCopy.galleryPhotos.map((p, idx) => ({
        ...p,
        url: p.url.startsWith('data:image') ? `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80&sig=${idx}` : p.url
      }));
    }
  }

  // Se i soli album superano la soglia di sicurezza estrema, manteniamo fino a 50 scatti più recenti
  if (currentSize > MAX_SAFE_CHARS && Array.isArray(docCopy.weddingAlbumPhotos) && docCopy.weddingAlbumPhotos.length > 50) {
    docCopy.weddingAlbumPhotos = docCopy.weddingAlbumPhotos.slice(0, 50);
  }

  return docCopy;
}

/**
 * Salva o aggiorna un matrimonio su Firestore con protezione limite 1MB e ripristino automatico
 */
export async function saveWeddingToFirestore(wedding: WeddingData): Promise<void> {
  const docId = wedding.id || `wed-${Date.now()}`;
  const cleanCode = (wedding.weddingCode || `WED-${Date.now()}`).trim().toUpperCase();

  // Applica sanificazione preventiva per non superare mai 1MB
  const safeWedding = ensureWeddingUnderFirestoreLimit({
    ...wedding,
    id: docId,
    weddingCode: cleanCode,
  });

  const payload: WeddingData = sanitizeForFirestore(safeWedding);
  const path = `weddings/${docId}`;

  try {
    await setDoc(doc(db, 'weddings', docId), payload, { merge: true });
  } catch (error) {
    const errorStr = error instanceof Error ? error.message : String(error);
    // Recupero d'emergenza se Firestore rifiuta per dimensione (> 1,048,576 bytes)
    if (errorStr.includes('exceeds the maximum allowed size') || errorStr.includes('1,048,576 bytes')) {
      console.warn(`Firestore 1MB limit hit for weddings/${docId}. Stripping large base64 attachments and retrying...`);
      const emergencyWedding: WeddingData = {
        ...safeWedding,
        bannerImage: (safeWedding.bannerImage && safeWedding.bannerImage.startsWith('data:image'))
          ? FALLBACK_HERO_IMAGE
          : safeWedding.bannerImage,
        galleryPhotos: (safeWedding.galleryPhotos || []).map((p, idx) => ({
          ...p,
          url: (p.url && p.url.startsWith('data:image')) ? `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80&sig=${idx}` : p.url
        }))
      };
      try {
        await setDoc(doc(db, 'weddings', docId), sanitizeForFirestore(emergencyWedding), { merge: true });
        return;
      } catch (retryError) {
        handleFirestoreError(retryError, OperationType.WRITE, path);
      }
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Recupera tutti i matrimoni da Firestore
 */
export async function fetchWeddingsFromFirestore(): Promise<WeddingData[]> {
  const path = 'weddings';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: WeddingData[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as WeddingData;
      if (data && (data.weddingCode || data.id)) {
        list.push({
          ...data,
          id: docSnap.id,
          weddingCode: (data.weddingCode || docSnap.id).trim().toUpperCase()
        });
      }
    });
    return list;
  } catch (error) {
    console.warn('Lettura Firestore non disponibile (uso dati locali/offline):', error);
    return [];
  }
}

/**
 * Recupera un matrimonio per codice da Firestore
 */
export async function fetchWeddingByCodeFromFirestore(code: string): Promise<WeddingData | null> {
  if (!code) return null;
  const path = 'weddings';
  try {
    const weddings = await fetchWeddingsFromFirestore();
    const cleanTarget = code.trim().toUpperCase();
    const found = weddings.find(w => (w.weddingCode || '').trim().toUpperCase() === cleanTarget);
    return found || null;
  } catch (error) {
    console.warn('Lookup codice Firestore non disponibile:', error);
    return null;
  }
}

/**
 * Elimina un matrimonio da Firestore
 */
export async function deleteWeddingFromFirestore(weddingId: string, weddingCode: string): Promise<void> {
  const path = `weddings/${weddingId}`;
  try {
    // Traccia in localStorage i codici/ID eliminati per evitare resurrezione al sync/refresh
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('apulian_deleted_wedding_codes') || '[]');
      let changed = false;
      if (!deletedList.includes(weddingId)) {
        deletedList.push(weddingId);
        changed = true;
      }
      const cleanCode = (weddingCode || '').trim().toUpperCase();
      if (cleanCode && !deletedList.includes(cleanCode)) {
        deletedList.push(cleanCode);
        changed = true;
      }
      if (changed) {
        localStorage.setItem('apulian_deleted_wedding_codes', JSON.stringify(deletedList));
      }
    } catch {}

    await deleteDoc(doc(db, 'weddings', weddingId));

    // Cerca ed elimina anche per wedding_code se corrisponde
    const q = query(collection(db, 'weddings'), where('weddingCode', '==', weddingCode.toUpperCase()));
    const snap = await getDocs(q);
    for (const dSnap of snap.docs) {
      await deleteDoc(doc(db, 'weddings', dSnap.id));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Sottoscrizione Realtime ai matrimoni su Firestore
 */
export function subscribeToWeddingsFirestore(
  onUpdate: (weddings: WeddingData[]) => void
): () => void {
  const path = 'weddings';
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: WeddingData[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as WeddingData;
        if (data && (data.weddingCode || data.id)) {
          list.push({
            ...data,
            id: docSnap.id,
            weddingCode: (data.weddingCode || docSnap.id).trim().toUpperCase()
          });
        }
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
  return unsubscribe;
}

/**
 * Popola matrimoni demo se la collezione Firestore è vuota
 */
export async function seedDemoWeddingsIfEmptyFirestore(
  _initialWeddings: WeddingData[]): Promise<WeddingData[]> {
  try {
    const existing = await fetchWeddingsFromFirestore();
    return existing;
  } catch (error) {
    console.warn('Errore durante il recupero matrimoni da Firestore:', error);
    return [];
  }
}

/**
 * Salva un messaggio di chat su Firestore
 */
export async function sendChatMessageToFirestore(msg: ChatMessage): Promise<void> {
  const messageId = msg.id || `chat-${Date.now()}`;
  const payload: ChatMessage = sanitizeForFirestore({
    ...msg,
    id: messageId,
    timestamp: msg.timestamp || new Date().toISOString()
  });
  const path = `chat_messages/${messageId}`;
  try {
    await setDoc(doc(db, 'chat_messages', messageId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Recupera tutti i messaggi di chat da Firestore
 */
export async function fetchChatMessagesFromFirestore(): Promise<ChatMessage[]> {
  const path = 'chat_messages';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: ChatMessage[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as ChatMessage;
      if (data && data.text) {
        list.push({
          ...data,
          id: docSnap.id
        });
      }
    });
    // Ordina cronologicamente
    list.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Sottoscrizione Realtime ai messaggi di chat su Firestore
 */
export function subscribeToChatMessagesFirestore(
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const path = 'chat_messages';
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as ChatMessage;
        if (data && data.text) {
          list.push({
            ...data,
            id: docSnap.id
          });
        }
      });
      list.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
  return unsubscribe;
}

/**
 * Salva un desiderio (wish) su Firestore
 */
export async function saveWishToFirestore(wish: TouristWishRequest): Promise<void> {
  const wishId = wish.id || `wish-${Date.now()}`;
  const payload: TouristWishRequest = sanitizeForFirestore({
    ...wish,
    id: wishId,
    createdAt: wish.createdAt || new Date().toISOString()
  });
  const path = `wishes/${wishId}`;
  try {
    await setDoc(doc(db, 'wishes', wishId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Recupera tutti i desideri da Firestore
 */
export async function fetchWishesFromFirestore(): Promise<TouristWishRequest[]> {
  const path = 'wishes';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: TouristWishRequest[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as TouristWishRequest;
      if (data && data.title) {
        list.push({
          ...data,
          id: docSnap.id
        });
      }
    });
    return list;
  } catch (error) {
    console.warn('Lettura desideri Firestore non disponibile:', error);
    return [];
  }
}

/**
 * Sottoscrizione Realtime ai desideri su Firestore
 */
export function subscribeToWishesFirestore(
  onUpdate: (wishes: TouristWishRequest[]) => void
): () => void {
  const path = 'wishes';
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: TouristWishRequest[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as TouristWishRequest;
        if (data && data.title) {
          list.push({
            ...data,
            id: docSnap.id
          });
        }
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
  return unsubscribe;
}

/**
 * Elimina tutti i desideri correlati a un codice matrimonio da Firestore
 */
export async function deleteWishesByWeddingCodeFromFirestore(weddingCode: string): Promise<void> {
  if (!weddingCode) return;
  const normTarget = weddingCode.trim().toUpperCase().replace(/[\s\-_]+/g, '');
  try {
    const snapshot = await getDocs(collection(db, 'wishes'));
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const code = data?.weddingCode || '';
      if (code.trim().toUpperCase().replace(/[\s\-_]+/g, '') === normTarget) {
        await deleteDoc(doc(db, 'wishes', docSnap.id));
      }
    }
  } catch (error) {
    console.warn('Errore cancellazione desideri da Firestore:', error);
  }
}

/**
 * Elimina tutti i messaggi di chat correlati a un codice matrimonio da Firestore
 */
export async function deleteChatMessagesByWeddingCodeFromFirestore(weddingCode: string): Promise<void> {
  if (!weddingCode) return;
  const normTarget = weddingCode.trim().toUpperCase().replace(/[\s\-_]+/g, '');
  try {
    const snapshot = await getDocs(collection(db, 'chat_messages'));
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const code = data?.weddingCode || '';
      if (code.trim().toUpperCase().replace(/[\s\-_]+/g, '') === normTarget) {
        await deleteDoc(doc(db, 'chat_messages', docSnap.id));
      }
    }
  } catch (error) {
    console.warn('Errore cancellazione chat da Firestore:', error);
  }
}


