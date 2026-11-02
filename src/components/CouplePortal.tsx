import { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  MessageCircle, 
  Share2, 
  Users, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Eye, 
  ExternalLink, 
  Copy, 
  Image as ImageIcon,
  AlertCircle,
  HelpCircle,
  Utensils,
  Car,
  Sun,
  Gift,
  Compass,
  Check,
  X,
  Pencil,
  ArrowUp,
  ArrowDown,
  Send,
  ShoppingCart,
  Menu,
  LogOut
} from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { 
  WeddingData, 
  ScheduleEvent, 
  GalleryPhoto, 
  SecondaryInfoSection, 
  BroadcastAnnouncement,
  AdminSettings,
  ChatMessage
} from '../data/weddingStore';
import heroBanner from '../assets/images/wedding_concierge_hero_1791309110090.jpg';
import hotelSuiteImg from '../assets/images/wedding_hotel_suite_1791309120679.jpg';
import boatTourImg from '../assets/images/wedding_boat_experience_1791309131765.jpg';
import { compressImageFile } from '../lib/imageCompressor';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface CouplePortalProps {
  weddingData: WeddingData;
  onUpdateWedding: (updated: WeddingData) => void;
  onLogout: () => void;
  onPreviewAsGuest: (code: string) => void;
  adminSettings: AdminSettings;
  chatMessages?: ChatMessage[];
  onSendMessage?: (msg: { weddingCode: string; guestName: string; guestEmail: string; text: string }) => void;
  activeTab?: 'details' | 'photos' | 'secondary' | 'gift-services' | 'communication' | 'guests' | 'chat';
  setActiveTab?: (tab: 'details' | 'photos' | 'secondary' | 'gift-services' | 'communication' | 'guests' | 'chat') => void;
  onOpenMenu?: () => void;
}

