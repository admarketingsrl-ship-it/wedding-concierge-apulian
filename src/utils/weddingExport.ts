import { 
  WeddingData, 
  TouristWishRequest, 
  ChatMessage, 
  SupplierBookingOrder, 
  PaymentRequest, 
  GuestItem 
} from '../data/weddingStore';
import { 
  deleteWeddingFromFirestore, 
  saveWeddingToFirestore,
  deleteWishesByWeddingCodeFromFirestore,
  deleteChatMessagesByWeddingCodeFromFirestore
} from '../lib/firebase';

export interface WeddingExportPackage {
  exportVersion: string;
  appName: string;
  exportedAt: string;
  wedding: WeddingData;
  wishRequests?: TouristWishRequest[];
  chatMessages?: ChatMessage[];
  bookingOrders?: SupplierBookingOrder[];
  paymentRequests?: PaymentRequest[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    wedding: WeddingData;
    wishRequests: TouristWishRequest[];
    chatMessages: ChatMessage[];
    bookingOrders: SupplierBookingOrder[];
    paymentRequests: PaymentRequest[];
  };
}

/**
 * Normalizza il codice matrimonio per confronti precisi e insensibili a spazi/trattini/maiuscole
 */
export function normalizeWeddingCode(code?: string): string {
  if (!code) return '';
  return code.trim().toUpperCase().replace(/[\s\-_]+/g, '');
}

/**
 * Esporta un matrimonio e tutte le sue risorse collegate in un file JSON scaricabile
 */
