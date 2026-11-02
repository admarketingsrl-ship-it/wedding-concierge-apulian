import { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Globe, 
  AlertCircle, 
  X, 
  HeartHandshake, 
  Package, 
  Building2, 
  Check,
  Heart,
  ChevronRight,
  ArrowLeft,
  UserCheck,
  Eye,
  EyeOff,
  Hotel,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ADMIN_CREDENTIALS, WeddingData, MasterSupplier } from '../data/weddingStore';
import { fetchWeddingByCodeFromFirestore } from '../lib/firebase';
import heroBanner from '../assets/images/wedding_concierge_hero_1791309110090.jpg';

interface HomeLoginProps {
  weddings: WeddingData[];
  suppliers: MasterSupplier[];
  onGuestLogin: (guestInfo: { name: string; email: string; phone: string; weddingCode: string; provider: 'google' | 'apple' | 'email'; country?: string }, rememberMe?: boolean) => void;
  onCoupleLogin: (weddingCode: string, coupleEmail?: string, rememberMe?: boolean) => void;
  onAdminLogin: (rememberMe?: boolean) => void;
  onSupplierLogin: (supplierId: string, rememberMe?: boolean) => void;
  onRegisterHotel?: (hotelData: {
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
  }) => void;
  onResetToDemoWedding?: () => void;
  onWeddingDiscovered?: (wedding: any) => void;
  savedSession?: { role: string; name?: string; details?: string } | null;
  onResumeSavedSession?: () => void;
  onClearSavedSession?: () => void;
}

