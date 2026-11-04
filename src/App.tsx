import { useState, useEffect } from 'react';
import {
  saveWeddingToFirestore,
  ensureWeddingUnderFirestoreLimit,
  fetchWeddingsFromFirestore,
  fetchWeddingByCodeFromFirestore,
  deleteWeddingFromFirestore,
  subscribeToWeddingsFirestore,
  seedDemoWeddingsIfEmptyFirestore,
  sendChatMessageToFirestore,
  fetchChatMessagesFromFirestore,
  subscribeToChatMessagesFirestore,
  saveWishToFirestore,
  fetchWishesFromFirestore,
  subscribeToWishesFirestore
} from './lib/firebase';
import { signUpUser, signInUser, signOutUser } from './lib/auth';
import { 
  Building2, 
  Compass, 
  Sparkles, 
  Users, 
  Lock, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  MessageCircle,
  Package,
  HeartHandshake,
  FileText,
  X,
  Phone,
  Mail,
  MapPin,
  Heart,
  RefreshCw,
  Check,
  CheckCircle2,
  Menu,
  Car,
  Camera,
  Info,
  Gift,
  Lightbulb,
  ShoppingCart,
  CreditCard,
  Scissors,
  Calendar
} from 'lucide-react';
import HamburgerMenu, { MenuItem } from './components/HamburgerMenu';
import HomeLogin from './components/HomeLogin';
import AdminPanel from './components/AdminPanel';
import GuestPortal from './components/GuestPortal';
import SupplierPortal from './components/SupplierPortal';
import CouplePortal from './components/CouplePortal';
import AgencyDashboard from './components/AgencyDashboard';
import { 
  INITIAL_WEDDINGS, 
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIER_PACKAGES,
  INITIAL_SUPPLIER_BOOKINGS,
  INITIAL_WISH_REQUESTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_PAYMENT_REQUESTS,
  WeddingData,
  MasterSupplier,
  SupplierPackage,
  SupplierBookingOrder,
  TouristWishRequest,
  ChatMessage,
  PaymentRequest,
  AdminSettings,
  HotelItem,
  WeddingAlertNotification
} from './data/weddingStore';


// Fallback globale di sicurezza a livello di modulo:
// Garantisce che savedSessionMeta, setSavedSessionMeta e SESSION_STORAGE_KEY siano SEMPRE definiti,
// prevenendo qualsiasi ReferenceError a runtime sia in locale che su Vercel.
export const savedSessionMeta: { role: string; name?: string; details?: string } | null = null;
export const setSavedSessionMeta = (_meta: any) => {};
export const SESSION_STORAGE_KEY = 'apulian_concierge_session_v1';