export function exportWeddingToJson(
  wedding: WeddingData,
  allWishRequests: TouristWishRequest[] = [],
  allChatMessages: ChatMessage[] = [],
  allBookingOrders: SupplierBookingOrder[] = [],
  allPaymentRequests: PaymentRequest[] = []
): void {
  const normCode = normalizeWeddingCode(wedding.weddingCode || wedding.id);

  // Raccogli solo i dati correlati a questo specifico codice matrimonio
  const relatedWishes = allWishRequests.filter(
    w => normalizeWeddingCode(w.weddingCode) === normCode
  );
  const relatedChat = allChatMessages.filter(
    m => normalizeWeddingCode(m.weddingCode) === normCode
  );
  const relatedOrders = allBookingOrders.filter(
    o => normalizeWeddingCode(o.weddingCode) === normCode
  );
  const relatedPayments = allPaymentRequests.filter(
    p => normalizeWeddingCode(p.weddingCode) === normCode
  );

  const exportPackage: WeddingExportPackage = {
    exportVersion: '1.0',
    appName: 'AD Marketing Apulian Wedding Concierge',
    exportedAt: new Date().toISOString(),
    wedding: {
      ...wedding,
      // Assicura che gli ospiti siano inclusi nella scheda matrimonio
      guests: wedding.guests || []
    },
    wishRequests: relatedWishes,
    chatMessages: relatedChat,
    bookingOrders: relatedOrders,
    paymentRequests: relatedPayments
  };

  const fileData = JSON.stringify(exportPackage, null, 2);
  const blob = new Blob([fileData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const rawCode = (wedding.weddingCode || wedding.id || 'MATRIMONIO').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `matrimonio_EXPORT_${rawCode}_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida ed estrae i dati da una stringa JSON di un matrimonio esportato
 */
export function parseWeddingImportJson(jsonContent: string): ImportResult {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Il file selezionato non contiene un oggetto JSON valido.' };
    }

    let wedding: WeddingData | null = null;
    let wishRequests: TouristWishRequest[] = [];
    let chatMessages: ChatMessage[] = [];
    let bookingOrders: SupplierBookingOrder[] = [];
    let paymentRequests: PaymentRequest[] = [];

    // Se è un package esportato completo
    if (parsed.wedding && typeof parsed.wedding === 'object') {
      wedding = parsed.wedding;
      if (Array.isArray(parsed.wishRequests)) wishRequests = parsed.wishRequests;
      if (Array.isArray(parsed.chatMessages)) chatMessages = parsed.chatMessages;
      if (Array.isArray(parsed.bookingOrders)) bookingOrders = parsed.bookingOrders;
      if (Array.isArray(parsed.paymentRequests)) paymentRequests = parsed.paymentRequests;
    } else if (parsed.weddingCode && parsed.coupleNames) {
      // È una scheda matrimonio raw diretta
      wedding = parsed as WeddingData;
    } else {
      return {
        success: false,
        message: 'Formato file non riconosciuto. Assicurati che sia un file JSON di matrimonio esportato.'
      };
    }

    if (!wedding || (!wedding.weddingCode && !wedding.id)) {
      return {
        success: false,
        message: 'Il matrimonio nel file non possiede un codice o un ID valido.'
      };
    }

    // Garantisci strutture di default pulite
    wedding.hotels = wedding.hotels || [];
    wedding.transfers = wedding.transfers || [];
    wedding.experiences = wedding.experiences || [];
    wedding.extraServices = wedding.extraServices || [];
    wedding.guests = wedding.guests || [];
    wedding.giftRequests = wedding.giftRequests || [];
    wedding.notifications = wedding.notifications || [];

    return {
      success: true,
      message: `Matrimonio "${wedding.coupleNames || wedding.weddingCode}" pronto per l'importazione.`,
      data: {
        wedding,
        wishRequests,
        chatMessages,
        bookingOrders,
        paymentRequests
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Errore nella lettura del file JSON: ${err.message || 'Sintassi invalida'}`
    };
  }
}

/**
 * Esegue la cancellazione profonda (cascade delete) di un matrimonio e di tutte le sue entità collegate
 */
export async function performCascadeDeleteWedding({
  weddingCodeOrId,
  weddingTitle,
  weddings,
  wishRequests,
  chatMessages,
  bookingOrders,
  paymentRequests,
  onUpdateWeddings,
  onUpdateWishRequests,
  onUpdateChatMessages,
  onUpdateBookingOrders,
  onUpdatePaymentRequests,
  deleteAssociatedEntities = true
}: {
  weddingCodeOrId: string;
  weddingTitle?: string;
  weddings: WeddingData[];
  wishRequests: TouristWishRequest[];
  chatMessages: ChatMessage[];
  bookingOrders: SupplierBookingOrder[];
  paymentRequests: PaymentRequest[];
  onUpdateWeddings: (updated: WeddingData[]) => void;
  onUpdateWishRequests?: (updated: TouristWishRequest[]) => void;
  onUpdateChatMessages?: (updated: ChatMessage[]) => void;
  onUpdateBookingOrders?: (updated: SupplierBookingOrder[]) => void;
  onUpdatePaymentRequests?: (updated: PaymentRequest[]) => void;
  deleteAssociatedEntities?: boolean;
}): Promise<void> {
  const normTarget = normalizeWeddingCode(weddingCodeOrId);
  const targetWedding = weddings.find(
    w => normalizeWeddingCode(w.weddingCode) === normTarget || normalizeWeddingCode(w.id) === normTarget
  );

  const codeToMatch = targetWedding?.weddingCode || weddingCodeOrId;
  const idToMatch = targetWedding?.id || weddingCodeOrId;

  // 1. Aggiungi il codice e l'ID all'elenco dei codici eliminati per evitare che la sincronizzazione li ripristini
  try {
    const deletedCodesRaw = localStorage.getItem('apulian_deleted_wedding_codes');
    const deletedCodes: string[] = deletedCodesRaw ? JSON.parse(deletedCodesRaw) : [];
    if (!deletedCodes.includes(codeToMatch.toUpperCase())) {
      deletedCodes.push(codeToMatch.toUpperCase());
    }
    if (!deletedCodes.includes(idToMatch)) {
      deletedCodes.push(idToMatch);
    }
    localStorage.setItem('apulian_deleted_wedding_codes', JSON.stringify(deletedCodes));
  } catch {}

  // 2. Rimuovi la scheda matrimonio
  const updatedWeddings = weddings.filter(
    w => normalizeWeddingCode(w.weddingCode) !== normTarget && normalizeWeddingCode(w.id) !== normTarget
  );
  onUpdateWeddings(updatedWeddings);

  // 3. Se l'utente ha confermato la cancellazione anche dei dati collegati:
  if (deleteAssociatedEntities) {
    // Rimuovi Desideri / Wishlist
    if (onUpdateWishRequests) {
      const updatedWishes = wishRequests.filter(
        w => normalizeWeddingCode(w.weddingCode) !== normTarget
      );
      onUpdateWishRequests(updatedWishes);
    }

    // Rimuovi Messaggi Chat
    if (onUpdateChatMessages) {
      const updatedChat = chatMessages.filter(
        m => normalizeWeddingCode(m.weddingCode) !== normTarget
      );
      onUpdateChatMessages(updatedChat);
    }

    // Rimuovi Ordini Fornitori
    if (onUpdateBookingOrders) {
      const updatedOrders = bookingOrders.filter(
        o => normalizeWeddingCode(o.weddingCode) !== normTarget
      );
      onUpdateBookingOrders(updatedOrders);
    }

    // Rimuovi Richieste Pagamento
    if (onUpdatePaymentRequests) {
      const updatedPayments = paymentRequests.filter(
        p => normalizeWeddingCode(p.weddingCode) !== normTarget
      );
      onUpdatePaymentRequests(updatedPayments);
    }

    // Cancella da Firestore anche i desideri e i messaggi chat della sposa e degli ospiti per questo matrimonio
    try {
      await deleteWishesByWeddingCodeFromFirestore(codeToMatch);
      await deleteChatMessagesByWeddingCodeFromFirestore(codeToMatch);
    } catch (e) {
      console.warn('Errore cancellazione entità collegate da Firestore:', e);
    }
  }

  // 4. Cancella da Firestore Cloud
  try {
    await deleteWeddingFromFirestore(idToMatch, codeToMatch);
  } catch (e) {
    console.warn('Errore cancellazione Firestore:', e);
  }

  // 5. Notifica backend Express
  try {
    fetch(`/api/weddings/${encodeURIComponent(codeToMatch)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleteAssociatedEntities })
    }).catch(() => {});
  } catch {}
}