export default function HomeLogin({ 
  weddings, 
  suppliers, 
  onGuestLogin, 
  onCoupleLogin,
  onAdminLogin,
  onSupplierLogin,
  onRegisterHotel,
  onResetToDemoWedding,
  onWeddingDiscovered,
  savedSession,
  onResumeSavedSession,
  onClearSavedSession
}: HomeLoginProps) {
  // Ruolo attivo: 'guest' (esploso come principale di default) oppure 'couple' | 'admin' | 'supplier'
  const [activeRole, setActiveRole] = useState<'guest' | 'couple' | 'admin' | 'supplier'>('guest');

  // Funzione Memoria ("Ricordami su questo dispositivo")
  const [rememberMeGuest, setRememberMeGuest] = useState(true);
  const [rememberMeCouple, setRememberMeCouple] = useState(true);
  const [rememberMeAdmin, setRememberMeAdmin] = useState(true);
  const [rememberMeSupplier, setRememberMeSupplier] = useState(true);

  // Modalità Fornitore/Hotel: 'login' oppure 'register'
  const [supplierMode, setSupplierMode] = useState<'login' | 'register'>('login');

  // Campi Registrazione Autonoma Struttura Hotel
  const [regHotelName, setRegHotelName] = useState('');
  const [regHotelStars, setRegHotelStars] = useState(5);
  const [regHotelCity, setRegHotelCity] = useState('Valle d\'Itria, Puglia');
  const [regHotelAddress, setRegHotelAddress] = useState('');
  const [regHotelContact, setRegHotelContact] = useState('');
  const [regHotelEmail, setRegHotelEmail] = useState('');
  const [regHotelPhone, setRegHotelPhone] = useState('');
  const [regHotelWebsiteUrl, setRegHotelWebsiteUrl] = useState('');
  const [regHotelBookingEngineType, setRegHotelBookingEngineType] = useState<'DIRECT_ENGINE' | 'BOOKING_COM'>('DIRECT_ENGINE');
  const [regHotelRate, setRegHotelRate] = useState(380);
  const [regHotelRoomType, setRegHotelRoomType] = useState('Camera Matrimoniale Deluxe');
  const [regHotelRoomsBlocked, setRegHotelRoomsBlocked] = useState(20);
  const [regHotelPassword, setRegHotelPassword] = useState('');
  const [regHotelPerk, setRegHotelPerk] = useState('Negoziato per voi dall\'Agenzia: Accesso spa gratuito e colazione pugliese con prodotti a km 0.');
  const [regHotelError, setRegHotelError] = useState('');
  const [regHotelSuccessModal, setRegHotelSuccessModal] = useState<{
    hotelName: string;
    email: string;
    password: string;
    loginUrl: string;
    bookingEngineUrl: string;
    sentAt: string;
    supplierId: string;
  } | null>(null);
  const [copiedRegEmail, setCopiedRegEmail] = useState(false);

  // Modale e Richiesta Recupero Credenziali (info@admarketing.it)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryRole, setRecoveryRole] = useState<'guest' | 'couple' | 'supplier' | 'admin'>('guest');
  const [copiedRecoveryEmail, setCopiedRecoveryEmail] = useState(false);

  // Stato Modulo Ospite (Inizializzato vuoto per non esporre credenziali altrui)
  const [guestMode, setGuestMode] = useState<'quick' | 'register'>('quick');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [weddingCode, setWeddingCode] = useState('');
  const [guestError, setGuestError] = useState('');

  // Stato Modulo Sposi (Codice matrimonio, email sposa e password)
  const [coupleWeddingCode, setCoupleWeddingCode] = useState('');
  const [coupleEmail, setCoupleEmail] = useState('');
  const [couplePassword, setCouplePassword] = useState('');
  const [coupleError, setCoupleError] = useState('');

  // Stato Modulo Amministratore (Nessun pre-riempimento)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Stato Modulo Fornitore (Solo campi vuoti)
  const [supplierInput, setSupplierInput] = useState('');
  const [supplierPassword, setSupplierPassword] = useState('');
  const [showSupplierPassword, setShowSupplierPassword] = useState(false);
  const [showCouplePassword, setShowCouplePassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showRegHotelPassword, setShowRegHotelPassword] = useState(false);
  const [supplierError, setSupplierError] = useState('');

  // Rilevamento automatico codice matrimonio da URL se condiviso dagli sposi (es. ?code=XYZ&role=couple&email=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code') || params.get('wedding');
      const urlEmail = params.get('email');
      const roleParam = params.get('role');
      if (urlCode) {
        const clean = urlCode.toUpperCase();
        setWeddingCode(clean);
        setCoupleWeddingCode(clean);
        // Esegui subito un lookup su Firestore per assicurarsi che il matrimonio sia scoperto e inserito nello store
        fetchWeddingByCodeFromFirestore(clean)
          .then(wedding => {
            if (wedding && onWeddingDiscovered) {
              onWeddingDiscovered(wedding);
            }
          })
          .catch(() => {});
      }
      if (urlEmail) {
        setCoupleEmail(urlEmail.trim().toLowerCase());
      }
      if (roleParam === 'couple') {
        setActiveRole('couple');
      }
    } catch {
      // ignore
    }
  }, []);

  // Submit Ospite con verifica locale e lookup dinamico su database Firestore
  const handleGuestSubmit = async (customData?: { name: string; email: string }) => {
    // Rimuovi provider: 'google' | 'apple' | 'email' poiché ora solo email è consentita
    const provider = 'email';
    
    // ... logic ...
    setGuestError('');
    const cleanCode = weddingCode.trim().toUpperCase();
    
    if (!cleanCode) {
      setGuestError('Inserisci il Codice Matrimonio ricevuto nel messaggio WhatsApp o nella partecipazione.');
      return;
    }

    let found = weddings.find(w => w.weddingCode.toUpperCase() === cleanCode);
    if (!found) {
      // Lookup dinamico direttamente su Firestore (permette l'accesso immediato da qualsiasi smartphone/browser)
      try {
        const weddingFromDb = await fetchWeddingByCodeFromFirestore(cleanCode);
        if (weddingFromDb) {
          found = weddingFromDb;
          if (onWeddingDiscovered) {
            onWeddingDiscovered(weddingFromDb);
          }
        }
      } catch (err) {
        console.warn('Errore lookup matrimonio da Firestore:', err);
      }
    }

    if (!found) {
      setGuestError(`Il codice "${cleanCode}" non è stato trovato. Verifica il codice ricevuto dagli sposi o contatta info@admarketing.it per ricevere assistenza.`);
      return;
    }

    const finalName = customData?.name || guestName.trim();
    const finalEmail = customData?.email || guestEmail.trim() || 'guest@example.com';
    const finalPhone = guestPhone.trim();

    if (!finalName) {
      setGuestError('Inserisci il tuo nome e cognome per entrare.');
      return;
    }

    if (!finalPhone) {
      setGuestError('Inserisci il tuo numero di cellulare per continuare.');
      return;
    }

    onGuestLogin({
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      weddingCode: cleanCode,
      provider,
      country: guestCountry
    }, rememberMeGuest);
  };

  // Submit Sposi con verifica di Codice Matrimonio, Email Sposa e Password
  const handleCoupleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoupleError('');

    const cleanCode = coupleWeddingCode.trim().toUpperCase();
    const cleanNormalized = cleanCode.replace(/[\s\-_]+/g, '');
    const cleanEmail = coupleEmail.trim().toLowerCase();
    const cleanPassword = couplePassword.trim();

    if (!cleanCode) {
      setCoupleError('Inserisci il Codice Matrimonio.');
      return;
    }
    if (!cleanEmail) {
      setCoupleError('Inserisci l\'Email della Sposa.');
      return;
    }
    if (!cleanPassword) {
      setCoupleError('Inserisci la Password Sposi.');
      return;
    }

    // 1. Cerca prima in locale
    let found = weddings.find(w => {
      const c = (w.weddingCode || '').trim().toUpperCase();
      return c === cleanCode || c.replace(/[\s\-_]+/g, '') === cleanNormalized;
    });

    // 2. Se non trovato in locale, prova lookup su Firestore
    if (!found) {
      try {
        const weddingFromDb = await fetchWeddingByCodeFromFirestore(cleanCode);
        if (weddingFromDb) {
          found = weddingFromDb;
          if (onWeddingDiscovered) {
            onWeddingDiscovered(weddingFromDb);
          }
        }
      } catch (err) {
        console.warn('Errore lookup sposi su Firestore:', err);
      }
    }

    if (!found) {
      setCoupleError(`Nessun matrimonio trovato con il codice "${cleanCode}". Per recuperare il vostro codice contattate info@admarketing.it.`);
      return;
    }

    // 3. Verifica credenziali: Email Sposa e Password
    let expectedEmail = (found.coupleEmail || '').trim().toLowerCase();
    let expectedPassword = (found.couplePassword || '').trim();

    // Se l'email o la password non corrispondono ai dati in cache, scarica sempre la versione aggiornata da Firestore
    if ((expectedEmail && cleanEmail !== expectedEmail) || (expectedPassword && cleanPassword !== expectedPassword)) {
      try {
        const freshWedding = await fetchWeddingByCodeFromFirestore(cleanCode);
        if (freshWedding) {
          found = freshWedding;
          if (onWeddingDiscovered) {
            onWeddingDiscovered(freshWedding);
          }
          expectedEmail = (freshWedding.coupleEmail || '').trim().toLowerCase();
          expectedPassword = (freshWedding.couplePassword || '').trim();
        }
      } catch (e) {
        console.warn('Controllo credenziali remote su Firestore:', e);
      }
    }

    // Controllo Email Sposa:
    if (expectedEmail && cleanEmail !== expectedEmail) {
      setCoupleError(`L'email inserita non corrisponde a quella della sposa registrata per questo matrimonio. Verificate l'indirizzo o contattate l'agenzia a info@admarketing.it.`);
      return;
    }

    // Controllo Password:
    if (expectedPassword && cleanPassword !== expectedPassword) {
      setCoupleError('Password non corretta. Per recuperare le credenziali d\'accesso del vostro matrimonio, inviate un\'email a info@admarketing.it.');
      return;
    }

    onCoupleLogin(found.weddingCode || cleanCode, cleanEmail, rememberMeCouple);
  };

  // Submit Admin
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPwd = adminPassword.trim();

    if (
      (cleanEmail === 'info@admarketing.it' ||
       cleanEmail === 'admin@weddingconcierge.it' ||
       cleanEmail === (ADMIN_CREDENTIALS.email || '').toLowerCase()) &&
      (cleanPwd === 'WeddingAdmin2026!' || cleanPwd === ADMIN_CREDENTIALS.password)
    ) {
      onAdminLogin(rememberMeAdmin);
    } else {
      setAdminError('Credenziali agenzia non valide. Per assistenza o per recuperare la password dello staff contatta info@admarketing.it.');
    }
  };

  // Submit Fornitore (Solo caselle per inserire le credenziali)
  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierError('');

    const query = supplierInput.trim().toLowerCase();
    if (!query) {
      setSupplierError('Inserisci la tua email aziendale o il codice fornitore assegnato.');
      return;
    }

    // Cerca tra i fornitori registrati
    const matchedSupplier = suppliers.find(s => 
      s.email.toLowerCase() === query ||
      s.id.toLowerCase() === query ||
      s.name.toLowerCase() === query
    );

    if (!matchedSupplier) {
      setSupplierError('Nessun fornitore registrato con questa email o codice. Per richiedere le credenziali contatta info@admarketing.it.');
      return;
    }

    const validPassword = matchedSupplier.accessPassword;
    if (supplierPassword !== validPassword) {
      setSupplierError('Password non corretta. Per recuperare la password della tua struttura contatta info@admarketing.it.');
      return;
    }

    onSupplierLogin(matchedSupplier.id, rememberMeSupplier);
  };

  // Submit Registrazione Nuova Struttura Hotel
  const handleHotelRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegHotelError('');

    if (!regHotelName.trim()) {
      setRegHotelError('Inserisci il nome della struttura ricettiva o hotel.');
      return;
    }
    if (!regHotelEmail.trim()) {
      setRegHotelError('Inserisci un\'email valida per la gestione delle prenotazioni e l\'accesso al portale.');
      return;
    }

    const cleanEmail = regHotelEmail.trim().toLowerCase();
    const existing = suppliers.find(s => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      setRegHotelError('Questa email è già associata a una struttura registrata. Passa alla scheda "Accedi al Portale".');
      return;
    }

    const cleanWebsiteUrl = regHotelWebsiteUrl.trim() ||
      (regHotelBookingEngineType === 'BOOKING_COM'
        ? `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(regHotelName.trim() + ' ' + regHotelCity.trim())}`
        : `https://www.${regHotelName.toLowerCase().replace(/[^a-z0-9]/g, '')}.it/booking`);

    const newSupplierId = `sup-hotel-${Date.now()}`;
    const timestampStr = `${new Date().toLocaleDateString('it-IT')} ore ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;

    if (onRegisterHotel) {
      onRegisterHotel({
        name: regHotelName.trim(),
        stars: Number(regHotelStars),
        city: regHotelCity.trim(),
        address: regHotelAddress.trim() || `${regHotelCity.trim()}, Puglia`,
        contactPerson: regHotelContact.trim() || 'Direzione Hotel',
        email: cleanEmail,
        phone: regHotelPhone.trim() || '+39 080 1234567',
        standardRate: Number(regHotelRate),
        websiteUrl: cleanWebsiteUrl,
        bookingEngineType: regHotelBookingEngineType,
        roomTypeName: regHotelRoomType.trim() || 'Camera Matrimoniale Deluxe',
        roomsBlocked: Number(regHotelRoomsBlocked),
        password: regHotelPassword.trim(),
        negotiatedPerk: regHotelPerk.trim()
      });
    }

    // Mostra modale con l'email di benvenuto e istruzioni inviata all'hotel
    setRegHotelSuccessModal({
      hotelName: regHotelName.trim(),
      email: cleanEmail,
      password: regHotelPassword.trim(),
      loginUrl: window.location.origin || 'https://apulianweddingconcierge.it',
      bookingEngineUrl: cleanWebsiteUrl,
      sentAt: timestampStr,
      supplierId: newSupplierId
    });

    // Invio automatico a Formspree (https://formspree.io/f/xaeqloob)
    try {
      fetch('https://formspree.io/f/xaeqloob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `Nuova Registrazione Hotel Partner - ${regHotelName.trim()}`,
          hotelName: regHotelName.trim(),
          city: regHotelCity.trim(),
          email: cleanEmail,
          phone: regHotelPhone.trim(),
          roomsBlocked: regHotelRoomsBlocked,
          timestamp: timestampStr
        })
      }).catch(err => console.warn("Formspree hotel reg error:", err));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-10">
      {/* ========================================================================= */}
      {/* HERO BANNER BENVENUTO PUGLIA                                              */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-200 bg-stone-800 text-white shadow-xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={heroBanner} 
            alt="Puglia Destination Wedding & Luxury Concierge" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-wider mb-3">
            <span>Hospitality & Wedding Destination Puglia</span>
            <span aria-hidden="true">·</span>
            <span>AD Marketing · Palagianello (TA)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-white tracking-tight leading-tight">
            Apulian Wedding Concierge
          </h1>

          <p className="text-neutral-300 text-sm sm:text-base mt-4 leading-relaxed max-w-2xl">
            La piattaforma integrata per matrimoni internazionali in Puglia: accoglienza ospiti, prenotazione autonoma di hotel convenzionati, transfer aeroporto, servizi di bellezza ed esperienze indimenticabili offerte dagli sposi.
          </p>

          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10 text-xs text-neutral-300 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-stone-400" />
              <span>Nessun Obbligo: Selezione Libera</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-stone-400" />
              <span>Hotel 5★, Transfer & Beauty Salons</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-stone-400" />
              <span>Assistente Valeria Dedicata in Puglia</span>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER SESSIONE SALVATA (Funzione Memoria) */}
      {savedSession && (
        <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-300 text-stone-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-200/80 rounded-xl text-stone-800 shrink-0">
              <UserCheck className="w-5 h-5 text-stone-800" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>Accesso Memorizzato su questo dispositivo</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-stone-800 mt-0.5">
                Sei pronto a riprendere la sessione come <strong className="font-semibold text-stone-950">{savedSession.name || savedSession.role}</strong> {savedSession.details ? `(${savedSession.details})` : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onResumeSavedSession && (
              <button
                type="button"
                onClick={onResumeSavedSession}
                className="px-4 py-2 bg-stone-750 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Accedi Subito</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onClearSavedSession && (
              <button
                type="button"
                onClick={onClearSavedSession}
                className="px-3 py-2 bg-white text-neutral-600 border border-neutral-300 rounded-xl text-xs hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cambia Profilo
              </button>
            )}
          </div>
        </div>
      )}


      {/* BANNER TEST REALI - AREA AGENZIA */}
      <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-md border border-neutral-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-stone-300 font-serif-luxury font-bold">
              Accesso Staff Agenzia
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Hai dimenticato le credenziali? Contatta <strong className="text-white">info@admarketing.it</strong> per assistenza.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SELETTORE AREE DI ACCESSO: MENU A PULSANTI ADATTIVO E RESPONSIVE         */}
      {/* (Nessuno scorrimento orizzontale, 100% responsive e carino per smartphone) */}
      {/* ========================================================================= */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center sm:text-left mb-2">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Seleziona la tua area di accesso:
          </span>
        </div>
        <div className="flex overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-2.5 whitespace-nowrap sm:whitespace-normal">
          {/* 1. Ospiti */}
          <button
            type="button"
            onClick={() => setActiveRole('guest')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all active:scale-95 cursor-pointer min-w-[140px] sm:min-w-0 border ${
              activeRole === 'guest'
                ? 'bg-stone-750 text-white font-semibold shadow-xs border-stone-950 ring-2 ring-stone-900/20'
                : 'text-neutral-700 hover:text-stone-800 hover:bg-neutral-50 bg-white border-neutral-200 shadow-2xs'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeRole === 'guest' ? 'bg-white/15 text-stone-200' : 'bg-stone-100 text-stone-800'}`}>
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block text-xs font-bold truncate">Ospiti & Invitati</span>
              <span className={`text-[10px] block mt-0.5 truncate ${activeRole === 'guest' ? 'text-stone-200' : 'text-neutral-500'}`}>
                Accesso con Codice
              </span>
            </div>
          </button>

          {/* 2. Sposi */}
          <button
            type="button"
            onClick={() => setActiveRole('couple')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all active:scale-95 cursor-pointer min-w-[140px] sm:min-w-0 border ${
              activeRole === 'couple'
                ? 'bg-rose-900 text-white font-semibold shadow-xs border-rose-950 ring-2 ring-rose-900/20'
                : 'text-neutral-700 hover:text-rose-900 hover:bg-rose-50/50 bg-white border-neutral-200 shadow-2xs'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeRole === 'couple' ? 'bg-white/15 text-rose-200' : 'bg-rose-100 text-rose-700'}`}>
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block text-xs font-bold truncate">Futuri Sposi</span>
              <span className={`text-[10px] block mt-0.5 truncate ${activeRole === 'couple' ? 'text-rose-200' : 'text-neutral-500'}`}>
                Area Coppia Nozze
              </span>
            </div>
          </button>

          {/* 3. Agenzia */}
          <button
            type="button"
            onClick={() => setActiveRole('admin')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all active:scale-95 cursor-pointer min-w-[140px] sm:min-w-0 border ${
              activeRole === 'admin'
                ? 'bg-stone-750 text-white font-semibold shadow-xs border-black ring-2 ring-neutral-900/20'
                : 'text-neutral-700 hover:text-stone-800 hover:bg-neutral-50 bg-white border-neutral-200 shadow-2xs'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeRole === 'admin' ? 'bg-white/15 text-neutral-200' : 'bg-neutral-100 text-neutral-700'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block text-xs font-bold truncate">Staff Agenzia</span>
              <span className={`text-[10px] block mt-0.5 truncate ${activeRole === 'admin' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                AD Marketing Back End
              </span>
            </div>
          </button>

          {/* 4. Fornitori */}
          <button
            type="button"
            onClick={() => setActiveRole('supplier')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all active:scale-95 cursor-pointer min-w-[140px] sm:min-w-0 border ${
              activeRole === 'supplier'
                ? 'bg-purple-900 text-white font-semibold shadow-xs border-purple-950 ring-2 ring-purple-900/20'
                : 'text-neutral-700 hover:text-purple-900 hover:bg-purple-50/50 bg-white border-neutral-200 shadow-2xs'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeRole === 'supplier' ? 'bg-white/15 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block text-xs font-bold truncate">Fornitori Partner</span>
              <span className={`text-[10px] block mt-0.5 truncate ${activeRole === 'supplier' ? 'text-purple-200' : 'text-neutral-500'}`}>
                Credenziali Private
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEZIONE 1: ACCESSO OSPITI (ESPLOSA COME PRINCIPALE) */}
      {activeRole === 'guest' && (
        <section className="bg-white border-2 border-stone-900/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 max-w-4xl mx-auto relative transition-all">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-50 border border-stone-200 text-stone-800 text-[11px] font-semibold uppercase tracking-wider mb-3">
              <Globe className="w-3.5 h-3.5 text-stone-700" />
              <span>Accesso Principale · Portale Ospiti & Invitati</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-800">
              Entra nel Matrimonio per cui sei Invitato
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
              Inserisci il <strong>Codice Matrimonio</strong> ricevuto per accedere a tutte le sezioni: prenota liberamente alloggi convenzionati, transfer dall'aeroporto, acconciatura ed escursioni pugliesi.
            </p>
          </div>

          {/* Toggle rapido: Accesso Rapido vs Registrazione Email */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex p-1 bg-neutral-100 rounded-xl text-xs font-medium text-neutral-600">
              <button
                type="button"
                onClick={() => setGuestMode('quick')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  guestMode === 'quick' 
                    ? 'bg-white text-stone-800 shadow-xs font-semibold' 
                    : 'hover:text-stone-800'
                }`}
              >
                Accesso con Codice Matrimonio
              </button>
              <button
                type="button"
                onClick={() => setGuestMode('register')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  guestMode === 'register' 
                    ? 'bg-white text-stone-800 shadow-xs font-semibold' 
                    : 'hover:text-stone-800'
                }`}
              >
                Registrati con Email Completa
              </button>
            </div>
          </div>

          {/* Form Dati Invitato & Codice Matrimonio */}
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nome e Cognome dell'Invitato
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Es. Eleanor Vance"
                className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email dell'Invitato
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="eleanor.vance@gmail.com"
                className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-700"
              />
            </div>

            {guestMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Città / Paese di Provenienza
                </label>
                <input
                  type="text"
                  value={guestCountry}
                  onChange={(e) => setGuestCountry(e.target.value)}
                  placeholder="Es. New York, Londra, Milano, Dublino"
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-700"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Codice Matrimonio (Ricevuto su WhatsApp dagli sposi)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-700 absolute left-3 top-3" />
                <input
                  type="text"
                  value={weddingCode}
                  onChange={(e) => setWeddingCode(e.target.value.toUpperCase())}
                  placeholder="ES: CHIARA-MATTEO-2026"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-800 font-mono font-bold tracking-wider uppercase text-stone-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Numero di Cellulare (Obbligatorio)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+39 333 1234567"
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-700"
                  required
                />
              </div>
            </div>

            {guestError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{guestError}</span>
              </div>
            )}

            {/* Funzione Memoria Ospiti */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 select-none py-1">
              <input
                type="checkbox"
                checked={rememberMeGuest}
                onChange={(e) => setRememberMeGuest(e.target.checked)}
                className="w-4 h-4 rounded text-stone-800 border-neutral-300 focus:ring-stone-800"
              />
              <span><strong>Ricordami su questo dispositivo</strong> (Accesso automatico futuro)</span>
            </label>

            <button
              type="button"
              onClick={() => handleGuestSubmit()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold text-white bg-stone-750 hover:bg-stone-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Entra nel Matrimonio Selezionato</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE SPOSI (Se attivata tramite pulsante piccolo)                     */}
      {/* ========================================================================= */}
      {activeRole === 'couple' && (
        <section className="bg-white border-2 border-rose-950/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 max-w-2xl mx-auto relative animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna all'Accesso Ospiti (Principale)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
              title="Chiudi e torna agli ospiti"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-700 fill-rose-700" />
              <span>Area Riservata Futuri Sposi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-800">
              Benvenuti nella Pagina Sposi
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2">
              Gestite i dettagli delle nozze, caricate le vostre foto, aggiungete informazioni secondarie (logistica, clima, lista nozze) e condividete l'invito ufficiale WhatsApp con i vostri ospiti.
            </p>
          </div>

          <form onSubmit={handleCoupleSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Codice Matrimonio *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-rose-700 absolute left-3 top-3" />
                <input
                  type="text"
                  value={coupleWeddingCode}
                  onChange={(e) => setCoupleWeddingCode(e.target.value.toUpperCase())}
                  placeholder="Es. CHIARA-MATTEO-2026"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-rose-50/50 border border-rose-300 rounded-lg font-mono font-bold text-rose-950 uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email della Sposa *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={coupleEmail}
                  onChange={(e) => setCoupleEmail(e.target.value)}
                  placeholder="es. sposa@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Password Sposi *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type={showCouplePassword ? "text" : "password"}
                  value={couplePassword}
                  onChange={(e) => setCouplePassword(e.target.value)}
                  placeholder="Inserisci la password sposi"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-800 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCouplePassword(!showCouplePassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCouplePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Accesso riservato: inserisci il <strong>Codice Matrimonio</strong>, l'<strong>Email della Sposa</strong> e la <strong>Password</strong>.
              </span>
            </div>

            {coupleError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{coupleError}</span>
              </div>
            )}

            {/* Funzione Memoria Sposi */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 select-none py-1">
              <input
                type="checkbox"
                checked={rememberMeCouple}
                onChange={(e) => setRememberMeCouple(e.target.checked)}
                className="w-4 h-4 rounded text-rose-800 border-neutral-300 focus:ring-rose-800"
              />
              <span><strong>Ricordami su questo dispositivo</strong> (Accesso automatico futuro)</span>
            </label>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors mt-2 cursor-pointer"
            >
              <span>Entra nel Portale Sposi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE AGENZIA (Se attivata tramite pulsante piccolo)                   */}
      {/* ========================================================================= */}
      {activeRole === 'admin' && (
        <section className="bg-white border-2 border-stone-700/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 max-w-2xl mx-auto relative animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna all'Accesso Ospiti (Principale)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
              title="Chiudi e torna agli ospiti"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center max-w-lg mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Back End · Staff Concierge AD Marketing
            </span>
            <h3 className="text-2xl font-serif-luxury font-bold text-stone-800 mt-1">
              Pannello Direzionale Concierge
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Gestione matrimoni in Puglia, pacchetti fornitori, inviti WhatsApp per gli sposi, monitoraggio scelte e contabilità.
            </p>
          </div>

          {/* Credenziali Accesso Staff Agenzia AD Marketing */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Richiesta Credenziali</span>
              </span>
            </div>
            <div className="text-[11px] text-neutral-600">
              Per accedere come staff, inserisci le tue credenziali aziendali. In caso di smarrimento, contatta <strong className="font-semibold text-stone-800">info@admarketing.it</strong>.
            </div>
          </div>

          <form onSubmit={handleAdminSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Amministratore
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@weddingconcierge.it"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type={showAdminPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {adminError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Funzione Memoria Admin */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 select-none py-1">
              <input
                type="checkbox"
                checked={rememberMeAdmin}
                onChange={(e) => setRememberMeAdmin(e.target.checked)}
                className="w-4 h-4 rounded text-stone-800 border-neutral-300 focus:ring-neutral-900"
              />
              <span><strong>Ricordami su questo dispositivo</strong> (Accesso automatico futuro)</span>
            </label>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-stone-750 hover:bg-stone-700 rounded-xl shadow-xs transition-colors mt-2 cursor-pointer"
            >
              <span>Accedi al Back Office Agenzia</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE FORNITORI (Se attivata tramite pulsante piccolo)                  */}
      {/* ========================================================================= */}
      {activeRole === 'supplier' && (
        <section className="bg-white border-2 border-purple-900/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 max-w-2xl mx-auto relative animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna all'Accesso Ospiti (Principale)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
              title="Chiudi e torna agli ospiti"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Package className="w-3.5 h-3.5 text-purple-700" />
              <span>Accesso Riservato Partner & Strutture Ricettive</span>
            </div>
            <h3 className="text-2xl font-serif-luxury font-bold text-stone-800">
              {supplierMode === 'login' ? 'Portale Fornitori & Hotel Partner' : 'Registra la Tua Struttura Ricettiva'}
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              {supplierMode === 'login'
                ? 'Accedi alla tua area riservata per gestire la scheda della struttura, consultare le prenotazioni ricevute e confermare le opzioni ospiti.'
                : 'Compila la scheda informativa con tutti i dettagli e le dotazioni della tua struttura. Il prezzo di riferimento e le quotazioni esatte saranno stabiliti dall\'agenzia in base alle date.'}
            </p>
          </div>

          {/* Selettore Modalità: Login vs Registrazione Struttura */}
          <div className="flex p-1 bg-purple-50/80 rounded-xl max-w-sm mx-auto border border-purple-200">
            <button
              type="button"
              onClick={() => setSupplierMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                supplierMode === 'login'
                  ? 'bg-purple-800 text-white shadow-2xs'
                  : 'text-purple-800 hover:text-purple-950'
              }`}
            >
              Accedi al Portale
            </button>
            <button
              type="button"
              onClick={() => setSupplierMode('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                supplierMode === 'register'
                  ? 'bg-purple-800 text-white shadow-2xs'
                  : 'text-purple-800 hover:text-purple-950'
              }`}
            >
              Registra Struttura (Compila Scheda)
            </button>
          </div>

          {/* MODALITÀ 1: Form Credenziali Fornitore */}
          {supplierMode === 'login' && (
            <form onSubmit={handleSupplierSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Aziendale o Codice Fornitore
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={supplierInput}
                    onChange={(e) => setSupplierInput(e.target.value)}
                    placeholder="Es. booking@borgoegnazia.it oppure sup-borgo"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-700 font-medium"
                    required
                  />
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Inserisci l'email o il codice fornitore presente nella mail di attivazione inviata dall'agenzia.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password di Accesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type={showSupplierPassword ? "text" : "password"}
                    value={supplierPassword}
                    onChange={(e) => setSupplierPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-700 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupplierPassword(!showSupplierPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showSupplierPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Per recuperare le credenziali, contatta <strong className="font-mono text-neutral-700">info@admarketing.it</strong>.
                </span>
              </div>

              {supplierError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{supplierError}</span>
                </div>
              )}

              {/* Funzione Memoria Fornitore */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 select-none py-1">
                <input
                  type="checkbox"
                  checked={rememberMeSupplier}
                  onChange={(e) => setRememberMeSupplier(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-700 border-neutral-300 focus:ring-purple-700"
                />
                <span><strong>Ricordami su questo dispositivo</strong> (Accesso automatico futuro)</span>
              </label>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors mt-2 cursor-pointer"
              >
                <span>Accedi all'Area Fornitore & Hotel</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* MODALITÀ 2: Compilazione Scheda Struttura da parte dell'Hotel */}
          {supplierMode === 'register' && (
            <form onSubmit={handleHotelRegisterSubmit} className="space-y-4 max-w-xl mx-auto text-xs animate-in fade-in">
              <div className="p-4 rounded-xl bg-stone-50/90 border border-stone-300 text-stone-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Politica Gestione Prezzi:</strong> La tua struttura compila qui la scheda completa con tutti i dettagli e le tipologie di camera. <strong>Il prezzo di riferimento e le quotazioni esatte verranno inseriti e determinati dallo staff dell'agenzia AD Marketing</strong> in base ai giorni del soggiorno e alla valutazione del periodo delle nozze.
                </div>
              </div>

              {regHotelError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regHotelError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nome Struttura Ricettiva / Hotel *
                  </label>
                  <input
                    type="text"
                    required
                    value={regHotelName}
                    onChange={(e) => setRegHotelName(e.target.value)}
                    placeholder="Es. Masseria Petrarolo / Hotel Villa Rosa"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Categoria Stelle</label>
                  <select
                    value={regHotelStars}
                    onChange={(e) => setRegHotelStars(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs"
                  >
                    <option value={3}>3 Stelle</option>
                    <option value={4}>4 Stelle Superior</option>
                    <option value={5}>5 Stelle Lusso</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Comune / Città in Puglia *</label>
                  <input
                    type="text"
                    required
                    value={regHotelCity}
                    onChange={(e) => setRegHotelCity(e.target.value)}
                    placeholder="Es. Fasano (BR), Monopoli, Ostuni..."
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Indirizzo Completo Struttura</label>
                  <input
                    type="text"
                    value={regHotelAddress}
                    onChange={(e) => setRegHotelAddress(e.target.value)}
                    placeholder="Es. Contrada Petrarolo s.n., Monopoli (BA)"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Referente / Contatto</label>
                  <input
                    type="text"
                    value={regHotelContact}
                    onChange={(e) => setRegHotelContact(e.target.value)}
                    placeholder="Es. Maria Rossi (Direzione)"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Telefono per Urgenze</label>
                  <input
                    type="text"
                    value={regHotelPhone}
                    onChange={(e) => setRegHotelPhone(e.target.value)}
                    placeholder="+39 080 1234567"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Prenotazioni & Login *</label>
                  <input
                    type="email"
                    required
                    value={regHotelEmail}
                    onChange={(e) => setRegHotelEmail(e.target.value)}
                    placeholder="booking@masseriapetrarolo.it"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Password Personale di Accesso</label>
                  <div className="relative">
                    <input
                      type={showRegHotelPassword ? "text" : "password"}
                      value={regHotelPassword}
                      onChange={(e) => setRegHotelPassword(e.target.value)}
                      placeholder="fornitore2026"
                      className="w-full p-2.5 pr-10 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegHotelPassword(!showRegHotelPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegHotelPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Sito Web o Booking Engine della Struttura (Per verifica disponibilità)
                  </label>
                  <input
                    type="url"
                    value={regHotelWebsiteUrl}
                    onChange={(e) => setRegHotelWebsiteUrl(e.target.value)}
                    placeholder="https://www.masseriapetrarolo.it/booking"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tipologia Camera Principale</label>
                  <input
                    type="text"
                    value={regHotelRoomType}
                    onChange={(e) => setRegHotelRoomType(e.target.value)}
                    placeholder="Es. Camera Deluxe Vista Ulivi"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Camere Disponibili per Nozze</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={regHotelRoomsBlocked}
                    onChange={(e) => setRegHotelRoomsBlocked(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Benefit / Accoglienza Riservata agli Ospiti del Matrimonio
                  </label>
                  <input
                    type="text"
                    value={regHotelPerk}
                    onChange={(e) => setRegHotelPerk(e.target.value)}
                    placeholder="Es. Bottiglia di vino pugliese in camera all'arrivo e late check-out"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 flex items-center justify-between">
                <span>Tariffa di riferimento e quotazioni:</span>
                <span className="font-bold text-purple-950 bg-white px-2 py-0.5 rounded border border-purple-300">
                  Valutata & Inserita dall'Agenzia AD Marketing
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-purple-800 hover:bg-purple-900 rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Salva Scheda Struttura & Accreditati nel Concierge</span>
              </button>
            </form>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE ALTRI ACCESSI PIÙ IN PICCOLO: SPOSI, AGENZIA, FORNITORI           */}
      {/* "mentre sposi , agenzia e fornitori più in piccolo"                       */}
      {/* ========================================================================= */}
      <section className="pt-2 border-t border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Altri Accessi Riservati alla Piattaforma
            </h3>
            <p className="text-xs text-neutral-500">
              Se sei una coppia di sposi, lo staff dell'agenzia o una struttura partner, clicca per accedere:
            </p>
          </div>
          {activeRole !== 'guest' && (
            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="text-xs font-semibold text-stone-800 hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Mostra di nuovo Accesso Ospiti principale</span>
            </button>
          )}
        </div>

        {/* 3 Card Più in Piccolo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. ACCESSO SPOSI (COMPATTO) */}
          <div
            onClick={() => {
              setActiveRole('couple');
              const el = document.getElementById('top');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
              activeRole === 'couple'
                ? 'bg-rose-50/70 border-rose-400 shadow-sm ring-1 ring-rose-400'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-rose-300 shadow-2xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    Coppia Nozze
                  </span>
                </div>
                <h4 className="text-sm font-serif-luxury font-bold text-stone-800 mt-0.5">
                  Accesso Sposi
                </h4>
                <p className="text-[11px] text-neutral-500 leading-snug mt-1">
                  Inserisci dettagli nozze, carica foto, gestisci note secondarie e crea inviti WhatsApp.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-rose-800 group-hover:text-rose-950">
              <span>{activeRole === 'couple' ? 'Sezione Sposi attiva' : 'Apri Login Sposi'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. ACCESSO AGENZIA (COMPATTO) */}
          <div
            onClick={() => {
              setActiveRole('admin');
              const el = document.getElementById('top');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
              activeRole === 'admin'
                ? 'bg-neutral-100 border-neutral-400 shadow-sm ring-1 ring-neutral-400'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-300 shadow-2xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 text-stone-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                    Staff AD Marketing
                  </span>
                </div>
                <h4 className="text-sm font-serif-luxury font-bold text-stone-800 mt-0.5">
                  Accesso Agenzia
                </h4>
                <p className="text-[11px] text-neutral-500 leading-snug mt-1">
                  Back office direzionale, approvazione pacchetti fornitori, contabilità e report ospiti.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-stone-700 group-hover:text-stone-800">
              <span>{activeRole === 'admin' ? 'Sezione Agenzia attiva' : 'Apri Login Agenzia'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. ACCESSO FORNITORI (COMPATTO) */}
          <div
            onClick={() => {
              setActiveRole('supplier');
              const el = document.getElementById('top');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
              activeRole === 'supplier'
                ? 'bg-purple-50/70 border-purple-400 shadow-sm ring-1 ring-purple-400'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-purple-300 shadow-2xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    Partner & Strutture
                  </span>
                </div>
                <h4 className="text-sm font-serif-luxury font-bold text-stone-800 mt-0.5">
                  Accesso Fornitori
                </h4>
                <p className="text-[11px] text-neutral-500 leading-snug mt-1">
                  Inserisci pacchetti per l'agenzia, ricevi prenotazioni email e configura pagamenti.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-purple-800 group-hover:text-purple-950">
              <span>{activeRole === 'supplier' ? 'Sezione Fornitori attiva' : 'Apri Login Fornitore'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODALE DI BENVENUTO & CREDENZIALI STRUTTURA HOTEL REGISTRATA             */}
      {/* ========================================================================= */}
      {regHotelSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Scheda Struttura Ricevuta
                  </span>
                  <h3 className="text-lg font-serif-luxury font-bold text-stone-800 leading-tight">
                    Benvenuto nel Concierge, {regHotelSuccessModal.hotelName}!
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRegHotelSuccessModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-300 text-xs text-stone-950 space-y-2 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-stone-800">
                <ShieldCheck className="w-4 h-4 text-stone-700" />
                <span>Politica Tariffe Convenzionate AD Marketing:</span>
              </div>
              <p>
                La tua struttura è stata registrata con successo nel sistema con tutti i dettagli e le camere disponibili. 
                <strong> Il prezzo di riferimento e le quotazioni esatte per gli ospiti saranno inseriti e definiti dallo staff dell'agenzia AD Marketing</strong> in base alle date e alla durata del soggiorno.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <span className="text-neutral-500 font-semibold block text-[11px] uppercase tracking-wider">
                Credenziali di Accesso Personali:
              </span>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Email di Accesso:</span>
                  <code className="font-mono font-bold text-purple-900">{regHotelSuccessModal.email}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Password Predefinita:</span>
                  <code className="font-mono font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-neutral-300">
                    {regHotelSuccessModal.password}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Codice Fornitore:</span>
                  <code className="font-mono text-neutral-700">{regHotelSuccessModal.supplierId}</code>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${regHotelSuccessModal.email}\nPassword: ${regHotelSuccessModal.password}\nLink: ${window.location.origin}`);
                  setCopiedRegEmail(true);
                  setTimeout(() => setCopiedRegEmail(false), 3000);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 font-semibold text-xs text-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedRegEmail ? 'Copiato!' : 'Copia Credenziali'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const hotelId = regHotelSuccessModal.supplierId;
                  setRegHotelSuccessModal(null);
                  onSupplierLogin(hotelId, true);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Accedi Subito al Portale Fornitori</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