export default function App() {
  // Storage key per catalogo matrimoni (v5 pulita con gli 8 matrimoni ufficiali dell'agenzia)
  const WEDDINGS_STORAGE_KEY = 'apulian_weddings_data_v5';

  const getDeletedCodes = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('apulian_deleted_wedding_codes') || '[]');
    } catch {
      return [];
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database State - Persistito per salvare nuovi matrimoni creati dall'agenzia
  const [weddings, setWeddings] = useState<WeddingData[]>(() => {
    try {
      // Pulizia automatica versioni legacy con dati demo vecchi
      localStorage.removeItem('apulian_weddings_data_v1');
      localStorage.removeItem('apulian_weddings_data_v2');
      localStorage.removeItem('apulian_weddings_data_v3');
      localStorage.removeItem('apulian_weddings_data_v4');

      const stored = localStorage.getItem(WEDDINGS_STORAGE_KEY);
      const deletedCodes = getDeletedCodes();
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const clean = parsed
            .filter(w => {
              const code = (w.weddingCode || '').trim().toUpperCase();
              const id = (w.id || '').trim();
              return !deletedCodes.includes(code) && !deletedCodes.includes(id);
            })
            .map(w => ensureWeddingUnderFirestoreLimit(w));
          
          return clean;
        }
      }
    } catch {}
    return [];
  });
  const [suppliers, setSuppliers] = useState<MasterSupplier[]>(INITIAL_SUPPLIERS);
  const [packages, setPackages] = useState<SupplierPackage[]>(INITIAL_SUPPLIER_PACKAGES);
  const [bookingOrders, setBookingOrders] = useState<SupplierBookingOrder[]>(() => {
    try {
      const stored = localStorage.getItem('apulian_booking_orders_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return INITIAL_SUPPLIER_BOOKINGS;
  });
  const [wishRequests, setWishRequests] = useState<TouristWishRequest[]>(() => {
    try {
      const stored = localStorage.getItem('apulian_wish_requests_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_WISH_REQUESTS;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('apulian_chat_messages_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CHAT_MESSAGES;
  });

  // Sincronizzazione permanente locale e remota con il backend Express /api/chat
  useEffect(() => {
    try {
      localStorage.setItem('apulian_chat_messages_v1', JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  // Sincronizzazione permanente locale dei desideri (wishlist)
  useEffect(() => {
    try {
      localStorage.setItem('apulian_wish_requests_v1', JSON.stringify(wishRequests));
    } catch {}
  }, [wishRequests]);

  // Polling e sincronizzazione real-time tra ospite, cliente e agenzia (multi-device e cross-browser)
  let isChatSyncInFlight = false;
  const syncChatWithBackend = async () => {
    if (isChatSyncInFlight) return;
    isChatSyncInFlight = true;
    try {
      const res = await fetch('/api/chat');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.messages)) {
          setChatMessages(prev => {
            const map = new Map<string, ChatMessage>();
            // I messaggi dal server hanno la priorità
            data.messages.forEach((m: ChatMessage) => map.set(m.id, m));
            // Aggiungi eventuali messaggi locali non ancora sincronizzati
            prev.forEach(m => {
              if (!map.has(m.id)) map.set(m.id, m);
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('apulian_chat_messages_v1', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    } catch {
      // Fallback offline non bloccante
    } finally {
      isChatSyncInFlight = false;
    }
  };

  let isWishSyncInFlight = false;
  const syncWishesWithBackend = async () => {
    if (isWishSyncInFlight) return;
    isWishSyncInFlight = true;
    try {
      const res = await fetch('/api/wishes');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.wishes)) {
          setWishRequests(prev => {
            const map = new Map<string, TouristWishRequest>();
            data.wishes.forEach((w: TouristWishRequest) => map.set(w.id, w));
            prev.forEach(w => {
              if (!map.has(w.id)) map.set(w.id, w);
            });
            const merged = Array.from(map.values()).sort((a, b) => 
              (b.createdAt || '').localeCompare(a.createdAt || '')
            );
            try {
              localStorage.setItem('apulian_wish_requests_v1', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    } catch {
      // Fallback offline non bloccante
    } finally {
      isWishSyncInFlight = false;
    }
  };

  useEffect(() => {
    // 1. Sottoscrizione Realtime Firestore per la chat istantanea
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = subscribeToChatMessagesFirestore((firestoreMsgs) => {
        if (!firestoreMsgs || firestoreMsgs.length === 0) return;
        setChatMessages(prev => {
          const map = new Map<string, ChatMessage>();
          prev.forEach(m => map.set(m.id, m));
          firestoreMsgs.forEach(m => map.set(m.id, m));
          const merged = Array.from(map.values()).sort((a, b) => 
            (a.timestamp || '').localeCompare(b.timestamp || '')
          );
          try {
            localStorage.setItem('apulian_chat_messages_v1', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      });
    } catch (err) {
      console.warn('Errore sottoscrizione Firestore chat:', err);
    }

    // 2. Fetch di backup iniziale dal server locale/Express
    syncChatWithBackend();
    syncWishesWithBackend();
    const interval = setInterval(syncChatWithBackend, 5000);
    const wishInterval = setInterval(syncWishesWithBackend, 3000);

    // Canale real-time cross-tab BroadcastChannel per la chat
    const chatChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('apulian_chat_sync') : null;
    if (chatChannel) {
      chatChannel.onmessage = (event) => {
        if (event.data?.message) {
          const incoming: ChatMessage = event.data.message;
          setChatMessages(prev => {
            if (prev.some(m => m.id === incoming.id)) return prev;
            const next = [...prev, incoming];
            try {
              localStorage.setItem('apulian_chat_messages_v1', JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      };
    }

    // Canale real-time cross-tab BroadcastChannel per i desideri (wishlist)
    const wishChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('apulian_wishes_sync') : null;
    if (wishChannel) {
      wishChannel.onmessage = (event) => {
        if (event.data?.wish) {
          const incoming: TouristWishRequest = event.data.wish;
          setWishRequests(prev => {
            const map = new Map<string, TouristWishRequest>();
            prev.forEach(w => map.set(w.id, w));
            map.set(incoming.id, incoming);
            const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            try {
              localStorage.setItem('apulian_wish_requests_v1', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'apulian_chat_messages_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setChatMessages(parsed);
          }
        } catch {}
      }
      if (e.key === 'apulian_wish_requests_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setWishRequests(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Sottoscrizione Realtime Firestore per i desideri (wishes)
    let unsubscribeWishes: (() => void) | null = null;
    try {
      unsubscribeWishes = subscribeToWishesFirestore((firestoreWishes) => {
        if (!firestoreWishes || firestoreWishes.length === 0) return;
        setWishRequests(prev => {
          const map = new Map<string, TouristWishRequest>();
          prev.forEach(w => map.set(w.id, w));
          firestoreWishes.forEach(w => map.set(w.id, w));
          const merged = Array.from(map.values()).sort((a, b) => 
            (b.createdAt || '').localeCompare(a.createdAt || '')
          );
          try {
            localStorage.setItem('apulian_wish_requests_v1', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      });
    } catch (err) {
      console.warn('Errore sottoscrizione Firestore wishes:', err);
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (unsubscribeWishes) unsubscribeWishes();
      clearInterval(interval);
      clearInterval(wishInterval);
      window.removeEventListener('storage', handleStorage);
      if (chatChannel) chatChannel.close();
      if (wishChannel) wishChannel.close();
    };
  }, []);

  const SETTINGS_STORAGE_KEY = 'apulian_admin_settings_v2';
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
      const stored = localStorage.getItem('apulian_admin_settings_v2');
      if (stored) {
        return { ...INITIAL_ADMIN_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {}
    return INITIAL_ADMIN_SETTINGS;
  });

  const handleUpdateAdminSettings = (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch {}
  };

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(INITIAL_PAYMENT_REQUESTS);

  // Stato Autenticazione & Ruolo
  const [authRole, setAuthRole] = useState<'guest' | 'couple' | 'admin' | 'supplier' | null>(null);
  const [lang, setLang] = useState<'it' | 'en'>(
    (typeof navigator !== 'undefined' && navigator.language.startsWith('en')) ? 'en' : 'it'
  );
  
  const [currentGuest, setCurrentGuest] = useState<{
    name: string;
    email: string;
    phone?: string;
    weddingCode: string;
    provider: 'google' | 'apple' | 'email';
    country?: string;
  } | null>(null);
  const [currentCoupleWeddingCode, setCurrentCoupleWeddingCode] = useState<string>('CHIARA-MATTEO-2026');
  const [currentSupplierId, setCurrentSupplierId] = useState<string>(INITIAL_SUPPLIERS[0].id);

  // Vista Attiva (Home, Ospite, Sposi, Admin, Fornitore, Dashboard)
  const [currentView, setCurrentView] = useState<'home' | 'guest' | 'couple' | 'admin' | 'supplier' | 'dashboard'>('home');
  const [isLateralMenuOpen, setIsLateralMenuOpen] = useState(false);
  const [guestActiveTab, setGuestActiveTab] = useState<'couple-info' | 'rsvp' | 'hotels' | 'transfers' | 'experiences' | 'services' | 'wishes' | 'chat' | 'itinerary' | 'payments' | 'album'>('couple-info');
  const [coupleActiveTab, setCoupleActiveTab] = useState<'details' | 'photos' | 'secondary' | 'gift-services' | 'communication' | 'guests' | 'chat'>('details');

  // Modali Informative Legali Footer (AD Marketing Palagianello TA)
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'cookies' | 'terms' | null>(null);

  // Ripristino Automatico all'avvio usando Sessione salvata
  useEffect(() => {
    // 2. Ripristino rapido sessione locale memorizzata
    try {
      const savedRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedRaw) {
        const session = JSON.parse(savedRaw);
        if (session?.role) {
          setAuthRole(session.role);
          if (session.role === 'admin') setCurrentView('admin');
          if (session.role === 'couple') {
            setCurrentView('couple');
            setCurrentCoupleWeddingCode(session.coupleWeddingCode);
          }
          if (session.role === 'guest') {
            setCurrentView('guest');
            setCurrentGuest(session.guestInfo);
          }
          
          setSavedSessionMeta({
            role: session.role,
            name: session.name || session.guestInfo?.name || session.role,
            details: session.details || session.guestInfo?.weddingCode || ''
          });
        }
      }
    } catch {}
  }, []);

  // Login Ospite con memoria e lookup immediato
  const handleGuestLogin = async (
    guestInfo: { 
      name: string; 
      email: string; 
      phone: string;
      weddingCode: string; 
      provider: 'google' | 'apple' | 'email'; 
      country?: string 
    },
    rememberMe: boolean = true
  ) => {
    const cleanCode = (guestInfo.weddingCode || '').trim().toUpperCase();
    
    // Assicurati che il matrimonio sia nel catalogo prima di entrare
    const existing = weddings.find(w => {
      const c = (w.weddingCode || '').trim().toUpperCase();
      return c === cleanCode || c.replace(/[\s\-_]+/g, '') === cleanCode.replace(/[\s\-_]+/g, '');
    });

    if (!existing) {
      try {
        const foundOnline = await fetchWeddingByCodeFromFirestore(cleanCode);
        if (foundOnline) {
          // handleWeddingDiscovered(foundOnline);
          setWeddings(prev => [...prev, foundOnline]);
        }
      } catch (e) {
        console.warn('Lookup online durante login ospite:', e);
      }
    }

    if (guestInfo.provider === 'email' && guestInfo.email) {
      try {
        await signUpUser(guestInfo.email, 'TemporaryPassword123!', guestInfo.name, 'guest');
      } catch (e: any) {
        if (e?.message?.includes('already registered')) {
          try {
            await signInUser(guestInfo.email, 'TemporaryPassword123!');
          } catch {}
        }
      }
    }

    setAuthRole('guest');
    setCurrentGuest(guestInfo);
    setCurrentView('guest');

    // Registra subito l'ospite nella lista del matrimonio se non è già presente
    handleSaveGuestChoices({
      name: guestInfo.name,
      email: guestInfo.email,
      phone: guestInfo.phone,
      weddingCode: cleanCode,
      country: guestInfo.country || 'Italia'
    });

    if (rememberMe) {
      const session = {
        role: 'guest',
        guestInfo,
        name: guestInfo.name,
        details: `Codice Nozze: ${guestInfo.weddingCode}`,
        savedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {}
      setSavedSessionMeta({ role: 'guest', name: guestInfo.name, details: guestInfo.weddingCode });
    }
  };

  // Login Sposi con memoria e lookup immediato (Codice Matrimonio, Email Sposa, Password)
  const handleCoupleLogin = async (code: string, email?: string, rememberMe: boolean = true) => {
    const cleanCode = (code || '').trim().toUpperCase();

    // Verifica se il matrimonio è già in memoria o va cercato sul server
    let coupleWed = weddings.find(w => {
      const c = (w.weddingCode || '').trim().toUpperCase();
      return c === cleanCode || c.replace(/[\s\-_]+/g, '') === cleanCode.replace(/[\s\-_]+/g, '');
    });

    if (!coupleWed) {
      try {
        const foundOnline = await fetchWeddingByCodeFromFirestore(cleanCode);
        if (foundOnline) {
          setWeddings(prev => [...prev, foundOnline]);
          coupleWed = foundOnline;
        }
      } catch (e) {
        console.warn('Lookup online durante login sposi:', e);
      }
    }

    setAuthRole('couple');
    setCurrentCoupleWeddingCode(cleanCode);
    setCurrentGuest(null);
    setCurrentView('couple');

    const cNames = coupleWed?.coupleNames || cleanCode;
    const brideEmail = email || coupleWed?.coupleEmail || '';

    if (rememberMe) {
      const session = {
        role: 'couple',
        coupleWeddingCode: cleanCode,
        coupleEmail: brideEmail,
        name: cNames,
        details: `Area Sposi - ${cleanCode}`,
        savedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {}
      setSavedSessionMeta({ role: 'couple', name: cNames, details: cleanCode });
    }
  };

  // Sincronizzazione automatica e costante catalogo matrimoni da Firestore e backend (Multi-Device, Multi-User e Real-Time)
  useEffect(() => {
    let isMounted = true;

    let isWeddingsSyncInFlight = false;
    const syncWeddings = async () => {
      if (isWeddingsSyncInFlight) return;
      isWeddingsSyncInFlight = true;
      try {
        // 1. Fetch da Firestore
        try {
          let firestoreWeddings = await fetchWeddingsFromFirestore();
          const deletedCodes = getDeletedCodes();
          firestoreWeddings = firestoreWeddings.filter(w => {
            const code = (w.weddingCode || '').trim().toUpperCase();
            const id = (w.id || '').trim();
            return !deletedCodes.includes(code) && !deletedCodes.includes(id);
          });

          if (isMounted && firestoreWeddings) {
            setWeddings(firestoreWeddings);
            try {
              localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(firestoreWeddings));
            } catch {}
          }
        } catch (fErr) {
          console.warn('Errore lettura matrimoni Firestore:', fErr);
        }

      } catch (err) {
        console.error('Errore recupero matrimoni:', err);
      } finally {
        isWeddingsSyncInFlight = false;
      }
    };

    syncWeddings();
    // Polling calmo ogni 20 secondi (gli aggiornamenti istantanei avvengono via Firestore Realtime & BroadcastChannel)
    const interval = setInterval(syncWeddings, 20000);

    // Sottoscrizione Firestore Realtime
    let unsubscribeFirestoreWeddings: (() => void) | null = null;
    try {
      unsubscribeFirestoreWeddings = subscribeToWeddingsFirestore((firestoreList) => {
        if (!isMounted || !firestoreList) return;
        const deletedCodes = getDeletedCodes();
        const filteredList = firestoreList.filter(w => {
          const code = (w.weddingCode || '').trim().toUpperCase();
          const id = (w.id || '').trim();
          return !deletedCodes.includes(code) && !deletedCodes.includes(id);
        });
        setWeddings(filteredList);
        try {
          localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(filteredList));
        } catch {}
      });
    } catch (err) {
      console.warn('Errore sottoscrizione Firestore matrimoni:', err);
    }

    // Canale real-time cross-tab BroadcastChannel
    const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('apulian_weddings_sync') : null;
    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === 'ALL_SYNCED' || event.data?.type === 'FORCE_REFRESH') {
          syncWeddings();
        } else if (event.data?.wedding) {
          const incoming: WeddingData = event.data.wedding;
          setWeddings(prev => {
            const cleanTarget = (incoming.weddingCode || incoming.id).trim().toUpperCase();
            const idx = prev.findIndex(w => w.id === incoming.id || (w.weddingCode || '').trim().toUpperCase() === cleanTarget);
            let next: WeddingData[];
            if (idx >= 0) {
              next = [...prev];
              next[idx] = incoming;
            } else {
              next = [incoming, ...prev];
            }
            try {
              localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === WEDDINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWeddings(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      if (unsubscribeFirestoreWeddings) unsubscribeFirestoreWeddings();
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Aggiunge una segnalazione / notifica di avviso per un matrimonio specifico (da sposi o ospiti)
  const addWeddingNotification = (
    weddingCode: string,
    notif: {
      source: WeddingAlertNotification['source'];
      authorName: string;
      authorRole: 'ospite' | 'sposi';
      title: string;
      description: string;
      actionTab?: WeddingAlertNotification['actionTab'];
    }
  ) => {
    const cleanCode = (weddingCode || '').trim().toUpperCase();
    const cleanNorm = cleanCode.replace(/[\s\-_]+/g, '');
    const nowTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const newAlert: WeddingAlertNotification = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      weddingCode: cleanCode,
      source: notif.source,
      authorName: notif.authorName,
      authorRole: notif.authorRole,
      title: notif.title,
      description: notif.description,
      timestamp: `Oggi, ${nowTime}`,
      read: false,
      actionTab: notif.actionTab || 'weddings'
    };

    setWeddings(prev => {
      const updated = prev.map(w => {
        const wCode = (w.weddingCode || w.id).trim().toUpperCase();
        if (wCode === cleanCode || wCode.replace(/[\s\-_]+/g, '') === cleanNorm) {
          const existingNotifs = (w.notifications || []).filter(n => n.id !== newAlert.id);
          return {
            ...w,
            notifications: [newAlert, ...existingNotifs]
          };
        }
        return w;
      });

      try {
        localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      const targetW = updated.find(w => (w.weddingCode || w.id).trim().toUpperCase() === cleanCode);
      if (targetW) {
        saveWeddingToFirestore(targetW).catch(() => {});
      }

      return updated;
    });

    setSyncFeedback(`Nuova segnalazione da ${notif.authorName} (${notif.authorRole}): ${notif.title}`);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  // Aggiornamento singolo matrimonio (dall'area sposi o admin con propagazione immediata)
  const handleUpdateSingleWedding = async (updatedWedding: WeddingData) => {
    const cleanTarget = (updatedWedding.weddingCode || updatedWedding.id).trim().toUpperCase();
    const cleanNormalized = cleanTarget.replace(/[\s\-_]+/g, '');

    // Se l'aggiornamento proviene dall'area sposi, genera una segnalazione di avviso
    if (authRole === 'couple') {
      const nowTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      const coupleAlert: WeddingAlertNotification = {
        id: `alert-${Date.now()}`,
        weddingCode: cleanTarget,
        source: 'COUPLE_UPDATE',
        authorName: updatedWedding.coupleNames || 'Sposi',
        authorRole: 'sposi',
        title: `Aggiornamento dettagli matrimonio dagli sposi`,
        description: `Modificati programma, location o annunci per ${updatedWedding.coupleNames}`,
        timestamp: `Oggi, ${nowTime}`,
        read: false,
        actionTab: 'weddings'
      };
      updatedWedding.notifications = [coupleAlert, ...(updatedWedding.notifications || [])];
    }

    const updated = weddings.map(w => {
      const c = (w.weddingCode || w.id).trim().toUpperCase();
      return (w.id === updatedWedding.id || c === cleanTarget || c.replace(/[\s\-_]+/g, '') === cleanNormalized)
        ? updatedWedding
        : w;
    });

    handleUpdateWeddings(updated);
    await saveWeddingToFirestore(updatedWedding);

    // Notifica istantanea via BroadcastChannel ad altri tab (Ospiti, Sposi, Admin)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apulian_weddings_sync');
        bc.postMessage({ type: 'WEDDING_UPDATED', wedding: updatedWedding });
        bc.close();
      }
    } catch {}
  };

  // Aggiornamento catalogo matrimoni, salvataggio locale e sincronizzazione backend immediata
  const handleUpdateWeddings = (updated: WeddingData[]) => {
    setWeddings(updated);
    try {
      localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Sincronizza su Firestore per persistenza real-time cloud
    updated.forEach(w => {
      saveWeddingToFirestore(w).catch(() => {});
    });

    // Sincronizza immediatamente sul server per renderlo visibile a tutti gli accessi
    try {
      fetch('/api/weddings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddings: updated })
      }).catch(() => {});
    } catch {}

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apulian_weddings_sync');
        bc.postMessage({ type: 'ALL_SYNCED', weddings: updated });
        bc.close();
      }
    } catch {}
  };

  // Integrazione dinamica matrimonio scoperto via codice dal login
  const handleWeddingDiscovered = (discoveredWedding: WeddingData) => {
    if (!discoveredWedding || !discoveredWedding.weddingCode) return;
    setWeddings(prev => {
      const cleanTarget = discoveredWedding.weddingCode.trim().toUpperCase();
      const existingIdx = prev.findIndex(
        w => w.id === discoveredWedding.id || w.weddingCode.trim().toUpperCase() === cleanTarget
      );
      let next: WeddingData[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = { ...next[existingIdx], ...discoveredWedding };
      } else {
        next = [discoveredWedding, ...prev];
      }
      try {
        localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Ripristino dati demo per pulizia completa
  const handleResetToDemoWedding = () => {
    setWeddings(INITIAL_WEDDINGS);
    try {
      localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(INITIAL_WEDDINGS));
    } catch {}
  };

  // Registrazione autonoma hotel dal portale
  const handleRegisterHotel = (hotelData: {
    name: string;
    stars: number;
    city: string;
    address: string;
    contactPerson: string;
    email: string;
    phone: string;
    standardRate: number;
    websiteUrl: string;
    bookingEngineType: 'DIRECT_ENGINE' | 'BOOKING_COM';
    roomTypeName: string;
    roomsBlocked: number;
    password?: string;
    negotiatedPerk?: string;
  }) => {
    const newSupId = `sup-hotel-${Date.now()}`;
    const newSup: MasterSupplier = {
      id: newSupId,
      name: hotelData.name,
      category: 'HOTEL',
      stars: hotelData.stars,
      city: hotelData.city,
      address: hotelData.address,
      contactPerson: hotelData.contactPerson,
      email: hotelData.email,
      phone: hotelData.phone,
      standardRate: hotelData.standardRate,
      commissionPercent: 12,
      notes: 'Struttura registrata direttamente tramite il portale fornitori.',
      accessPassword: hotelData.password || 'fornitore2026',
      welcomeEmailSent: true,
      emailSentAt: new Date().toISOString(),
      websiteUrl: hotelData.websiteUrl,
      bookingEngineType: hotelData.bookingEngineType,
      negotiatedPerk: hotelData.negotiatedPerk,
      roomTypes: [
        {
          id: `rt-${Date.now()}`,
          name: hotelData.roomTypeName,
          pricePerNight: hotelData.standardRate,
          totalBlocked: hotelData.roomsBlocked,
          availableRooms: hotelData.roomsBlocked,
          maxOccupancy: 2
        }
      ]
    };

    setSuppliers(prev => [...prev, newSup]);

    const newHotelItem: HotelItem = {
      id: `hotel-${Date.now()}`,
      name: hotelData.name,
      stars: hotelData.stars,
      address: hotelData.address,
      distanceToVenue: 'Struttura convenzionata nozze',
      negotiatedRate: hotelData.standardRate,
      currency: 'EUR',
      bookingDeadline: '2026-07-31',
      groupCode: weddings[0]?.weddingCode || 'WEDDING-PUGLIA',
      supplierId: newSupId,
      websiteUrl: hotelData.websiteUrl,
      bookingEngineType: hotelData.bookingEngineType,
      negotiatedPerk: hotelData.negotiatedPerk,
      pricingManagedByAgency: true,
      agencyPricingNotes: 'Tariffa di riferimento registrata dalla scheda. Lo staff agenzia valuterà i giorni e inserirà la quotazione esatta.',
      roomTypes: newSup.roomTypes || []
    };

    const updatedWeddings = weddings.map(w => ({ ...w, hotels: [...w.hotels, newHotelItem] }));
    handleUpdateWeddings(updatedWeddings);
  };

  const handleAdminLogin = (rememberMe: boolean = true) => {
    setAuthRole('admin');
    setCurrentGuest(null);
    setCurrentView('admin');

    if (rememberMe) {
      const session = {
        role: 'admin',
        name: 'Staff AD Marketing Concierge',
        details: 'Back Office Direzionale',
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      setSavedSessionMeta({ role: 'admin', name: 'Staff Valeria', details: 'Back Office Agenzia' });
    }
  };

  // Login Fornitore Partner con memoria
  const handleSupplierLogin = (supplierId: string, rememberMe: boolean = true) => {
    setAuthRole('supplier');
    setCurrentSupplierId(supplierId);
    setCurrentGuest(null);
    setCurrentView('supplier');

    const sup = suppliers.find(s => s.id === supplierId);
    const supName = sup?.name || supplierId;

    if (rememberMe) {
      const session = {
        role: 'supplier',
        supplierId,
        name: supName,
        details: sup ? `${sup.category} · ${sup.city}` : '',
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      setSavedSessionMeta({ role: 'supplier', name: supName, details: sup?.category });
    }
  };

  // Riprendi sessione salvata dal banner
  const handleResumeSavedSession = () => {
    try {
      const savedRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedRaw) {
        const session = JSON.parse(savedRaw);
        if (session.role === 'guest' && session.guestInfo) {
          setAuthRole('guest');
          setCurrentGuest(session.guestInfo);
          setCurrentView('guest');
        } else if (session.role === 'couple' && session.coupleWeddingCode) {
          setAuthRole('couple');
          setCurrentCoupleWeddingCode(session.coupleWeddingCode);
          setCurrentView('couple');
        } else if (session.role === 'admin') {
          setAuthRole('admin');
          setCurrentView('admin');
        } else if (session.role === 'supplier' && session.supplierId) {
          setAuthRole('supplier');
          setCurrentSupplierId(session.supplierId);
          setCurrentView('supplier');
        }
      }
    } catch (e) {
      console.warn('Errore ripresa sessione', e);
    }
  };

  // Cancella sessione memorizzata
  const handleClearSavedSession = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
    setSavedSessionMeta(null);
  };

  // Logout Globale
  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
    setSavedSessionMeta(null);
    setAuthRole(null);
    setCurrentGuest(null);
    setCurrentView('home');
    signOutUser().catch(() => {});
  };

  // Anteprima Ospite dal pannello admin
  const handlePreviewAsGuest = (code: string) => {
    setAuthRole('guest');
    setCurrentGuest({
      name: 'Eleanor Vance (Anteprima Staff)',
      email: 'eleanor.vance@gmail.com',
      weddingCode: code,
      provider: 'google',
      country: 'Stati Uniti'
    });
    setCurrentView('guest');
  };

  // Invio messaggio in chat da parte dell'ospite (sincronizzato su backend e cross-tab)
  const handleSendMessageFromGuest = (msg: { text: string; guestName: string; guestEmail: string; weddingCode: string }) => {
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      weddingCode: msg.weddingCode,
      guestName: msg.guestName,
      guestEmail: msg.guestEmail,
      sender: 'guest',
      text: msg.text,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: false
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Salvataggio permanente su Firestore per sincronizzazione real-time multi-device
    sendChatMessageToFirestore(newMsg).catch(err => console.warn('Errore invio chat a Firestore:', err));

    // Segnalazione di avviso nella scheda matrimoni
    addWeddingNotification(msg.weddingCode, {
      source: 'CHAT_MESSAGE',
      authorName: msg.guestName,
      authorRole: 'ospite',
      title: `Messaggio Concierge Chat da ${msg.guestName}`,
      description: msg.text.length > 70 ? `${msg.text.substring(0, 70)}...` : msg.text,
      actionTab: 'chat'
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apulian_chat_sync');
        bc.postMessage({ type: 'NEW_CHAT_MESSAGE', message: newMsg });
        bc.close();
      }
    } catch {}

    // Invio al backend per sincronizzazione istantanea multi-device con il cliente / agenzia
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingCode: msg.weddingCode,
        guestName: msg.guestName,
        guestEmail: msg.guestEmail,
        sender: 'guest',
        text: msg.text
      })
    }).then(res => res.json()).then(data => {
      if (data?.success) {
        if (data.autoReply) {
          sendChatMessageToFirestore(data.autoReply).catch(() => {});
          setChatMessages(prev => {
            if (prev.some(m => m.id === data.autoReply.id)) return prev;
            const updated = [...prev, data.autoReply];
            try {
              localStorage.setItem('apulian_chat_messages_v1', JSON.stringify(updated));
            } catch {}
            try {
              if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const bc = new BroadcastChannel('apulian_chat_sync');
                bc.postMessage({ type: 'NEW_CHAT_MESSAGE', message: data.autoReply });
                bc.close();
              }
            } catch {}
            return updated;
          });
        }
        syncChatWithBackend();
      }
    }).catch(() => {});
  };

  // Risposta alla chat da parte dell'amministrazione (Valeria)
  const handleReplyChatMessage = (reply: { weddingCode: string; guestName: string; guestEmail: string; text: string }) => {
    const newMsg: ChatMessage = {
      id: `chat-valeria-${Date.now()}`,
      weddingCode: reply.weddingCode,
      guestName: reply.guestName,
      guestEmail: reply.guestEmail,
      sender: 'valeria',
      text: reply.text,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: true
    };
    setChatMessages(prev => [...prev, newMsg]);

    // Salvataggio permanente su Firestore
    sendChatMessageToFirestore(newMsg).catch(err => console.warn('Errore risposta chat a Firestore:', err));

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apulian_chat_sync');
        bc.postMessage({ type: 'NEW_CHAT_MESSAGE', message: newMsg });
        bc.close();
      }
    } catch {}

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingCode: reply.weddingCode,
        guestName: reply.guestName,
        guestEmail: reply.guestEmail,
        sender: 'valeria',
        text: reply.text
      })
    }).then(res => res.json()).then(data => {
      if (data?.success) syncChatWithBackend();
    }).catch(() => {});
  };

  // Invio messaggio in chat da parte degli sposi (cliente) verso gli ospiti o Valeria
  const handleSendMessageFromCouple = (msg: { weddingCode: string; guestName: string; guestEmail: string; text: string }) => {
    const msgId = `chat-couple-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      weddingCode: msg.weddingCode,
      guestName: msg.guestName,
      guestEmail: msg.guestEmail,
      sender: 'couple',
      text: msg.text,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: true
    };
    setChatMessages(prev => [...prev, newMsg]);

    // Salvataggio permanente su Firestore
    sendChatMessageToFirestore(newMsg).catch(err => console.warn('Errore invio chat sposi a Firestore:', err));

    // Segnalazione di avviso nella scheda matrimoni
    addWeddingNotification(msg.weddingCode, {
      source: 'CHAT_MESSAGE',
      authorName: msg.guestName || 'Sposi',
      authorRole: 'sposi',
      title: `Nuovo messaggio dagli Sposi in Chat`,
      description: msg.text.length > 70 ? `${msg.text.substring(0, 70)}...` : msg.text,
      actionTab: 'chat'
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apulian_chat_sync');
        bc.postMessage({ type: 'NEW_CHAT_MESSAGE', message: newMsg });
        bc.close();
      }
    } catch {}

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: msgId,
        weddingCode: msg.weddingCode,
        guestName: msg.guestName,
        guestEmail: msg.guestEmail,
        sender: 'couple',
        text: msg.text
      })
    }).then(res => res.json()).then(data => {
      if (data?.success) {
        if (data.autoReply) {
          sendChatMessageToFirestore(data.autoReply).catch(() => {});
          setChatMessages(prev => {
            if (prev.some(m => m.id === data.autoReply.id)) return prev;
            const updated = [...prev, data.autoReply];
            try {
              localStorage.setItem('apulian_chat_messages_v1', JSON.stringify(updated));
            } catch {}
            try {
              if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const bc = new BroadcastChannel('apulian_chat_sync');
                bc.postMessage({ type: 'NEW_CHAT_MESSAGE', message: data.autoReply });
                bc.close();
              }
            } catch {}
            return updated;
          });
        }
        syncChatWithBackend();
      }
    }).catch(() => {});
  };

  // Invio nuova proposta / desiderio su misura da parte dell'ospite
  const handleSendWish = (wish: { 
    title: string; 
    description: string; 
    preferredDate: string; 
    participantsCount: number; 
    budgetRange: string;
    weddingCode?: string;
    guestName?: string;
    guestEmail?: string;
  }) => {
    const targetWeddingCode = (wish.weddingCode || currentGuest?.weddingCode || weddings[0]?.weddingCode || 'CHIARA-MATTEO-2026').trim().toUpperCase();
    const guestName = wish.guestName || currentGuest?.name || 'Ospite';
    const guestEmail = (wish.guestEmail || currentGuest?.email || 'guest@example.com').trim().toLowerCase();
    
    const newWish: TouristWishRequest = {
      id: `wish-${Date.now()}`,
      weddingCode: targetWeddingCode,
      guestName,
      guestEmail,
      guestPhone: currentGuest?.phone || '',
      title: wish.title,
      description: wish.description,
      preferredDate: wish.preferredDate,
      participantsCount: wish.participantsCount,
      budgetRange: wish.budgetRange,
      status: 'RECEIVED',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setWishRequests(prev => {
      const filtered = prev.filter(w => w.id !== newWish.id);
      const updated = [newWish, ...filtered];
      try {
        localStorage.setItem('apulian_wish_requests_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    
    // Salvataggio permanente su Firestore
    saveWishToFirestore(newWish).catch(err => console.warn('Errore salvataggio wish a Firestore:', err));

    // Salvataggio permanente su backend Express per sincronizzazione real-time multi-device
    fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWish)
    }).then(res => res.json()).then(data => {
      if (data?.success) syncWishesWithBackend();
    }).catch(err => console.warn('Errore invio wish a backend API:', err));

    // Invio automatico notifica via Formspree all'agenzia (info@admarketing.it)
    try {
      fetch('https://formspree.io/f/xaeqloob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `Nuovo Desiderio Ospite Wishlist - ${newWish.guestName} (${targetWeddingCode})`,
          guestName: newWish.guestName,
          guestEmail: newWish.guestEmail,
          weddingCode: targetWeddingCode,
          title: newWish.title,
          description: newWish.description,
          preferredDate: newWish.preferredDate,
          participantsCount: newWish.participantsCount,
          budgetRange: newWish.budgetRange,
          timestamp: new Date().toLocaleString('it-IT')
        })
      }).catch(e => console.warn('Formspree wish dispatch error:', e));
    } catch (e) {}

    // Broadcast channel per la sincronizzazione real-time istantanea tra schede
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('apulian_wishes_sync');
        bc.postMessage({ type: 'NEW_WISH', wish: newWish });
        bc.close();
      }
    } catch {}

    // Segnalazione di avviso nella scheda matrimoni dell'amministrazione
    addWeddingNotification(targetWeddingCode, {
      source: 'GUEST_WISH',
      authorName: newWish.guestName,
      authorRole: 'ospite',
      title: `Nuovo Desiderio Ospite: ${newWish.title}`,
      description: `${newWish.participantsCount} pax · ${newWish.description}`,
      actionTab: 'wishlist'
    });
  };

  const handleUpdateWishRequests = (updated: TouristWishRequest[]) => {
    setWishRequests(updated);
    try {
      localStorage.setItem('apulian_wish_requests_v1', JSON.stringify(updated));
    } catch {}
    
    // Sincronizza su Firestore per ogni wish aggiornato
    updated.forEach(wish => {
      saveWishToFirestore(wish).catch(() => {});
    });

    // Sincronizza su backend Express per l'agenzia in tempo reale
    fetch('/api/wishes/bulk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishes: updated })
    }).then(res => res.json()).then(data => {
      if (data?.success) syncWishesWithBackend();
    }).catch(err => console.warn('Errore aggiornamento wishes bulk su backend API:', err));
  };

  // Invio Email riepilogo incassi via Gmail API
  const handleSendGmail = async (options: { to: string; subject: string; body: string }) => {
    try {
      // Ottieni il token OAuth dal client side (gestito internamente da AI Studio quando si usa set_up_oauth)
      // Nota: In questo ambiente, il token è disponibile via window.google.accounts.oauth2 se configurato,
      // ma il pattern standard qui è passare tramite una route server-side se possibile o usare l'SDK.
      // Tuttavia, per "invio diretto da gmail", implementiamo la chiamata alla Gmail API.
      
      const gapi = (window as any).gapi;
      if (!gapi) {
        throw new Error('Google API Client non caricato');
      }

      const email = [
        'Content-Type: text/html; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        `To: ${options.to}\n`,
        `Subject: ${options.subject}\n\n`,
        options.body
      ].join('');

      const base64SafeEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(window as any).googleToken}`, // Supponendo che il token sia salvato globalmente dopo OAuth
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: base64SafeEmail
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Errore invio email');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Errore Gmail API:', error);
      throw error;
    }
  };

  // Aggiornamento ordini di prenotazione e persistenza
  const handleUpdateBookingOrders = (updated: SupplierBookingOrder[]) => {
    setBookingOrders(updated);
    try {
      localStorage.setItem('apulian_booking_orders_v1', JSON.stringify(updated));
    } catch {}
  };

  // Registrazione o aggiornamento completo scheda ospite in w.guests sia in locale che su Firestore Cloud
  const handleSaveGuestChoices = (guestPayload: {
    name: string;
    email: string;
    weddingCode: string;
    phone?: string;
    country?: string;
    hotelBooked?: string;
    roomType?: string;
    checkInDate?: string;
    checkOutDate?: string;
    hotelNights?: number;
    hotelEstimatePrice?: number;
    hotelBookingStatus?: 'NONE' | 'QUOTE_REQUESTED' | 'OFFICIAL_CONFIRMED' | 'PAID';
    hotelSpecialRequests?: string;
    transferBooked?: string;
    flight?: string;
    experiences?: string[];
    extraServices?: string[];
    diet?: string;
    totalAmountDue?: number;
    orders?: SupplierBookingOrder[];
    companions?: any[];
    familyName?: string;
    specialNeeds?: string;
    serviceBookings?: Record<string, any>;
  }) => {
    // 1. Registra eventuali ordini fornitori
    if (guestPayload.orders && guestPayload.orders.length > 0) {
      setBookingOrders(prev => {
        const updated = [...guestPayload.orders!, ...prev];
        try {
          localStorage.setItem('apulian_booking_orders_v1', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    // 2. Registra o aggiorna l'ospite nella bacheca del matrimonio corrispondente
    const targetCode = (guestPayload.weddingCode || currentGuest?.weddingCode || weddings[0]?.weddingCode || '').trim().toUpperCase();

    setWeddings(prevWeddings => {
      let targetWeddingUpdated: WeddingData | null = null;
      const updatedWeddings = prevWeddings.map(w => {
        const wCode = (w.weddingCode || '').trim().toUpperCase();
        if (wCode === targetCode || wCode.replace(/[\s\-_]+/g, '') === targetCode.replace(/[\s\-_]+/g, '')) {
          const guestIdx = w.guests.findIndex(
            g => (g.email || '').trim().toLowerCase() === (guestPayload.email || '').trim().toLowerCase() ||
                 (g.name || '').trim().toLowerCase() === (guestPayload.name || '').trim().toLowerCase()
          );

          let updatedGuests = [...w.guests];
          const fullDate = new Date().toISOString().split('T')[0];

          if (guestIdx >= 0) {
            const existing = updatedGuests[guestIdx];
            updatedGuests[guestIdx] = {
              ...existing,
              name: guestPayload.name || existing.name,
              email: guestPayload.email || existing.email,
              phone: guestPayload.phone || existing.phone || '+39 340 1234567',
              country: guestPayload.country || existing.country || 'Italia',
              hotelBooked: guestPayload.hotelBooked ?? existing.hotelBooked,
              roomType: guestPayload.roomType ?? existing.roomType,
              checkInDate: guestPayload.checkInDate ?? existing.checkInDate,
              checkOutDate: guestPayload.checkOutDate ?? existing.checkOutDate,
              hotelNights: guestPayload.hotelNights ?? existing.hotelNights,
              hotelEstimatePrice: guestPayload.hotelEstimatePrice ?? existing.hotelEstimatePrice,
              hotelBookingStatus: (guestPayload.hotelBookingStatus ?? existing.hotelBookingStatus) || 'QUOTE_REQUESTED',
              hotelSpecialRequests: guestPayload.hotelSpecialRequests ?? existing.hotelSpecialRequests,
              transferBooked: guestPayload.transferBooked ?? existing.transferBooked,
              flight: guestPayload.flight ?? existing.flight,
              experiences: guestPayload.experiences ?? existing.experiences,
              extraServices: guestPayload.extraServices ?? existing.extraServices,
              diet: guestPayload.diet ?? existing.diet ?? 'Nessuna intolleranza',
              totalAmountDue: guestPayload.totalAmountDue ?? existing.totalAmountDue,
              status: 'CONFIRMED',
              companions: guestPayload.companions ?? existing.companions,
              familyName: guestPayload.familyName ?? existing.familyName,
              specialNeeds: guestPayload.specialNeeds ?? existing.specialNeeds,
              serviceBookings: guestPayload.serviceBookings ?? existing.serviceBookings,
            };
          } else {
            updatedGuests.push({
              id: `guest-${Date.now()}`,
              name: guestPayload.name,
              email: guestPayload.email,
              phone: guestPayload.phone || '+39 340 1234567',
              country: guestPayload.country || currentGuest?.country || 'Italia',
              flag: '🇮🇹',
              hotelBooked: guestPayload.hotelBooked || 'Nessun alloggio (Autonomo)',
              roomType: guestPayload.roomType || '',
              checkInDate: guestPayload.checkInDate || '',
              checkOutDate: guestPayload.checkOutDate || '',
              hotelNights: guestPayload.hotelNights || 0,
              hotelEstimatePrice: guestPayload.hotelEstimatePrice || 0,
              hotelBookingStatus: guestPayload.hotelBookingStatus || 'QUOTE_REQUESTED',
              hotelSpecialRequests: guestPayload.hotelSpecialRequests || '',
              transferBooked: guestPayload.transferBooked || 'Nessun transfer (Autonomo)',
              flight: guestPayload.flight || '',
              experiences: guestPayload.experiences || [],
              extraServices: guestPayload.extraServices || [],
              diet: guestPayload.diet || 'Nessuna intolleranza',
              status: 'CONFIRMED',
              totalAmountDue: guestPayload.totalAmountDue || 0,
              paymentStatus: (guestPayload.totalAmountDue || 0) > 0 ? 'PENDING' : 'FREE',
              registeredAt: fullDate,
              companions: guestPayload.companions || [],
              familyName: guestPayload.familyName || '',
              specialNeeds: guestPayload.specialNeeds || '',
              serviceBookings: guestPayload.serviceBookings || {},
            });
          }
          const nowTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
          const servicesCount = (guestPayload.experiences?.length || 0) + (guestPayload.extraServices?.length || 0);
          const hotelSummary = guestPayload.hotelBooked && guestPayload.hotelBooked !== 'NONE'
            ? `Hotel: ${guestPayload.hotelBooked} (${guestPayload.hotelNights || 1} notti)`
            : 'Alloggio autonomo';
          const detailDesc = `${hotelSummary} · ${servicesCount} attività/servizi · Saldo: €${guestPayload.totalAmountDue || 0}`;

          const newAlert: WeddingAlertNotification = {
            id: `alert-${Date.now()}`,
            weddingCode: targetCode,
            source: 'GUEST_CHOICE_UPDATE',
            authorName: guestPayload.name || 'Ospite',
            authorRole: 'ospite',
            title: `Nuovo itinerario / opzioni da ${guestPayload.name || 'Ospite'}`,
            description: detailDesc,
            timestamp: `Oggi, ${nowTime}`,
            read: false,
            actionTab: 'guests'
          };

          const existingNotifs = (w.notifications || []).filter(n => n.id !== newAlert.id);
          const updatedW = { 
            ...w, 
            guests: updatedGuests,
            notifications: [newAlert, ...existingNotifs]
          };
          targetWeddingUpdated = updatedW;
          return updatedW;
        }
        return w;
      });

      // Feedback visivo immediato
      setSyncFeedback(`Nuovo aggiornamento registrato da ${guestPayload.name || 'Ospite'} per il matrimonio ${targetCode}!`);
      setTimeout(() => setSyncFeedback(null), 5000);

      // Salva in localStorage per persistenza immediata
      try {
        localStorage.setItem(WEDDINGS_STORAGE_KEY, JSON.stringify(updatedWeddings));
      } catch {}

      // Sincronizza su Firestore Cloud
      if (targetWeddingUpdated) {
        saveWeddingToFirestore(targetWeddingUpdated).catch(err => console.warn('Sync guest choices to Firestore:', err));
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('apulian_weddings_sync');
            bc.postMessage({ type: 'WEDDING_UPDATED', wedding: targetWeddingUpdated });
            bc.close();
          }
        } catch {}
      }

      return updatedWeddings;
    });
  };

  // Alias per retrocompatibilità
  const handleConfirmBookingToSuppliers = (newOrders: SupplierBookingOrder[]) => {
    if (newOrders && newOrders.length > 0) {
      setBookingOrders(prev => {
        const updated = [...newOrders, ...prev];
        try {
          localStorage.setItem('apulian_booking_orders_v1', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  // Aggiunta nuovo pacchetto da parte del fornitore
  const handleAddPackage = (newPkg: SupplierPackage) => {
    setPackages(prev => [newPkg, ...prev]);
  };

  // Matrimonio attivo per la vista ospite con tolleranza formattazione codice
  const activeGuestWedding = weddings.find(w => {
    const code = (w.weddingCode || '').trim().toUpperCase();
    const target = (currentGuest?.weddingCode || 'CHIARA-MATTEO-2026').trim().toUpperCase();
    return code === target || code.replace(/[\s\-_]+/g, '') === target.replace(/[\s\-_]+/g, '');
  }) || weddings[0];

  // Matrimonio attivo per la vista sposi con tolleranza formattazione codice
  const activeCoupleWedding = weddings.find(w => {
    const code = (w.weddingCode || '').trim().toUpperCase();
    const target = (currentCoupleWeddingCode || '').trim().toUpperCase();
    return code === target || code.replace(/[\s\-_]+/g, '') === target.replace(/[\s\-_]+/g, '');
  }) || weddings[0];

  // Fornitore attualmente selezionato
  const activeSupplier = suppliers.find(s => s.id === currentSupplierId) || suppliers[0];

  // Configurazione voci del Menu Laterale Unificato
  const getLateralMenuConfig = () => {
    if (currentView === 'guest') {
      const guestItems: MenuItem[] = [
        {
          id: 'couple-info',
          label: lang === 'it' ? 'Servizi e informazioni' : 'Services & Information',
          subtitle: lang === 'it' ? 'Dettagli cerimonia, ricevimento e informazioni utili' : 'Ceremony, reception & useful info',
          icon: <Heart className="w-5 h-5" />
        },
        {
          id: 'rsvp',
          label: lang === 'it' ? 'RSVP & Famiglia' : 'RSVP & Family',
          subtitle: lang === 'it' ? 'Conferma presenza, intolleranze e accompagnatori' : 'Attendance, dietary & companions',
          icon: <CheckCircle2 className="w-5 h-5" />,
          badge: currentGuest?.name ? 'Personale' : undefined
        },
        {
          id: 'album',
          label: lang === 'it' ? 'Album del Matrimonio' : 'Wedding Album',
          subtitle: lang === 'it' ? 'Scatta dal vivo o carica fino a 30 foto delle nozze' : 'Snap live or upload up to 30 wedding photos',
          icon: <Camera className="w-5 h-5" />,
          badge: 'Nuovo'
        },
        {
          id: 'hotels',
          label: lang === 'it' ? 'Soggiorni & Hotel' : 'Hotels & Stays',
          subtitle: lang === 'it' ? 'Hotel convenzionati e masserie consigliate' : 'Partner hotels & masserie',
          icon: <Building2 className="w-5 h-5" />
        },
        {
          id: 'transfers',
          label: lang === 'it' ? 'Transfer & Spostamenti' : 'Transfers & Mobility',
          subtitle: lang === 'it' ? 'Navette aeroporto e minivan dedicati' : 'Airport shuttles & private minivans',
          icon: <Car className="w-5 h-5" />
        },
        {
          id: 'experiences',
          label: lang === 'it' ? 'Esperienze in Puglia' : 'Puglia Experiences',
          subtitle: lang === 'it' ? 'Tour in barca, degustazioni e borghi' : 'Boat tours, wine tastings & towns',
          icon: <Compass className="w-5 h-5" />
        },
        {
          id: 'services',
          label: lang === 'it' ? 'Servizi & Beauty' : 'Services & Beauty',
          subtitle: lang === 'it' ? 'Hair stylist, trucco e noleggi convenzionati' : 'Hair stylist, makeup & rentals',
          icon: <Scissors className="w-5 h-5" />
        },
        {
          id: 'wishes',
          label: lang === 'it' ? 'Richieste Speciali' : 'Special Wishes',
          subtitle: lang === 'it' ? 'Desideri su misura curati dal Concierge' : 'Custom desires curated by Concierge',
          icon: <Sparkles className="w-5 h-5" />
        },
        {
          id: 'itinerary',
          label: lang === 'it' ? 'Programma & Mappa' : 'Itinerary & Map',
          subtitle: lang === 'it' ? 'Orari ufficiali e coordinate location' : 'Official schedule & GPS coordinates',
          icon: <Calendar className="w-5 h-5" />
        },
        {
          id: 'payments',
          label: lang === 'it' ? 'Cassa & Pagamenti' : 'Payments & Summary',
          subtitle: lang === 'it' ? 'Riepilogo prenotazioni e quote' : 'Booking recap & payment status',
          icon: <CreditCard className="w-5 h-5" />
        },
        {
          id: 'chat',
          label: lang === 'it' ? 'Chat con Valeria' : 'Chat with Valeria',
          subtitle: lang === 'it' ? 'Assistenza concierge 24/7' : 'Live concierge 24/7 assistance',
          icon: <MessageCircle className="w-5 h-5" />,
          badge: 'Online'
        }
      ];

      return {
        items: guestItems,
        title: activeGuestWedding?.coupleNames || 'Nozze in Puglia',
        subtitle: lang === 'it' ? 'Area Ospite & Servizi Turistici' : 'Guest Portal & Concierge Services',
        weddingCode: activeGuestWedding?.weddingCode,
        guestName: currentGuest?.name,
        activeTab: guestActiveTab,
        setActiveTab: (tab: any) => setGuestActiveTab(tab)
      };
    }

    if (currentView === 'couple') {
      const coupleItems: MenuItem[] = [
        {
          id: 'details',
          label: 'Dettagli Nozze & Sedi',
          subtitle: 'Data, chiesa, ricevimento e testi personalizzati',
          icon: <Heart className="w-5 h-5" />
        },
        {
          id: 'photos',
          label: 'Album del Matrimonio',
          subtitle: 'Foto ufficiali e scatti live degli invitati aggiornati in tempo reale',
          icon: <Camera className="w-5 h-5" />
        },
        {
          id: 'secondary',
          label: 'Guida Utile Ospiti',
          subtitle: 'FAQ, dress code, meteo e consigli di viaggio',
          icon: <Info className="w-5 h-5" />
        },
        {
          id: 'gift-services',
          label: 'Regala Servizi',
          subtitle: 'Hotel, transfer ed esperienze abilitate per gli ospiti',
          icon: <Gift className="w-5 h-5" />
        },
        {
          id: 'communication',
          label: 'Invito WhatsApp & Avvisi',
          subtitle: 'Messaggi broadcast e promemoria WhatsApp',
          icon: <MessageCircle className="w-5 h-5" />
        },
        {
          id: 'guests',
          label: 'Riepilogo Ospiti & RSVP',
          subtitle: 'Conferme presenze, tavoli e preferenze alimentari',
          icon: <Users className="w-5 h-5" />
        },
        {
          id: 'chat',
          label: 'Chat Assistenza Valeria',
          subtitle: 'Canale diretto con il tuo Wedding Concierge dedicato',
          icon: <Sparkles className="w-5 h-5" />,
          badge: '24/7'
        }
      ];

      return {
        items: coupleItems,
        title: activeCoupleWedding?.coupleNames || 'Area Sposi',
        subtitle: 'Gestione Nozze & Esperienza Ospiti',
        weddingCode: activeCoupleWedding?.weddingCode,
        guestName: activeCoupleWedding?.coupleNames,
        activeTab: coupleActiveTab,
        setActiveTab: (tab: any) => setCoupleActiveTab(tab)
      };
    }

    if (currentView === 'admin' || currentView === 'dashboard') {
      const adminItems: MenuItem[] = [
        {
          id: 'admin',
          label: 'Pannello Amministrazione',
          subtitle: 'Gestione matrimoni, fornitori e approvazioni',
          icon: <Building2 className="w-5 h-5" />
        },
        {
          id: 'dashboard',
          label: 'Monitoraggio Globale',
          subtitle: 'Metriche live presenze, prenotazioni e flussi',
          icon: <Users className="w-5 h-5" />
        }
      ];

      return {
        items: adminItems,
        title: 'AD Marketing',
        subtitle: 'Amministrazione Concierge Agenzia',
        weddingCode: 'ADMIN',
        guestName: 'Amministratore',
        activeTab: currentView,
        setActiveTab: (tab: any) => setCurrentView(tab)
      };
    }

    if (currentView === 'supplier') {
      const supplierItems: MenuItem[] = [
        {
          id: 'supplier',
          label: 'Portale Fornitore Partner',
          subtitle: 'Gestione ordini, disponibilità e catalogo',
          icon: <Package className="w-5 h-5" />
        }
      ];

      return {
        items: supplierItems,
        title: activeSupplier?.name || 'Fornitore Partner',
        subtitle: 'Gestione Prenotazioni & Pacchetti',
        weddingCode: 'PARTNER',
        guestName: activeSupplier?.name,
        activeTab: 'supplier',
        setActiveTab: (tab: any) => setCurrentView(tab)
      };
    }

    // Default / Home
    const homeItems: MenuItem[] = [
      {
        id: 'home',
        label: 'Home & Benvenuto',
        subtitle: 'Portale d’ingresso al matrimonio ed esplorazione Puglia',
        icon: <Globe className="w-5 h-5" />
      }
    ];

    if (authRole === 'guest') {
      homeItems.push({
        id: 'guest',
        label: 'Mio Matrimonio (Ospite)',
        subtitle: `Rientra nell'area del matrimonio ${activeGuestWedding?.coupleNames}`,
        icon: <Heart className="w-5 h-5" />
      });
    }

    if (authRole === 'couple') {
      homeItems.push({
        id: 'couple',
        label: 'Area Sposi Riservata',
        subtitle: `Gestione matrimonio ${activeCoupleWedding?.coupleNames}`,
        icon: <Heart className="w-5 h-5" />
      });
    }

    if (authRole === 'admin') {
      homeItems.push(
        {
          id: 'admin',
          label: 'Pannello Agenzia',
          subtitle: 'Gestione matrimoni e impostazioni',
          icon: <Building2 className="w-5 h-5" />
        },
        {
          id: 'dashboard',
          label: 'Monitoraggio Globale',
          subtitle: 'Cruscotto presenze e ricavi',
          icon: <Users className="w-5 h-5" />
        }
      );
    }

    if (authRole === 'supplier') {
      homeItems.push({
        id: 'supplier',
        label: 'Portale Fornitore',
        subtitle: 'Visualizza ordini assegnati',
        icon: <Package className="w-5 h-5" />
      });
    }

    return {
      items: homeItems,
      title: 'Apulian Concierge',
      subtitle: 'Luxury Bespoke Wedding & Tourism in Puglia',
      weddingCode: undefined,
      guestName: undefined,
      activeTab: currentView,
      setActiveTab: (tab: any) => setCurrentView(tab)
    };
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col selection:bg-stone-800 selection:text-white">
      {/* 
        ======================================================================
        HEADER CONCIERGE STICKY UNIFICATO
        Pulsante Menu unico in alto a destra fisso all'header che apre il drawer da sinistra
        ======================================================================
      */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E0D6] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Element Wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('home')}
              className="text-left group flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center font-serif-luxury font-bold text-lg shadow-sm border border-stone-800 group-hover:scale-105 transition-transform">
                P
              </div>
              <div>
                <span className="text-lg font-serif-luxury font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors block leading-none">
                  Apulian Concierge
                </span>
                <span className="text-[10px] text-amber-800 uppercase tracking-widest font-semibold block mt-1">
                  AD Marketing · Bespoke Weddings
                </span>
              </div>
            </button>
          </div>

          {/* Indicatore Contestuale Centrale (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-[#E6E0D6] shadow-2xs text-xs">
            {currentView === 'guest' && (
              <>
                <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span className="text-stone-500 font-medium">Ospite:</span>
                <span className="font-serif-luxury font-bold text-stone-900">{activeGuestWedding?.coupleNames}</span>
                <span className="text-stone-300">|</span>
                <span className="font-mono text-[10px] text-stone-500">{activeGuestWedding?.weddingCode}</span>
              </>
            )}
            {currentView === 'couple' && (
              <>
                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                <span className="text-rose-900 font-medium">Area Sposi:</span>
                <span className="font-serif-luxury font-bold text-stone-900">{activeCoupleWedding?.coupleNames}</span>
                <span className="text-stone-300">|</span>
                <span className="font-mono text-[10px] text-rose-800">{activeCoupleWedding?.weddingCode}</span>
              </>
            )}
            {currentView === 'admin' && (
              <>
                <Building2 className="w-3.5 h-3.5 text-stone-700" />
                <span className="font-semibold text-stone-900">Pannello Amministrazione Agenzia</span>
              </>
            )}
            {currentView === 'dashboard' && (
              <>
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-semibold text-stone-900">Monitoraggio Globale & Notifiche</span>
              </>
            )}
            {currentView === 'supplier' && (
              <>
                <Package className="w-3.5 h-3.5 text-purple-700" />
                <span className="font-semibold text-stone-900">{activeSupplier?.name}</span>
              </>
            )}
            {currentView === 'home' && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-stone-600 font-medium">Esperienza di Nozze in Puglia</span>
              </>
            )}
          </div>

          {/* Sezione Destra: Pulsante MENU Fisso all'Header */}
          <div className="flex items-center gap-3">
            {/* Pillola rapida utente autenticato */}
            {authRole === 'guest' && currentGuest && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-stone-700 bg-white/80 rounded-full border border-[#E6E0D6]">
                <Globe className="w-3 h-3 text-stone-400" />
                <span className="truncate max-w-[120px]">{currentGuest.name}</span>
              </span>
            )}
            {authRole === 'couple' && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-rose-900 bg-rose-50 rounded-full border border-rose-200">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span className="truncate max-w-[120px]">{activeCoupleWedding?.coupleNames}</span>
              </span>
            )}

            {/* PULSANTE MENU UNIFICATO IN ALTO A DESTRA (Classiche tre linee) */}
            <button 
              type="button"
              onClick={() => setIsLateralMenuOpen(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white transition-all shadow-md hover:shadow-lg border border-stone-800 cursor-pointer group"
              aria-label="Apri Menu di Navigazione"
            >
              {/* Il classico simbolo delle tre linee */}
              <div className="flex flex-col justify-center items-center gap-1 w-4 h-4">
                <span className="w-4 h-0.5 bg-amber-300 rounded-full transition-transform duration-200 group-hover:w-4" />
                <span className="w-3.5 h-0.5 bg-amber-300 rounded-full transition-transform duration-200 group-hover:w-4" />
                <span className="w-4 h-0.5 bg-amber-300 rounded-full transition-transform duration-200 group-hover:w-4" />
              </div>
              <span className="font-serif-luxury font-semibold text-xs tracking-wider uppercase text-amber-200">
                {currentView === 'guest' ? 'Servizi e Info' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Menu Laterale a Scorrimento da Sinistra con Sfondo Semitrasparente */}
      {(() => {
        const menuConfig = getLateralMenuConfig();
        return (
          <HamburgerMenu
            isOpen={isLateralMenuOpen}
            onClose={() => setIsLateralMenuOpen(false)}
            title={menuConfig.title}
            subtitle={menuConfig.subtitle}
            weddingCode={menuConfig.weddingCode}
            guestName={menuConfig.guestName}
            activeTab={menuConfig.activeTab}
            setActiveTab={menuConfig.setActiveTab}
            items={menuConfig.items}
            onOpenChat={() => {
              if (currentView === 'guest') setGuestActiveTab('chat');
              if (currentView === 'couple') setCoupleActiveTab('chat');
              setIsLateralMenuOpen(false);
            }}
            onNavigateHome={() => {
              setCurrentView('home');
              setIsLateralMenuOpen(false);
            }}
            lang={lang}
            setLang={setLang}
            onLogout={authRole ? handleLogout : undefined}
          />
        );
      })()}

      {/* Notifica Sincronizzazione Dati Recenti */}
      {syncFeedback && (() => {
        const lastSyncTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        return (
          <div className="bg-emerald-700 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm transition-all animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-200" />
            <span>{syncFeedback}</span>
            <span className="opacity-75 text-[11px]">· Ore {lastSyncTime}</span>
          </div>
        );
      })()}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <HomeLogin 
            weddings={weddings} 
            suppliers={suppliers}
            onGuestLogin={handleGuestLogin} 
            onCoupleLogin={handleCoupleLogin}
            onAdminLogin={handleAdminLogin}
            onSupplierLogin={handleSupplierLogin}
            onRegisterHotel={handleRegisterHotel}
            onResetToDemoWedding={handleResetToDemoWedding}
            onWeddingDiscovered={handleWeddingDiscovered}
          />
        )}

        {currentView === 'couple' && (
          <CouplePortal 
            weddingData={activeCoupleWedding}
            onUpdateWedding={handleUpdateSingleWedding}
            onLogout={handleLogout}
            onPreviewAsGuest={handlePreviewAsGuest}
            adminSettings={adminSettings}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessageFromCouple}
            activeTab={coupleActiveTab}
            setActiveTab={setCoupleActiveTab}
          />
        )}

        {currentView === 'guest' && (
          <GuestPortal 
            weddingData={activeGuestWedding} 
            guestInfo={currentGuest || {
              name: 'Eleanor Vance',
              email: 'eleanor.vance@gmail.com',
              weddingCode: activeGuestWedding.weddingCode,
              provider: 'google',
              country: 'Stati Uniti'
            }}
            adminNotificationEmail={adminSettings.adminNotificationEmail}
            suppliers={suppliers}
            onLogout={handleLogout}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessageFromGuest}
            onSendWish={handleSendWish}
            onConfirmBookingToSuppliers={handleConfirmBookingToSuppliers}
            onSaveGuestChoices={handleSaveGuestChoices}
            onUpdateWedding={handleUpdateSingleWedding}
            adminSettings={adminSettings}
            wishRequests={wishRequests}
            lang={lang}
            setLang={setLang}
            activeTab={guestActiveTab}
            setActiveTab={setGuestActiveTab}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel 
            weddings={weddings} 
            onUpdateWeddings={handleUpdateWeddings}
            onResetToDemoWedding={handleResetToDemoWedding}
            suppliers={suppliers}
            onUpdateSuppliers={setSuppliers}
            packages={packages}
            bookingOrders={bookingOrders}
            onUpdateBookingOrders={handleUpdateBookingOrders}
            wishRequests={wishRequests}
            onUpdateWishRequests={handleUpdateWishRequests}
            chatMessages={chatMessages}
            onReplyChatMessage={handleReplyChatMessage}
            adminSettings={adminSettings}
            onUpdateAdminSettings={handleUpdateAdminSettings}
            paymentRequests={paymentRequests}
            onUpdatePaymentRequests={setPaymentRequests}
            onLogout={handleLogout}
            onPreviewAsGuest={handlePreviewAsGuest}
            onSendGmail={handleSendGmail}
          />
        )}

        {currentView === 'supplier' && (
          <SupplierPortal
            suppliers={suppliers}
            currentSupplierId={currentSupplierId}
            onChangeSupplier={setCurrentSupplierId}
            packages={packages}
            onAddPackage={handleAddPackage}
            bookingOrders={bookingOrders}
            onUpdateBookingOrders={setBookingOrders}
            weddings={weddings}
            onUpdateWeddings={handleUpdateWeddings}
            onUpdateSuppliers={setSuppliers}
            onLogout={handleLogout}
            onNavigateToAgency={() => {
              setAuthRole('admin');
              setCurrentView('admin');
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <AgencyDashboard 
            weddings={weddings}
            onUpdateWeddings={handleUpdateWeddings}
            suppliers={suppliers}
            packages={packages}
            bookingOrders={bookingOrders}
            paymentRequests={paymentRequests}
            wishRequests={wishRequests}
            onUpdateWishRequests={handleUpdateWishRequests}
            onNavigateToAdminTab={(tab, _weddingId) => {
              setAuthRole('admin');
              setCurrentView('admin');
            }}
          />
        )}
      </main>

      {/* ========================================================================= */}
      {/* FOOTER CON INFO AD MARKETING PALAGIANELLO (TA) & PRIVACY POLICY          */}
      {/* ========================================================================= */}
      <footer className="border-t border-neutral-200 bg-white pt-10 pb-8 mt-12 text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Colonna 1: Dati Agenzia AD Marketing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury font-bold text-stone-800 text-base">
                  Apulian Wedding Concierge
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Piattaforma di incoming e hospitality management per ospiti internazionali di matrimoni di lusso in Puglia.
              </p>
              <div className="text-[11px] text-neutral-700 font-semibold pt-1">
                A cura di <strong>{adminSettings.agencyLegalName || 'AD Marketing S.r.l.s.'}</strong>
              </div>
              <div className="text-[11px] text-neutral-500">
                {adminSettings.agencyCity || '74018 Palagianello (TA) · Puglia, Italia'}
              </div>
              {adminSettings.badgeText && (
                <div className="pt-1">
                  <span className="inline-block text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    {adminSettings.badgeText}
                  </span>
                </div>
              )}
            </div>

            {/* Colonna 2: Dati Legali & Fiscali */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-800 block">
                Dati Societari & Legali
              </span>
              <div className="text-[11px] text-neutral-500 space-y-1">
                <div>Ragione Sociale: <strong>{adminSettings.agencyLegalName || 'AD Marketing S.r.l.s.'}</strong></div>
                <div>Sede Legale: {adminSettings.agencyAddress || 'Via Roma, 45'}</div>
                <div>{adminSettings.agencyCity || '74018 Palagianello (TA) - Italia'}</div>
                <div>P.IVA & Codice Fiscale: <strong className="font-mono text-stone-700">{adminSettings.agencyVat || 'IT03124590731'}</strong></div>
                <div>REA: {adminSettings.agencyRea || 'TA-201842'} · Capitale Sociale: {adminSettings.agencyShareCapital || '€10.000 i.v.'}</div>
                {adminSettings.defaultIban && (
                  <div className="text-[10px] text-neutral-400 font-mono pt-0.5 truncate" title={adminSettings.defaultIban}>
                    IBAN: {adminSettings.defaultIban.substring(0, 15)}...
                  </div>
                )}
              </div>
            </div>

            {/* Colonna 3: Contatti & Assistenza Ospiti */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-800 block">
                Centrale Operativa Puglia
              </span>
              <div className="text-[11px] text-neutral-500 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-mono">{adminSettings.adminNotificationEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Tel: {adminSettings.agencyPhone || '+39 099 8887766'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Concierge H24: {adminSettings.valeriaPhone || '+39 340 1234567'} (Valeria)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Operatività: Bari, Brindisi, Valle d'Itria, Salento</span>
                </div>
              </div>
            </div>

            {/* Colonna 4: Informative & Link Legali (Modali Interattivi) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-800 block">
                Privacy & Trasparenza
              </span>
              <ul className="text-[11px] space-y-1.5">
                <li>
                  <button
                    onClick={() => setActiveLegalModal('privacy')}
                    className="text-neutral-600 hover:text-stone-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Privacy Policy (GDPR EU 2016/679)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('cookies')}
                    className="text-neutral-600 hover:text-stone-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Cookie Policy & Trattamento Dati</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('terms')}
                    className="text-neutral-600 hover:text-stone-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Termini di Servizio Concierge & Pagamenti</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setAuthRole('supplier');
                      setCurrentView('supplier');
                    }}
                    className="text-purple-700 hover:text-purple-900 hover:underline cursor-pointer font-semibold flex items-center gap-1 pt-1"
                  >
                    <span>Portale Convenzione Fornitori Partner →</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400">
            <div>
              © {new Date().getFullYear()} {adminSettings.agencyLegalName || 'AD Marketing S.r.l.s.'} · {adminSettings.agencyCity ? adminSettings.agencyCity.split('-')[0].trim() : 'Palagianello (TA)'} · Tutti i diritti riservati.
            </div>
            <div className="flex items-center gap-3">
              <span>Progettato per matrimoni d'eccellenza in Puglia</span>
              <span aria-hidden="true">·</span>
              <span>Bari / Brindisi Airport Concierge NCC</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALI INTERATTIVI PRIVACY POLICY & TERMINI                               */}
      {/* ========================================================================= */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-stone-700" />
                <h3 className="text-base font-bold text-stone-800">
                  {activeLegalModal === 'privacy' && 'Informativa sulla Privacy (GDPR UE 2016/679)'}
                  {activeLegalModal === 'cookies' && 'Informativa Cookie & Preferenze Dati'}
                  {activeLegalModal === 'terms' && 'Termini e Condizioni di Servizio Concierge'}
                </h3>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-600 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {activeLegalModal === 'privacy' && (
                <>
                  <p>
                    <strong>Titolare del Trattamento:</strong> AD Marketing S.r.l.s., con sede legale in Via Roma 45, 74018 Palagianello (TA), P.IVA IT03124590731, email: info@admarketing.it.
                  </p>
                  <p>
                    <strong>Finalità del Trattamento:</strong> I dati personali forniti dagli ospiti (nome, cognome, email, numero di telefono, dettagli di volo, preferenze alimentari ed eventuali richieste speciali) sono raccolti esclusivamente per la corretta organizzazione della logistica matrimoniale, prenotazione camere d'hotel, coordinamento transfer aeroportuali e gestione delle esperienze sul territorio pugliese.
                  </p>
                  <p>
                    <strong>Comunicazione a Terzi:</strong> I dati necessari alla fornitura dei singoli servizi vengono trasmessi ai soli fornitori partner incaricati (strutture ricettive, autisti NCC, skipper e professionisti estetici) e all'assistente personale Valeria per l'assistenza diretta.
                  </p>
                  <p>
                    <strong>Conservazione e Diritti dell'Interessato:</strong> I dati sono conservati per il tempo strettamente necessario all'espletamento dell'evento matrimoniale e agli obblighi fiscali. In conformità con gli artt. 15-22 del GDPR, l'interessato può richiedere in ogni momento la cancellazione o rettifica dei dati scrivendo a info@admarketing.it.
                  </p>
                </>
              )}

              {activeLegalModal === 'cookies' && (
                <>
                  <p>
                    <strong>Tipologia di Cookie Utilizzati:</strong> L'applicazione <em>Apulian Wedding Concierge</em> fa uso unicamente di cookie tecnici di sessione e preferenze di autenticazione, necessari per consentire l'accesso sicuro con codice matrimonio, account Google o Apple, e per conservare il riepilogo del voucher dell'ospite.
                  </p>
                  <p>
                    Non viene effettuata profilazione commerciale o tracciamento a fini pubblicitari invasivi da parte di terze parti non autorizzate.
                  </p>
                  <p>
                    Per maggiori informazioni o per disabilitare l'uso dei cookie dal browser, è possibile fare riferimento alle impostazioni del proprio dispositivo. Titolare: AD Marketing S.r.l.s. - Palagianello (TA).
                  </p>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <p>
                    <strong>Oggetto del Servizio:</strong> AD Marketing S.r.l.s. (Palagianello - TA) fornisce servizi di concierge, coordinamento e intermediazione per ospiti di destination wedding in Puglia.
                  </p>
                  <p>
                    <strong>Alloggi e Tariffe Convenzionate:</strong> Le camere sono bloccate secondo accordi stipulati con le singole strutture ricettive. L'ospite è libero di aderire o di alloggiare in autonomia.
                  </p>
                  <p>
                    <strong>Modalità di Pagamento:</strong> I pagamenti per i servizi a pagamento scelti dall'ospite (transfer privati, gite in barca, make-up in camera) possono essere saldati tramite link sicuro Stripe, bonifico bancario ad AD Marketing o accordo diretto con il fornitore partner secondo le indicazioni fornite nel riepilogo.
                  </p>
                  <p>
                    <strong>Eventi Gratuiti degli Sposi:</strong> Le serate ed esperienze contrassegnate come "Offerto dagli Sposi" sono interamente a carico della coppia nuziale e non comportano alcun costo per l'invitato.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-750 rounded-xl"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