export default function CouplePortal({
  weddingData,
  onUpdateWedding,
  onLogout,
  onPreviewAsGuest,
  adminSettings,
  chatMessages = [],
  onSendMessage,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onOpenMenu
}: CouplePortalProps) {
  if (!weddingData) return null;

  // Tabs di navigazione per gli sposi
  const [internalActiveTab, setInternalActiveTab] = useState<'details' | 'photos' | 'secondary' | 'gift-services' | 'communication' | 'guests' | 'chat'>('details');
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setActiveTab = (tab: any) => {
    if (propSetActiveTab) propSetActiveTab(tab);
    setInternalActiveTab(tab);
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'details', label: 'Dettagli Nozze', icon: <Heart className="w-5 h-5" /> },
    { id: 'photos', label: 'Galleria Foto', icon: <Camera className="w-5 h-5" /> },
    { id: 'secondary', label: 'Guida Utile', icon: <Info className="w-5 h-5" /> },
    { id: 'gift-services', label: 'Regala Servizi', icon: <Gift className="w-5 h-5" /> },
    { id: 'communication', label: 'Invito WhatsApp', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'guests', label: 'Riepilogo Ospiti', icon: <Users className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat Ospiti', icon: <MessageCircle className="w-5 h-5" /> },
  ];

  const [selectedChatGuestEmail, setSelectedChatGuestEmail] = useState<string>('');
  const [coupleReplyText, setCoupleReplyText] = useState('');



  // Cataloghi di fallback se non definiti nel matrimonio specifico
  const hotels = weddingData.hotels && weddingData.hotels.length > 0 ? weddingData.hotels : [
    {
      id: 'hotel-default-1',
      name: 'Borgo Egnazia Resort & Spa (5★ Lusso)',
      stars: 5,
      address: 'Contrada Losciale, Fasano (BR)',
      distanceToVenue: 'Sede della cerimonia',
      negotiatedRate: 520,
      currency: 'EUR',
      bookingDeadline: '2026-07-31',
      groupCode: weddingData.weddingCode,
      supplierId: 'sup-borgo',
      websiteUrl: 'https://www.borgoegnazia.it',
      negotiatedPerk: 'Bottiglia di Primitivo di Manduria DOC in camera.',
      pricingManagedByAgency: true,
      roomTypes: [
        { id: 'rt-1', name: 'Corte Bella Suite (Vista Ulivi)', pricePerNight: 520, totalBlocked: 30, availableRooms: 10, maxOccupancy: 2 },
        { id: 'rt-2', name: 'La Dimora Splendida', pricePerNight: 680, totalBlocked: 20, availableRooms: 8, maxOccupancy: 3 }
      ]
    }
  ];

  const transfers = weddingData.transfers && weddingData.transfers.length > 0 ? weddingData.transfers : [
    {
      id: 'tr-default-1',
      type: 'AIRPORT_SHUTTLE' as const,
      title: 'Navetta Collettiva Aeroporto Bari (BRI) / Brindisi (BDS)',
      origin: 'Aeroporti di Bari e Brindisi',
      destination: weddingData.venue,
      departureTime: 'Orari coordinati con i voli degli ospiti',
      vehicleType: 'Mercedes Sprinter VIP 16 posti',
      capacity: 16,
      bookedSeats: 4,
      pricePerSeat: 35,
      isPaidByCouple: false,
      supplierId: 'sup-ncc'
    }
  ];

  const experiences = weddingData.experiences && weddingData.experiences.length > 0 ? weddingData.experiences : [
    {
      id: 'exp-default-1',
      title: 'Gita in Barca al Tramonto alle Grotte di Polignano',
      category: 'BOAT_TOUR' as const,
      eventDate: '2026-09-11',
      startTime: '17:30 - 20:00',
      durationHours: 2.5,
      meetingPoint: 'Porto Turistico Cala Ponte, Polignano',
      pricePerPerson: 85,
      isHostSponsored: false,
      maxParticipants: 28,
      bookedParticipants: 12,
      dressCode: 'Resort Chic',
      description: 'Tour in motoscafo d\'epoca tra le scogliere di Polignano con aperitivo al tramonto.',
      supplierId: 'sup-boat'
    },
    {
      id: 'exp-default-2',
      title: 'Degustazione Vini & Olio in Masseria Storica',
      category: 'WINE_TASTING' as const,
      eventDate: '2026-09-13',
      startTime: '16:00 - 18:30',
      durationHours: 2.0,
      meetingPoint: 'Frantoio Ipogeo della Masseria',
      pricePerPerson: 55,
      isHostSponsored: true,
      maxParticipants: 40,
      bookedParticipants: 20,
      dressCode: 'Casual Elegante',
      description: 'Degustazione guidata di vini DOC pugliesi (Primitivo, Negroamaro, Fiano) e olio extravergine d\'oliva con prodotti tipici.',
      supplierId: 'sup-masseria'
    }
  ];

  const extraServices = weddingData.extraServices && weddingData.extraServices.length > 0 ? weddingData.extraServices : [
    {
      id: 'srv-default-1',
      title: 'Trucco Professionale per la Cerimonia',
      category: 'MAKEUP' as const,
      price: 90,
      isPaidByCouple: false,
      duration: '50 min',
      description: 'Make-up a lunga tenuta applicato direttamente nella tua camera in hotel.',
      providerName: 'Chiara Valente Bridal Glam'
    },
    {
      id: 'srv-default-2',
      title: 'Parrucchiera / Hair Styling Evento',
      category: 'HAIR' as const,
      price: 80,
      isPaidByCouple: false,
      duration: '45 min',
      description: 'Acconciatura professionale personalizzata per la cerimonia.',
      providerName: 'Puglia Luxury Hair'
    }
  ];

  // Stato Regala Servizi agli Ospiti (con calcolo preventivo e approvazione agenzia)
  const [giftGuestsCount, setGiftGuestsCount] = useState<number>(weddingData.guests.length || 24);
  const [selectedGiftExpIds, setSelectedGiftExpIds] = useState(
    experiences.filter(e => e.isHostSponsored).map(e => e.id)
  );
  const [giftProposalStatus, setGiftProposalStatus] = useState<'IDLE' | 'SENT_TO_AGENCY' | 'APPROVED'>('IDLE');

  // Stato Dettagli Matrimonio
  const [coupleNames, setCoupleNames] = useState(weddingData.coupleNames);
  const [weddingDate, setWeddingDate] = useState(weddingData.weddingDate);
  const [venue, setVenue] = useState(weddingData.venue);
  const [city, setCity] = useState(weddingData.city);
  const [welcomeMessage, setWelcomeMessage] = useState(weddingData.welcomeMessage);
  const [dressCode, setDressCode] = useState(weddingData.dressCode || '');
  const [story, setStory] = useState(weddingData.story || '');
  const [bannerImage, setBannerImage] = useState(weddingData.bannerImage);



  // Stato Timeline / Programma Nozze
  const [schedule, setSchedule] = useState(weddingData.schedule || [
    { id: 'ev-1', time: '16:30', title: 'Welcome Refreshment nell\'Agrumeto', location: 'Corte degli Aranci', description: 'Accoglienza con infusi freschi e drink di benvenuto' },
    { id: 'ev-2', time: '17:15', title: 'Cerimonia di Nozze tra gli Ulivi', location: 'Uliveto Storico', description: 'Scambio delle promesse' },
    { id: 'ev-3', time: '18:30', title: 'Aperitivo al Tramonto & Isole Gastronomiche', location: 'Piscina & Belvedere', description: 'Live show mozzarelle e vini pugliesi' },
    { id: 'ev-4', time: '20:30', title: 'Cena Placée sotto le Luminarie', location: 'Piazza della Corte', description: 'Banchetto tradizionale pugliese' },
    { id: 'ev-5', time: '23:00', title: 'Taglio della Torta Nuziale & Spettacolo', location: 'Giardino', description: 'Millefoglie e brindisi' },
    { id: 'ev-6', time: '23:30', title: 'Open Bar & DJ Set', location: 'Corte Notturna', description: 'Party e musica fino a tardi' }
  ]);

  // Stato Galleria Foto
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(weddingData.galleryPhotos || [
    { id: 'ph-1', url: hotelSuiteImg, caption: 'La nostra splendida masseria in Valle d\'Itria', uploadedAt: '2026-09-01' },
    { id: 'ph-2', url: boatTourImg, caption: 'Sopralluogo in barca a Polignano a Mare', uploadedAt: '2026-09-05' },
    { id: 'ph-3', url: heroBanner, caption: 'L\'aia illuminata dalle tradizionali luminarie pugliesi', uploadedAt: '2026-09-10' }
  ]);

  // Stato Informazioni Secondarie
  const [secondaryInfo, setSecondaryInfo] = useState<SecondaryInfoSection[]>(weddingData.secondaryInfo || [
    {
      id: 'sec-1',
      title: 'Logistica, Come Arrivare & Parcheggi',
      category: 'logistics',
      content: 'La masseria dista 45 minuti dall\'Aeroporto di Bari e 40 da quello di Brindisi. Per chi arriva in auto c\'è un ampio parcheggio interno gratuito con servizio valet. Navetta gratuita per gli ospiti che alloggiano negli hotel convenzionati.'
    },
    {
      id: 'sec-2',
      title: 'Clima a Settembre & Abbigliamento Consigliato',
      category: 'weather',
      content: 'Giornate calde e soleggiate (26°-29°C), la sera la brezza può rinfrescare l\'aria (19°-21°C). Consigliata una stola leggera. Per le signore: consigliamo scarpe con zeppa o tacco comodo per camminare sui ciottoli e sul prato.'
    },
    {
      id: 'sec-3',
      title: 'Lista Nozze & Regalo di Nozze',
      category: 'gift',
      content: 'Il vostro viaggio per festeggiare con noi è il regalo più bello! Se volete contribuire alla nostra luna di miele: IBAN IT98 X 03002 03280 000000123456 (Intestato agli sposi).'
    },
    {
      id: 'sec-4',
      title: 'Cucina Pugliese, Menù & Intolleranze',
      category: 'food',
      content: 'Tutti i piatti saranno preparati con eccellenze pugliesi. Abbiamo previsto menù specifici per celiaci, vegetariani e vegani: segnalatelo nel portale o a Valeria!'
    },
    {
      id: 'sec-5',
      title: 'Luoghi del Cuore da Visitare nei Dintorni',
      category: 'tourism',
      content: 'Consigliatissimi: Polignano a Mare, i trulli di Alberobello, la città bianca di Ostuni e una sosta tra le calette di Monopoli.'
    }
  ]);

  // Stato Avvisi / Annunci per gli ospiti (Broadcast)
  const [broadcastAnnouncements, setBroadcastAnnouncements] = useState<BroadcastAnnouncement[]>(weddingData.broadcastAnnouncements || [
    {
      id: 'ann-1',
      title: 'Navette Aeroporto Confermate',
      message: 'Le navette collettive da Bari e Brindisi sono attive. Ricordatevi di inserire il codice volo nella scheda Transfer!',
      date: '10 Settembre 2026',
      urgent: false
    },
    {
      id: 'ann-2',
      title: 'Welcome Party & Dress Code Informale',
      message: 'Per la festa dell\'11 settembre: abbigliamento comodo e fresco! Ci saranno panzerotti caldi e musica tradizionale nell\'aia.',
      date: '11 Settembre 2026',
      urgent: true
    }
  ]);

  // Stato Input Nuovi Elementi
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleLocation, setNewScheduleLocation] = useState('');
  const [newScheduleDesc, setNewScheduleDesc] = useState('');
  // Stato per la selezione della posizione (Maps)
  const [editingScheduleLocation, setEditingScheduleLocation] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  // Funzione per cercare location su Maps (mocking)
  const handleSearchLocation = (query: string) => {
    // In una implementazione reale qui si userebbe Places API
    triggerToast(`Ricerca su Google Maps per: ${query}...`);
    // Mock
    setEditingScheduleLocation(query + ' (Verificato su Maps)');
    setShowMapModal(false);
  };

  // Stato Modifica Elemento Esistente Timeline
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editScheduleTitle, setEditScheduleTitle] = useState('');
  const [editScheduleLocation, setEditScheduleLocation] = useState('');
  const [editScheduleDesc, setEditScheduleDesc] = useState('');

  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [newInfoTitle, setNewInfoTitle] = useState('');
  const [newInfoCategory, setNewInfoCategory] = useState<'logistics' | 'weather' | 'gift' | 'food' | 'tourism' | 'other'>('logistics');
  const [newInfoContent, setNewInfoContent] = useState('');

  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMessage, setNewAnnMessage] = useState('');
  const [newAnnUrgent, setNewAnnUrgent] = useState(false);

  // Stato Toast / Notifica Salvataggio
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Stato Modal Anteprima Foto Ingrandita (Lightbox)
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // Stato Ricerca Invitati
  const [guestSearch, setGuestSearch] = useState('');

  // Calcolo Giorni al Matrimonio
  const calculateDaysLeft = () => {
    try {
      const weddingDay = new Date(weddingDate);
      const today = new Date();
      const diffTime = weddingDay.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 150;
    }
  };

  // Sincronizzazione automatica se il matrimonio viene aggiornato esternamente (es. da ospiti, prenotazioni o agenzia)
  useEffect(() => {
    if (weddingData) {
      if (weddingData.coupleNames) setCoupleNames(weddingData.coupleNames);
      if (weddingData.weddingDate) setWeddingDate(weddingData.weddingDate);
      if (weddingData.venue) setVenue(weddingData.venue);
      if (weddingData.city) setCity(weddingData.city);
      if (weddingData.welcomeMessage) setWelcomeMessage(weddingData.welcomeMessage);
      if (weddingData.dressCode !== undefined) setDressCode(weddingData.dressCode);
      if (weddingData.story !== undefined) setStory(weddingData.story);
      if (weddingData.bannerImage) setBannerImage(weddingData.bannerImage);
      if (Array.isArray(weddingData.schedule)) setSchedule(weddingData.schedule);
      if (Array.isArray(weddingData.galleryPhotos)) setGalleryPhotos(weddingData.galleryPhotos);
      if (Array.isArray(weddingData.secondaryInfo)) setSecondaryInfo(weddingData.secondaryInfo);
      if (Array.isArray(weddingData.broadcastAnnouncements)) setBroadcastAnnouncements(weddingData.broadcastAnnouncements);
    }
  }, [weddingData]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
    }, 3500);
  };

  // Salvataggio globale delle modifiche con propagazione immediata
  const handleSaveWeddingChanges = (overrides?: Partial<WeddingData>, customMessage?: string) => {
    const updatedWedding: WeddingData = {
      ...weddingData,
      coupleNames: coupleNames.trim(),
      weddingDate,
      venue: venue.trim(),
      city: city.trim(),
      welcomeMessage: welcomeMessage.trim(),
      dressCode: dressCode.trim(),
      story: story.trim(),
      bannerImage,
      schedule,
      galleryPhotos,
      secondaryInfo,
      broadcastAnnouncements,
      ...(overrides || {})
    };

    onUpdateWedding(updatedWedding);
    triggerToast(customMessage || 'Modifiche salvate con successo! Visibili immediatamente agli ospiti.');
  };

  const [isExportingSheets, setIsExportingSheets] = useState(false);

  const handleExportToGoogleSheets = async () => {
    try {
      setIsExportingSheets(true);
      triggerToast('Autenticazione Google e creazione Foglio in corso...');

      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/drive.file');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('Impossibile ottenere il token di accesso Google.');
      }

      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `Elenco Sposi & Ristorante - ${coupleNames} (${weddingData.weddingCode})`
          }
        })
      });

      if (!createRes.ok) {
        throw new Error('Errore nella creazione del Google Sheet.');
      }

      const sheetData = await createRes.json();
      const spreadsheetId = sheetData.spreadsheetId;
      const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      const rows = [
        [
          'Nome Ospite',
          'Email',
          'Telefono',
          'Paese',
          'Nucleo Familiare',
          'Accompagnatori',
          'Hotel Prenotato',
          'Tipo Camera',
          'Transfer',
          'Esperienze & Servizi',
          'Dieta / Intolleranze / Allergie',
          'Stato RSVP'
        ],
        ...weddingData.guests.map(g => [
          g.name,
          g.email,
          g.phone || '',
          g.country || '',
          g.familyName || 'Nucleo Principale (1)',
          g.companions ? g.companions.map((c: any) => `${c.name} (${c.relationship})`).join(', ') : '',
          g.hotelBooked || 'Nessuno',
          g.roomType || '',
          g.transferBooked || 'Autonomo',
          g.serviceBookings ? Object.entries(g.serviceBookings).map(([k, v]: [string, any]) => `${k} (x${v.quantity})`).join('; ') : '',
          [g.diet, g.specialNeeds, g.companions?.map((c: any) => c.dietary).filter(Boolean).join('; ')].filter(Boolean).join(' | ') || 'Nessuna restrizione',
          g.status
        ])
      ];

      const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: 'Sheet1!A1',
          majorDimension: 'ROWS',
          values: rows
        })
      });

      if (!updateRes.ok) {
        throw new Error('Errore durante la scrittura dei dati nel foglio.');
      }

      triggerToast('Foglio Google creato e popolato con successo!');
      window.open(spreadsheetUrl, '_blank');
    } catch (err: any) {
      console.error('Errore export Google Sheets:', err);
      triggerToast(`Errore export Google Sheets: ${err?.message || 'Riprova più tardi'}`);
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Nome Ospite', 'Email', 'Telefono', 'Paese', 'Nucleo Familiare', 'Accompagnatori', 'Hotel', 'Camera', 'Transfer', 'Servizi', 'Dieta / Intolleranze', 'Stato RSVP'];
      const csvRows = [
        headers.join(','),
        ...weddingData.guests.map(g => [
          `"${g.name}"`,
          `"${g.email}"`,
          `"${g.phone || ''}"`,
          `"${g.country || ''}"`,
          `"${g.familyName || 'Nucleo Principale'}"`,
          `"${g.companions ? g.companions.map((c: any) => c.name).join(' - ') : ''}"`,
          `"${g.hotelBooked || 'Nessuno'}"`,
          `"${g.roomType || ''}"`,
          `"${g.transferBooked || 'Autonomo'}"`,
          `"${g.serviceBookings ? Object.keys(g.serviceBookings).join('; ') : ''}"`,
          `"${[g.diet, g.specialNeeds].filter(Boolean).join(' | ')}"`,
          `"${g.status}"`
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Elenco_Sposi_${weddingData.weddingCode}_Ristorante.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('File CSV esportato con successo!');
    } catch (e) {
      triggerToast('Errore durante l\'esportazione CSV');
    }
  };

  // Gestione Upload File Immagine Locale per Galleria con Compressione Ottimizzata (< 120KB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        triggerToast('Ottimizzazione e compressione foto in corso...');
        const compressedUrl = await compressImageFile(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.75,
          maxBytes: 120 * 1024
        });
        const newPhoto: GalleryPhoto = {
          id: `photo-${Date.now()}`,
          url: compressedUrl,
          caption: newPhotoCaption || file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date().toISOString().split('T')[0]
        };
        const updated = [newPhoto, ...galleryPhotos];
        setGalleryPhotos(updated);
        setNewPhotoCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Salvataggio automatico
        const updatedWedding: WeddingData = {
          ...weddingData,
          galleryPhotos: updated
        };
        onUpdateWedding(updatedWedding);
        triggerToast('Foto ottimizzata e aggiunta alla galleria!');
      } catch (err) {
        console.error('Errore compressione foto:', err);
        triggerToast('Errore durante il caricamento della foto');
      }
    }
  };

  // Gestione Upload Banner Principale con Compressione Ottimizzata (< 150KB)
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        triggerToast('Ottimizzazione immagine di copertina in corso...');
        const compressedBanner = await compressImageFile(file, {
          maxWidth: 1400,
          maxHeight: 800,
          quality: 0.75,
          maxBytes: 150 * 1024
        });
        setBannerImage(compressedBanner);
        const updatedWedding: WeddingData = {
          ...weddingData,
          bannerImage: compressedBanner
        };
        onUpdateWedding(updatedWedding);
        triggerToast('Nuova immagine copertina ottimizzata e applicata al matrimonio!');
      } catch (err) {
        console.error('Errore compressione banner:', err);
        triggerToast('Errore durante il caricamento della copertina');
      }
    }
  };

  // Aggiungi foto da URL esterno o preset
  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Foto del matrimonio',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newPhoto, ...galleryPhotos];
    setGalleryPhotos(updated);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    const updatedWedding: WeddingData = {
      ...weddingData,
      galleryPhotos: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Foto aggiunta alla galleria!');
  };

  const handleDeletePhoto = (id: string) => {
    const updated = galleryPhotos.filter(p => p.id !== id);
    setGalleryPhotos(updated);
    const updatedWedding: WeddingData = {
      ...weddingData,
      galleryPhotos: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Foto rimossa dalla galleria.');
  };

  // Timeline events management
  const handleAddScheduleEvent = () => {
    if (!newScheduleTime.trim() || !newScheduleTitle.trim()) return;
    const newEv: ScheduleEvent = {
      id: `ev-${Date.now()}`,
      time: newScheduleTime.trim(),
      title: newScheduleTitle.trim(),
      location: newScheduleLocation.trim() || venue,
      description: newScheduleDesc.trim()
    };
    const updated = [...schedule, newEv];
    setSchedule(updated);
    setNewScheduleTime('');
    setNewScheduleTitle('');
    setNewScheduleLocation('');
    setNewScheduleDesc('');

    const updatedWedding: WeddingData = {
      ...weddingData,
      schedule: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Nuovo momento aggiunto al programma nozze!');
  };

  const handleDeleteScheduleEvent = (id: string) => {
    const updated = schedule.filter(s => s.id !== id);
    setSchedule(updated);
    if (editingScheduleId === id) {
      setEditingScheduleId(null);
    }
    const updatedWedding: WeddingData = {
      ...weddingData,
      schedule: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Momento rimosso dal programma.');
  };

  // Inizio Modifica Momento Programma
  const handleStartEditSchedule = (item: ScheduleEvent) => {
    setEditingScheduleId(item.id);
    setEditScheduleTime(item.time);
    setEditScheduleTitle(item.title);
    setEditScheduleLocation(item.location || '');
    setEditScheduleDesc(item.description || '');
  };

  // Salva Modifica Momento Programma
  const handleSaveEditSchedule = () => {
    if (!editingScheduleId || !editScheduleTime.trim() || !editScheduleTitle.trim()) return;
    const updated = schedule.map(s => {
      if (s.id === editingScheduleId) {
        return {
          ...s,
          time: editScheduleTime.trim(),
          title: editScheduleTitle.trim(),
          location: editScheduleLocation.trim() || venue,
          description: editScheduleDesc.trim()
        };
      }
      return s;
    });
    setSchedule(updated);
    setEditingScheduleId(null);

    const updatedWedding: WeddingData = {
      ...weddingData,
      schedule: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Momento del programma modificato e salvato!');
  };

  // Annulla Modifica Momento Programma
  const handleCancelEditSchedule = () => {
    setEditingScheduleId(null);
    setEditScheduleTime('');
    setEditScheduleTitle('');
    setEditScheduleLocation('');
    setEditScheduleDesc('');
  };

  // Sposta Ordine Cronologico Momenti
  const handleMoveSchedule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= schedule.length) return;
    const newSched = [...schedule];
    const [removed] = newSched.splice(index, 1);
    newSched.splice(targetIndex, 0, removed);
    setSchedule(newSched);
    const updatedWedding: WeddingData = {
      ...weddingData,
      schedule: newSched
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Ordine del programma aggiornato!');
  };

  // Secondary info management
  const handleAddSecondaryInfo = () => {
    if (!newInfoTitle.trim() || !newInfoContent.trim()) return;
    const newSec: SecondaryInfoSection = {
      id: `sec-${Date.now()}`,
      title: newInfoTitle.trim(),
      category: newInfoCategory,
      content: newInfoContent.trim()
    };
    const updated = [...secondaryInfo, newSec];
    setSecondaryInfo(updated);
    setNewInfoTitle('');
    setNewInfoContent('');

    const updatedWedding: WeddingData = {
      ...weddingData,
      secondaryInfo: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Nuova scheda informativa pubblicata per gli ospiti!');
  };

  const handleDeleteSecondaryInfo = (id: string) => {
    const updated = secondaryInfo.filter(s => s.id !== id);
    setSecondaryInfo(updated);
    const updatedWedding: WeddingData = {
      ...weddingData,
      secondaryInfo: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Scheda informativa rimossa.');
  };

  // Broadcast announcements management
  const handleAddAnnouncement = () => {
    if (!newAnnTitle.trim() || !newAnnMessage.trim()) return;
    const newAnn: BroadcastAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle.trim(),
      message: newAnnMessage.trim(),
      urgent: newAnnUrgent,
      date: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    const updated = [newAnn, ...broadcastAnnouncements];
    setBroadcastAnnouncements(updated);
    setNewAnnTitle('');
    setNewAnnMessage('');
    setNewAnnUrgent(false);

    const updatedWedding: WeddingData = {
      ...weddingData,
      broadcastAnnouncements: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Avviso per gli ospiti pubblicato in bacheca!');
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = broadcastAnnouncements.filter(a => a.id !== id);
    setBroadcastAnnouncements(updated);
    const updatedWedding: WeddingData = {
      ...weddingData,
      broadcastAnnouncements: updated
    };
    onUpdateWedding(updatedWedding);
    triggerToast('Avviso rimosso.');
  };

  // WhatsApp Invite Generator for Couple
  const getWhatsAppCoupleInviteText = (lang: 'it' | 'en') => {
    if (lang === 'it') {
      return `👰🤵 Cari amici e parenti!

Siamo immensamente felici di invitarvi a celebrare il nostro matrimonio in Puglia:
💍 *${coupleNames}*
🗓 *Data:* ${new Date(weddingDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
📍 *Location:* ${venue} (${city})

Per rendere il vostro soggiorno un'esperienza meravigliosa e senza pensieri, abbiamo attivato la piattaforma *Apulian Wedding Concierge*.

📱 *Come accedere:*
1. Apri la piattaforma: https://concierge-wedding.vercel.app/?code=${weddingData.weddingCode}
2. Clicca su *Accesso Ospiti*
3. Inserisci il nostro Codice Matrimonio: *${weddingData.weddingCode}*

Troverete gli hotel convenzionati, i transfer dagli aeroporti di Bari e Brindisi, i servizi di acconciatura/trucco e le esperienze speciali che abbiamo organizzato per voi. Inoltre, l'assistente Valeria sarà a vostra disposizione in chat!

Con tutto il nostro affetto,
${coupleNames} ❤️`;
    } else {
      return `👰🤵 Dear friends and family!

We are overjoyed to celebrate our destination wedding in Puglia with you:
💍 *${coupleNames}*
🗓 *Date:* ${weddingDate}
📍 *Venue:* ${venue} (${city}, Italy)

To help you organize your travel smoothly, we have set up the *Apulian Wedding Concierge* platform!

📱 *How to access:*
1. Visit: https://concierge-wedding.vercel.app/?code=${weddingData.weddingCode}
2. Click on *Guest Access*
3. Enter our Wedding Code: *${weddingData.weddingCode}*

You can browse negotiated hotels, airport transfers from Bari and Brindisi, hair & makeup services, and RSVP for the special experiences we planned for you. Our dedicated concierge Valeria is also available on live chat!

With all our love,
${coupleNames} ❤️`;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`${label} copiato negli appunti!`);
  };

  const filteredGuests = weddingData.guests.filter(g => 
    g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
    g.country.toLowerCase().includes(guestSearch.toLowerCase()) ||
    g.email.toLowerCase().includes(guestSearch.toLowerCase())
  );

  // Messaggi chat di questo matrimonio per gli Sposi
  const weddingChatMessages = (chatMessages || []).filter(m => {
    const cleanCode = (weddingData.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
    const msgCode = (m.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
    return (!msgCode || msgCode === cleanCode) && 
           (m.sender === 'valeria' || m.sender === 'couple');
  });

  // Mappa di tutte le conversazioni disponibili (Solo Valeria)
  const chatConversationsMap = new Map<string, { name: string; email: string; lastMessage?: string; unread?: boolean; flag?: string }>();
  
  // Canale prioritario: Valeria Concierge (UNICA CHAT VISIBILE AGLI SPOSI)
  chatConversationsMap.set('valeria@admarketing.it', {
    name: 'Valeria · Concierge AD Marketing',
    email: 'valeria@admarketing.it',
    lastMessage: 'Linea diretta con la tua assistente dedicata AD Marketing',
    unread: false,
    flag: '🌿'
  });

  const chatConversations = Array.from(chatConversationsMap.values());
  const activeChatEmail = 'valeria@admarketing.it';

  const activeChatMessages = weddingChatMessages.filter(m => {
    return (m.guestEmail || '').toLowerCase() === 'valeria@admarketing.it' || 
           m.sender === 'couple' ||
           m.sender === 'valeria';
  });

  const handleCoupleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleReplyText.trim()) return;

    if (onSendMessage) {
      onSendMessage({
        weddingCode: weddingData.weddingCode,
        guestName: 'Sposi',
        guestEmail: weddingData.coupleEmail || 'sposi@wedding.it',
        text: coupleReplyText.trim()
      });
    }
    setCoupleReplyText('');
    triggerToast('Messaggio inviato a Valeria!');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notifica */}
      {showSaveToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-750 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER SPOSI: BENVENUTO, BADGE, CONTEGGIO & AZIONI RAPIDE                 */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-800 text-white shadow-xl border border-neutral-200">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={bannerImage || heroBanner} 
            alt="Copertina Matrimonio Sposi" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Area Riservata Sposi</span>
            </span>
            <span className="text-white/40">•</span>
            <span className="font-mono text-neutral-300">Codice: {weddingData.weddingCode}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-white tracking-tight leading-tight">
            {coupleNames}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-300 mt-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>{new Date(weddingDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-stone-400" />
              <span>{venue}, {city}</span>
            </div>
            <span>•</span>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-400/20 text-stone-300 font-semibold text-xs border border-stone-400/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Mancano {calculateDaysLeft()} giorni alle nozze!</span>
            </div>
          </div>

          <p className="text-neutral-300 text-xs sm:text-sm mt-4 leading-relaxed max-w-2xl line-clamp-2">
            {welcomeMessage}
          </p>

          {/* Quick Action Buttons for Couples */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/10">

            <button
              onClick={() => onPreviewAsGuest(weddingData.weddingCode)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white hover:bg-white/25 text-xs font-semibold transition-colors shadow-sm cursor-pointer border border-white/20"
            >
              <Eye className="w-3.5 h-3.5 text-stone-200" />
              <span>Vedi Come lo Vedono gli Invitati</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('communication');
                const text = getWhatsAppCoupleInviteText('it');
                copyToClipboard(text, 'Invito WhatsApp');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copia Invito WhatsApp</span>
            </button>

            <button
              onClick={() => handleSaveWeddingChanges()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salva Modifiche</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra di Stato Sezione Attiva Sposi */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Sezione Attiva:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 text-white font-semibold text-xs shadow-2xs">
            {navItems.find(n => n.id === activeTab)?.icon}
            <span>{navItems.find(n => n.id === activeTab)?.label}</span>
          </span>
        </div>

        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Tutte le Sezioni Nozze</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. DETTAGLI MATRIMONIO & PROGRAMMA DELLA GIORNATA                         */}
      {/* ========================================================================= */}
      {activeTab === 'details' && (
        <div className="space-y-8">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif-luxury font-bold text-stone-800">
                  Dettagli Generali delle Nozze
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Queste informazioni saranno visualizzate dagli ospiti al momento del login e nella loro guida di viaggio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salva Dettagli</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nomi degli Sposi
                </label>
                <input
                  type="text"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  placeholder="Es. Sophia Rossi & Liam O'Connor"
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Data del Matrimonio
                </label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Location Principale (Masseria, Villa, Resort)
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Es. Borgo Egnazia, Masseria Torre Coccaro"
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Città & Territorio in Puglia
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Es. Valle d'Itria, Fasano (BR), Ostuni"
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Messaggio di Benvenuto per gli Invitati
              </label>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Scrivi un messaggio affettuoso per i vostri amici e familiari che arrivano in Puglia..."
                className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Dress Code & Stile Suggerito
                </label>
                <input
                  type="text"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  placeholder="Es. Apulian Chic: lino e colori della terra, scarpe comode per il prato"
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Suggerimento: specifica il tipo di scarpe per le pavimentazioni storiche e il prato.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  La Nostra Storia (Breve Introduzione)
                </label>
                <input
                  type="text"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Es. Ci siamo innamorati della Valle d'Itria nel 2023..."
                  className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Tasto Salvataggio Card Dettagli Generali */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-neutral-500">I dati salvati saranno aggiornati all'istante anche per gli ospiti.</span>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({}, 'Dati generali e testi del matrimonio salvati!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 hover:bg-stone-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salva Dati Generali</span>
              </button>
            </div>
          </div>

          {/* Programma / Timeline Nozze */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>Programma della Giornata (Timeline Nozze)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Gli orari e i luoghi dei vari momenti (Welcome, Cerimonia, Aperitivo, Cena, Taglio Torta, Party).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({}, 'Programma timeline salvato con successo!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-stone-400" />
                <span>Salva Timeline</span>
              </button>
            </div>

            {/* Lista Momenti Timeline */}
            <div className="space-y-3">
              {schedule.map((item, idx) => {
                const isEditing = editingScheduleId === item.id;

                if (isEditing) {
                  return (
                    <div 
                      key={item.id}
                      className="p-4 bg-stone-50/60 rounded-xl border-2 border-stone-300 shadow-sm space-y-3 animate-in fade-in duration-200"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/70">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5 text-stone-700" />
                          <span>Modifica Momento del Programma</span>
                        </span>
                        <span className="text-[11px] text-stone-800/80 font-mono">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Orario</label>
                          <input
                            type="text"
                            value={editScheduleTime}
                            onChange={(e) => setEditScheduleTime(e.target.value)}
                            placeholder="17:30"
                            className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg font-mono font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-700"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Momento / Titolo</label>
                          <input
                            type="text"
                            value={editScheduleTitle}
                            onChange={(e) => setEditScheduleTitle(e.target.value)}
                            placeholder="Es. Cerimonia nell'Uliveto"
                            className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-700"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Luogo / Punto d'incontro</label>
                          <input
                            type="text"
                            value={editScheduleLocation}
                            onChange={(e) => setEditScheduleLocation(e.target.value)}
                            placeholder="Es. Borgo Egnazia, Uliveto"
                            className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-700"
                          />
                        </div>
                        <div className="sm:col-span-12">
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Dettagli & Note per gli ospiti (opzionale)</label>
                          <input
                            type="text"
                            value={editScheduleDesc}
                            onChange={(e) => setEditScheduleDesc(e.target.value)}
                            placeholder="Es. Calice di benvenuto, musica d'arpa e rinfresco per gli ospiti"
                            className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-stone-700"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/70">
                        <button
                          type="button"
                          onClick={handleCancelEditSchedule}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Annulla</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEditSchedule}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Salva Modifiche</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={item.id}
                    className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-100/70 transition-colors group"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-16 px-2 py-1.5 rounded-lg bg-stone-750 text-white text-center font-mono text-xs font-bold shrink-0 shadow-2xs">
                        {item.time}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-800 flex items-center gap-2 flex-wrap">
                          <span>{item.title}</span>
                          <span className="text-[11px] font-normal text-neutral-500">📍 {item.location}</span>
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-neutral-600 mt-0.5 leading-snug">{item.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Pulsanti per riordinare cronologicamente */}
                      <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSchedule(idx, 'up')}
                          className={`p-1 rounded text-neutral-500 hover:text-stone-800 ${idx === 0 ? 'opacity-25 cursor-not-allowed' : 'hover:bg-neutral-100 cursor-pointer'}`}
                          title="Sposta prima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === schedule.length - 1}
                          onClick={() => handleMoveSchedule(idx, 'down')}
                          className={`p-1 rounded text-neutral-500 hover:text-stone-800 ${idx === schedule.length - 1 ? 'opacity-25 cursor-not-allowed' : 'hover:bg-neutral-100 cursor-pointer'}`}
                          title="Sposta dopo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pulsante Modifica */}
                      <button
                        type="button"
                        onClick={() => handleStartEditSchedule(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 hover:text-stone-800 hover:border-stone-300 border border-neutral-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                        title="Modifica questo momento"
                      >
                        <Pencil className="w-3.5 h-3.5 text-stone-700" />
                        <span>Modifica</span>
                      </button>

                      {/* Pulsante Elimina */}
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduleEvent(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Rimuovi momento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aggiunta Nuovo Momento */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <span className="text-xs font-bold text-stone-700 block">
                Aggiungi un Nuovo Momento al Programma:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">Orario</label>
                  <input
                    type="text"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    placeholder="17:30"
                    className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">Momento / Titolo</label>
                  <input
                    type="text"
                    value={newScheduleTitle}
                    onChange={(e) => setNewScheduleTitle(e.target.value)}
                    placeholder="Es. Cerimonia nell'Uliveto"
                    className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg font-semibold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">Luogo / Punto d'incontro</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editingScheduleLocation || newScheduleLocation}
                      onChange={(e) => setNewScheduleLocation(e.target.value)}
                      placeholder="Es. Uliveto Storico"
                      className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className="absolute right-2 top-1.5 text-stone-600 hover:text-stone-800"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddScheduleEvent}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-stone-750 hover:bg-stone-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Aggiungi al Programma</span>
                  </button>
                </div>
                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">Dettagli & Descrizione per gli invitati (opzionale)</label>
                  <input
                    type="text"
                    value={newScheduleDesc}
                    onChange={(e) => setNewScheduleDesc(e.target.value)}
                    placeholder="Es. Rinfresco all'arrivo con bevande fresche, musica acustica e ventagli"
                    className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg text-stone-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banner Salvataggio Finale Sezione Dettagli */}
          <div className="p-5 rounded-2xl bg-stone-750 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Save className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Salva e Pubblica Dettagli Matrimonio</div>
                <p className="text-xs text-neutral-300">Tutte le modifiche a nomi, location, data e timeline della giornata vengono sincronizzate subito per gli invitati.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSaveWeddingChanges({}, 'Tutti i dettagli e il programma sono stati salvati!')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 shrink-0 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salva Tutte le Modifiche Dettagli</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CARICA FOTO & GESTIONE GALLERIA NOZZE                                  */}
      {/* ========================================================================= */}
      {activeTab === 'photos' && (
        <div className="space-y-8">
          {/* Foto Copertina / Banner Principale */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-rose-500" />
                  <span>Foto Copertina / Banner del Matrimonio</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Questa immagine accoglierà i vostri ospiti all'apertura del portale del vostro matrimonio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({ bannerImage }, 'Foto copertina salvata con successo!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5 text-stone-400" />
                <span>Salva Copertina</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 aspect-video rounded-xl overflow-hidden border border-neutral-200 shadow-xs relative">
                <img 
                  src={bannerImage} 
                  alt="Anteprima copertina" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                  Copertina Attuale
                </span>
              </div>

              <div className="md:col-span-7 space-y-3">
                <span className="text-xs font-semibold text-neutral-700 block">
                  Cambia l'immagine di copertina:
                </span>
                
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carica dal tuo Dispositivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBannerImage(hotelSuiteImg);
                      handleSaveWeddingChanges({ bannerImage: hotelSuiteImg }, 'Applicata e salvata suite Masseria come copertina!');
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Preset Suite Masseria
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBannerImage(boatTourImg);
                      handleSaveWeddingChanges({ bannerImage: boatTourImg }, 'Applicato e salvato mare di Polignano come copertina!');
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Preset Scogliere Polignano
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Formati consigliati: JPG o PNG orizzontali ad alta risoluzione (almeno 1600x900px).
                </p>
              </div>
            </div>
          </div>

          {/* Galleria Fotografica degli Sposi */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-stone-600" />
                  <span>Galleria Fotografica della Coppia & Luoghi ({galleryPhotos.length})</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Caricate le foto del vostro fidanzamento, dei sopralluoghi in Puglia o dei momenti più belli da condividere con gli invitati.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({ galleryPhotos, bannerImage }, 'Galleria fotografica salvata con successo!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5 text-stone-400" />
                <span>Salva Galleria ({galleryPhotos.length} foto)</span>
              </button>
            </div>

            {/* Box Caricamento Nuova Foto */}
            <div className="p-4 sm:p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <span className="text-xs font-bold text-stone-700 block">
                Carica Nuova Foto nella Galleria:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Didascalia / Titolo della Foto
                  </label>
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Es. Sopralluogo al tramonto nell'uliveto"
                    className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Carica File da PC/Smartphone
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-750 file:text-white hover:file:bg-stone-700 file:cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleziona & Carica</span>
                  </button>
                </div>
              </div>

              {/* Oppure tramite URL */}
              <div className="pt-2 flex items-center gap-2 text-xs">
                <span className="text-neutral-400">oppure inserisci URL immagine:</span>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://esempio.com/foto.jpg"
                  className="flex-1 p-1.5 text-xs bg-white border border-neutral-300 rounded-lg max-w-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoByUrl}
                  className="px-3 py-1.5 rounded-lg bg-neutral-200 text-stone-700 text-xs font-semibold hover:bg-neutral-300 cursor-pointer"
                >
                  Aggiungi URL
                </button>
              </div>
            </div>

            {/* Griglia Foto Caricate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {galleryPhotos.map((photo) => (
                <div 
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden border border-neutral-200 bg-stone-750 shadow-2xs hover:shadow-md transition-all flex flex-col"
                >
                  <div 
                    className="aspect-4/3 overflow-hidden cursor-pointer relative"
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption || 'Foto sposi'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 text-stone-800 text-xs font-bold flex items-center gap-1.5 shadow-md">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ingrandisci</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white flex items-center justify-between border-t border-neutral-100">
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-stone-800 truncate">
                        {photo.caption || 'Foto senza titolo'}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Caricata il {photo.uploadedAt}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Elimina foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tasto Salvataggio Card Galleria */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-neutral-500">Tutte le foto sono visibili in tempo reale agli ospiti invitati.</span>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({ galleryPhotos, bannerImage }, 'Galleria fotografica salvata con successo!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 hover:bg-stone-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5 text-stone-400" />
                <span>Salva Galleria Foto</span>
              </button>
            </div>
          </div>

          {/* Banner Salvataggio Finale Galleria */}
          <div className="p-5 rounded-2xl bg-stone-750 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Salva e Sincronizza Galleria Fotografica</div>
                <p className="text-xs text-neutral-300">Le foto caricate e le didascalie vengono mostrate subito nella gallery dei vostri invitati.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSaveWeddingChanges({ galleryPhotos, bannerImage }, 'Galleria fotografica salvata con successo!')}
              className="px-6 py-2.5 rounded-xl bg-stone-500 hover:bg-stone-400 text-stone-800 text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 shrink-0 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salva Tutte le Foto</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INFORMAZIONI SECONDARIE & GUIDA PER GLI OSPITI                          */}
      {/* ========================================================================= */}
      {activeTab === 'secondary' && (
        <div className="space-y-8">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>Informazioni Secondarie & Guida Utile agli Ospiti</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Consigli su parcheggi, clima della Puglia, coordinate per il regalo di nozze, intolleranze e posti da visitare.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({ secondaryInfo }, 'Informazioni utili salvate con successo!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salva Schede</span>
              </button>
            </div>

            {/* Schede Esistenti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {secondaryInfo.map((sec) => {
                const getIcon = () => {
                  switch (sec.category) {
                    case 'logistics': return <Car className="w-4 h-4 text-blue-600" />;
                    case 'weather': return <Sun className="w-4 h-4 text-stone-500" />;
                    case 'gift': return <Gift className="w-4 h-4 text-rose-500" />;
                    case 'food': return <Utensils className="w-4 h-4 text-emerald-600" />;
                    case 'tourism': return <Compass className="w-4 h-4 text-purple-600" />;
                    default: return <Info className="w-4 h-4 text-neutral-600" />;
                  }
                };

                return (
                  <div 
                    key={sec.id}
                    className="p-5 bg-neutral-50/70 rounded-2xl border border-neutral-200 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-lg bg-white border border-neutral-200 shadow-2xs">
                            {getIcon()}
                          </span>
                          <span className="text-xs font-bold text-stone-800">{sec.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSecondaryInfo(sec.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Elimina scheda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={sec.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSecondaryInfo(prev => prev.map(item => item.id === sec.id ? { ...item, content: val } : item));
                        }}
                        className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg leading-relaxed text-neutral-700"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500">
                      <span className="uppercase font-semibold tracking-wider text-[10px]">Categoria: {sec.category}</span>
                      <span>Modificabile in tempo reale</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aggiungi Nuova Scheda Informativa */}
            <div className="p-5 bg-sky-50/40 rounded-2xl border border-sky-200 space-y-3">
              <span className="text-xs font-bold text-sky-950 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-sky-700" />
                <span>Aggiungi una Nuova Scheda Informativa per gli Invitati:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Titolo della Scheda
                  </label>
                  <input
                    type="text"
                    value={newInfoTitle}
                    onChange={(e) => setNewInfoTitle(e.target.value)}
                    placeholder="Es. Dress Code Brunch del Giorno Dopo"
                    className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Categoria Icona
                  </label>
                  <select
                    value={newInfoCategory}
                    onChange={(e) => setNewInfoCategory(e.target.value as any)}
                    className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg"
                  >
                    <option value="logistics">🚗 Logistica & Parcheggi</option>
                    <option value="weather">☀️ Clima & Abbigliamento</option>
                    <option value="gift">🎁 Lista Nozze & Regalo</option>
                    <option value="food">🍷 Cucina & Intolleranze</option>
                    <option value="tourism">🏖️ Luoghi nei Dintorni</option>
                    <option value="other">ℹ️ Altra Informazione</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddSecondaryInfo}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crea &amp; Salva Scheda</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Testo Descrittivo della Scheda
                </label>
                <textarea
                  rows={2}
                  value={newInfoContent}
                  onChange={(e) => setNewInfoContent(e.target.value)}
                  placeholder="Scrivi le indicazioni e i consigli per i tuoi invitati..."
                  className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            {/* Tasto Salvataggio Card Info */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-neutral-500">Le schede informative vengono mostrate nella guida degli ospiti.</span>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({ secondaryInfo }, 'Informazioni utili salvate con successo!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 hover:bg-stone-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5 text-sky-400" />
                <span>Salva Schede Guida</span>
              </button>
            </div>
          </div>

          {/* Banner Salvataggio Finale Informazioni Secondarie */}
          <div className="p-5 rounded-2xl bg-stone-750 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Salva Informazioni Utili &amp; Guida Ospiti</div>
                <p className="text-xs text-neutral-300">Tutte le schede logistiche, meteo, regalo e culinarie sono pubblicate immediatamente agli invitati.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSaveWeddingChanges({ secondaryInfo }, 'Informazioni utili salvate con successo!')}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-800 text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 shrink-0 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salva Tutte le Informazioni</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REGALA SERVIZI ED ESPERIENZE AGLI OSPITI (CALCOLO PREVENTIVO SPOSI)   */}
      {/* ========================================================================= */}
      {activeTab === 'gift-services' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700">
                  <Gift className="w-4 h-4 text-stone-600" />
                  <span>Omaggi & Ospitalità dagli Sposi</span>
                </div>
                <h3 className="text-xl font-serif-luxury font-bold text-stone-800 mt-1">
                  Regala Esperienze e Servizi ai Tuoi Invitati
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                  Scegli quali servizi desideri offrire e regalare ai tuoi ospiti. Il sistema calcola in tempo reale il preventivo complessivo in base al numero di invitati stimati. Una volta confermata dall'agenzia AD Marketing, l'esperienza risulterà <strong>100% Gratuita (Offerta con affetto dagli Sposi)</strong> nel portale ospiti.
                </p>
              </div>

              {/* Status Badge & Tasto Salvataggio */}
              <div className="flex items-center gap-2.5 shrink-0">
                {giftProposalStatus === 'APPROVED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approvato dall'Agenzia</span>
                  </span>
                ) : giftProposalStatus === 'SENT_TO_AGENCY' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300">
                    <Clock className="w-4 h-4 text-stone-600" />
                    <span>In Valutazione Agenzia</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-200">
                    <Sparkles className="w-4 h-4 text-stone-600" />
                    <span>Configura Preventivo</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveWeddingChanges({}, 'Impostazioni regali e servizi salvate con successo!')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5 text-stone-400" />
                  <span>Salva Scelte Servizi</span>
                </button>
              </div>
            </div>

            {/* Configurazione Parametri & Numero Ospiti */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/60 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-stone-950 flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-800" />
                  <span>Numero Ospiti per cui Offrire i Servizi:</span>
                </span>
                <p className="text-[11px] text-stone-800">
                  Calcola la spesa moltiplicando la tariffa convenzionata per il numero di partecipanti.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGiftGuestsCount(Math.max(1, giftGuestsCount - 5))}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <div className="text-center">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={giftGuestsCount}
                    onChange={(e) => setGiftGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center font-bold text-sm bg-white border border-stone-300 rounded-lg py-1 px-2 text-stone-800"
                  />
                  <span className="block text-[10px] text-stone-800 font-medium mt-0.5">ospiti previsti</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGiftGuestsCount(giftGuestsCount + 5)}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setGiftGuestsCount(weddingData.guests.length || 24)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-stone-300 text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  Tutti ({weddingData.guests.length})
                </button>
              </div>
            </div>

            {/* Catalogo Esperienze con Selezione Regalo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Seleziona i Servizi da Offrire:
                </span>
                <span className="text-xs text-neutral-500">
                  {selectedGiftExpIds.length} servizi selezionati
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiences.map((exp) => {
                  const isSelected = selectedGiftExpIds.includes(exp.id);
                  const subTotal = exp.pricePerPerson * giftGuestsCount;

                  return (
                    <div
                      key={exp.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedGiftExpIds(selectedGiftExpIds.filter(id => id !== exp.id));
                        } else {
                          setSelectedGiftExpIds([...selectedGiftExpIds, exp.id]);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-stone-50/80 border-stone-400 ring-2 ring-stone-500/20 shadow-xs'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                            {exp.category}
                          </span>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-stone-600 border-stone-600 text-white' : 'border-neutral-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-stone-800 leading-snug">
                          {exp.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                          {exp.description}
                        </p>

                        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                          <span className="text-neutral-500">Tariffa a persona:</span>
                          <span className="font-semibold text-stone-800">€{exp.pricePerPerson}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-200/80 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-stone-800">
                          Totale per {giftGuestsCount} ospiti:
                        </span>
                        <span className="text-sm font-bold text-stone-800">
                          €{subTotal.toLocaleString('it-IT')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Box Preventivo Totale & Azioni */}
            {(() => {
              const totalGiftEstimate = selectedGiftExpIds.reduce((sum, id) => {
                const exp = experiences.find(e => e.id === id);
                return sum + (exp ? exp.pricePerPerson * giftGuestsCount : 0);
              }, 0);

              const handleSendToAgency = () => {
                setGiftProposalStatus('SENT_TO_AGENCY');
                triggerToast(`Proposta di ${selectedGiftExpIds.length} regali inviata a Valeria (AD Marketing) per approvazione e tariffa negoziata.`);
              };

              const handleApproveLocally = () => {
                // Imposta come approvato e aggiorna le esperienze
                setGiftProposalStatus('APPROVED');
                const updatedExperiences = experiences.map(e => ({
                  ...e,
                  isHostSponsored: selectedGiftExpIds.includes(e.id) ? true : e.isHostSponsored
                }));
                const updatedWedding = {
                  ...weddingData,
                  experiences: updatedExperiences
                };
                onUpdateWedding(updatedWedding);
                triggerToast('Servizi approvati! Ora appariranno come "Offerti dagli Sposi (Gratuiti)" per gli ospiti nel portale.');
              };

              return (
                <div className="p-5 rounded-2xl bg-stone-750 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                      Riepilogo Preventivo Servizi Offerti
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-serif-luxury font-bold text-white">
                        €{totalGiftEstimate.toLocaleString('it-IT')}
                      </span>
                      <span className="text-xs text-neutral-400">
                        ({selectedGiftExpIds.length} servizi per {giftGuestsCount} ospiti)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 max-w-lg">
                      {selectedGiftExpIds.length > 0
                        ? `Gli ospiti non pagheranno nulla per queste esperienze: il saldo sarà concordato con l'agenzia AD Marketing a tariffa preferenziale.`
                        : 'Seleziona almeno un servizio per calcolare il preventivo e offrirlo agli ospiti.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      disabled={selectedGiftExpIds.length === 0}
                      onClick={handleSendToAgency}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-600 hover:bg-stone-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Invia Richiesta all'Agenzia</span>
                    </button>
                    <button
                      type="button"
                      disabled={selectedGiftExpIds.length === 0}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                      onClick={() => triggerToast("Acquisto Esperienze attivato per gli Sposi")}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Acquista per Voi</span>
                    </button>

                    <button
                      type="button"
                      disabled={selectedGiftExpIds.length === 0}
                      onClick={handleApproveLocally}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                      title="Simula approvazione immediata agenzia"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Convalida & Attiva Subito</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Banner Salvataggio Finale Servizi & Omaggi */}
          <div className="p-5 rounded-2xl bg-stone-750 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Salva e Applica Servizi Offerti agli Ospiti</div>
                <p className="text-xs text-neutral-300">Le esperienze e i servizi approvati risulteranno subito gratuiti e offerti dagli sposi nel portale invitati.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSaveWeddingChanges({}, 'Servizi offerti agli ospiti salvati con successo!')}
              className="px-6 py-2.5 rounded-xl bg-stone-500 hover:bg-stone-400 text-stone-800 text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 shrink-0 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salva Scelte Servizi</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INVITO WHATSAPP DEGLI SPOSI (ex Sezione 4)                              */}

      {/* ========================================================================= */}
      {activeTab === 'communication' && (
        <div className="space-y-8">
          {/* Generatore Invito Ufficiale WhatsApp degli Sposi */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Condivisione Esterna
                </span>
                <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2 mt-0.5">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Invito Ufficiale WhatsApp degli Sposi per i Propri Ospiti</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Inviate questo messaggio tramite WhatsApp ai vostri invitati per invitarli e fornire il Codice Matrimonio con cui accedere al Concierge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({ broadcastAnnouncements }, 'Bacheca avvisi e comunicazioni salvate!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salva Comunicazioni</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Versione Italiana */}
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <span>🇮🇹</span>
                      <span>Messaggio in Italiano</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Pronto per WhatsApp
                    </span>
                  </div>

                  <pre className="p-3 bg-white rounded-xl border border-neutral-200 text-stone-700 text-[11px] font-sans leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {getWhatsAppCoupleInviteText('it')}
                  </pre>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(getWhatsAppCoupleInviteText('it'))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Invia Subito su WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(getWhatsAppCoupleInviteText('it'), 'Invito Italiano')}
                    className="p-2.5 rounded-xl border border-neutral-300 hover:bg-white text-neutral-700 transition-colors cursor-pointer"
                    title="Copia negli appunti"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Versione Inglese per Ospiti Internazionali */}
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <span>🇬🇧 🇺🇸</span>
                      <span>Messaggio in Inglese (International Guests)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                      English Version
                    </span>
                  </div>

                  <pre className="p-3 bg-white rounded-xl border border-neutral-200 text-stone-700 text-[11px] font-sans leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {getWhatsAppCoupleInviteText('en')}
                  </pre>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(getWhatsAppCoupleInviteText('en'))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(getWhatsAppCoupleInviteText('en'), 'English Invite')}
                    className="p-2.5 rounded-xl border border-neutral-300 hover:bg-white text-neutral-700 transition-colors cursor-pointer"
                    title="Copy text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bacheca Avvisi in Tempo Reale (Broadcast Announcements) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-stone-600" />
                <span>Bacheca Avvisi & Comunicazioni in Tempo Reale ({broadcastAnnouncements.length})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Scrivete avvisi importanti per tutti gli invitati: appariranno in evidenza nel loro portale ospiti!
              </p>
            </div>

            {/* Aggiungi Nuovo Avviso */}
            <div className="p-4 sm:p-5 bg-stone-50/50 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-950 block">
                Pubblica un Nuovo Avviso per gli Invitati:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Titolo dell'Avviso
                  </label>
                  <input
                    type="text"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="Es. Orario navetta confermato alle 16:30 dall'hotel"
                    className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center gap-2 pb-1">
                  <input
                    type="checkbox"
                    id="urgentCheck"
                    checked={newAnnUrgent}
                    onChange={(e) => setNewAnnUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-neutral-300"
                  />
                  <label htmlFor="urgentCheck" className="text-xs font-semibold text-rose-700 cursor-pointer">
                    Contrassegna come URGENTE
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Messaggio Dettagliato
                </label>
                <textarea
                  rows={2}
                  value={newAnnMessage}
                  onChange={(e) => setNewAnnMessage(e.target.value)}
                  placeholder="Scrivi il messaggio che tutti gli ospiti leggeranno..."
                  className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={handleAddAnnouncement}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 text-white text-xs font-semibold hover:bg-stone-750 transition-colors shadow-2xs cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Pubblica Avviso in Bacheca</span>
              </button>
            </div>

            {/* Lista Avvisi Pubblicati */}
            <div className="space-y-3">
              {broadcastAnnouncements.map((ann) => (
                <div 
                  key={ann.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    ann.urgent ? 'bg-rose-50 border-rose-200' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {ann.urgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                          Urgente
                        </span>
                      )}
                      <span className="text-xs font-bold text-stone-800">{ann.title}</span>
                      <span className="text-[10px] text-neutral-400">• {ann.date}</span>
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed max-w-2xl">
                      {ann.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`📢 *Avviso Sposi (${coupleNames})*: ${ann.title}\n\n${ann.message}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      title="Condividi questo avviso su WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      title="Elimina avviso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tasto Salvataggio Card Avvisi */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-neutral-500">Gli annunci pubblicati compaiono subito nella schermata dei vostri invitati.</span>
              <button
                type="button"
                onClick={() => handleSaveWeddingChanges({ broadcastAnnouncements }, 'Bacheca avvisi salvata con successo!')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 hover:bg-stone-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salva Avvisi Ospiti</span>
              </button>
            </div>
          </div>

          {/* Banner Salvataggio Finale Comunicazioni */}
          <div className="p-5 rounded-2xl bg-stone-750 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Salva Bacheca Annunci &amp; Messaggi Ospiti</div>
                <p className="text-xs text-neutral-300">Tutti gli avvisi urgenti e le comunicazioni vengono sincronizzati all'istante.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSaveWeddingChanges({ broadcastAnnouncements }, 'Bacheca avvisi sincronizzata con successo!')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 shrink-0 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salva Tutte le Comunicazioni</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RIEPILOGO INVITATI & MONITORAGGIO SCELTE (LIVE RSVP)                     */}
      {/* ========================================================================= */}
      {activeTab === 'guests' && (
        <div className="space-y-8">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Riepilogo Invitati & Scelte del Vostro Matrimonio ({weddingData.guests.length})</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Monitorate in tempo reale gli ospiti registrati, le loro camere, transfer ed eventuali intolleranze alimentari.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Cerca per nome, paese o email..."
                    className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveWeddingChanges({}, 'Lista ospiti e preferenze salvate con successo!')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Salva Ospiti</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Ospiti per gli Sposi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                <div className="text-2xl font-bold font-serif-luxury text-indigo-950">
                  {weddingData.guests.length}
                </div>
                <div className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                  Invitati Registrati
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                <div className="text-2xl font-bold font-serif-luxury text-emerald-950">
                  {weddingData.guests.filter(g => g.hotelBooked && g.hotelBooked !== '-').length}
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                  Alloggi in Convenzione
                </div>
              </div>

              <div className="p-4 bg-stone-50/50 rounded-xl border border-stone-100 text-center">
                <div className="text-2xl font-bold font-serif-luxury text-stone-950">
                  {weddingData.guests.filter(g => g.transferBooked && !g.transferBooked.includes('Autonomo')).length}
                </div>
                <div className="text-[11px] font-semibold text-stone-700 mt-0.5">
                  Navette / Transfer
                </div>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 text-center">
                <div className="text-2xl font-bold font-serif-luxury text-rose-950">
                  {weddingData.guests.filter(g => g.diet && g.diet !== 'Nessuna restrizione').length}
                </div>
                <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
                  Diete Speciali / Allergie
                </div>
              </div>
            </div>

            {/* Esportazione Elenco Sposi per il Ristorante (Google Sheets & CSV) */}
            <div className="p-4 bg-stone-750 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold">Esporta Elenco Sposi (Nucleo Familiare &amp; Intolleranze)</div>
                  <p className="text-xs text-neutral-300">Genera un Foglio Google o scarica il file CSV completo da consegnare al ristorante o allo staff del banchetto.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportToGoogleSheets}
                  disabled={isExportingSheets}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isExportingSheets ? 'Creazione Google Sheet...' : 'Esporta in Google Fogli'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2.5 rounded-xl bg-stone-600 hover:bg-stone-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Scarica CSV (Excel)</span>
                </button>
              </div>
            </div>

            {/* Tabella Invitati (Responsive: Cards su mobile, Table su desktop) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 font-semibold bg-neutral-50/60">
                    <th className="py-2.5 px-3">Ospite</th>
                    <th className="py-2.5 px-3">Origine</th>
                    <th className="py-2.5 px-3">Alloggio Prenotato</th>
                    <th className="py-2.5 px-3">Transfer / Volo</th>
                    <th className="py-2.5 px-3">Esperienze & Servizi</th>
                    <th className="py-2.5 px-3">Dieta & Allergie</th>
                    <th className="py-2.5 px-3">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredGuests.map((g) => (
                    <tr key={g.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-800">{g.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{g.email}</div>
                        {g.familyName && <div className="text-[10px] text-indigo-600 font-bold mt-1 uppercase tracking-tight">Nucleo: {g.familyName}</div>}
                        {g.companions && g.companions.length > 0 && (
                          <div className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                            +{g.companions.length} accompagnatori: <span className="font-medium text-stone-600">{g.companions.map((c: any) => c.name).join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="flex items-center gap-1.5 text-neutral-700">
                          <span>{g.flag}</span>
                          <span>{g.country}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-700">{g.hotelBooked || 'In attesa'}</div>
                        {g.roomType && g.roomType !== '-' && (
                          <div className="text-[10px] text-neutral-500">{g.roomType}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-stone-700">{g.transferBooked || 'Autonomo'}</div>
                        {g.flight && (
                          <div className="text-[10px] text-neutral-500 font-mono">✈️ {g.flight}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-1.5">
                          {g.serviceBookings && Object.entries(g.serviceBookings).length > 0 ? (
                            Object.entries(g.serviceBookings).map(([serviceId, booking]) => (
                              <div key={serviceId} className="text-[10px] leading-tight border-b border-neutral-100 pb-1 last:border-0">
                                <div className="font-bold text-stone-800 flex items-center justify-between">
                                  <span>{serviceId.replace(/-/g, ' ').toUpperCase()}</span>
                                  <span className="bg-stone-100 px-1 rounded">x{booking.quantity}</span>
                                </div>
                                {booking.notes && <div className="text-neutral-500 italic mt-0.5">Note: {booking.notes}</div>}
                              </div>
                            ))
                          ) : (
                            <span className="text-neutral-400 italic">Nessun servizio prenotato</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          g.diet && g.diet !== 'Nessuna restrizione'
                            ? 'bg-stone-100 text-stone-800 border border-stone-200'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {g.diet || 'Nessuna'}
                        </span>
                        {g.specialNeeds && (
                          <div className="text-[9px] text-amber-700 italic mt-1 leading-tight">
                            Note: {g.specialNeeds}
                          </div>
                        )}
                        {g.companions?.some((c: any) => c.dietary && c.dietary !== 'Standard') && (
                          <div className="text-[9px] text-rose-600 mt-1 font-medium border-t border-rose-100 pt-1">
                            Diete Accompagnatori: {g.companions.filter((c: any) => c.dietary !== 'Standard').map((c: any) => `${c.name}: ${c.dietary}`).join('; ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* View Mobile: Cards */}
            <div className="sm:hidden space-y-4">
              {filteredGuests.map((g) => (
                <div key={g.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-stone-800 text-sm">{g.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{g.email}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {g.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-1">
                      <span className="text-neutral-400 uppercase font-bold text-[9px]">Origine</span>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <span>{g.flag}</span>
                        <span>{g.country}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-neutral-400 uppercase font-bold text-[9px]">Alloggio</span>
                      <div className="font-semibold text-stone-700">{g.hotelBooked || 'In attesa'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-neutral-400 uppercase font-bold text-[9px]">Transfer</span>
                      <div className="text-stone-700">{g.transferBooked || 'Autonomo'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-neutral-400 uppercase font-bold text-[9px]">Dieta</span>
                      <div className="font-semibold text-stone-800">{g.diet || 'Nessuna'}</div>
                    </div>
                  </div>

                  {g.serviceBookings && Object.entries(g.serviceBookings).length > 0 && (
                    <div className="pt-2 border-t border-neutral-200 space-y-1">
                      <span className="text-neutral-400 uppercase font-bold text-[9px]">Servizi Prenotati</span>
                      <div className="space-y-1">
                        {Object.entries(g.serviceBookings).map(([serviceId, booking]) => (
                          <div key={serviceId} className="flex justify-between text-[10px]">
                            <span className="font-bold text-stone-800 uppercase">{serviceId.replace(/-/g, ' ')}</span>
                            <span className="bg-stone-100 px-1 rounded">x{booking.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {g.familyName && (
                    <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg inline-block">
                      Nucleo: {g.familyName}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Box Assistenza Valeria per gli Sposi */}
            <div className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-750 text-white font-bold flex items-center justify-center font-serif-luxury shrink-0">
                  V
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-950">
                    Valeria · Concierge Dedicata a {coupleNames}
                  </div>
                  <div className="text-[11px] text-stone-800">
                    AD Marketing Palagianello (TA) • WhatsApp: {adminSettings.valeriaPhone}
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${adminSettings.valeriaPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Ciao Valeria, siamo ${coupleNames} dal portale sposi! Avremmo bisogno di un aggiornamento sulla logistica del matrimonio.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-750 text-white text-xs font-semibold hover:bg-stone-700 transition-colors shadow-2xs shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scrivi a Valeria su WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CHAT OSPITI & COMUNICAZIONE SPOSI / CLIENTE                            */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                  Centrale Chat &amp; Messaggi Sposi (Cliente)
                </span>
              </div>
              <h2 className="text-xl font-serif-luxury font-bold text-stone-800 mt-1">
                Chat con Ospiti e Concierge Valeria · {coupleNames}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Rispondi agli invitati o chiedi supporto a Valeria per accoglienza, orari navette e transfer in tempo reale.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200">
                {weddingChatMessages.length} messaggi sincronizzati
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Elenco Canali / Conversazioni */}
            <div className="lg:col-span-4 border border-neutral-200 rounded-2xl bg-neutral-50 p-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block px-2">
                Canali Attivi ({chatConversations.length})
              </span>

              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {chatConversations.map((conv) => {
                  const isSelected = activeChatEmail.toLowerCase() === conv.email.toLowerCase();
                  const msgs = weddingChatMessages.filter(m => {
                    if (conv.email === 'valeria@admarketing.it') {
                      return m.guestEmail === 'valeria@admarketing.it' || m.sender === 'couple';
                    }
                    return (m.guestEmail || '').toLowerCase() === conv.email.toLowerCase();
                  });
                  const lastMsg = msgs[msgs.length - 1];

                  return (
                    <button
                      key={conv.email}
                      type="button"
                      onClick={() => setSelectedChatGuestEmail(conv.email)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-white shadow-xs border-rose-800 ring-2 ring-rose-800/10'
                          : 'border-transparent hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-stone-800 flex items-center gap-1.5 truncate">
                          <span>{conv.flag}</span>
                          <span className="truncate">{conv.name}</span>
                        </span>
                        {msgs.length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-200 text-stone-700 shrink-0">
                            {msgs.length}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate mt-1">
                        {lastMsg ? lastMsg.text : 'Nessun messaggio recente'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dettaglio Conversazione & Invio Risposta */}
            <div className="lg:col-span-8 border border-neutral-200 rounded-2xl bg-white p-5 space-y-4 flex flex-col justify-between min-h-[480px]">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                    <span>💬</span>
                    <span>Conversazione con: {chatConversationsMap.get(activeChatEmail.toLowerCase())?.name || activeChatEmail}</span>
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {activeChatEmail}
                  </span>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                  {activeChatEmail === 'valeria@admarketing.it' ? 'Concierge Valeria' : 'Invitato al Matrimonio'}
                </span>
              </div>

              {/* Area Messaggi */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-neutral-50/70 rounded-xl max-h-[360px] min-h-[240px]">
                {activeChatMessages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
                    <MessageCircle className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="font-semibold text-neutral-700">Nessun messaggio ancora scambiato in questa conversazione.</p>
                    <p className="text-[11px] text-neutral-400">
                      Scrivi un messaggio qui sotto per inviare un saluto o coordinare le opzioni con il tuo ospite o con Valeria!
                    </p>
                  </div>
                ) : (
                  activeChatMessages.map((m) => {
                    const isCouple = m.sender === 'couple';
                    const isValeria = m.sender === 'valeria';
                    const isGuest = m.sender === 'guest';

                    return (
                      <div
                        key={m.id}
                        className={`flex ${isCouple ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl p-3.5 text-xs shadow-2xs space-y-1 ${
                            isCouple
                              ? 'bg-rose-900 text-white rounded-br-none'
                              : isValeria
                              ? 'bg-emerald-900 text-white rounded-bl-none'
                              : 'bg-white border border-neutral-200 text-stone-800 rounded-bl-none'
                          }`}
                        >
                          <div className={`text-[10px] font-semibold flex items-center justify-between gap-2 ${
                            isCouple ? 'text-rose-200' : isValeria ? 'text-emerald-200' : 'text-neutral-500'
                          }`}>
                            <span>{isCouple ? `Voi (Sposi · ${coupleNames})` : isValeria ? 'Valeria · Concierge AD Marketing' : m.guestName}</span>
                            <span className="text-[9px] opacity-75">{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Suggerimenti Risposta Rapida */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-400 font-semibold self-center mr-1">Risposte rapide:</span>
                {[
                  "Non vediamo l'ora di vedervi in Puglia! ❤️",
                  "Grazie mille per aver confermato, a prestissimo!",
                  "Valeria sta verificando la navetta aeroporto per voi."
                ].map((quickText, qIdx) => (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => setCoupleReplyText(quickText)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                  >
                    {quickText}
                  </button>
                ))}
              </div>

              {/* Form Risposta Sposi */}
              <form onSubmit={handleCoupleSendMessage} className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <input
                  type="text"
                  value={coupleReplyText}
                  onChange={(e) => setCoupleReplyText(e.target.value)}
                  placeholder={`Scrivi un messaggio a ${chatConversationsMap.get(activeChatEmail.toLowerCase())?.name || 'questo destinatario'}...`}
                  className="flex-1 text-xs p-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-900"
                />
                <button
                  type="submit"
                  className="px-5 py-3 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invia Risposta</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX FOTO INGRANDITA                                            */}
      {/* ========================================================================= */}
      {previewPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div 
            className="max-w-4xl w-full bg-stone-800 rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-16/10 max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img 
                src={previewPhoto.url} 
                alt={previewPhoto.caption || 'Foto sposi'} 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-stone-750 text-white flex items-center justify-between text-xs border-t border-white/10">
              <span className="font-semibold text-sm">{previewPhoto.caption || 'Foto del matrimonio'}</span>
              <span className="text-neutral-400 font-mono text-[11px]">Caricata: {previewPhoto.uploadedAt}</span>
            </div>
          </div>
        </div>
      )}
      {showMapModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Cerca su Google Maps</h2>
            <input
              type="text"
              placeholder="Inserisci il nome della location..."
              className="w-full p-2 border rounded-lg mb-4"
              onChange={(e) => setNewScheduleLocation(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowMapModal(false)} className="px-4 py-2 text-sm bg-neutral-100 rounded-lg">Annulla</button>
              <button onClick={() => handleSearchLocation(newScheduleLocation)} className="px-4 py-2 text-sm bg-stone-750 text-white rounded-lg">Cerca</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

