import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  Send, 
  Search, 
  Share2, 
  LogOut, 
  Edit3, 
  Hotel, 
  Compass, 
  Car, 
  Sparkles, 
  Clock, 
  Flame, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Phone, 
  Mail, 
  DollarSign,
  Tag,
  ShieldCheck,
  Eye,
  Palette,
  Sliders,
  CreditCard,
  Landmark,
  FileText,
  Save,
  Layers,
  Brush,
  HelpCircle,
  Settings2,
  Globe,
  CheckSquare,
  Bell,
  AlertTriangle,
  ArrowRight,
  Filter,
  Menu,
  Heart,
  Lightbulb
} from 'lucide-react';
import HamburgerMenu, { MenuItem } from './HamburgerMenu';
import { 
  WeddingData, 
  HotelItem, 
  ExperienceItem, 
  TransferItem, 
  ExtraServiceItem,
  RoomTypeItem,
  MasterSupplier, 
  SupplierPackage, 
  SupplierBookingOrder, 
  TouristWishRequest, 
  ChatMessage, 
  PaymentRequest, 
  AdminSettings,
  GuestItem,
  WeddingAlertNotification,
  getSharedExperiencesDatabase,
  getSavedMasterExperiences,
  saveCustomMasterExperience
} from '../data/weddingStore';
import { saveWeddingToFirestore, deleteWeddingFromFirestore } from '../lib/firebase';
import CatalogSettings from './CatalogSettings';

export interface AdminPanelProps {
  weddings: WeddingData[];
  onUpdateWeddings: (weddings: WeddingData[]) => void;
  onResetToDemoWedding?: () => void;
  suppliers: MasterSupplier[];
  onUpdateSuppliers: (suppliers: MasterSupplier[]) => void;
  packages: SupplierPackage[];
  bookingOrders: SupplierBookingOrder[];
  onUpdateBookingOrders: (orders: SupplierBookingOrder[]) => void;
  wishRequests: TouristWishRequest[];
  onUpdateWishRequests: (wishes: TouristWishRequest[]) => void;
  chatMessages: ChatMessage[];
  onReplyChatMessage: (reply: { weddingCode: string; guestName: string; guestEmail: string; text: string }) => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  paymentRequests: PaymentRequest[];
  onUpdatePaymentRequests: (requests: PaymentRequest[]) => void;
  onLogout: () => void;
  onPreviewAsGuest?: (weddingCode: string) => void;
  onSendGmail?: (options: { to: string; subject: string; body: string }) => Promise<{ success: boolean }>;
}

export default function AdminPanel({
  weddings,
  onUpdateWeddings,
  onResetToDemoWedding,
  suppliers,
  onUpdateSuppliers,
  packages,
  bookingOrders,
  onUpdateBookingOrders,
  wishRequests,
  onUpdateWishRequests,
  chatMessages,
  onReplyChatMessage,
  adminSettings,
  onUpdateAdminSettings,
  paymentRequests,
  onUpdatePaymentRequests,
  onLogout,
  onPreviewAsGuest,
  onSendGmail
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'weddings' | 'hotels' | 'experiences' | 'transfers' | 'services' | 'guests' | 'chat' | 'suppliers' | 'settings' | 'wishlist' | 'payments' | 'catalog'>('weddings');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'weddings', label: 'Matrimoni', icon: <Heart className="w-5 h-5" /> },
    { id: 'hotels', label: 'Hotel', icon: <Building2 className="w-5 h-5" /> },
    { id: 'experiences', label: 'Esperienze', icon: <Compass className="w-5 h-5" /> },
    { id: 'transfers', label: 'Transfer', icon: <Car className="w-5 h-5" /> },
    { id: 'services', label: 'Servizi', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'guests', label: 'Ospiti', icon: <Users className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'suppliers', label: 'Fornitori', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Impostazioni', icon: <Settings2 className="w-5 h-5" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'payments', label: 'Pagamenti', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'catalog', label: 'Catalogo', icon: <Layers className="w-5 h-5" /> },
  ];
  const [searchWedding, setSearchWedding] = useState('');
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(weddings[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Gestione Schermata Impostazioni Avanzate Agenzia
  const [settingsSubTab, setSettingsSubTab] = useState<'company' | 'team_contacts' | 'banking' | 'branding' | 'features' | 'preview_sync'>('company');
  const [settingsForm, setSettingsForm] = useState<AdminSettings>(adminSettings);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState<string | null>(null);

  // Gestione Segnalazioni & Feedback di Avviso Matrimoni
  const [weddingAlertFilter, setWeddingAlertFilter] = useState<'ALL' | 'ALERTS_ONLY' | 'WITH_GUESTS'>('ALL');
  const [alertActionToast, setAlertActionToast] = useState<string | null>(null);
  const [wishFilterScope, setWishFilterScope] = useState<'selected' | 'all'>('all');
  const [wishSearchQuery, setWishSearchQuery] = useState('');
  const [wishStatusFilter, setWishStatusFilter] = useState<'ALL' | 'RECEIVED' | 'PROPOSAL_READY' | 'CONFIRMED'>('ALL');
  const [wishSelectedWeddingCode, setWishSelectedWeddingCode] = useState<string>('ALL');
  const [showAddWishModal, setShowAddWishModal] = useState(false);
  const [newWishForm, setNewWishForm] = useState<{
    weddingCode: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    title: string;
    description: string;
    preferredDate: string;
    participantsCount: number;
    budgetRange: string;
    proposedCost: number | string;
    agencyNotes: string;
    status: 'RECEIVED' | 'PROPOSAL_READY' | 'CONFIRMED' | 'ARCHIVED';
  }>({
    weddingCode: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    title: '',
    description: '',
    preferredDate: '',
    participantsCount: 2,
    budgetRange: '€150 - €300',
    proposedCost: 160,
    agencyNotes: '',
    status: 'RECEIVED'
  });

  const handleOpenAddWishModal = () => {
    const defaultCode = selectedWedding?.weddingCode || 'MONTECCHI-CAPULETI-2026';
    const firstGuest = selectedWedding?.guests?.[0];
    setNewWishForm({
      weddingCode: defaultCode,
      guestName: firstGuest?.name || '',
      guestEmail: firstGuest?.email || '',
      guestPhone: firstGuest?.phone || '',
      title: '',
      description: '',
      preferredDate: '',
      participantsCount: 2,
      budgetRange: '€150 - €300',
      proposedCost: 160,
      agencyNotes: '',
      status: 'RECEIVED'
    });
    setShowAddWishModal(true);
  };

  const handleSaveNewWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishForm.title.trim()) {
      alert('Inserisci il titolo della richiesta o del desiderio');
      return;
    }
    const createdWish: TouristWishRequest = {
      id: `wish-${Date.now()}`,
      weddingCode: (newWishForm.weddingCode || selectedWedding?.weddingCode || 'MONTECCHI-CAPULETI-2026').trim().toUpperCase(),
      guestName: newWishForm.guestName.trim() || 'Ospite',
      guestEmail: newWishForm.guestEmail.trim().toLowerCase(),
      guestPhone: newWishForm.guestPhone.trim(),
      title: newWishForm.title.trim(),
      description: newWishForm.description.trim(),
      preferredDate: newWishForm.preferredDate,
      participantsCount: Number(newWishForm.participantsCount) || 1,
      budgetRange: newWishForm.budgetRange,
      status: newWishForm.status || 'RECEIVED',
      agencyNotes: newWishForm.agencyNotes,
      proposedCost: newWishForm.proposedCost !== '' ? Number(newWishForm.proposedCost) : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = [createdWish, ...wishRequests];
    onUpdateWishRequests(updated);
    setShowAddWishModal(false);
    setAlertActionToast(`✓ Desiderio "${createdWish.title}" inserito con successo!`);
    setTimeout(() => setAlertActionToast(null), 3500);

    fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdWish)
    }).catch(() => {});
  };

  const handleDeleteWish = (wishId: string, wishTitle: string) => {
    if (confirm(`Sei sicuro di voler eliminare la richiesta "${wishTitle}"?`)) {
      const updated = wishRequests.filter(w => w.id !== wishId);
      onUpdateWishRequests(updated);
      setAlertActionToast(`Desiderio eliminato con successo.`);
      setTimeout(() => setAlertActionToast(null), 3000);

      fetch('/api/wishes/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishes: updated })
      }).catch(() => {});
    }
  };

  useEffect(() => {
    if (adminSettings) {
      setSettingsForm(adminSettings);
    }
  }, [adminSettings]);

  const handleSaveSettings = () => {
    onUpdateAdminSettings(settingsForm);
    setSettingsSaveSuccess('Tutte le modifiche e i dati societari sono stati applicati con successo a tutti i materiali!');
    setTimeout(() => setSettingsSaveSuccess(null), 3500);
  };

  // Modali Matrimonio
  const [showNewWeddingModal, setShowNewWeddingModal] = useState(false);
  const [createdWeddingForWhatsApp, setCreatedWeddingForWhatsApp] = useState<WeddingData | null>(null);
  const [editingWedding, setEditingWedding] = useState<WeddingData | null>(null);

  // Modali Hotel
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelItem | null>(null);
  const [hotelForm, setHotelForm] = useState<Partial<HotelItem>>({
    name: '',
    stars: 5,
    address: '',
    distanceToVenue: '',
    negotiatedRate: 250,
    currency: 'EUR',
    groupCode: '',
    bookingDeadline: '',
    negotiatedPerk: '',
    websiteUrl: '',
    agencyPricingNotes: ''
  });
  const [hotelRoomTypes, setHotelRoomTypes] = useState<RoomTypeItem[]>([
    { id: 'rt-1', name: 'Deluxe Room', pricePerNight: 250, totalBlocked: 10, availableRooms: 10, maxOccupancy: 2 }
  ]);

  // Modali Esperienza
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [expForm, setExpForm] = useState<Partial<ExperienceItem>>({
    title: '',
    category: 'BOAT_TOUR',
    eventDate: '',
    startTime: '18:00 - 20:30',
    durationHours: 2.5,
    meetingPoint: '',
    pricePerPerson: 75,
    isHostSponsored: false,
    maxParticipants: 30,
    bookedParticipants: 0,
    dressCode: 'Resort Chic',
    description: '',
    negotiatedPerk: '',
    supplierId: ''
  });
  const [searchSharedExp, setSearchSharedExp] = useState('');
  const [sharedExpCategoryFilter, setSharedExpCategoryFilter] = useState<string>('ALL');
  const [showSharedCatalogModal, setShowSharedCatalogModal] = useState(false);
  const [sharedExpToast, setSharedExpToast] = useState<string | null>(null);
  const [saveToMasterCatalogToo, setSaveToMasterCatalogToo] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Modali Transfer
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<TransferItem | null>(null);
  const [transferForm, setTransferForm] = useState<Partial<TransferItem>>({
    title: '',
    type: 'AIRPORT_SHUTTLE',
    origin: 'Aeroporto di Bari (BRI)',
    destination: '',
    departureTime: '11:00 e 15:30',
    vehicleType: 'Mercedes Sprinter VIP 16 posti',
    capacity: 16,
    bookedSeats: 0,
    pricePerSeat: 35,
    isPaidByCouple: false,
    negotiatedPerk: ''
  });

  // Modali Servizi Extra / Beauty
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ExtraServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<ExtraServiceItem>>({
    title: '',
    category: 'MAKEUP',
    price: 90,
    isPaidByCouple: false,
    duration: '50 min',
    description: '',
    providerName: 'Chiara Valente Bridal Glam',
    negotiatedPerk: '',
    paymentLink: '',
    paymentMode: 'ONLINE_LINK'
  });

  const handleOpenNewService = () => {
    setEditingService(null);
    setServiceForm({
      title: 'Trucco Professionale per la Cerimonia',
      category: 'MAKEUP',
      price: 90,
      isPaidByCouple: false,
      duration: '50 min',
      description: 'Make-up a lunga tenuta applicato direttamente in camera.',
      providerName: 'Chiara Valente Bridal Glam',
      negotiatedPerk: 'Ritocco incluso prima della cerimonia.',
      paymentLink: '',
      paymentMode: 'ONLINE_LINK'
    });
    setShowServiceModal(true);
  };

  const handleOpenEditService = (srv: ExtraServiceItem) => {
    setEditingService(srv);
    setServiceForm({ ...srv });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWedding || !serviceForm.title?.trim()) return;

    const newSrv: ExtraServiceItem = {
      id: editingService?.id || `srv-${Date.now()}`,
      title: serviceForm.title.trim(),
      category: serviceForm.category as any || 'MAKEUP',
      price: Number(serviceForm.price) || 80,
      isPaidByCouple: Boolean(serviceForm.isPaidByCouple),
      duration: serviceForm.duration || '50 min',
      description: serviceForm.description || '',
      providerName: serviceForm.providerName || 'Fornitore Partner Puglia',
      negotiatedPerk: serviceForm.negotiatedPerk || '',
      paymentLink: serviceForm.paymentLink || '',
      paymentMode: serviceForm.paymentMode || 'ONLINE_LINK'
    };

    let updatedServices: ExtraServiceItem[];
    if (editingService) {
      updatedServices = (selectedWedding.extraServices || []).map(s => s.id === editingService.id ? newSrv : s);
    } else {
      updatedServices = [...(selectedWedding.extraServices || []), newSrv];
    }

    const updatedWedding: WeddingData = {
      ...selectedWedding,
      extraServices: updatedServices
    };

    await persistWeddingUpdate(updatedWedding);
    setShowServiceModal(false);
  };

  const handleDeleteService = async (srvId: string) => {
    if (!selectedWedding) return;
    if (confirm('Eliminare questo servizio extra per questo matrimonio?')) {
      const updatedServices = (selectedWedding.extraServices || []).filter(s => s.id !== srvId);
      const updatedWedding: WeddingData = { ...selectedWedding, extraServices: updatedServices };
      await persistWeddingUpdate(updatedWedding);
    }
  };

  // Chat Admin
  const [selectedChatGuest, setSelectedChatGuest] = useState<string>('ALL');
  const [replyText, setReplyText] = useState('');
  const [chatFeedback, setChatFeedback] = useState<string | null>(null);

  // Form Nuovo/Modifica Matrimonio
  const [weddingForm, setWeddingForm] = useState<Partial<WeddingData>>({
    coupleNames: '',
    weddingCode: '',
    weddingDate: '',
    venue: 'Masseria San Domenico',
    city: 'Savelletri di Fasano (BR)',
    country: 'Italia',
    coupleEmail: '',
    couplePhone: '',
    couplePassword: 'password123',
    welcomeMessage: '',
    dressCode: 'Formal Chic Pugliese',
    story: ''
  });

  // Matrimonio Selezionato
  const selectedWedding = weddings.find(w => w.id === selectedWeddingId) || weddings[0];

  // Chat Concierge Individuale Valeria
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatListFilter, setChatListFilter] = useState<'with_messages' | 'all_guests'>('with_messages');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Aggregazione conversazioni per il matrimonio selezionato
  const currentWeddingChatMessages = chatMessages.filter(m => {
    if (!selectedWedding?.weddingCode) return false;
    const mCode = (m.weddingCode || '').trim().toUpperCase();
    const wCode = (selectedWedding.weddingCode || '').trim().toUpperCase();
    return mCode === wCode || mCode.replace(/[\s\-_]+/g, '') === wCode.replace(/[\s\-_]+/g, '');
  });

  const guestByEmailMap = new Map<string, GuestItem>();
  const guestByNameMap = new Map<string, GuestItem>();
  (selectedWedding?.guests || []).forEach(g => {
    if (g.email) guestByEmailMap.set(g.email.trim().toLowerCase(), g);
    if (g.name) guestByNameMap.set(g.name.trim().toLowerCase(), g);
  });

  const conversationsMap = new Map<string, {
    id: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    role: 'guest' | 'couple';
    messages: ChatMessage[];
    lastMessage?: ChatMessage;
    unreadCount: number;
    guestData?: GuestItem;
  }>();

  // 1. Canale Sposi (Cliente)
  if (selectedWedding) {
    const coupleEmail = (selectedWedding.coupleEmail || 'sposi@wedding.it').trim().toLowerCase();
    const coupleMsgs = currentWeddingChatMessages.filter(
      m => m.sender === 'couple' || (m.guestEmail && m.guestEmail.trim().toLowerCase() === coupleEmail)
    );
    conversationsMap.set('sposi-coppia', {
      id: 'sposi-coppia',
      guestName: `Sposi · ${selectedWedding.coupleNames}`,
      guestEmail: selectedWedding.coupleEmail || 'sposi@wedding.it',
      guestPhone: selectedWedding.couplePhone,
      role: 'couple',
      messages: coupleMsgs,
      lastMessage: coupleMsgs[coupleMsgs.length - 1],
      unreadCount: coupleMsgs.filter(m => !m.readByAdmin && m.sender === 'couple').length
    });
  }

  // 2. Raggruppa i messaggi degli ospiti
  currentWeddingChatMessages.forEach(m => {
    if (m.sender === 'couple') return;
    const emailNorm = (m.guestEmail || '').trim().toLowerCase();
    const nameNorm = (m.guestName || '').trim();
    if (!emailNorm && !nameNorm) return;

    const convId = emailNorm || nameNorm.toLowerCase().replace(/\s+/g, '-');
    const matchedGuest = (emailNorm ? guestByEmailMap.get(emailNorm) : null) || 
                         (nameNorm ? guestByNameMap.get(nameNorm.toLowerCase()) : null);

    if (!conversationsMap.has(convId)) {
      conversationsMap.set(convId, {
        id: convId,
        guestName: matchedGuest?.name || m.guestName || 'Ospite Invitato',
        guestEmail: matchedGuest?.email || m.guestEmail || '',
        guestPhone: matchedGuest?.phone,
        role: 'guest',
        messages: [],
        unreadCount: 0,
        guestData: matchedGuest || undefined
      });
    }

    const conv = conversationsMap.get(convId)!;
    conv.messages.push(m);
    if (!m.readByAdmin && m.sender === 'guest') {
      conv.unreadCount += 1;
    }
  });

  // Ordina i messaggi cronologicamente
  conversationsMap.forEach(conv => {
    conv.messages.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    conv.lastMessage = conv.messages[conv.messages.length - 1];
  });

  // 3. Se attivo il filtro "tutti gli ospiti", includi anche gli ospiti registrati che non hanno ancora inviato messaggi
  if (chatListFilter === 'all_guests' && selectedWedding?.guests) {
    selectedWedding.guests.forEach(g => {
      const emailNorm = (g.email || '').trim().toLowerCase();
      const convId = emailNorm || g.name.trim().toLowerCase().replace(/\s+/g, '-');
      if (!conversationsMap.has(convId)) {
        conversationsMap.set(convId, {
          id: convId,
          guestName: g.name,
          guestEmail: g.email || '',
          guestPhone: g.phone,
          role: 'guest',
          messages: [],
          lastMessage: undefined,
          unreadCount: 0,
          guestData: g
        });
      }
    });
  }

  // Lista finale filtrata per la ricerca e ordinata
  const conversationsList = Array.from(conversationsMap.values())
    .filter(conv => {
      if (chatListFilter === 'with_messages' && conv.messages.length === 0) {
        return false;
      }
      if (!chatSearchQuery.trim()) return true;
      const q = chatSearchQuery.toLowerCase();
      return conv.guestName.toLowerCase().includes(q) || 
             conv.guestEmail.toLowerCase().includes(q) ||
             (conv.lastMessage?.text || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      const tA = a.lastMessage?.timestamp || '';
      const tB = b.lastMessage?.timestamp || '';
      return tB.localeCompare(tA);
    });

  // Conversazione attualmente selezionata
  const activeConversation = 
    conversationsList.find(c => c.id === selectedChatGuest) ||
    conversationsList[0] ||
    Array.from(conversationsMap.values())[0];

  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, selectedChatGuest, chatMessages]);

  // Helper salvataggio sincronizzato
  const persistWeddingUpdate = async (updatedWedding: WeddingData) => {
    const updatedList = weddings.map(w => w.id === updatedWedding.id ? updatedWedding : w);
    onUpdateWeddings(updatedList);

    try {
      await saveWeddingToFirestore(updatedWedding);
    } catch (err) {
      console.warn('Errore salvataggio Firestore:', err);
    }
  };

  const handleCopyLink = (code: string) => {
    const url = `https://concierge-wedding.vercel.app/?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateWeddingWhatsAppMessage = (w: WeddingData) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://concierge-wedding.vercel.app';
    const portalUrl = `${origin}/?code=${encodeURIComponent(w.weddingCode)}`;
    return encodeURIComponent(
      `✨ *Apulian Wedding Concierge - Benvenuti al Matrimonio di ${w.coupleNames}* ✨\n\n` +
      `Siamo felicissimi di avervi con noi per celebrare il nostro giorno speciale in Puglia!\n\n` +
      `📅 *Data:* ${w.weddingDate}\n` +
      `📍 *Location:* ${w.venue}, ${w.city}\n\n` +
      `📱 *Accedi al Portale Ospiti Ufficiale:*\n` +
      `1. Apri il link: ${portalUrl}\n` +
      `2. Clicca su "Accesso Ospiti"\n` +
      `3. Codice Matrimonio: *${w.weddingCode}*\n\n` +
      `Troverete tutti gli hotel convenzionati, i transfer dagli aeroporti, le esperienze pugliesi e la chat concierge di Valeria a vostra completa disposizione!\n\n` +
      `Non vediamo l'ora di festeggiare insieme! 🥂`
    );
  };

  const generateBrideWhatsAppCredentialsMessage = (w: WeddingData) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://concierge-wedding.vercel.app';
    const coupleEmailParam = encodeURIComponent(w.coupleEmail || '');
    const coupleCodeParam = encodeURIComponent(w.weddingCode || '');
    const portalUrl = `${origin}/?role=couple&code=${coupleCodeParam}&email=${coupleEmailParam}`;
    return encodeURIComponent(
      `💐 *Gentile ${w.coupleNames}, benvenuti in Apulian Wedding Concierge!* 💐\n\n` +
      `Il vostro matrimonio in Puglia è ora attivo sulla nostra piattaforma esclusiva.\n\n` +
      `🔐 *Credenziali di Accesso Riservato Sposi:*\n` +
      `• Codice Matrimonio: *${w.weddingCode}*\n` +
      `• Email Sposa: *${w.coupleEmail || 'Non inserita'}*\n` +
      `• Password Sposi: *${w.couplePassword || 'puglia2026'}*\n\n` +
      `📲 *Link di Accesso Diretto al Portale:*\n${portalUrl}\n\n` +
      `Dalla vostra area riservata potrete personalizzare il programma della giornata (con geolocalizzazione Google Maps), gestire le scelte degli invitati e chattare direttamente con Valeria Concierge.\n\n` +
      `Per qualsiasi modifica o richiesta, siamo al vostro fianco!\n` +
      `*AD Marketing Concierge Puglia*`
    );
  };

  // Helper generazione automatica codice matrimonio
  const generateAutomaticWeddingCode = (names: string, date?: string, existingCodes: string[] = []): string => {
    let year = '2026';
    if (date) {
      const yearMatch = date.match(/202[4-9]/);
      if (yearMatch) year = yearMatch[0];
    }

    let cleaned = (names || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[+&]/g, ' ')
      .replace(/\b(and|e|ed|con)\b/gi, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim();

    const parts = cleaned.split(/\s+/).filter(Boolean);
    let baseCode = '';
    if (parts.length >= 2) {
      baseCode = `${parts[0]}-${parts[1]}-${year}`.toUpperCase();
    } else if (parts.length === 1) {
      baseCode = `${parts[0]}-${year}`.toUpperCase();
    } else {
      const rand = Math.floor(1000 + Math.random() * 9000);
      baseCode = `PUGLIA-${year}-${rand}`.toUpperCase();
    }

    let finalCode = baseCode;
    let counter = 1;
    while (existingCodes.includes(finalCode)) {
      counter++;
      finalCode = `${baseCode}-${counter}`;
    }

    return finalCode;
  };

  // Creazione / Salvataggio Matrimonio
  const handleSaveWeddingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingForm.coupleNames?.trim()) return;

    if (editingWedding) {
      // Modifica esistente - salvataggio modifiche anche per email, telefono e password
      const updated: WeddingData = {
        ...editingWedding,
        ...weddingForm,
        coupleNames: (weddingForm.coupleNames || editingWedding.coupleNames).trim(),
        weddingCode: (weddingForm.weddingCode || editingWedding.weddingCode).trim().toUpperCase(),
        coupleEmail: weddingForm.coupleEmail !== undefined ? weddingForm.coupleEmail.trim() : (editingWedding.coupleEmail || ''),
        couplePhone: weddingForm.couplePhone !== undefined ? weddingForm.couplePhone.trim() : (editingWedding.couplePhone || ''),
        couplePassword: weddingForm.couplePassword !== undefined ? weddingForm.couplePassword.trim() : (editingWedding.couplePassword || 'puglia2026')
      } as WeddingData;

      await persistWeddingUpdate(updated);
      setEditingWedding(null);
      setShowNewWeddingModal(false);
    } else {
      // Nuovo matrimonio: codice matrimonio generato automaticamente
      const existingCodes = weddings.map(w => (w.weddingCode || '').toUpperCase());
      const code = (
        weddingForm.weddingCode?.trim() || 
        generateAutomaticWeddingCode(weddingForm.coupleNames?.trim() || 'PUGLIA', weddingForm.weddingDate, existingCodes)
      ).toUpperCase();

      const newId = `wed-${Date.now()}`;
      const defaultEmail = `${code.toLowerCase().replace(/[^a-z0-9]/g, '')}@weddingpuglia.it`;
      const brideEmail = (weddingForm.coupleEmail || '').trim() || defaultEmail;
      const bridePhone = (weddingForm.couplePhone || '').trim();
      const bridePassword = (weddingForm.couplePassword || '').trim() || 'puglia2026';

      const newWedding: WeddingData = {
        id: newId,
        weddingCode: code,
        coupleNames: weddingForm.coupleNames.trim(),
        coupleEmail: brideEmail,
        couplePhone: bridePhone,
        couplePassword: bridePassword,
        weddingDate: weddingForm.weddingDate || '12 Settembre 2026',
        venue: weddingForm.venue || 'Masseria San Domenico',
        city: weddingForm.city || 'Savelletri di Fasano (BR)',
        country: weddingForm.country || 'Italia',
        bannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        welcomeMessage: weddingForm.welcomeMessage || `Benvenuti al nostro matrimonio in Puglia! Siamo felici di avervi con noi.`,
        currency: 'EUR',
        conciergeEmail: adminSettings?.adminNotificationEmail || 'info@admarketing.it',
        conciergePhone: adminSettings?.agencyPhone || '+39 099 888 5678',
        conciergeWhatsApp: adminSettings?.valeriaPhone || '+39 340 1234567',
        dressCode: weddingForm.dressCode || 'Formal Chic Pugliese',
        story: weddingForm.story || 'La nostra storia d’amore tra gli ulivi e il mare della Puglia.',
        schedule: [
          { id: `sch-1-${newId}`, time: '17:00', title: 'Cerimonia di Nozze', location: weddingForm.venue || 'Masseria', description: 'Scambio delle promesse al tramonto' },
          { id: `sch-2-${newId}`, time: '19:30', title: 'Aperitivo & Cena Pugliese', location: weddingForm.venue || 'Masseria', description: 'Banchetto gourmet tipico pugliese' }
        ],
        galleryPhotos: [],
        secondaryInfo: [],
        broadcastAnnouncements: [],
        hotels: [],
        transfers: [],
        experiences: [],
        extraServices: [],
        guests: [],
        giftRequests: []
      };

      const nextList = [newWedding, ...weddings];
      onUpdateWeddings(nextList);
      setSelectedWeddingId(newId);

      try {
        await saveWeddingToFirestore(newWedding);
      } catch (err) {
        console.warn('Errore salvataggio nuovo matrimonio su Firestore:', err);
      }

      setShowNewWeddingModal(false);
      setCreatedWeddingForWhatsApp(newWedding);
    }
  };

  const handleOpenEditWedding = (w: WeddingData) => {
    setEditingWedding(w);
    setWeddingForm({
      coupleNames: w.coupleNames,
      weddingCode: w.weddingCode,
      weddingDate: w.weddingDate,
      venue: w.venue,
      city: w.city,
      country: w.country,
      coupleEmail: w.coupleEmail,
      couplePhone: w.couplePhone,
      couplePassword: w.couplePassword,
      welcomeMessage: w.welcomeMessage,
      dressCode: w.dressCode,
      story: w.story
    });
  };

  const handleDeleteWedding = async (wedding: WeddingData) => {
    if (confirm('Sei sicuro di voler eliminare questo matrimonio?')) {
      const next = weddings.filter(w => w.id !== wedding.id);
      onUpdateWeddings(next);
      if (selectedWeddingId === wedding.id && next.length > 0) {
        setSelectedWeddingId(next[0].id);
      }
      try {
        await deleteWeddingFromFirestore(wedding.id, wedding.weddingCode);
      } catch (err) {
        console.warn('Errore eliminazione matrimonio da Firestore:', err);
      }
    }
  };

  const resolveExperience = (expIdOrTitle: string) => {
    const weddingExps = selectedWedding?.experiences || [];
    let found = weddingExps.find(e => e.id === expIdOrTitle || e.title.toLowerCase() === expIdOrTitle.toLowerCase());
    if (found) return found;

    const masterExps = getSavedMasterExperiences();
    found = masterExps.find(e => e.id === expIdOrTitle || e.title.toLowerCase() === expIdOrTitle.toLowerCase());
    if (found) return found;

    const sharedExps = getSharedExperiencesDatabase([], masterExps, packages);
    found = sharedExps.find(e => e.id === expIdOrTitle || e.title.toLowerCase() === expIdOrTitle.toLowerCase());
    if (found) return found;

    const cleanTitle = expIdOrTitle
      .replace(/^master-exp-/, '')
      .replace(/^exp-/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    return {
      id: expIdOrTitle,
      title: cleanTitle.length > 3 ? cleanTitle : 'Esperienza Curata in Puglia',
      pricePerPerson: 50,
      isHostSponsored: false
    };
  };

  const resolveExtraService = (srvIdOrTitle: string) => {
    const weddingSrvs = selectedWedding?.extraServices || [];
    let found = weddingSrvs.find(s => s.id === srvIdOrTitle || s.title.toLowerCase() === srvIdOrTitle.toLowerCase());
    if (found) return found;

    let pkgFound = (packages || []).find(p => p.id === srvIdOrTitle || p.title.toLowerCase() === srvIdOrTitle.toLowerCase());
    if (pkgFound) {
      return {
        id: pkgFound.id,
        title: pkgFound.title,
        price: pkgFound.pricePerUnit || 80,
        isPaidByCouple: false
      };
    }

    const cleanTitle = srvIdOrTitle
      .replace(/^pkg-/, '')
      .replace(/^srv-/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    return {
      id: srvIdOrTitle,
      title: cleanTitle.length > 3 ? cleanTitle : 'Servizio Extra & Beauty',
      price: 80,
      isPaidByCouple: false
    };
  };

  // --- GESTIONE HOTEL ---
  const handleOpenNewHotel = () => {
    setEditingHotel(null);
    setHotelForm({
      name: '',
      stars: 5,
      address: '',
      distanceToVenue: '10 min di auto',
      negotiatedRate: 280,
      currency: 'EUR',
      groupCode: selectedWedding?.weddingCode || 'PUGLIA-2026',
      bookingDeadline: '2026-07-31',
      negotiatedPerk: 'Bottiglia di vino pugliese e colazione inclusa.',
      websiteUrl: '',
      agencyPricingNotes: ''
    });
    setHotelRoomTypes([
      { id: `rt-${Date.now()}-1`, name: 'Superior Room', pricePerNight: 280, totalBlocked: 10, availableRooms: 10, maxOccupancy: 2 }
    ]);
    setShowHotelModal(true);
  };

  const handleOpenEditHotel = (h: HotelItem) => {
    setEditingHotel(h);
    setHotelForm({ ...h });
    setHotelRoomTypes(h.roomTypes && h.roomTypes.length > 0 ? h.roomTypes : [
      { id: `rt-${Date.now()}-1`, name: 'Standard Room', pricePerNight: h.negotiatedRate || 200, totalBlocked: 10, availableRooms: 10, maxOccupancy: 2 }
    ]);
    setShowHotelModal(true);
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWedding || !hotelForm.name?.trim()) return;

    const newHotel: HotelItem = {
      id: editingHotel?.id || `hotel-${Date.now()}`,
      name: hotelForm.name.trim(),
      stars: Number(hotelForm.stars) || 4,
      address: hotelForm.address || 'Puglia',
      distanceToVenue: hotelForm.distanceToVenue || 'Vicino alla masseria',
      negotiatedRate: Number(hotelForm.negotiatedRate) || 200,
      currency: hotelForm.currency || 'EUR',
      groupCode: hotelForm.groupCode || selectedWedding.weddingCode,
      bookingDeadline: hotelForm.bookingDeadline || '2026-08-01',
      negotiatedPerk: hotelForm.negotiatedPerk || '',
      websiteUrl: hotelForm.websiteUrl || '',
      bookingEngineType: 'DIRECT_ENGINE',
      roomTypes: hotelRoomTypes,
      agencyPricingNotes: hotelForm.agencyPricingNotes || '',
      pricingManagedByAgency: true
    };

    let updatedHotels: HotelItem[];
    if (editingHotel) {
      updatedHotels = (selectedWedding.hotels || []).map(h => h.id === editingHotel.id ? newHotel : h);
    } else {
      updatedHotels = [...(selectedWedding.hotels || []), newHotel];
    }

    const updatedWedding: WeddingData = {
      ...selectedWedding,
      hotels: updatedHotels
    };

    await persistWeddingUpdate(updatedWedding);
    setShowHotelModal(false);
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!selectedWedding) return;
    if (confirm('Eliminare questo hotel convenzionato per questo matrimonio?')) {
      const updatedHotels = (selectedWedding.hotels || []).filter(h => h.id !== hotelId);
      const updatedWedding: WeddingData = { ...selectedWedding, hotels: updatedHotels };
      await persistWeddingUpdate(updatedWedding);
    }
  };

  // Master catalog unificato cross-matrimonio e fornitori
  const masterExperiencesList = getSharedExperiencesDatabase(weddings, getSavedMasterExperiences(), packages);

  // --- GESTIONE ESPERIENZE CONDIVISE & DATABASE PUGLIA ---
  const handleOpenNewExp = (template?: ExperienceItem) => {
    setEditingExp(null);
    setSelectedTemplateId(template?.id || '');
    if (template) {
      setExpForm({
        ...template,
        id: '',
        eventDate: selectedWedding?.weddingDate || '2026-09-11',
        bookedParticipants: 0
      });
    } else {
      setExpForm({
        title: '',
        category: 'BOAT_TOUR',
        eventDate: selectedWedding?.weddingDate || '2026-09-11',
        startTime: '17:30 - 20:00',
        durationHours: 2.5,
        meetingPoint: 'Porto Turistico Cala Ponte, Polignano',
        pricePerPerson: 85,
        isHostSponsored: false,
        maxParticipants: 28,
        bookedParticipants: 0,
        dressCode: 'Resort Chic',
        description: 'Tour esclusivo in barca con calici di vino pugliese e tramonto.',
        supplierId: 'sup-boat-polignano',
        negotiatedPerk: 'Aperitivo con taralli e focaccia barese a bordo.'
      });
    }
    setSaveToMasterCatalogToo(true);
    setShowExpModal(true);
  };

  const handleOpenEditExp = (exp: ExperienceItem) => {
    setEditingExp(exp);
    setSelectedTemplateId('');
    setExpForm({ ...exp });
    setSaveToMasterCatalogToo(true);
    setShowExpModal(true);
  };

  const handleImportSharedExp = async (sharedExp: ExperienceItem) => {
    if (!selectedWedding) return;

    // Controllo se è già presente in questo matrimonio
    const alreadyExists = (selectedWedding.experiences || []).some(
      e => e.title.trim().toLowerCase() === sharedExp.title.trim().toLowerCase()
    );

    if (alreadyExists) {
      setSharedExpToast(`"${sharedExp.title}" è già configurata per questo matrimonio!`);
      setTimeout(() => setSharedExpToast(null), 3500);
      return;
    }

    const newExp: ExperienceItem = {
      ...sharedExp,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventDate: selectedWedding.weddingDate || '2026-09-11',
      bookedParticipants: 0
    };

    const updatedExp = [...(selectedWedding.experiences || []), newExp];
    const updatedWedding: WeddingData = {
      ...selectedWedding,
      experiences: updatedExp
    };

    await persistWeddingUpdate(updatedWedding);
    // Assicura che sia persistita anche nel database master
    saveCustomMasterExperience(newExp);

    setSharedExpToast(`✓ Esperienza "${sharedExp.title}" aggiunta con successo a ${selectedWedding.coupleNames}!`);
    setTimeout(() => setSharedExpToast(null), 3500);
  };

  const handleImportBatchRecommended = async () => {
    if (!selectedWedding) return;
    const currentTitles = new Set((selectedWedding.experiences || []).map(e => e.title.trim().toLowerCase()));
    const toAdd = masterExperiencesList.slice(0, 3).filter(exp => !currentTitles.has(exp.title.trim().toLowerCase()));

    if (toAdd.length === 0) {
      setSharedExpToast('Le 3 esperienze consigliate sono già tutte attive in questo matrimonio.');
      setTimeout(() => setSharedExpToast(null), 3000);
      return;
    }

    const newItems: ExperienceItem[] = toAdd.map((exp, idx) => ({
      ...exp,
      id: `exp-${Date.now()}-${idx}`,
      eventDate: selectedWedding.weddingDate || '2026-09-11',
      bookedParticipants: 0
    }));

    const updatedWedding: WeddingData = {
      ...selectedWedding,
      experiences: [...(selectedWedding.experiences || []), ...newItems]
    };

    await persistWeddingUpdate(updatedWedding);
    newItems.forEach(item => saveCustomMasterExperience(item));

    setSharedExpToast(`✓ Aggiunte ${newItems.length} esperienze pugliesi consigliate a ${selectedWedding.coupleNames}!`);
    setTimeout(() => setSharedExpToast(null), 3500);
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWedding || !expForm.title?.trim()) return;

    const newExp: ExperienceItem = {
      id: editingExp?.id || `exp-${Date.now()}`,
      title: expForm.title.trim(),
      category: expForm.category as any || 'BOAT_TOUR',
      eventDate: expForm.eventDate || selectedWedding.weddingDate || '2026-09-11',
      startTime: expForm.startTime || '18:00',
      durationHours: Number(expForm.durationHours) || 2,
      meetingPoint: expForm.meetingPoint || 'Da concordare',
      pricePerPerson: Number(expForm.pricePerPerson) || 50,
      isHostSponsored: Boolean(expForm.isHostSponsored),
      maxParticipants: Number(expForm.maxParticipants) || 30,
      bookedParticipants: editingExp?.bookedParticipants || 0,
      dressCode: expForm.dressCode || 'Smart Casual',
      description: expForm.description || '',
      negotiatedPerk: expForm.negotiatedPerk || '',
      supplierId: expForm.supplierId || '',
      image: expForm.image || ''
    };

    let updatedExp: ExperienceItem[];
    if (editingExp) {
      updatedExp = (selectedWedding.experiences || []).map(e => e.id === editingExp.id ? newExp : e);
    } else {
      updatedExp = [...(selectedWedding.experiences || []), newExp];
    }

    const updatedWedding: WeddingData = {
      ...selectedWedding,
      experiences: updatedExp
    };

    await persistWeddingUpdate(updatedWedding);

    // Salva sempre anche nel Database Master globale, così ogni matrimonio creato ne beneficia
    if (saveToMasterCatalogToo) {
      saveCustomMasterExperience(newExp);
    }

    setSharedExpToast(`Esperienza "${newExp.title}" salvata e resa disponibile per tutti i matrimoni!`);
    setTimeout(() => setSharedExpToast(null), 3500);
    setShowExpModal(false);
  };

  const handleDeleteExp = async (expId: string) => {
    if (!selectedWedding) return;
    if (confirm('Eliminare questa esperienza per questo matrimonio?')) {
      const updatedExp = (selectedWedding.experiences || []).filter(e => e.id !== expId);
      const updatedWedding: WeddingData = { ...selectedWedding, experiences: updatedExp };
      await persistWeddingUpdate(updatedWedding);
    }
  };

  // --- GESTIONE TRANSFER ---
  const handleOpenNewTransfer = () => {
    setEditingTransfer(null);
    setTransferForm({
      title: 'Navetta Aeroporto Bari Karol Wojtyla (BRI) → Savelletri',
      type: 'AIRPORT_SHUTTLE',
      origin: 'Aeroporto di Bari (BRI)',
      destination: selectedWedding?.venue || 'Masseria',
      departureTime: 'Ore 11:30, 15:00 e 19:30',
      vehicleType: 'Mercedes Sprinter VIP 16 posti',
      capacity: 16,
      bookedSeats: 0,
      pricePerSeat: 35,
      isPaidByCouple: false,
      negotiatedPerk: 'Autista parlante inglese e bottiglietta d\'acqua a bordo.'
    });
    setShowTransferModal(true);
  };

  const handleOpenEditTransfer = (tr: TransferItem) => {
    setEditingTransfer(tr);
    setTransferForm({ ...tr });
    setShowTransferModal(true);
  };

  const handleSaveTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWedding || !transferForm.title?.trim()) return;

    const newTr: TransferItem = {
      id: editingTransfer?.id || `tr-${Date.now()}`,
      title: transferForm.title.trim(),
      type: transferForm.type as any || 'AIRPORT_SHUTTLE',
      origin: transferForm.origin || 'Aeroporto',
      destination: transferForm.destination || selectedWedding.venue || 'Masseria',
      departureTime: transferForm.departureTime || 'Orario da concordare',
      vehicleType: transferForm.vehicleType || 'Mercedes Sprinter',
      capacity: Number(transferForm.capacity) || 16,
      bookedSeats: editingTransfer?.bookedSeats || 0,
      pricePerSeat: Number(transferForm.pricePerSeat) || 30,
      isPaidByCouple: Boolean(transferForm.isPaidByCouple),
      negotiatedPerk: transferForm.negotiatedPerk || ''
    };

    let updatedTransfers: TransferItem[];
    if (editingTransfer) {
      updatedTransfers = (selectedWedding.transfers || []).map(t => t.id === editingTransfer.id ? newTr : t);
    } else {
      updatedTransfers = [...(selectedWedding.transfers || []), newTr];
    }

    const updatedWedding: WeddingData = {
      ...selectedWedding,
      transfers: updatedTransfers
    };

    await persistWeddingUpdate(updatedWedding);
    setShowTransferModal(false);
  };

  const handleDeleteTransfer = async (trId: string) => {
    if (!selectedWedding) return;
    if (confirm('Eliminare questo transfer per questo matrimonio?')) {
      const updatedTransfers = (selectedWedding.transfers || []).filter(t => t.id !== trId);
      const updatedWedding: WeddingData = { ...selectedWedding, transfers: updatedTransfers };
      await persistWeddingUpdate(updatedWedding);
    }
  };

  // Chat invio risposta individuale concierge Valeria
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedWedding || !activeConversation) return;

    const targetName = activeConversation.role === 'couple' ? selectedWedding.coupleNames : activeConversation.guestName;
    const targetEmail = activeConversation.guestEmail || (activeConversation.role === 'couple' ? (selectedWedding.coupleEmail || '') : '') || 'info@admarketing.it';

    onReplyChatMessage({
      weddingCode: selectedWedding.weddingCode,
      guestName: targetName,
      guestEmail: targetEmail,
      text: replyText.trim()
    });

    setReplyText('');
    setChatFeedback(`Risposta inviata a ${targetName}!`);
    setTimeout(() => setChatFeedback(null), 3500);
  };

  // Esportazione Ospiti CSV
  const handleExportGuestsCsv = () => {
    if (!selectedWedding) return;
    const guests = selectedWedding.guests || [];
    const headers = ['Nome', 'Email', 'Telefono', 'Paese', 'Hotel', 'Camera', 'Transfer', 'Volo', 'Esperienze', 'Intolleranze/Dieta', 'Stato RSVP', 'Totale €'];
    const rows = guests.map(g => [
      `"${g.name}"`,
      `"${g.email}"`,
      `"${g.phone || ''}"`,
      `"${g.country || ''}"`,
      `"${g.hotelBooked || ''}"`,
      `"${g.roomType || ''}"`,
      `"${g.transferBooked || ''}"`,
      `"${g.flight || ''}"`,
      `"${(g.experiences || []).join('; ')}"`,
      `"${g.diet || ''}"`,
      `"${g.status || ''}"`,
      `"${g.totalAmountDue || 0}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ospiti_${selectedWedding.weddingCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unifica i desideri da wishRequests con qualsiasi segnalazione GUEST_WISH presente nelle notifiche dei matrimoni
  const consolidatedWishRequests = useMemo(() => {
    const map = new Map<string, TouristWishRequest>();

    // 1. Aggiungi tutti i wishRequests registrati
    (wishRequests || []).forEach(w => {
      if (w.id) map.set(w.id, w);
    });

    // 2. Ispeziona le notifiche di tutti i matrimoni per unificare qualsiasi segnalazione GUEST_WISH
    (weddings || []).forEach(w => {
      (w.notifications || []).forEach(n => {
        if (n.source === 'GUEST_WISH') {
          const alreadyExists = Array.from(map.values()).some(existing => 
            existing.id === n.id || 
            (existing.title && n.title && (
              existing.title.toLowerCase().trim() === n.title.toLowerCase().trim() ||
              n.title.toLowerCase().includes(existing.title.toLowerCase())
            ))
          );

          if (!alreadyExists) {
            const cleanTitle = n.title.replace(/^Nuov[ao] (Richiesta )?Desiderio( Ospite)?:\s*/i, '').trim();
            const synthWish: TouristWishRequest = {
              id: n.id || `wish-from-notif-${Date.now()}`,
              weddingCode: n.weddingCode || w.weddingCode,
              guestName: (n.authorName || 'Ospite').replace(/\s*\(Ospite\)$/i, ''),
              guestEmail: (w.guests && w.guests.length > 0 ? w.guests[0].email : '') || 'ospite@matrimonio.it',
              guestPhone: (w.guests && w.guests.length > 0 ? w.guests[0].phone : '') || '',
              title: cleanTitle || n.title,
              description: n.description || 'Richiesta speciale registrata nel riassunto nozze.',
              preferredDate: w.weddingDate || '2026-09-12',
              participantsCount: 2,
              budgetRange: '€150 - €300',
              status: n.read ? 'CONFIRMED' : 'RECEIVED',
              agencyNotes: `Sincronizzato da avviso matrimonio (${n.timestamp || 'Recente'}).`,
              createdAt: n.timestamp || new Date().toISOString().substring(0, 10)
            };
            map.set(synthWish.id, synthWish);
          }
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [wishRequests, weddings]);

  // Calcola tutte le segnalazioni (salvate + dinamiche in sospeso) per un matrimonio
  const getWeddingAlerts = (w: WeddingData): WeddingAlertNotification[] => {
    const customAlerts = (w.notifications || []).filter(n => !n.read);
    const alerts: WeddingAlertNotification[] = [...customAlerts];

    // Desideri pendenti ricevuti per questo matrimonio (confronto normalizzato)
    const wNorm = (w.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
    (consolidatedWishRequests || [])
      .filter((wr: TouristWishRequest) => {
        const wrNorm = (wr.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
        return wrNorm === wNorm && wr.status === 'RECEIVED';
      })
      .forEach((wr: TouristWishRequest) => {
        if (!alerts.some(a => a.source === 'GUEST_WISH' && (a.id === wr.id || a.title.includes(wr.title)))) {
          alerts.push({
            id: `dyn-wish-${wr.id}`,
            weddingCode: w.weddingCode,
            source: 'GUEST_WISH',
            authorName: wr.guestName,
            authorRole: 'ospite',
            title: `Nuovo Desiderio: ${wr.title}`,
            description: `${wr.participantsCount} pax · ${wr.description}`,
            timestamp: wr.createdAt || 'Di recente',
            read: false,
            actionTab: 'wishlist'
          });
        }
      });

    // Chat non lette da ospiti o sposi per questo matrimonio
    const unreadChats = (chatMessages || []).filter(
      m => m.weddingCode === w.weddingCode && !m.readByAdmin && m.sender !== 'valeria'
    );
    if (unreadChats.length > 0 && !alerts.some(a => a.source === 'CHAT_MESSAGE')) {
      const last = unreadChats[unreadChats.length - 1];
      alerts.push({
        id: `dyn-chat-${w.weddingCode}`,
        weddingCode: w.weddingCode,
        source: 'CHAT_MESSAGE',
        authorName: last.guestName || (last.sender === 'couple' ? 'Sposi' : 'Ospite'),
        authorRole: last.sender === 'couple' ? 'sposi' : 'ospite',
        title: `${unreadChats.length} Messagg${unreadChats.length === 1 ? 'io' : 'i'} non lett${unreadChats.length === 1 ? 'o' : 'i'} in Concierge Chat`,
        description: `Ultimo messaggio da ${last.guestName}: "${last.text.substring(0, 60)}"`,
        timestamp: last.timestamp || 'Oggi',
        read: false,
        actionTab: 'chat'
      });
    }

    // Richieste quotazione hotel dagli ospiti
    (w.guests || [])
      .filter(g => g.hotelBookingStatus === 'QUOTE_REQUESTED' && g.hotelBooked && g.hotelBooked !== 'NONE')
      .forEach(g => {
        if (!alerts.some(a => a.source === 'HOTEL_QUOTE_REQUEST' && a.authorName === g.name)) {
          alerts.push({
            id: `dyn-hotel-${g.id}`,
            weddingCode: w.weddingCode,
            source: 'HOTEL_QUOTE_REQUEST',
            authorName: g.name,
            authorRole: 'ospite',
            title: `Richiesta Preventivo Alloggio da ${g.name}`,
            description: `${g.hotelBooked} (${g.hotelNights || 1} notti) · Check-in: ${g.checkInDate || 'Da definire'}`,
            timestamp: g.registeredAt || 'Oggi',
            read: false,
            actionTab: 'hotels'
          });
        }
      });

    // Regali sposi pendenti
    (w.giftRequests || [])
      .filter(gr => gr.status === 'PENDING_APPROVAL')
      .forEach(gr => {
        if (!alerts.some(a => a.source === 'COUPLE_GIFT' && a.id === gr.id)) {
          alerts.push({
            id: `dyn-gift-${gr.id}`,
            weddingCode: w.weddingCode,
            source: 'COUPLE_GIFT',
            authorName: gr.coupleNames || w.coupleNames,
            authorRole: 'sposi',
            title: `Richiesta Regalo Sposi: ${gr.serviceTitle}`,
            description: `Offerta a ${gr.guestsCount} ospiti · Stima: €${gr.totalEstimatedAmount}`,
            timestamp: gr.requestedAt || 'Oggi',
            read: false,
            actionTab: 'experiences'
          });
        }
      });

    return alerts;
  };

  // Archivia / Segna come letta una singola notifica
  const handleDismissNotification = async (weddingId: string, alertId: string) => {
    const targetW = weddings.find(w => w.id === weddingId);
    if (!targetW) return;

    const updatedNotifs = (targetW.notifications || []).map(n => 
      n.id === alertId ? { ...n, read: true } : n
    );

    const updatedWedding = {
      ...targetW,
      notifications: updatedNotifs
    };

    await persistWeddingUpdate(updatedWedding);
    setAlertActionToast('Segnalazione archiviata');
    setTimeout(() => setAlertActionToast(null), 3000);
  };

  // Archivia tutte le notifiche di un matrimonio
  const handleClearAllWeddingNotifications = async (weddingId: string) => {
    const targetW = weddings.find(w => w.id === weddingId);
    if (!targetW) return;

    const updatedNotifs = (targetW.notifications || []).map(n => ({ ...n, read: true }));
    const updatedWedding = {
      ...targetW,
      notifications: updatedNotifs
    };

    await persistWeddingUpdate(updatedWedding);
    setAlertActionToast(`Segnalazioni archiviate per ${targetW.coupleNames}`);
    setTimeout(() => setAlertActionToast(null), 3000);
  };

  // Simula nuova richiesta di test (permette all'utente o amministratore di testare l'avviso in tempo reale)
  const handleSimulateNewAlert = async (weddingId: string, role: 'ospite' | 'sposi') => {
    const targetW = weddings.find(w => w.id === weddingId);
    if (!targetW) return;

    const nowTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const isGuest = role === 'ospite';
    const simAlertId = `sim-alert-${Date.now()}`;
    const sampleAlert: WeddingAlertNotification = isGuest ? {
      id: simAlertId,
      weddingCode: targetW.weddingCode,
      source: 'GUEST_WISH',
      authorName: 'Eleanor Vance (Ospite)',
      authorRole: 'ospite',
      title: 'Nuova Richiesta Desiderio: Tour in Ape Calessino tra gli Ulivi',
      description: 'L\'ospite desidera una visita guidata pomeridiana tra i trulli storici di Alberobello per 4 persone.',
      timestamp: `Oggi, ${nowTime}`,
      read: false,
      actionTab: 'wishlist'
    } : {
      id: simAlertId,
      weddingCode: targetW.weddingCode,
      source: 'COUPLE_UPDATE',
      authorName: targetW.coupleNames,
      authorRole: 'sposi',
      title: 'Aggiornamento Programma & Dress Code dagli Sposi',
      description: 'Gli sposi hanno aggiornato gli orari del taglio torta e specificato il dress code Total White.',
      timestamp: `Oggi, ${nowTime}`,
      read: false,
      actionTab: 'weddings'
    };

    // Se è un desiderio ospite, sincronizzalo contemporaneamente anche nell'array dedicato dei desideri (wishRequests)
    if (isGuest) {
      const newSimulatedWish: TouristWishRequest = {
        id: simAlertId,
        weddingCode: targetW.weddingCode,
        guestName: 'Eleanor Vance',
        guestEmail: 'eleanor.vance@gmail.com',
        guestPhone: '+1 312 555 0198',
        title: 'Tour in Ape Calessino tra gli Ulivi',
        description: 'L\'ospite desidera una visita guidata pomeridiana tra i trulli storici di Alberobello per 4 persone con degustazione di prodotti tipici.',
        preferredDate: targetW.weddingDate || '2026-06-21',
        participantsCount: 4,
        budgetRange: '€180 - €280',
        status: 'RECEIVED',
        agencyNotes: 'Richiesta di test simulata direttamente dall\'amministrazione.',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      const updatedWishList = [newSimulatedWish, ...(wishRequests || []).filter(w => w.id !== simAlertId)];
      onUpdateWishRequests(updatedWishList);
      fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSimulatedWish)
      }).catch(() => {});
    }

    const updatedWedding = {
      ...targetW,
      notifications: [sampleAlert, ...(targetW.notifications || [])]
    };

    await persistWeddingUpdate(updatedWedding);
    setAlertActionToast(`Nuova segnalazione simulata (${sampleAlert.authorRole.toUpperCase()}): "${sampleAlert.title}"`);
    setTimeout(() => setAlertActionToast(null), 4000);
  };

  const totalAlertsAcrossAllWeddings = weddings.reduce((sum, w) => sum + getWeddingAlerts(w).length, 0);
  const weddingsWithAlertsCount = weddings.filter(w => getWeddingAlerts(w).length > 0).length;

  const filteredWeddings = weddings.filter(w => {
    const matchesSearch = 
      w.coupleNames.toLowerCase().includes(searchWedding.toLowerCase()) ||
      w.weddingCode.toLowerCase().includes(searchWedding.toLowerCase()) ||
      (w.city && w.city.toLowerCase().includes(searchWedding.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (weddingAlertFilter === 'ALERTS_ONLY') {
      return getWeddingAlerts(w).length > 0;
    }
    if (weddingAlertFilter === 'WITH_GUESTS') {
      return (w.guests?.length || 0) > 0;
    }
    return true;
  });

  const adminMenuItems: MenuItem[] = [
    { 
      id: 'weddings', 
      label: 'Matrimoni In Gestione', 
      subtitle: `${weddings.length} matrimoni attivi`,
      icon: <Building2 className="w-5 h-5 text-amber-800" />,
      badge: weddings.length
    },
    { 
      id: 'guests', 
      label: 'Ospiti & Conferme RSVP', 
      subtitle: `${selectedWedding?.guests?.length || 0} ospiti per ${selectedWedding?.coupleNames || 'selezionato'}`,
      icon: <Users className="w-5 h-5 text-stone-700" />,
      badge: selectedWedding?.guests?.length || 0
    },
    { 
      id: 'payments', 
      label: 'Incassi & Conto Sposi', 
      subtitle: 'Incassi ospiti e saldi per servizi sposi',
      icon: <DollarSign className="w-5 h-5 text-emerald-700" />,
      highlight: true
    },
    { 
      id: 'wishlist', 
      label: 'Wishlist & Desideri Ospiti', 
      subtitle: `${consolidatedWishRequests.length} richieste pervenute`,
      icon: <Lightbulb className="w-5 h-5 text-amber-600" />,
      badge: consolidatedWishRequests.length > 0 ? consolidatedWishRequests.length : undefined
    },
    { 
      id: 'chat', 
      label: 'Concierge Chat Live', 
      subtitle: `${conversationsList.filter(c => c.messages.length > 0).length} chat attive`,
      icon: <MessageCircle className="w-5 h-5 text-emerald-600" />
    },
    { 
      id: 'hotels', 
      label: 'Strutture Hotel & Alloggi', 
      subtitle: `${selectedWedding?.hotels?.length || 0} hotel convenzionati`,
      icon: <Hotel className="w-5 h-5 text-stone-700" /> 
    },
    { 
      id: 'experiences', 
      label: 'Esperienze & Tour', 
      subtitle: `${selectedWedding?.experiences?.length || 0} esperienze pugliesi`,
      icon: <Compass className="w-5 h-5 text-amber-800" /> 
    },
    { 
      id: 'transfers', 
      label: 'Transfer & Navette', 
      subtitle: `${selectedWedding?.transfers?.length || 0} servizi navetta`,
      icon: <Car className="w-5 h-5 text-stone-700" /> 
    },
    { 
      id: 'services', 
      label: 'Beauty & Servizi Extra', 
      subtitle: `${selectedWedding?.extraServices?.length || 0} servizi extra`,
      icon: <Sparkles className="w-5 h-5 text-purple-700" /> 
    },
    { 
      id: 'suppliers', 
      label: 'Database Fornitori Partner', 
      subtitle: `${suppliers.length} fornitori accreditati`,
      icon: <ShieldCheck className="w-5 h-5 text-stone-700" /> 
    },
    { 
      id: 'catalog', 
      label: 'Catalogo Master Puglia', 
      subtitle: 'Pacchetti ed esperienze condivise',
      icon: <Layers className="w-5 h-5 text-stone-700" /> 
    },
    { 
      id: 'settings', 
      label: 'Impostazioni Agenzia', 
      subtitle: 'Dati societari, IBAN, branding & team',
      icon: <Sliders className="w-5 h-5 text-stone-700" /> 
    }
  ];

  return (
    <div className="flex-1 bg-neutral-50 pb-20">
      {/* HAMBURGER DRAWER MENU LATERALE A SCORRIMENTO */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMenuOpen(false);
        }}
        items={adminMenuItems}
        title="Pannello Agenzia Concierge"
        subtitle="Valeria · AD Marketing S.r.l.s."
        guestName="Valeria (Back Office Agenzia)"
        weddingCode={selectedWedding?.weddingCode}
        onLogout={onLogout}
      />

      {/* HEADER AGENZIA CON CONTROLLI PRINCIPALI */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* PULSANTE MENU HAMBURGER (3 LINIE) PER SCORRIMENTO LATERALE */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 rounded-xl bg-amber-900 text-white hover:bg-amber-800 transition-all cursor-pointer shadow-xs flex items-center gap-2 shrink-0"
              title="Apri Menu Navigazione Agenzia"
            >
              <Menu className="w-5 h-5 text-amber-200" />
              <span className="text-xs font-bold font-serif-luxury hidden sm:inline">Menu Agenzia</span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-amber-900 text-white flex items-center justify-center font-bold font-serif-luxury text-lg shadow-xs">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-serif-luxury text-stone-800">
                  Concierge Executive Panel
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                  <Flame className="w-3 h-3 text-emerald-600" /> Firebase &amp; Firestore Live
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Pannello Direzione Agenzia · Valeria (AD Marketing, Palagianello)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Gruppo: Azioni Matrimonio */}
            <div className="flex items-center gap-2 pr-3 border-r border-neutral-200">
              <button
                onClick={() => {
                  setActiveTab('weddings');
                  setWeddingAlertFilter(prev => prev === 'ALERTS_ONLY' ? 'ALL' : 'ALERTS_ONLY');
                }}
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  totalAlertsAcrossAllWeddings > 0
                    ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs hover:bg-amber-200'
                    : 'bg-white text-stone-600 border-neutral-200 hover:bg-neutral-50'
                }`}
                title="Centro Segnalazioni &amp; Avvisi da Sposi/Ospiti"
              >
                <Bell className={`w-3.5 h-3.5 ${totalAlertsAcrossAllWeddings > 0 ? 'text-amber-800 animate-bounce' : 'text-neutral-400'}`} />
                <span>Avvisi</span>
                {totalAlertsAcrossAllWeddings > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-800 text-white text-[10px] font-bold">
                    {totalAlertsAcrossAllWeddings}
                  </span>
                )}
              </button>
            </div>

            {/* Gruppo: Gestione Amministrativa */}
            <div className="flex items-center gap-2 pl-1">
              <button
                onClick={() => {
                  setEditingWedding(null);
                  setWeddingForm({
                    coupleNames: '',
                    weddingCode: '',
                    weddingDate: '',
                    venue: 'Masseria San Domenico',
                    city: 'Savelletri di Fasano (BR)',
                    country: 'Italia',
                    coupleEmail: '',
                    couplePhone: '',
                    couplePassword: 'password123',
                    welcomeMessage: '',
                    dressCode: 'Formal Chic Pugliese',
                    story: ''
                  });
                  setShowNewWeddingModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-700 text-white text-xs font-semibold hover:bg-stone-800 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuovo Matrimonio
              </button>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Esci
              </button>
            </div>
          </div>
        </div>

        {/* BARRA TAB PRINCIPALI - Scrollabile su Mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-1 border-t border-neutral-100 pt-2 overflow-hidden">
          {/* Gruppo: Gestione Matrimonio (Contestuale) */}
          <div className="overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex items-center gap-2 whitespace-nowrap">
              {[
                { id: 'weddings', label: `Matrimoni (${weddings.length})`, icon: Building2 },
                { id: 'guests', label: `Ospiti & RSVP (${selectedWedding?.guests?.length || 0})`, icon: Users },
                { id: 'hotels', label: `Hotel (${selectedWedding?.hotels?.length || 0})`, icon: Hotel },
                { id: 'experiences', label: `Esperienze (${selectedWedding?.experiences?.length || 0})`, icon: Compass },
                { id: 'transfers', label: `Transfer (${selectedWedding?.transfers?.length || 0})`, icon: Car },
                { id: 'services', label: `Beauty/Extra (${selectedWedding?.extraServices?.length || 0})`, icon: Sparkles },
                { id: 'chat', label: `Concierge Chat (${conversationsList.filter(c => c.messages.length > 0).length})`, icon: MessageCircle },
                { id: 'wishlist', label: `Desideri (${wishRequests.length})`, icon: Sparkles },
                { id: 'payments', label: `Incassi (${paymentRequests.length})`, icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-full border cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-amber-900 text-white border-amber-900 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-900'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gruppo: Amministrazione & Impostazioni (Generiche) */}
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 whitespace-nowrap">
              {[
                { id: 'suppliers', label: `Fornitori (${suppliers.length})`, icon: ShieldCheck },
                { id: 'settings', label: 'Impostazioni', icon: Sliders },
                { id: 'catalog', label: 'Catalogo Puglia', icon: Layers }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-full border cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SELETTORE MATRIMONIO ATTIVO IN ALTO PER I TAB OPERATIVI */}
      {activeTab !== 'weddings' && activeTab !== 'settings' && (
        <div className="bg-amber-50/70 border-b border-amber-200/60 py-2.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                Matrimonio in gestione:
              </span>
              <select
                value={selectedWeddingId}
                onChange={(e) => setSelectedWeddingId(e.target.value)}
                className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-stone-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-amber-900"
              >
                {weddings.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.coupleNames} · Codice: {w.weddingCode} ({w.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-neutral-600 text-[11px]">
              <span>📍 {selectedWedding?.venue || 'Masseria'}, {selectedWedding?.city}</span>
              <span>📅 {selectedWedding?.weddingDate}</span>
              <button
                onClick={() => handleCopyLink(selectedWedding?.weddingCode || '')}
                className="text-amber-900 font-bold hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copia Link Portale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENUTO PRINCIPALE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* ========================================================================= */}
        {/* 1. TAB: GESTIONE MATRIMONI CON SEGNALAZIONI & AVVISI SPOSI / OSPITI       */}
        {/* ========================================================================= */}
        {activeTab === 'weddings' && (
          <div className="space-y-6">
            {/* Banner Feedback Notifiche / Azione Rapida */}
            {alertActionToast && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-center justify-between shadow-2xs animate-fade-in">
                <div className="flex items-center gap-2 font-medium">
                  <Bell className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>{alertActionToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAlertActionToast(null)}
                  className="text-amber-800 hover:text-amber-950 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Banner Generale di Allerta Segnalazioni Attive */}
            {totalAlertsAcrossAllWeddings > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">
                        Centro Segnalazioni &amp; Richieste da Gestire
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-800 text-white font-bold text-[10px]">
                        {totalAlertsAcrossAllWeddings} Nuovi Avvisi
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Ci sono richieste o aggiornamenti pendenti inviati da sposi o invitati in <strong>{weddingsWithAlertsCount}</strong> matrimoni.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setWeddingAlertFilter(prev => prev === 'ALERTS_ONLY' ? 'ALL' : 'ALERTS_ONLY')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      weddingAlertFilter === 'ALERTS_ONLY'
                        ? 'bg-amber-900 text-white shadow-xs'
                        : 'bg-white text-amber-950 border border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {weddingAlertFilter === 'ALERTS_ONLY' ? '✓ Filtro Avvisi Attivo' : 'Mostra Solo Matrimoni con Avvisi'}
                  </button>
                </div>
              </div>
            )}

            {/* Barra Superiore: Ricerca, Filtri & Simulatore Rapido */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cerca per nomi sposi, codice o città..."
                  value={searchWedding}
                  onChange={(e) => setSearchWedding(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setWeddingAlertFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    weddingAlertFilter === 'ALL'
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'bg-neutral-100 text-stone-600 hover:bg-neutral-200'
                  }`}
                >
                  Tutti ({weddings.length})
                </button>

                <button
                  type="button"
                  onClick={() => setWeddingAlertFilter('ALERTS_ONLY')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    weddingAlertFilter === 'ALERTS_ONLY'
                      ? 'bg-amber-900 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-700" />
                  <span>Con Segnalazioni ({weddingsWithAlertsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWeddingAlertFilter('WITH_GUESTS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    weddingAlertFilter === 'WITH_GUESTS'
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'bg-neutral-100 text-stone-600 hover:bg-neutral-200'
                  }`}
                >
                  Con Ospiti ({weddings.filter(w => (w.guests?.length || 0) > 0).length})
                </button>
              </div>

              {/* Pulsante rapido di Test/Simulazione Segnalazioni */}
              <div className="flex items-center gap-1 text-[11px] self-end md:self-auto">
                <span className="text-neutral-400 mr-1">Simula Avviso:</span>
                <button
                  onClick={() => handleSimulateNewAlert(selectedWeddingId || weddings[0]?.id, 'ospite')}
                  className="px-2.5 py-1 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-md font-semibold cursor-pointer"
                  title="Simula una nuova richiesta da parte dell'ospite"
                >
                  + Ospite
                </button>
                <button
                  onClick={() => handleSimulateNewAlert(selectedWeddingId || weddings[0]?.id, 'sposi')}
                  className="px-2.5 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded-md font-semibold cursor-pointer"
                  title="Simula un aggiornamento programma dagli sposi"
                >
                  + Sposi
                </button>
              </div>
            </div>

            {/* Griglia Matrimoni con Riquadro Segnalazioni & Feedback di Avviso */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWeddings.map(w => {
                const isSelected = w.id === selectedWeddingId;
                const hotelsCount = w.hotels?.length || 0;
                const expCount = w.experiences?.length || 0;
                const trCount = w.transfers?.length || 0;
                const guestsCount = w.guests?.length || 0;
                const alerts = getWeddingAlerts(w);
                const hasAlerts = alerts.length > 0;

                return (
                  <div
                    key={w.id}
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between ${
                      hasAlerts
                        ? 'border-amber-400 ring-2 ring-amber-400/25 shadow-amber-500/5'
                        : isSelected
                        ? 'border-stone-800 ring-2 ring-stone-800/15'
                        : 'border-neutral-200'
                    }`}
                  >
                    <div>
                      {/* Box di Segnalazione & Feedback di Avviso */}
                      {hasAlerts ? (
                        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-950 space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-amber-200/60">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
                              </span>
                              <span>🔔 {alerts.length} Segnalazion{alerts.length === 1 ? 'e' : 'i'} da gestire</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleClearAllWeddingNotifications(w.id)}
                              className="text-[10px] text-amber-800 hover:text-amber-950 underline font-semibold cursor-pointer"
                              title="Segna tutte come lette per questo matrimonio"
                            >
                              Segna tutte lette
                            </button>
                          </div>

                          {/* Lista degli avvisi dettagliati */}
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                            {alerts.map(a => (
                              <div
                                key={a.id}
                                className="p-2.5 bg-white rounded-lg border border-amber-200 shadow-2xs text-[11px] flex flex-col gap-1 transition-all hover:border-amber-300"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                      a.authorRole === 'sposi' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                                    }`}>
                                      {a.authorRole === 'sposi' ? '❤️ Sposi' : '👤 Ospite'}
                                    </span>
                                    <span className="font-bold text-stone-800 truncate max-w-[130px]">{a.authorName}</span>
                                  </div>
                                  <span className="text-[10px] text-neutral-400 shrink-0 font-mono">{a.timestamp}</span>
                                </div>

                                <div className="font-semibold text-stone-900 leading-tight">
                                  {a.title}
                                </div>
                                <div className="text-neutral-500 text-[10px] line-clamp-2 leading-relaxed">
                                  {a.description}
                                </div>

                                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedWeddingId(w.id);
                                      if (a.actionTab === 'wishlist') {
                                        setWishFilterScope('all');
                                        setWishSelectedWeddingCode(w.weddingCode);
                                        setActiveTab('wishlist');
                                      } else if (a.actionTab) {
                                        setActiveTab(a.actionTab as any);
                                      }
                                    }}
                                    className="text-amber-900 hover:text-amber-950 font-bold text-[10px] flex items-center gap-1 hover:underline cursor-pointer"
                                  >
                                    <span>Gestisci richiesta</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDismissNotification(w.id, a.id)}
                                    className="text-neutral-400 hover:text-neutral-700 text-[10px] cursor-pointer"
                                    title="Archivia questo avviso"
                                  >
                                    ✓ Archivia
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3.5 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between font-medium">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Tutte le richieste gestite</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold">Aggiornato</span>
                        </div>
                      )}

                      {/* Header Matrimonio */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-900 font-mono text-[11px] font-bold rounded-md border border-amber-200">
                            {w.weddingCode}
                          </span>
                          <h3 className="text-base font-bold text-stone-800 font-serif-luxury mt-1.5">
                            {w.coupleNames}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditWedding(w)}
                            className="text-neutral-400 hover:text-amber-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Modifica Matrimonio"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWedding(w)}
                            className="text-neutral-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Elimina Matrimonio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3.5 space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="font-medium text-stone-700">{w.weddingDate || 'Data da definire'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{w.venue}, {w.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{guestsCount} ospiti registrati nel portale</span>
                        </div>
                      </div>

                      {/* Mini pillole stato */}
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                        <span className={`px-2 py-0.5 rounded-full ${guestsCount > 0 ? 'bg-stone-100 text-stone-800' : 'bg-stone-50 text-stone-400'}`}>
                          👥 {guestsCount} Ospiti
                        </span>
                        {hotelsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                            🏨 {hotelsCount} Hotel
                          </span>
                        )}
                        {expCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                            ✨ {expCount} Tour
                          </span>
                        )}
                        {hasAlerts && (
                          <span className="px-2 py-0.5 bg-amber-800 text-white rounded-full font-bold">
                            🔔 {alerts.length} Avvis{alerts.length === 1 ? 'o' : 'i'}
                          </span>
                        )}
                      </div>

                      {/* Test Simulator per singolo matrimonio */}
                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Simula avviso:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSimulateNewAlert(w.id, 'ospite')}
                            className="px-2 py-0.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded font-semibold cursor-pointer"
                            title="Aggiungi una segnalazione di test dall'ospite"
                          >
                            + Ospite
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulateNewAlert(w.id, 'sposi')}
                            className="px-2 py-0.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded font-semibold cursor-pointer"
                            title="Aggiungi una segnalazione di test dagli sposi"
                          >
                            + Sposi
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Credenziali Sposi (Codice, Email, Password, Telefono) */}
                      <div className="mt-3.5 pt-3 border-t border-neutral-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Credenziali Accesso Sposi</span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditWedding(w)}
                            className="text-[10px] font-semibold text-amber-900 hover:text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
                            title="Modifica Email, Telefono o Password"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifica</span>
                          </button>
                        </div>

                        <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 text-[10px]">Codice:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-stone-900">{w.weddingCode}</span>
                              <button onClick={() => navigator.clipboard.writeText(w.weddingCode)} className="text-neutral-400 hover:text-stone-700 p-0.5" title="Copia codice">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 text-[10px]">Email Sposa:</span>
                            <div className="flex items-center gap-1 max-w-[170px]">
                              <span className="font-mono text-stone-700 truncate">{w.coupleEmail || 'Non impostata'}</span>
                              {w.coupleEmail && (
                                <button onClick={() => navigator.clipboard.writeText(w.coupleEmail || '')} className="text-neutral-400 hover:text-stone-700 p-0.5" title="Copia email">
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 text-[10px]">Telefono:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-stone-700">{w.couplePhone || 'Non impostato'}</span>
                              {w.couplePhone && (
                                <button onClick={() => navigator.clipboard.writeText(w.couplePhone || '')} className="text-neutral-400 hover:text-stone-700 p-0.5" title="Copia telefono">
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 text-[10px]">Password:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-stone-700">{w.couplePassword || 'puglia2026'}</span>
                              <button onClick={() => navigator.clipboard.writeText(w.couplePassword || 'puglia2026')} className="text-neutral-400 hover:text-stone-700 p-0.5" title="Copia password">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          <a
                            href={w.couplePhone 
                              ? `https://wa.me/${w.couplePhone.replace(/[^0-9]/g, '')}?text=${generateBrideWhatsAppCredentialsMessage(w)}` 
                              : `https://wa.me/?text=${generateBrideWhatsAppCredentialsMessage(w)}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-1.5 px-2 rounded-lg border border-emerald-200 text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Invia credenziali alla sposa via WhatsApp"
                          >
                            <Share2 className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>

                          <button 
                            type="button"
                            onClick={() => {
                              const portalUrl = `${window.location.origin}/?role=couple&code=${encodeURIComponent(w.weddingCode)}&email=${encodeURIComponent(w.coupleEmail || '')}`;
                              const summary = `Credenziali Matrimonio ${w.coupleNames}:\n• Codice: ${w.weddingCode}\n• Email Sposa: ${w.coupleEmail || 'Non impostata'}\n• Password: ${w.couplePassword || 'puglia2026'}\n• Link Accesso: ${portalUrl}`;
                              navigator.clipboard.writeText(summary);
                              alert(`Credenziali e link di accesso copiati negli appunti!`);
                            }}
                            className="text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 py-1.5 px-2 rounded-lg border border-amber-200 cursor-pointer text-center flex items-center justify-center gap-1 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copia</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={async () => {
                              if (!w.coupleEmail) {
                                alert('Email sposa non impostata!');
                                return;
                              }
                              const portalUrl = `${window.location.origin}/?role=couple&code=${encodeURIComponent(w.weddingCode)}&email=${encodeURIComponent(w.coupleEmail || '')}`;
                              const subject = `Credenziali Accesso Matrimonio ${w.coupleNames}`;
                              const body = `Gentile ${w.coupleNames},\n\nBenvenuti in Apulian Wedding Concierge.\n\nCodice Matrimonio: ${w.weddingCode}\nPassword: ${w.couplePassword || 'puglia2026'}\n\nAccedi al tuo portale qui: ${portalUrl}\n\nAD Marketing Concierge`;
                              
                              if (onSendGmail) {
                                const result = await onSendGmail({ to: w.coupleEmail, subject, body });
                                if (result.success) {
                                  alert('Email inviata con successo!');
                                } else {
                                  alert('Errore nell\'invio dell\'email.');
                                }
                              } else {
                                alert('Servizio email non disponibile.');
                              }
                            }}
                            className="text-[10px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 py-1.5 px-2 rounded-lg border border-blue-200 cursor-pointer text-center flex items-center justify-center gap-1 transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </button>
                        </div>
                      </div>

                    <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => handleCopyLink(w.weddingCode)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                        title="Copia link accesso ospiti"
                      >
                        {copiedCode === w.weddingCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copiato!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Link Portale
                          </>
                        )}
                      </button>

                      <a
                        href={`https://wa.me/?text=${generateWeddingWhatsAppMessage(w)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Invia invito WhatsApp ufficiale"
                      >
                        <Share2 className="w-3 h-3 text-emerald-600" /> WhatsApp
                      </a>

                      <button
                        onClick={() => {
                          setSelectedWeddingId(w.id);
                          setActiveTab('hotels');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Gestisci alloggi e servizi"
                      >
                        Gestisci ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TAB: GESTIONE HOTEL & ALLOGGI (LATO AGENZIA)                           */}
        {/* ========================================================================= */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                    Alloggi Convenzionati
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {selectedWedding?.weddingCode} · {selectedWedding?.coupleNames}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif-luxury text-stone-800 mt-1">
                  Gestione Hotel &amp; Room Blocks Negoziati
                </h2>
                <p className="text-xs text-neutral-500">
                  Aggiungi o modifica hotel, tariffe speciali concordate con l'agenzia, codici gruppo e camere opzionate per gli ospiti.
                </p>
              </div>

              <button
                onClick={handleOpenNewHotel}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-700 text-white font-semibold text-xs hover:bg-stone-800 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Aggiungi Hotel
              </button>
            </div>

            {/* Griglia Hotel del Matrimonio */}
            {(selectedWedding?.hotels || []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-2xs">
                <Hotel className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-stone-700">Nessun hotel ancora configurato</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-5">
                  Gli ospiti di questo matrimonio non visualizzano ancora strutture convenzionate. Clicca sul pulsante qui sotto per aggiungere il primo hotel partner.
                </p>
                <button
                  onClick={handleOpenNewHotel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 text-white rounded-lg text-xs font-bold hover:bg-amber-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Inserisci Hotel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(selectedWedding?.hotels || []).map(h => (
                  <div key={h.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                            {'★'.repeat(h.stars)}
                          </div>
                          <h3 className="font-bold text-base text-stone-800 font-serif-luxury">
                            {h.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditHotel(h)}
                            className="p-1.5 text-neutral-400 hover:text-amber-900 rounded-lg hover:bg-neutral-100"
                            title="Modifica Hotel"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHotel(h.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Elimina Hotel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{h.address}</span>
                      </p>
                      {h.distanceToVenue && (
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          🚗 {h.distanceToVenue}
                        </p>
                      )}

                      {/* Box Tariffa Convenzionata */}
                      <div className="mt-3.5 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Tariffa base negoziata:</span>
                          <span className="text-base font-extrabold text-amber-900 font-mono">
                            € {h.negotiatedRate} <span className="text-[10px] font-normal text-neutral-500">/ notte</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Codice Convenzione:</span>
                          <span className="font-mono font-bold text-stone-700 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                            {h.groupCode || selectedWedding.weddingCode}
                          </span>
                        </div>
                        {h.negotiatedPerk && (
                          <div className="text-[11px] text-amber-900 italic pt-1 border-t border-amber-200/50">
                            🎁 {h.negotiatedPerk}
                          </div>
                        )}
                      </div>

                      {/* Camere Bloccate */}
                      <div className="mt-4 space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Tipologie Camere &amp; Disponibilità:
                        </span>
                        {(h.roomTypes || []).map(rt => (
                          <div key={rt.id} className="p-2 bg-neutral-50 rounded-lg flex items-center justify-between border border-neutral-100">
                            <div>
                              <span className="font-semibold text-stone-700 block text-xs">{rt.name}</span>
                              <span className="text-[10px] text-neutral-400">Max {rt.maxOccupancy} ospiti · €{rt.pricePerNight}/notte</span>
                            </div>
                            <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-[11px] font-mono font-bold text-stone-800">
                              {rt.availableRooms} / {rt.totalBlocked} disp.
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {h.websiteUrl && (
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
                        <a
                          href={h.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-amber-900 font-semibold hover:underline flex items-center gap-1"
                        >
                          Booking Engine Struttura <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TAB: GESTIONE ESPERIENZE PUGLIESI (LATO AGENZIA)                       */}
        {/* ========================================================================= */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            {/* Toast notifica aggiunta esperienza */}
            {sharedExpToast && (
              <div className="p-3 bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>{sharedExpToast}</span>
                </div>
                <button onClick={() => setSharedExpToast(null)} className="text-emerald-200 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Header Controllo Esperienze */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                    Attività &amp; Tour
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {selectedWedding?.weddingCode} · {selectedWedding?.coupleNames}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif-luxury text-stone-800 mt-1">
                  Gestione Esperienze &amp; Eventi Speciali
                </h2>
                <p className="text-xs text-neutral-500">
                  Configura gite in barca, degustazioni, welcome dinner, cooking class e pizzica per gli ospiti. Le esperienze create qui o in altri matrimoni sono archiviate nel <strong>Database Master Condiviso</strong> e riutilizzabili con 1-click.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <button
                  onClick={() => setShowSharedCatalogModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-amber-700" />
                  <span>Libreria Master ({masterExperiencesList.length})</span>
                </button>
                <button
                  onClick={() => handleOpenNewExp()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-800 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nuova Esperienza</span>
                </button>
              </div>
            </div>

            {/* Sezione Esperienze Attive per questo matrimonio */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-stone-800">
                    Esperienze Attive in Questo Matrimonio
                  </h3>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full text-[11px] font-bold">
                    {(selectedWedding?.experiences || []).length}
                  </span>
                </div>
                {(selectedWedding?.experiences || []).length > 0 && (
                  <span className="text-xs text-neutral-400">
                    Sincronizzate con il portale ospiti e l'area sposi
                  </span>
                )}
              </div>

              {(selectedWedding?.experiences || []).length === 0 ? (
                <div className="bg-amber-50/40 rounded-2xl border-2 border-dashed border-amber-200 p-8 text-center shadow-2xs space-y-4">
                  <Compass className="w-10 h-10 text-amber-600 mx-auto" />
                  <div className="max-w-md mx-auto">
                    <h4 className="text-sm font-bold text-stone-800">
                      Nessuna esperienza ancora assegnata a {selectedWedding?.coupleNames}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      Puoi importare istantaneamente le attività pugliesi più richieste dal <strong>Database Master Condiviso</strong> oppure inserirne una personalizzata.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button
                      onClick={handleImportBatchRecommended}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 shadow-xs cursor-pointer transition-transform hover:scale-105"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ Importa le 3 Esperienze Consigliate</span>
                    </button>
                    <button
                      onClick={() => setShowSharedCatalogModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-50 cursor-pointer shadow-2xs"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Sfoglia Catalogo Completo ({masterExperiencesList.length})</span>
                    </button>
                    <button
                      onClick={() => handleOpenNewExp()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crea da zero</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(selectedWedding?.experiences || []).map(exp => {
                    const sup = suppliers.find(s => s.id === exp.supplierId);
                    return (
                      <div key={exp.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-colors">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                                {exp.category}
                              </span>
                              <h3 className="font-bold text-base text-stone-800 font-serif-luxury mt-1.5">
                                {exp.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditExp(exp)}
                                className="p-1.5 text-neutral-400 hover:text-amber-900 rounded-lg hover:bg-neutral-100"
                                title="Modifica Esperienza"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExp(exp.id)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                title="Elimina Esperienza da questo matrimonio"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {sup && (
                            <div className="mt-2 text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="text-stone-700 font-semibold">{sup.name}</span>
                              <span className="text-[10px] text-neutral-400">({sup.city})</span>
                            </div>
                          )}

                          <div className="mt-3 space-y-1 text-xs text-neutral-600 border-t border-neutral-100 pt-2.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{exp.eventDate} · {exp.startTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="truncate">{exp.meetingPoint}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{exp.bookedParticipants} / {exp.maxParticipants} posti prenotati</span>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-600 mt-2.5 line-clamp-3">
                            {exp.description}
                          </p>

                          {exp.negotiatedPerk && (
                            <div className="mt-3 p-2 bg-amber-50/80 rounded-lg border border-amber-200/50 text-[11px] text-amber-900 italic">
                              🎁 {exp.negotiatedPerk}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-xs text-neutral-500">Costo a persona:</span>
                          <span className="text-sm font-black text-stone-800">
                            {exp.isHostSponsored ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">
                                Offerto dagli Sposi
                              </span>
                            ) : (
                              `€ ${exp.pricePerPerson}`
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* LIBRERIA MASTER ESPERIENZE CONDIVISE (DATABASE FORNITORI & MATRIMONI)      */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 uppercase">
                      Libreria Centralizzata
                    </span>
                    <span className="text-xs text-neutral-500">
                      Disponibile per tutti i matrimoni creati
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-serif-luxury text-stone-800 mt-0.5">
                    Database Master Esperienze &amp; Fornitori Puglia
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Ogni esperienza salvata in qualsiasi matrimonio o fornitore è disponibile qui per essere importata con 1 click.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cerca attività o fornitore..."
                      value={searchSharedExp}
                      onChange={(e) => setSearchSharedExp(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl w-48 sm:w-64 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Filtri per Categoria */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'ALL', label: 'Tutte le Attività' },
                  { id: 'BOAT_TOUR', label: '⛵ Gite in Barca' },
                  { id: 'WINE_TASTING', label: '🍷 Degustazioni Vini' },
                  { id: 'COOKING_CLASS', label: '👩‍🍳 Cooking Class' },
                  { id: 'PIZZICA_NIGHT', label: '💃 Pizzica & Folklore' },
                  { id: 'OIL_TOUR', label: '🫒 Tour Olio & Ulivi' },
                  { id: 'WELCOME_PARTY', label: '🎉 Welcome Party' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSharedExpCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      sharedExpCategoryFilter === cat.id
                        ? 'bg-amber-900 text-white font-bold'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Griglia Esperienze del Master Database */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {masterExperiencesList
                  .filter(exp => {
                    if (sharedExpCategoryFilter !== 'ALL' && exp.category !== sharedExpCategoryFilter) return false;
                    if (searchSharedExp.trim()) {
                      const q = searchSharedExp.toLowerCase();
                      const sup = suppliers.find(s => s.id === exp.supplierId);
                      return (
                        exp.title.toLowerCase().includes(q) ||
                        exp.description.toLowerCase().includes(q) ||
                        exp.meetingPoint.toLowerCase().includes(q) ||
                        (sup && sup.name.toLowerCase().includes(q))
                      );
                    }
                    return true;
                  })
                  .map(masterExp => {
                    const isAlreadyInActiveWedding = (selectedWedding?.experiences || []).some(
                      e => e.title.trim().toLowerCase() === masterExp.title.trim().toLowerCase()
                    );
                    const sup = suppliers.find(s => s.id === masterExp.supplierId);

                    // Trova tutti i matrimoni che attualmente usano questa esperienza
                    const weddingsUsingThis = weddings.filter(w => 
                      (w.experiences || []).some(e => e.title.trim().toLowerCase() === masterExp.title.trim().toLowerCase())
                    );

                    return (
                      <div
                        key={masterExp.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isAlreadyInActiveWedding
                            ? 'bg-stone-50/50 border-emerald-300'
                            : 'bg-white hover:bg-amber-50/30 border-neutral-200 hover:border-amber-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-stone-700 uppercase">
                              {masterExp.category}
                            </span>
                            <span className="text-sm font-black text-amber-900">
                              € {masterExp.pricePerPerson} <span className="text-[10px] font-normal text-neutral-500">/ pax</span>
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-stone-800 font-serif-luxury mt-2">
                            {masterExp.title}
                          </h4>

                          {sup && (
                            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1 font-medium">
                              <Building2 className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span className="truncate text-stone-700">{sup.name}</span>
                              <span className="text-[10px] text-neutral-400">· {sup.city}</span>
                            </div>
                          )}

                          <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                            {masterExp.description}
                          </p>

                          {masterExp.negotiatedPerk && (
                            <div className="mt-2.5 p-1.5 bg-amber-50 rounded border border-amber-200/60 text-[10px] text-amber-900 italic">
                              🎁 {masterExp.negotiatedPerk}
                            </div>
                          )}

                          {/* Matrimoni che utilizzano questa esperienza */}
                          <div className="mt-3 pt-2 border-t border-neutral-100 text-[10px] text-neutral-400">
                            <span className="font-semibold text-neutral-500">Attiva in {weddingsUsingThis.length} matrimoni: </span>
                            {weddingsUsingThis.length > 0 ? (
                              <span>{weddingsUsingThis.map(w => w.weddingCode).join(', ')}</span>
                            ) : (
                              <span className="italic">Disponibile nel catalogo master</span>
                            )}
                          </div>
                        </div>

                        {/* Azioni 1-Click Import o Personalizzazione */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                          {isAlreadyInActiveWedding ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Attiva in questo matrimonio</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleImportSharedExp(masterExp)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Aggiungi a {selectedWedding?.weddingCode}</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenNewExp(masterExp)}
                            className="text-[11px] text-amber-900 font-semibold hover:underline"
                            title="Apri e personalizza orari o dettagli prima di aggiungere"
                          >
                            Modifica &amp; Clona
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TAB: GESTIONE TRANSFER & NAVETTE (LATO AGENZIA)                        */}
        {/* ========================================================================= */}
        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 uppercase tracking-wider">
                    Logistica &amp; NCC
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {selectedWedding?.weddingCode} · {selectedWedding?.coupleNames}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif-luxury text-stone-800 mt-1">
                  Gestione Transfer Aeroportuali &amp; Navette
                </h2>
                <p className="text-xs text-neutral-500">
                  Organizza i collegamenti da/per gli aeroporti di Bari (BRI) e Brindisi (BDS), orari, capienza e veicoli VIP.
                </p>
              </div>

              <button
                onClick={handleOpenNewTransfer}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-800 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                + Aggiungi Transfer / Navetta
              </button>
            </div>

            {(selectedWedding?.transfers || []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-2xs">
                <Car className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-stone-700">Nessuna navetta o transfer ancora configurato</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-5">
                  Aggiungi i collegamenti di navetta Mercedes Sprinter o transfer NCC per consentire agli ospiti di prenotare il viaggio dall'aeroporto alla masseria.
                </p>
                <button
                  onClick={handleOpenNewTransfer}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 text-white rounded-lg text-xs font-bold hover:bg-amber-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Inserisci Transfer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(selectedWedding?.transfers || []).map(tr => (
                  <div key={tr.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                            {tr.type}
                          </span>
                          <h3 className="font-bold text-base text-stone-800 mt-1">
                            {tr.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditTransfer(tr)}
                            className="p-1.5 text-neutral-400 hover:text-amber-900 rounded-lg hover:bg-neutral-100"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransfer(tr.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs py-3 my-3 border-y border-neutral-100">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Origine:</span>
                          <span className="font-semibold text-stone-700">{tr.origin}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Destinazione:</span>
                          <span className="font-semibold text-stone-700">{tr.destination}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Orario di Partenza:</span>
                          <span className="font-semibold text-stone-700">{tr.departureTime}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Veicolo:</span>
                          <span className="font-semibold text-stone-700 truncate block">{tr.vehicleType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-neutral-500">
                        Posti Occupati: <strong className="text-stone-800 font-mono">{tr.bookedSeats} / {tr.capacity}</strong>
                      </span>
                      <span className="font-bold text-stone-800 text-sm">
                        {tr.isPaidByCouple ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                            Offerto dagli Sposi
                          </span>
                        ) : (
                          `€ ${tr.pricePerSeat} / pax`
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: GESTIONE SERVIZI EXTRA & BEAUTY (TRUCCO, PARRUCCHIERE, ECC.)         */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                    Beauty &amp; Styling &bull; Ospiti
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {selectedWedding?.weddingCode} &bull; {selectedWedding?.coupleNames}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif-luxury text-stone-800 mt-1">
                  Gestione Servizi Extra (Trucco, Parrucchiere, Estetista, Babysitting)
                </h2>
                <p className="text-xs text-neutral-500">
                  Configura i servizi di bellezza e assistenza a disposizione degli ospiti nel portale, con relativi prezzi, operatori e link di pagamento.
                </p>
              </div>

              <button
                onClick={handleOpenNewService}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-800 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                + Aggiungi Servizio Extra
              </button>
            </div>

            {(selectedWedding?.extraServices || []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-2xs">
                <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-stone-700">Nessun servizio extra ancora configurato</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-5">
                  Aggiungi servizi come trucco sposa/invitata, acconciatura capelli, babysitting o stireria abiti da cerimonia.
                </p>
                <button
                  onClick={handleOpenNewService}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 text-white rounded-lg text-xs font-bold hover:bg-amber-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Inserisci Servizio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(selectedWedding?.extraServices || []).map(srv => (
                  <div key={srv.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900">
                            {srv.category}
                          </span>
                          <h3 className="font-bold text-base text-stone-800 mt-1">
                            {srv.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditService(srv)}
                            className="p-1.5 text-neutral-400 hover:text-amber-900 rounded-lg hover:bg-neutral-100"
                            title="Modifica Servizio"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Elimina Servizio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 mt-2 line-clamp-3">
                        {srv.description}
                      </p>

                      <div className="mt-3 space-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-2.5">
                        <div>Operatore: <strong className="text-stone-700">{srv.providerName}</strong></div>
                        <div>Durata: <strong className="text-stone-700">{srv.duration}</strong></div>
                        {srv.negotiatedPerk && (
                          <div className="text-amber-900 italic text-[11px] pt-1">
                            🎁 {srv.negotiatedPerk}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-neutral-100 text-xs">
                      <span className="text-neutral-500">Costo:</span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        {srv.isPaidByCouple ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">
                            Offerto dagli Sposi
                          </span>
                        ) : (
                          `€ ${srv.price}`
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TAB: OSPITI & RSVP                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'guests' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-stone-800 font-serif-luxury">
                  Elenco Ospiti &amp; RSVP: {selectedWedding?.coupleNames} ({selectedWedding?.weddingCode})
                </h3>
                <p className="text-xs text-neutral-500">
                  Monitoraggio presenze, alloggi scelti, transfer, intolleranze e voli degli ospiti
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportGuestsCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Esporta CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {(selectedWedding?.guests || []).length === 0 ? (
                <div className="col-span-full py-12 text-center text-neutral-400">
                  Nessun ospite ancora registrato per questo matrimonio.
                </div>
              ) : (
                (selectedWedding?.guests || []).map(g => {
                  const guestWishes = wishRequests.filter(w => {
                    const wCode = (w.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
                    const selCode = (selectedWedding?.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
                    const matchesCode = !wCode || wCode === selCode;

                    const gEmail = (g.email || '').trim().toLowerCase();
                    const wEmail = (w.guestEmail || '').trim().toLowerCase();
                    const gName = (g.name || '').trim().toLowerCase();
                    const wName = (w.guestName || '').trim().toLowerCase();

                    const matchesEmail = gEmail && wEmail && gEmail === wEmail;
                    const matchesName = gName && wName && gName === wName;

                    return matchesCode && (matchesEmail || matchesName);
                  });

                  return (
                    <div key={g.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-stone-800">{g.name}</h4>
                            <p className="text-[11px] text-stone-500">{g.country || 'Nazione non specificata'}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${g.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {g.status === 'CONFIRMED' ? 'CONFERMATO' : 'IN ATTESA'}
                          </span>
                        </div>

                        <div className="text-xs space-y-2 pt-3 border-t border-stone-100 mt-3">
                          {g.email && <p className="text-stone-700 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" /> <span className="truncate">{g.email}</span></p>}
                          {g.phone && <p className="text-stone-700 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {g.phone}</p>}
                          
                          {g.familyName && (
                            <p className="text-stone-800 font-bold flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-600" /> Nucleo: {g.familyName}
                            </p>
                          )}

                          {g.companions && g.companions.length > 0 && (
                            <div className="p-2 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                              <span className="text-[10px] font-bold text-indigo-900 block">Accompagnatori ({g.companions.length}):</span>
                              {g.companions.map((c: any, idx: number) => (
                                <div key={idx} className="text-[10px] text-indigo-800 flex justify-between border-b border-indigo-100/50 last:border-0 pb-1">
                                  <span>{c.name} ({c.relationship})</span>
                                  {c.dietary && c.dietary !== 'Standard' && <span className="font-bold text-rose-600">🍴 {c.dietary}</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {g.specialNeeds && (
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                              <span className="text-[10px] font-bold text-amber-900 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Note / Esigenze Speciali:
                              </span>
                              <p className="text-[10px] text-amber-800 italic">{g.specialNeeds}</p>
                            </div>
                          )}
                          
                          {g.hotelBooked && g.hotelBooked !== 'Nessun hotel' && (
                            <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                              <p className="text-stone-800 font-semibold flex items-center gap-1">
                                <Hotel className="w-3.5 h-3.5 text-amber-900" /> {g.hotelBooked} {g.roomType && `(${g.roomType})`}
                              </p>
                              <span className="text-[10px] text-stone-500 block mt-0.5">
                                Stato Pagamento Hotel: <strong className={g.hotelBookingStatus === 'PAID' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                                  {g.hotelBookingStatus === 'PAID' ? 'Pagato Online (Carta)' : g.hotelBookingStatus === 'OFFICIAL_CONFIRMED' ? 'Confermato - Da Saldare' : 'In attesa'}
                                </strong>
                              </span>
                            </div>
                          )}

                          {g.transferBooked && g.transferBooked !== 'Autonomo' && (
                            <p className="text-stone-700 flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-stone-400 shrink-0" /> 
                              <span>Transfer: {g.transferBooked} {g.flight && `(Volo: ${g.flight})`}</span>
                            </p>
                          )}

                          {(g.experiences && g.experiences.length > 0) && (
                            <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1.5">
                              <span className="text-[11px] font-bold text-amber-900 block flex items-center gap-1">
                                <Compass className="w-3.5 h-3.5" /> Esperienze &amp; Dettagli:
                              </span>
                              {g.experiences.map((expIdOrTitle, idx) => {
                                const matchedExp = (selectedWedding?.experiences || []).find(e => e.title === expIdOrTitle || e.id === expIdOrTitle);
                                const booking = g.serviceBookings?.[matchedExp?.id || expIdOrTitle];
                                const qty = booking?.quantity || 1;
                                const notes = booking?.notes;
                                const price = matchedExp ? (matchedExp.isHostSponsored ? 0 : matchedExp.pricePerPerson) : 0;
                                const isFree = matchedExp ? matchedExp.isHostSponsored : false;
                                
                                return (
                                  <div key={idx} className="text-[11px] text-stone-700 pl-4 border-l-2 border-amber-300 space-y-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold">{matchedExp ? matchedExp.title : expIdOrTitle}</span>
                                      <span className="font-bold text-stone-900">
                                        {isFree ? <span className="text-emerald-700">Offerto</span> : `€ ${price * qty}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                                      <span>Quantità: {qty} pax</span>
                                      {!isFree && <span>(€{price}/pax)</span>}
                                    </div>
                                    {notes && <p className="text-[10px] italic text-amber-800">Note: {notes}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {guestWishes.length > 0 && (
                            <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200 space-y-1">
                              <span className="text-[11px] font-bold text-stone-800 block flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-900" /> Desideri Espressi dall'Ospite:
                              </span>
                              {guestWishes.map(w => (
                                <div key={w.id} className="text-[11px] text-stone-700 space-y-0.5 pl-4 border-l-2 border-stone-400">
                                  <p className="font-semibold text-stone-900">{w.title}</p>
                                  <p className="text-stone-600 italic">"{w.description}"</p>
                                  {w.proposedCost != null && w.proposedCost > 0 && (
                                    <p className="text-stone-800 font-medium">Costo proposto agenzia: € {w.proposedCost}</p>
                                  )}
                                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 mt-1">
                                    Stato: {w.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {g.diet && g.diet !== 'Nessuna intolleranza' && (
                            <p className="text-stone-700"><span className="text-stone-400">Dieta:</span> {g.diet}</p>
                          )}

                          {(g.extraServices && g.extraServices.length > 0) && (
                            <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-200/60 space-y-1.5">
                              <span className="text-[11px] font-bold text-rose-900 block flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> Servizi Beauty & Extra:
                              </span>
                              {g.extraServices.map((srvIdOrTitle, idx) => {
                                const matchedSrv = (selectedWedding?.extraServices || []).find(s => s.title === srvIdOrTitle || s.id === srvIdOrTitle);
                                const booking = g.serviceBookings?.[matchedSrv?.id || srvIdOrTitle];
                                const qty = booking?.quantity || 1;
                                const notes = booking?.notes;
                                const price = matchedSrv ? (matchedSrv.isPaidByCouple ? 0 : matchedSrv.price) : 0;
                                const isFree = matchedSrv ? matchedSrv.isPaidByCouple : false;
                                
                                return (
                                  <div key={idx} className="text-[11px] text-stone-700 pl-4 border-l-2 border-rose-300 space-y-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold">{matchedSrv ? matchedSrv.title : srvIdOrTitle}</span>
                                      <span className="font-bold text-stone-900">
                                        {isFree ? <span className="text-emerald-700">Offerto</span> : `€ ${price * qty}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                                      <span>Quantità: {qty}</span>
                                      {!isFree && <span>(€{price}/u)</span>}
                                    </div>
                                    {notes && <p className="text-[10px] italic text-rose-800">Note: {notes}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-400 block">Stato Pagamenti Online:</span>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                g.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 
                                g.paymentStatus === 'FREE' ? 'bg-stone-100 text-stone-700' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {g.paymentStatus === 'PAID' ? 'Pagato Online 🟢' : g.paymentStatus === 'FREE' ? 'Gratuito / Offerto 🎁' : 'Da Saldare ⏳'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-stone-400 block">Totale Dovuto:</span>
                              <span className="text-sm font-black text-stone-900">€ {g.totalAmountDue || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex justify-end gap-2 mt-3">
                         {g.phone && (
                            <a href={`https://wa.me/${g.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3" /> WhatsApp
                            </a>
                         )}
                         <a href={`mailto:${g.email}`} className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium flex items-center gap-1">
                           <Mail className="w-3 h-3" /> Email
                         </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. TAB: LIVE CONCIERGE CHAT                                               */}
        {/* ========================================================================= */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col h-[700px]">
            {/* Header Concierge Valeria */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  V
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base font-serif-luxury text-amber-100">
                      Concierge Valeria · Conversazioni Individuali Ospiti
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Cloud
                    </span>
                  </div>
                  <p className="text-xs text-stone-300">
                    Matrimonio: <strong className="text-white">{selectedWedding?.coupleNames}</strong> ({selectedWedding?.weddingCode})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-300 text-[11px] hidden md:inline">
                  {conversationsList.length} {conversationsList.length === 1 ? 'ospite' : 'ospiti in elenco'}
                </span>
                <div className="inline-flex rounded-xl bg-stone-800 p-1 border border-stone-700">
                  <button
                    type="button"
                    onClick={() => setChatListFilter('with_messages')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      chatListFilter === 'with_messages'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Con Messaggi ({Array.from(conversationsMap.values()).filter(c => c.messages.length > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatListFilter('all_guests')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      chatListFilter === 'all_guests'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Tutti gli Invitati ({selectedWedding?.guests?.length || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* Split layout: Rubrica Sinistra / Chat Thread Destra */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* RUBRICA CONVERSAZIONI SINISTRA */}
              <div className="w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col bg-neutral-50/70 h-full">
                {/* Search Bar */}
                <div className="p-3 border-b border-neutral-200/80 bg-white">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      placeholder="Cerca ospite per nome o email..."
                      className="w-full pl-9 pr-3 py-2 bg-neutral-100/80 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-900 focus:bg-white focus:outline-none"
                    />
                    {chatSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setChatSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Elenco Ospiti che hanno scritto */}
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2 space-y-1">
                  {conversationsList.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 space-y-2">
                      <MessageCircle className="w-8 h-8 text-neutral-300 mx-auto" />
                      <p className="text-xs font-medium text-neutral-600">
                        {chatSearchQuery
                          ? `Nessun risultato per "${chatSearchQuery}"`
                          : chatListFilter === 'with_messages'
                          ? 'Nessun ospite ha ancora inviato messaggi per questo matrimonio.'
                          : 'Nessun ospite registrato in elenco.'}
                      </p>
                      {chatListFilter === 'with_messages' && (
                        <button
                          type="button"
                          onClick={() => setChatListFilter('all_guests')}
                          className="text-xs text-amber-900 font-bold hover:underline cursor-pointer"
                        >
                          Visualizza tutti gli invitati registrati
                        </button>
                      )}
                    </div>
                  ) : (
                    conversationsList.map((conv) => {
                      const isSelected = activeConversation?.id === conv.id;
                      const hasUnread = conv.unreadCount > 0;
                      const isCouple = conv.role === 'couple';

                      return (
                        <div
                          key={conv.id}
                          onClick={() => setSelectedChatGuest(conv.id)}
                          className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-amber-50/80 border-amber-800/40 shadow-xs ring-1 ring-amber-900/10'
                              : 'bg-white hover:bg-neutral-100/70 border-neutral-200/70 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCouple 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                  : isSelected
                                  ? 'bg-amber-900 text-white'
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                              }`}>
                                {isCouple ? '💍' : conv.guestName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-950' : 'text-stone-900'}`}>
                                    {conv.guestName}
                                  </span>
                                  {isCouple && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                                      Sposi
                                    </span>
                                  )}
                                  {hasUnread && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white animate-pulse">
                                      Nuovo
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-neutral-400 block truncate">
                                  {conv.guestEmail || 'Nessuna email'}
                                </span>
                              </div>
                            </div>

                            {conv.lastMessage && (
                              <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                                {conv.lastMessage.timestamp}
                              </span>
                            )}
                          </div>

                          {/* Anteprima ultimo messaggio */}
                          <div className="mt-2 text-xs text-neutral-600 flex items-center gap-1.5 min-w-0">
                            {conv.lastMessage ? (
                              <p className="truncate text-[11px] text-stone-600">
                                <span className="font-semibold text-stone-700">
                                  {conv.lastMessage.sender === 'valeria' ? 'Valeria: ' : conv.lastMessage.sender === 'couple' ? 'Sposi: ' : 'Ospite: '}
                                </span>
                                {conv.lastMessage.text}
                              </p>
                            ) : (
                              <p className="text-[10px] text-neutral-400 italic">
                                Nessun messaggio scambiato. Clicca per aprire la chat.
                              </p>
                            )}
                          </div>

                          {/* Badge riepilogo logistico ospite se presente */}
                          {conv.guestData && (conv.guestData.hotelBooked || conv.guestData.transferBooked) && (
                            <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center gap-2 text-[10px] text-neutral-500 overflow-hidden">
                              {conv.guestData.hotelBooked && (
                                <span className="truncate flex items-center gap-1">
                                  <Hotel className="w-3 h-3 text-amber-800 shrink-0" /> {conv.guestData.hotelBooked}
                                </span>
                              )}
                              {conv.guestData.transferBooked && (
                                <span className="truncate flex items-center gap-1">
                                  <Car className="w-3 h-3 text-blue-800 shrink-0" /> {conv.guestData.transferBooked}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* PANNELLO CHAT INDIVIDUALE DESTRA */}
              <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
                {activeConversation ? (
                  <>
                    {/* Header Conversazione Attiva */}
                    <div className="p-3.5 sm:p-4 border-b border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                          activeConversation.role === 'couple'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-stone-800 text-white'
                        }`}>
                          {activeConversation.role === 'couple' ? '💍' : activeConversation.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-900 text-sm sm:text-base font-serif-luxury">
                              {activeConversation.guestName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {activeConversation.role === 'couple' ? 'Cliente Principale' : 'Ospite Matrimonio'}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center gap-3 mt-0.5 flex-wrap">
                            {activeConversation.guestEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-neutral-400" /> {activeConversation.guestEmail}
                              </span>
                            )}
                            {activeConversation.guestPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-neutral-400" /> {activeConversation.guestPhone}
                              </span>
                            )}
                            {activeConversation.guestData?.country && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-neutral-400" /> {activeConversation.guestData.country}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info Logistics Rapide Ospite */}
                      {activeConversation.guestData && (
                        <div className="flex items-center gap-2 text-xs self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs">
                          <span className="text-[11px] font-semibold text-stone-700">Logistica:</span>
                          <span className="text-[11px] text-amber-950 font-medium">
                            {activeConversation.guestData.hotelBooked || 'Nessun hotel'}
                          </span>
                          <span className="text-neutral-300">|</span>
                          <span className="text-[11px] text-blue-950 font-medium">
                            {activeConversation.guestData.transferBooked || 'Transfer autonomo'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Area Messaggi Cronologici della Conversazione */}
                    <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-neutral-100/40">
                      {activeConversation.messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-3">
                          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-700 text-sm">
                              Nessun messaggio ancora scambiato con {activeConversation.guestName}
                            </p>
                            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                              Valeria può inviare un messaggio di benvenuto, confermare gli orari navette o fornire assistenza personalizzata.
                            </p>
                          </div>
                        </div>
                      ) : (
                        activeConversation.messages.map((m, idx) => {
                          const isValeria = m.sender === 'valeria';
                          const isCouple = m.sender === 'couple';

                          return (
                            <div
                              key={m.id || idx}
                              className={`flex ${isValeria ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-1.5 ${
                                  isValeria
                                    ? 'bg-stone-800 text-white rounded-tr-xs'
                                    : isCouple
                                    ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-xs'
                                    : 'bg-white border border-neutral-200 text-stone-800 rounded-tl-xs'
                                }`}
                              >
                                <div className={`text-[10px] font-semibold flex items-center justify-between gap-2 pb-0.5 border-b ${
                                  isValeria
                                    ? 'border-white/10 text-amber-200'
                                    : isCouple
                                    ? 'border-rose-100 text-rose-800'
                                    : 'border-neutral-100 text-amber-900'
                                }`}>
                                  <span className="flex items-center gap-1 font-bold">
                                    {isValeria 
                                      ? '🌿 Valeria (Concierge AD Marketing)' 
                                      : isCouple 
                                      ? `💍 Sposi (${selectedWedding?.coupleNames})`
                                      : `👤 ${m.guestName || activeConversation.guestName}`
                                    }
                                  </span>
                                  <span className={isValeria ? 'text-stone-300' : 'text-neutral-400'}>
                                    {m.timestamp}
                                  </span>
                                </div>

                                <p className="leading-relaxed whitespace-pre-wrap text-xs">
                                  {m.text}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Toast Feedback Invio */}
                    {chatFeedback && (
                      <div className="mx-4 my-2 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-fade-in shrink-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold">{chatFeedback}</span>
                        </div>
                      </div>
                    )}

                    {/* Risposte Rapide Concierge */}
                    <div className="px-4 py-2 bg-neutral-50/80 border-t border-neutral-200 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-700" /> Risposte Rapide:
                      </span>
                      {[
                        "Gentile ospite, ho verificato la tua richiesta. Valeria e lo staff AD Marketing sono a tua completa disposizione!",
                        "Confermiamo il transfer prenotato dall'aeroporto. L'autista ti attenderà con cartello recante il tuo nome.",
                        "La camera d'albergo è confermata alle tariffe agevolate AD Marketing.",
                        "Posti confermati per l'esperienza in Puglia! Ti invieremo orario e meeting point."
                      ].map((quickText, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => setReplyText(quickText)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:border-amber-700 hover:bg-amber-50/50 text-[11px] text-stone-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                        >
                          {qIdx === 0 ? '✨ Assistenza' : qIdx === 1 ? '✈️ Transfer' : qIdx === 2 ? '🏨 Hotel' : '🍷 Esperienza'}
                        </button>
                      ))}
                    </div>

                    {/* Form Risposta Concierge */}
                    <form onSubmit={handleSendReply} className="p-3.5 border-t border-neutral-200 bg-white flex flex-col gap-2 shrink-0">
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Scrivi un messaggio diretto a ${activeConversation.guestName} come Valeria Concierge...`}
                          className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-900 focus:bg-white focus:outline-none resize-none leading-relaxed"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              handleSendReply(e);
                            }
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] text-neutral-400 hidden sm:inline">
                          Premi <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-[10px] font-mono">Ctrl+Enter</kbd> per inviare velocemente
                        </span>

                        <div className="flex items-center gap-2 ml-auto">
                          {replyText && (
                            <button
                              type="button"
                              onClick={() => setReplyText('')}
                              className="px-3 py-1.5 text-neutral-500 hover:text-neutral-800 text-xs font-semibold cursor-pointer"
                            >
                              Svuota
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-950 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Invia Risposta a {activeConversation.guestName.split(' ')[0]}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400">
                    <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-700 text-sm">Seleziona un ospite dalla rubrica</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Scegli un contatto sulla sinistra per leggere la conversazione e rispondere singolarmente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. TAB: FORNITORI CONVENZIONATI                                           */}
        {/* ========================================================================= */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs">
              <h3 className="text-base font-bold text-stone-800 font-serif-luxury mb-1">
                Fornitori &amp; Partner Territoriali ({suppliers.length})
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Hotel convenzionati, transfer NCC, barche e attività turistiche in Puglia
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suppliers.map(s => (
                  <div key={s.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                    <span className="font-bold text-stone-800 block text-sm">{s.name}</span>
                    <span className="text-[10px] text-amber-900 uppercase font-bold block">{s.category}</span>
                    <span className="text-neutral-500 block mt-1.5">{s.city}</span>
                    <span className="text-neutral-600 block mt-0.5">{s.phone} · {s.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8.1 TAB: CATALOGO (Esperienze, Transfer, Servizi)                       */}
        {/* ========================================================================= */}
        {activeTab === 'catalog' && (
          <CatalogSettings 
            settings={settingsForm} 
            onUpdate={(updated) => {
              setSettingsForm(updated);
              onUpdateAdminSettings(updated);
            }} 
          />
        )}

        {/* ========================================================================= */}
        {/* 8. TAB: IMPOSTAZIONI AVANZATE & PERSONALIZZAZIONE PORTALE                 */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Header del Centro Impostazioni */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-amber-200 uppercase tracking-wider">
                    Pannello di Controllo Globale
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    Apulian Concierge Platform v2.4
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif-luxury text-stone-800 mt-1 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-800" />
                  <span>Impostazioni &amp; Personalizzazione Web App</span>
                </h2>
                <p className="text-xs text-neutral-500 max-w-2xl mt-1">
                  Configura i dati societari ufficiali, il team di accoglienza Valeria, le coordinate bancarie per bonifici e Stripe, lo stile grafico del portale e i moduli attivi per gli ospiti e gli sposi.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-900 hover:bg-amber-950 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Salva Modifiche Globali</span>
                </button>
              </div>
            </div>

            {/* Banner di Conferma Salvataggio */}
            {settingsSaveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between shadow-2xs animate-fade-in">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{settingsSaveSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsSaveSuccess(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Barra Navigazione Sub-Tabs Impostazioni */}
            <div className="bg-white rounded-xl border border-neutral-200 p-1.5 shadow-2xs flex flex-wrap gap-1.5">
              {[
                { id: 'company', label: '1. Società & Legale', icon: Landmark, desc: 'Dati fiscali, P.IVA, sede' },
                { id: 'team_contacts', label: '2. Team & Valeria', icon: Phone, desc: 'WhatsApp H24, email' },
                { id: 'banking', label: '3. Banca & IBAN', icon: CreditCard, desc: 'Conto, BIC, Stripe' },
                { id: 'branding', label: '4. Stile Grafico', icon: Palette, desc: 'Palette Puglia, font, card' },
                { id: 'features', label: '5. Moduli & Portali', icon: Settings2, desc: 'Switch, desideri, valuta' },
                { id: 'preview_sync', label: '6. Anteprima Materiali', icon: Eye, desc: 'Simulatore voucher e footer' }
              ].map(sub => {
                const Icon = sub.icon;
                const isActive = settingsSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSettingsSubTab(sub.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-800 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-neutral-500'}`} />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ================================================================= */}
            {/* SUB-TAB 1: DATI SOCIETARI, SEDE & LEGALI                         */}
            {/* ================================================================= */}
            {settingsSubTab === 'company' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-base font-bold text-stone-800 font-serif-luxury flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-800" />
                    <span>Dati Societari, Legali &amp; Fiscali della Società</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Questi dati compaiono nelle schede di prenotazione ufficiali, nei voucher PDF/HTML per gli ospiti, nei contratti con i fornitori e nel footer universale del sito.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Brand Commerciale Agenzia
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyName || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyName: e.target.value })}
                      placeholder="es. AD Marketing Wedding Concierge"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Nome identificativo visualizzato nelle comunicazioni e nei titoli
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Ragione Sociale Ufficiale (Fatturazione &amp; Legale)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyLegalName || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyLegalName: e.target.value })}
                      placeholder="es. AD Marketing S.r.l.s."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Intestatario formale dell'attività e dei contratti di hospitality
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Partita IVA &amp; Codice Fiscale
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyVat || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyVat: e.target.value })}
                      placeholder="es. IT03124590731"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Numero Iscrizione R.E.A. (CCIAA)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyRea || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyRea: e.target.value })}
                      placeholder="es. TA-201842"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Indirizzo Sede Legale (Via &amp; Numero Civico)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyAddress || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyAddress: e.target.value })}
                      placeholder="es. Via Roma, 45"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Città, CAP, Provincia &amp; Nazione
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyCity || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyCity: e.target.value })}
                      placeholder="es. 74018 Palagianello (TA) - Puglia, Italia"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Capitale Sociale Deliberato
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyShareCapital || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyShareCapital: e.target.value })}
                      placeholder="es. €10.000 i.v."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Badge Ufficiale Territoriale
                    </label>
                    <input
                      type="text"
                      value={settingsForm.badgeText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, badgeText: e.target.value })}
                      placeholder="es. AD Marketing · Official Puglia Concierge Partner"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Clausola di Trasparenza &amp; Disclaimer Legale (Footer e Schede)
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.footerDisclaimer || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerDisclaimer: e.target.value })}
                      placeholder="Testo descrittivo del ruolo dell'agenzia come concierge di incoming..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs leading-relaxed focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Viene stampato nelle schede di riepilogo per conformità con le normative sul turismo e intermediazione eventi in Puglia.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Applica Modifiche Societarie</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SUB-TAB 2: TEAM & CONCIERGE VALERIA                              */}
            {/* ================================================================= */}
            {settingsSubTab === 'team_contacts' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-base font-bold text-stone-800 font-serif-luxury flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Team Concierge &amp; Assistenza Valeria (H24)</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Definisci i canali diretti con cui gli ospiti internazionali e gli sposi possono contattare Valeria, richiedere supporto e ricevere notifiche.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Email Principale Notifiche &amp; Amministrazione Agenzia
                    </label>
                    <input
                      type="email"
                      value={settingsForm.adminNotificationEmail || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminNotificationEmail: e.target.value })}
                      placeholder="es. domenicoantonacci@gmail.com"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Riceve le notifiche di nuove registrazioni ospiti, richieste hotel e ordini fornitori
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Telefono Sede Centrale / Centralino AD Marketing
                    </label>
                    <input
                      type="text"
                      value={settingsForm.agencyPhone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, agencyPhone: e.target.value })}
                      placeholder="es. +39 099 8887766"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      WhatsApp Diretto Valeria (Concierge H24 Ospiti)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.valeriaPhone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, valeriaPhone: e.target.value })}
                      placeholder="es. +39 340 1234567"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Collegamento diretto "Scrivi su WhatsApp a Valeria" presente in tutto il portale
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Email Operativa Valeria Concierge
                    </label>
                    <input
                      type="email"
                      value={settingsForm.valeriaEmail || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, valeriaEmail: e.target.value })}
                      placeholder="es. valeria@admarketing.it"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Ruolo / Qualifica Professionale Ufficiale di Valeria
                    </label>
                    <input
                      type="text"
                      value={settingsForm.valeriaRoleTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, valeriaRoleTitle: e.target.value })}
                      placeholder="es. Head of Destination Wedding Concierge & Guest Experience"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Numero Linea Emergenze Notturne &amp; Weekend
                    </label>
                    <input
                      type="text"
                      value={settingsForm.emergencyPhone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, emergencyPhone: e.target.value })}
                      placeholder="es. +39 340 9988776"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Formula di Benvenuto Personalizzata per gli Ospiti nei Portali
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.defaultWelcomeGreeting || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, defaultWelcomeGreeting: e.target.value })}
                      placeholder="Benvenuti in Puglia! Il team di Valeria e AD Marketing è a vostra disposizione..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs leading-relaxed focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Salva Contatti Concierge</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SUB-TAB 3: COORDINATE BANCARIE & MODALITA' PAGAMENTI             */}
            {/* ================================================================= */}
            {settingsSubTab === 'banking' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-base font-bold text-stone-800 font-serif-luxury flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    <span>Coordinate Bancarie, IBAN &amp; Checkout Stripe</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Questi dati vengono inseriti nei messaggi di riepilogo inviati al cliente, nelle istruzioni di bonifico della scheda ospite e nella sezione incassi dell'agenzia.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Intestatario Ufficiale Conto Bancario
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankAccountHolder || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountHolder: e.target.value })}
                      placeholder="es. AD Marketing S.r.l.s. - Conto Servizi Matrimoni Puglia"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Banca &amp; Filiale di Appoggio
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankName || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                      placeholder="es. UniCredit Banca - Filiale di Taranto / Palagianello"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Codice IBAN (Bonifici SEPA &amp; Italia)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.defaultIban || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, defaultIban: e.target.value })}
                      placeholder="es. IT98 X 03002 03280 000000123456"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono font-bold text-stone-800 focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Viene mostrato all'ospite e al cliente con comodo pulsante di copia rapida
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Codice BIC / SWIFT (Bonifici Internazionali USA / UK)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.defaultBic || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, defaultBic: e.target.value })}
                      placeholder="es. UNCRITM1B45"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono font-bold text-stone-800 focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Link Pagamento Diretto Carta di Credito (Stripe Checkout)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.stripePaymentLink || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stripePaymentLink: e.target.value })}
                      placeholder="https://buy.stripe.com/..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Permette all'ospite di saldare le esperienze e i transfer con Apple Pay / Carta istantanea
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Commissione Standard Agenzia su Servizi (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={settingsForm.standardCommissionPercent ?? 15}
                        onChange={(e) => setSettingsForm({ ...settingsForm, standardCommissionPercent: Number(e.target.value) || 0 })}
                        className="w-24 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-amber-900 focus:outline-none"
                      />
                      <span className="text-neutral-500 font-bold">%</span>
                      <span className="text-[11px] text-neutral-400">
                        Applicata di default sui nuovi fornitori convenzionati
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Formula Causale Raccomandata per Bonifico
                    </label>
                    <input
                      type="text"
                      value={settingsForm.paymentInstructions || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paymentInstructions: e.target.value })}
                      placeholder='Saldo Servizi Concierge - [Codice Matrimonio] - [Nome Ospite]'
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Formula visualizzata nella scheda prenotazione per facilitare la riconciliazione con la banca
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Salva Parametri Bancari</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SUB-TAB 4: STILE GRAFICO & ASPETTO                                */}
            {/* ================================================================= */}
            {settingsSubTab === 'branding' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-base font-bold text-stone-800 font-serif-luxury flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-800" />
                    <span>Stile Grafico, Palette Puglia &amp; Identità Visiva</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Personalizza i colori dominanti della web app, la tipografia dei titoli e lo stile geometrico delle card per adattarsi al prestigio dell'evento.
                  </p>
                </div>

                {/* 1. Palette Puglia Predefinite */}
                <div className="space-y-3">
                  <label className="block font-semibold text-stone-800 text-xs">
                    Seleziona Palette Cromatica della Puglia:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'terracotta-gold',
                        name: 'Oro & Terracotta Pugliese',
                        desc: 'Tonalità calde di tufo, terra d’Otranto e luce dorata',
                        colors: ['#78350F', '#B45309', '#FDE68A', '#FFFBEB'],
                        tag: 'Consigliato Luxury'
                      },
                      {
                        id: 'olive-salvia',
                        name: 'Oliva & Salvia della Murgia',
                        desc: 'Verde ulivi secolari, foglie di salvia e pietra viva',
                        colors: ['#166534', '#15803D', '#BBF7D0', '#F0FDF4'],
                        tag: 'Country Masseria'
                      },
                      {
                        id: 'adriatic-navy',
                        name: 'Blu Adriatico & Polignano',
                        desc: 'Profondità del mare, calette turchesi e scogliera',
                        colors: ['#1E3A8A', '#2563EB', '#BFDBFE', '#EFF6FF'],
                        tag: 'Costiera & Barche'
                      },
                      {
                        id: 'monopoli-stone',
                        name: 'Pietra Leccese & Chianche',
                        desc: 'Eleganza sobria della pietra barocca dorata ed écru',
                        colors: ['#44403C', '#78716C', '#E7E5E4', '#FAFAF9'],
                        tag: 'Minimal Chic'
                      },
                      {
                        id: 'primitivo-wine',
                        name: 'Primitivo & Vini Nobili',
                        desc: 'Intensità bordeaux, velluto e serate di gala nuziali',
                        colors: ['#701A75', '#A21CAF', '#F5D0FE', '#FDF4FF'],
                        tag: 'Grand Gala'
                      }
                    ].map(pal => {
                      const isSelected = (settingsForm.themePalette || 'terracotta-gold') === pal.id;
                      return (
                        <div
                          key={pal.id}
                          onClick={() => setSettingsForm({ ...settingsForm, themePalette: pal.id as any })}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-900 bg-amber-50/50 shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-stone-800">{pal.name}</span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                {pal.tag}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-2.5">
                              {pal.colors.map((c, i) => (
                                <span
                                  key={i}
                                  className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] text-neutral-500 leading-tight">{pal.desc}</p>
                          </div>

                          <div className="pt-2.5 mt-2 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                            <span className={isSelected ? 'text-amber-950 font-bold' : 'text-neutral-400'}>
                              {isSelected ? '✓ Selezionato' : 'Clicca per attivare'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Tipografia Titoli */}
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <label className="block font-semibold text-stone-800 text-xs">
                    Stile Tipografico Titoli Portale:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'serif-luxury',
                        name: 'Serif Luxury & Grand Hotel',
                        sample: 'Apulian Wedding Concierge',
                        fontClass: 'font-serif-luxury italic',
                        desc: 'Stile editoriale, alta eleganza matrimoniale'
                      },
                      {
                        id: 'modern-sans',
                        name: 'Modern Minimalist Sans',
                        sample: 'Apulian Wedding Concierge',
                        fontClass: 'font-sans font-bold tracking-tight',
                        desc: 'Lineare, geometrico, chic internazionale'
                      },
                      {
                        id: 'classic-editorial',
                        name: 'Classic Editorial Bodoni',
                        sample: 'Apulian Wedding Concierge',
                        fontClass: 'font-serif uppercase tracking-widest',
                        desc: 'Richiamo alle testate di moda e riviste nuziali'
                      }
                    ].map(f => {
                      const isSelected = (settingsForm.fontFamilyStyle || 'serif-luxury') === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSettingsForm({ ...settingsForm, fontFamilyStyle: f.id as any })}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-900 bg-amber-50/50 shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <span className="font-bold text-xs text-stone-800 block">{f.name}</span>
                          <div className={`text-sm text-stone-900 mt-2 mb-1 ${f.fontClass}`}>
                            {f.sample}
                          </div>
                          <span className="text-[10px] text-neutral-500 block leading-tight">{f.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Stile Arrotondamento Card & Effetto Hero */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-neutral-100 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1.5">
                      Stile Arrotondamento Schede &amp; Card
                    </label>
                    <select
                      value={settingsForm.cardStyle || 'rounded-luxury'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cardStyle: e.target.value as any })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    >
                      <option value="rounded-luxury">Bordi Morbidi Arrotondati (rounded-2xl) - Standard Elegante</option>
                      <option value="sharp-elegance">Geometria Nobile &amp; Sharp (rounded-lg) - Istituzionale</option>
                      <option value="pill-soft">Pill Ultra-Soft (rounded-3xl) - Design Moderno</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1.5">
                      Effetto Sfondo Hero nei Portali
                    </label>
                    <select
                      value={settingsForm.portalHeroEffect || 'classic-warm'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, portalHeroEffect: e.target.value as any })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    >
                      <option value="classic-warm">Caldo Tradizionale Pugliese (Tonalità ambrate e tufo)</option>
                      <option value="glassmorphism">Glassmorphism (Trasparenze in vetro satinato)</option>
                      <option value="minimalist">Minimalista Ultra-Clean (Lineare e sobrio)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-800 mb-1">
                      URL Logo Personalizzato Agenzia (PNG Trasparente / SVG)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.customLogoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, customLogoUrl: e.target.value })}
                      placeholder="https://.../logo-agenzia.png (lasciare vuoto per stemma predefinito)"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Salva Stile Grafico</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SUB-TAB 5: MODULI & FUNZIONALITA' ATTIVE                         */}
            {/* ================================================================= */}
            {settingsSubTab === 'features' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-base font-bold text-stone-800 font-serif-luxury flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-amber-800" />
                    <span>Moduli Operativi, Switch Portale &amp; Automazioni</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Attiva o disattiva le funzionalità avanzate della web app in base alle preferenze degli sposi o alle esigenze organizzative dell'agenzia.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Switch 1: Desideri Ospiti */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-800 block text-sm">
                        Modulo "Desideri &amp; Wishlist Esperienze su Misura"
                      </span>
                      <p className="text-neutral-500 text-[11px] leading-relaxed">
                        Consente agli ospiti di esprimere richieste personalizzate (es. noleggio spider d'epoca, babysitter privata, escursione in elicottero) da impacchettare in preventivo.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableGuestWishes ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableGuestWishes: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Switch 2: Live Concierge Chat */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-800 block text-sm">
                        Live Chat Concierge Diretta con Valeria
                      </span>
                      <p className="text-neutral-500 text-[11px] leading-relaxed">
                        Abilita la finestra di messaggistica bidirezionale in tempo reale all'interno dell'app tra gli ospiti, gli sposi e il team dell'agenzia AD Marketing.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableConciergeChat ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableConciergeChat: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Switch 3: Accompagnatori RSVP */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-800 block text-sm">
                        Supporto Accompagnatori &amp; Famiglie nel Modulo RSVP
                      </span>
                      <p className="text-neutral-500 text-[11px] leading-relaxed">
                        Permette all'ospite invitato di registrare il partner o i bambini specificando preferenze alimentari individuali e alloggi condivisi.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableRsvpCompanions ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableRsvpCompanions: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Switch 4: Calcolatore Preventivo Notte Hotel */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-800 block text-sm">
                        Calcolatore Preventivo Notti Hotel in Tempo Reale
                      </span>
                      <p className="text-neutral-500 text-[11px] leading-relaxed">
                        Calcola e mostra una prima stima indicativa del costo soggiorno in base alle date di check-in/out e alla tariffa negoziata prima della conferma agenzia.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableBookingEngineCalculator ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableBookingEngineCalculator: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Switch 5: Invio Automatico Ordini Fornitori */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-800 block text-sm">
                        Invio Automatico Ordini via Email ai Fornitori Convenzionati
                      </span>
                      <p className="text-neutral-500 text-[11px] leading-relaxed">
                        Genera e invia in automatico la notifica di prenotazione alla struttura ricettiva o al fornitore dell'esperienza quando l'ospite convalida la sua scheda.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableAutomaticOrderToSupplier ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableAutomaticOrderToSupplier: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Parametri di Default: Valuta e Oggetto Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                    <div>
                      <label className="block font-semibold text-stone-800 mb-1">
                        Valuta Predefinita Portale
                      </label>
                      <select
                        value={settingsForm.defaultCurrency || 'EUR'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value as any })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-amber-900 focus:outline-none"
                      >
                        <option value="EUR">Euro (€ EUR) - Standard Italia / UE</option>
                        <option value="USD">Dollaro Statunitense ($ USD)</option>
                        <option value="GBP">Sterlina Britannica (£ GBP)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-800 mb-1">
                        Template Oggetto Email Riepilogo Scheda &amp; Voucher
                      </label>
                      <input
                        type="text"
                        value={settingsForm.emailSubjectTemplate || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, emailSubjectTemplate: e.target.value })}
                        placeholder="Scheda Prenotazione e Voucher Servizi - Matrimonio {WEDDING_CODE}"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-900 focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        Usa {'{WEDDING_CODE}'} e {'{GUEST_NAME}'} come segnaposto dinamici
                      </span>
                    </div>
                  </div>

                  {/* Ripristino Demo */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                    <div>
                      <span className="font-bold text-amber-950 block text-xs">
                        Ripristino Matrimoni &amp; Servizi Dimostrativi
                      </span>
                      <p className="text-amber-900/80 text-[11px]">
                        Ricarica i matrimoni di esempio (Chiara &amp; Matteo, Eleanor Vance) completi di hotel a 5 stelle, boat tour a Polignano e transfer NCC.
                      </p>
                    </div>

                    {onResetToDemoWedding && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Sei sicuro di voler ricaricare i matrimoni dimostrativi di default?')) {
                            onResetToDemoWedding();
                            setSettingsSaveSuccess('Database demo ripristinato con successo!');
                          }
                        }}
                        className="px-4 py-2 border border-amber-400 text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Ripristina Database Demo
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Salva Opzioni Moduli</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SUB-TAB 6: ANTEPRIMA LIVE & TEST MATERIALI                       */}
            {/* ================================================================= */}
            {settingsSubTab === 'preview_sync' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-5">
                    <div>
                      <h3 className="text-base font-bold text-stone-800 font-serif-luxury flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-800" />
                        <span>Anteprima Live Materiali &amp; Voucher Ospite</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Verifica come appaiono i dati societari, l'IBAN, i contatti di Valeria e la veste grafica impostata prima della visualizzazione finale da parte dei clienti.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = `Coordinate Bancarie Ufficiali ${settingsForm.agencyLegalName || 'AD Marketing S.r.l.s.'}:\nIntestatario: ${settingsForm.bankAccountHolder || settingsForm.agencyLegalName}\nBanca: ${settingsForm.bankName || 'UniCredit'}\nIBAN: ${settingsForm.defaultIban}\nBIC/SWIFT: ${settingsForm.defaultBic}\nCausale: ${settingsForm.paymentInstructions || 'Saldo Servizi Concierge'}`;
                          navigator.clipboard.writeText(text);
                          setSettingsSaveSuccess('Coordinate bancarie copiate negli appunti per email/WhatsApp!');
                          setTimeout(() => setSettingsSaveSuccess(null), 3000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Copia IBAN per Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Salva Tutto</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulatore Card Voucher Ufficiale */}
                  <div className="border-2 border-stone-800 rounded-2xl p-6 sm:p-8 bg-stone-50/50 space-y-6 shadow-sm">
                    {/* Header Scheda Ospite */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-900 text-amber-100 uppercase tracking-wider">
                            Voucher Ufficiale Servizi Ospiti
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">
                            {selectedWedding?.weddingCode || 'PUGLIA-2026'}
                          </span>
                        </div>
                        <h4 className="text-2xl font-bold font-serif-luxury text-stone-900 mt-1">
                          {settingsForm.agencyName || 'AD Marketing Wedding Concierge'}
                        </h4>
                        <div className="text-xs text-neutral-600 mt-0.5">
                          A cura di <strong>{settingsForm.agencyLegalName || 'AD Marketing S.r.l.s.'}</strong> · {settingsForm.agencyCity || 'Palagianello (TA)'}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          P.IVA: {settingsForm.agencyVat || 'IT03124590731'} · REA: {settingsForm.agencyRea || 'TA-201842'} · Cap. Soc.: {settingsForm.agencyShareCapital || '€10.000 i.v.'}
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-neutral-200 text-right text-xs">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Assistente Personale</span>
                        <div className="font-bold text-stone-800 text-sm">Valeria</div>
                        <div className="text-[11px] text-emerald-700 font-medium">{settingsForm.valeriaPhone || '+39 340 1234567'}</div>
                        <div className="text-[10px] text-neutral-400">{settingsForm.valeriaEmail || 'valeria@admarketing.it'}</div>
                      </div>
                    </div>

                    {/* Box Coordinate Bancarie nel Voucher */}
                    <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-amber-700" />
                          <span>Coordinate Bancarie Ufficiali per Bonifico Unico</span>
                        </span>
                        {settingsForm.stripePaymentLink && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            ✓ Stripe Checkout Abilitato
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Intestatario:</span>
                          <span className="font-bold text-stone-800">{settingsForm.bankAccountHolder || 'AD Marketing S.r.l.s.'}</span>
                          <span className="text-[11px] text-neutral-500 block">{settingsForm.bankName || 'UniCredit'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">IBAN &amp; BIC:</span>
                          <div className="font-mono font-bold text-stone-800 text-xs bg-neutral-50 p-1 rounded border border-neutral-200">
                            {settingsForm.defaultIban || 'IT98 X 03002 03280 000000123456'}
                          </div>
                          <div className="font-mono text-neutral-500 text-[11px] mt-0.5">
                            BIC/SWIFT: {settingsForm.defaultBic || 'UNCRITM1B45'}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                        <strong>Causale Bonifico:</strong>{' '}
                        <span className="font-mono text-amber-950 font-bold">
                          {settingsForm.paymentInstructions || 'Saldo Servizi Concierge - [Codice Matrimonio] - [Nome Ospite]'}
                        </span>
                      </div>
                    </div>

                    {/* Disclaimer nel Voucher */}
                    <div className="text-[10px] text-neutral-400 border-t border-stone-200 pt-3 leading-relaxed">
                      {settingsForm.footerDisclaimer || 'AD Marketing S.r.l.s. opera come agenzia di incoming e concierge logistico territoriale.'}
                    </div>
                  </div>
                </div>

                {/* Esportazione / Backup JSON */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Backup &amp; Esportazione Parametri
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Puoi esportare la configurazione corrente in formato JSON per conservarla o ripristinarla.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(settingsForm, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `apulian_agency_settings_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Esporta JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. TAB: RICHIESTE DESIDERI (WISHLIST)                                     */}
        {/* ========================================================================= */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Bespoke Concierge &bull; Wishlist Management</span>
                </div>
                <h3 className="text-xl font-bold font-serif-luxury text-stone-800">
                  Richieste Desideri (Wishlist) Ospiti
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Esperienze e richieste su misura inviate dagli ospiti. Prepara la quotazione e rispondi direttamente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={wishSearchQuery}
                    onChange={(e) => setWishSearchQuery(e.target.value)}
                    placeholder="Cerca per titolo, ospite, email o codice..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl w-48 sm:w-60 focus:bg-white focus:outline-none"
                  />
                  {wishSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setWishSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtro Selettore Matrimonio */}
                <select
                  value={wishSelectedWeddingCode}
                  onChange={(e) => {
                    setWishSelectedWeddingCode(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tutti i Matrimoni ({consolidatedWishRequests.length})</option>
                  {weddings.map(w => {
                    const cTarget = (w.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
                    const count = consolidatedWishRequests.filter((cw: TouristWishRequest) => {
                      const cItem = (cw.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
                      return cItem === cTarget;
                    }).length;
                    return (
                      <option key={w.id} value={w.weddingCode}>
                        {w.coupleNames} ({w.weddingCode}) &bull; {count}
                      </option>
                    );
                  })}
                </select>

                {/* Inserisci Desiderio Manuale */}
                <button
                  type="button"
                  onClick={handleOpenAddWishModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Inserisci Desiderio</span>
                </button>
              </div>
            </div>

            {/* Filtri Stato Desideri (Pillole rapide) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-200/70 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Stato:</span>
                <button
                  type="button"
                  onClick={() => setWishStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    wishStatusFilter === 'ALL'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  Tutti ({consolidatedWishRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setWishStatusFilter('RECEIVED')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    wishStatusFilter === 'RECEIVED'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  ⏳ In Attesa ({consolidatedWishRequests.filter((w: TouristWishRequest) => w.status === 'RECEIVED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setWishStatusFilter('PROPOSAL_READY')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    wishStatusFilter === 'PROPOSAL_READY'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-indigo-900 hover:bg-indigo-50 border border-indigo-200'
                  }`}
                >
                  💡 Proposta Pronta ({consolidatedWishRequests.filter((w: TouristWishRequest) => w.status === 'PROPOSAL_READY').length})
                </button>
                <button
                  type="button"
                  onClick={() => setWishStatusFilter('CONFIRMED')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    wishStatusFilter === 'CONFIRMED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  🟢 Confermati ({consolidatedWishRequests.filter((w: TouristWishRequest) => w.status === 'CONFIRMED').length})
                </button>
              </div>

              {wishSelectedWeddingCode !== 'ALL' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200">
                  <span>Filtrato per: <strong>{wishSelectedWeddingCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setWishSelectedWeddingCode('ALL')}
                    className="ml-1 text-amber-700 hover:text-amber-950 font-bold"
                    title="Rimuovi filtro matrimonio"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {(() => {
                const filteredWishes = consolidatedWishRequests.filter((w: TouristWishRequest) => {
                  // Filtro testuale
                  if (wishSearchQuery.trim()) {
                    const q = wishSearchQuery.toLowerCase();
                    const matchText = (
                      (w.title || '').toLowerCase().includes(q) ||
                      (w.description || '').toLowerCase().includes(q) ||
                      (w.guestName || '').toLowerCase().includes(q) ||
                      (w.guestEmail || '').toLowerCase().includes(q) ||
                      (w.weddingCode || '').toLowerCase().includes(q)
                    );
                    if (!matchText) return false;
                  }

                  // Filtro stato
                  if (wishStatusFilter !== 'ALL' && w.status !== wishStatusFilter) {
                    return false;
                  }

                  // Filtro matrimonio selezionato
                  if (wishSelectedWeddingCode !== 'ALL') {
                    const cleanTarget = wishSelectedWeddingCode.trim().toUpperCase().replace(/[\s\-_]+/g, '');
                    const cleanCode = (w.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
                    if (cleanCode !== cleanTarget) return false;
                  }

                  return true;
                });

                if (filteredWishes.length === 0) {
                  return (
                    <div className="py-12 px-6 text-center text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 space-y-3">
                      <Sparkles className="w-9 h-9 mx-auto text-amber-400 animate-pulse" />
                      <p className="text-sm font-semibold text-stone-800">
                        {wishSelectedWeddingCode !== 'ALL' || wishStatusFilter !== 'ALL' || wishSearchQuery
                          ? 'Nessun desiderio corrisponde ai filtri selezionati.'
                          : 'Nessuna richiesta desideri presente nel sistema.'}
                      </p>
                      <p className="text-xs text-neutral-500 max-w-md mx-auto">
                        {consolidatedWishRequests.length > 0 
                          ? `Sono presenti ${consolidatedWishRequests.length} desideri totali registrati negli altri matrimoni o con altri stati.`
                          : 'Gli ospiti possono inviare desideri personalizzati tramite il loro portale o possono essere inseriti manualmente dall\'agenzia.'}
                      </p>

                      <div className="flex items-center justify-center gap-2 pt-2">
                        {(wishSelectedWeddingCode !== 'ALL' || wishStatusFilter !== 'ALL' || wishSearchQuery) && (
                          <button
                            type="button"
                            onClick={() => {
                              setWishSelectedWeddingCode('ALL');
                              setWishStatusFilter('ALL');
                              setWishSearchQuery('');
                            }}
                            className="px-4 py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-200 cursor-pointer"
                          >
                            Mostra Tutti i {consolidatedWishRequests.length} Desideri
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleOpenAddWishModal}
                          className="px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 cursor-pointer"
                        >
                          + Inserisci Desiderio Manuale
                        </button>
                      </div>
                    </div>
                  );
                }

                return filteredWishes.map((wish: TouristWishRequest) => {
                  const relatedWedding = weddings.find(w => {
                    const c = (w.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
                    const wc = (wish.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');
                    return c === wc;
                  });

                  return (
                    <div key={wish.id} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-stone-900 text-sm">{wish.guestName}</span>
                            <span className="text-[11px] text-neutral-500 font-mono">({wish.guestEmail})</span>
                            {wish.guestPhone && (
                              <a 
                                href={`https://wa.me/${wish.guestPhone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                                title="Scrivi su WhatsApp all'ospite"
                              >
                                <span>📞 {wish.guestPhone}</span>
                              </a>
                            )}
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono font-bold text-[10px] uppercase border border-amber-200">
                              Matrimonio: {relatedWedding?.coupleNames || wish.weddingCode} ({wish.weddingCode || relatedWedding?.weddingCode || 'Generico'})
                            </span>
                          </div>
                          <h4 className="text-base font-bold font-serif-luxury text-amber-950 mt-1">{wish.title}</h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            wish.status === 'RECEIVED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            wish.status === 'PROPOSAL_READY' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                            'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {wish.status === 'RECEIVED' ? '⏳ IN ATTESA DI PROPOSTA' :
                             wish.status === 'PROPOSAL_READY' ? '💡 PROPOSTA PRONTA' :
                             '🟢 CONFERMATO'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteWish(wish.id, wish.title)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Elimina Desiderio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3.5 bg-stone-50 rounded-xl text-xs text-stone-800 leading-relaxed italic border border-stone-200/80">
                        "{wish.description}"
                      </div>

                      {wish.agencyNotes && (
                        <div className="p-3 bg-indigo-50/70 rounded-xl text-xs text-indigo-950 border border-indigo-200">
                          <strong className="font-bold text-indigo-900 block mb-0.5">Note Interne Valeria & AD Marketing:</strong>
                          <span>{wish.agencyNotes}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600 border-t border-stone-100 pt-3">
                        <div className="flex flex-wrap items-center gap-4 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>Data: <strong className="text-stone-800">{wish.preferredDate || 'Flessibile'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>Pax: <strong className="text-stone-800">{wish.participantsCount}</strong></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                            <span>Budget: <strong className="text-stone-800">{wish.budgetRange || 'Non specificato'}</strong></span>
                          </div>
                          {wish.proposedCost !== undefined && (
                            <div className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              <span>Proposta: € {wish.proposedCost}</span>
                            </div>
                          )}
                        </div>

                        {/* Azioni Amministrazione */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button 
                            type="button"
                            onClick={() => {
                              const cost = prompt('Inserisci il costo totale proposto per questa esperienza (€):', wish.proposedCost?.toString() || '150');
                              if (cost !== null && !isNaN(Number(cost))) {
                                const notes = prompt('Inserisci una nota informativa per l\'ospite (opzionale):', wish.agencyNotes || 'Proposta elaborata dai nostri partner locali.');
                                const updatedItem: TouristWishRequest = {
                                  ...wish,
                                  proposedCost: Number(cost),
                                  agencyNotes: notes || wish.agencyNotes,
                                  status: 'PROPOSAL_READY' as const
                                };
                                const exists = wishRequests.some(w => w.id === wish.id);
                                const updatedWishes = exists 
                                  ? wishRequests.map(w => w.id === wish.id ? updatedItem : w)
                                  : [updatedItem, ...wishRequests];
                                onUpdateWishRequests(updatedWishes);
                                fetch('/api/wishes', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(updatedItem)
                                }).catch(() => {});
                                setAlertActionToast(`Proposta di €${cost} salvata per ${wish.guestName}!`);
                                setTimeout(() => setAlertActionToast(null), 3000);
                              }
                            }}
                            className="px-3 py-1.5 bg-stone-800 text-white text-[11px] font-bold rounded-lg hover:bg-stone-900 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                            <span>{wish.proposedCost ? 'Modifica Quotazione' : 'Definisci Quotazione'}</span>
                          </button>

                          {wish.guestEmail && onSendGmail && (
                            <button
                              type="button"
                              onClick={async () => {
                                const costVal = wish.proposedCost || 150;
                                const emailSubject = `Proposta Personalizzata Concierge per "${wish.title}" - Matrimonio ${wish.weddingCode}`;
                                const emailBody = `
                                  <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
                                    <h2 style="color: #4a3728;">Gentile ${wish.guestName},</h2>
                                    <p>Abbiamo elaborato la proposta personalizzata per il tuo desiderio espressamente richiesto per il matrimonio <strong>${wish.weddingCode}</strong>:</p>
                                    <div style="background: #fdf8f3; padding: 15px; border-left: 4px solid #c59b27; margin: 15px 0;">
                                      <h3 style="margin: 0 0 5px 0; color: #7a5c18;">${wish.title}</h3>
                                      <p style="margin: 0; font-size: 14px; italic;">"${wish.description}"</p>
                                      <p style="margin: 10px 0 0 0; font-weight: bold; font-size: 16px; color: #2e7d32;">
                                        Costo Proposto per ${wish.participantsCount} pax: &euro;${costVal}
                                      </p>
                                    </div>
                                    ${wish.agencyNotes ? `<p><strong>Dettagli organizzativi:</strong> ${wish.agencyNotes}</p>` : ''}
                                    <p>Puoi consultare e confermare la proposta accedendo direttamente al tuo portale ospite.</p>
                                    <p style="margin-top: 25px; font-size: 12px; color: #888;">
                                      Valeria & AD Marketing Concierge Puglia<br/>
                                      WhatsApp Assistenza: +39 340 1234567
                                    </p>
                                  </div>
                                `;

                                try {
                                  setAlertActionToast(`Invio mail a ${wish.guestEmail}...`);
                                  await onSendGmail({
                                    to: wish.guestEmail,
                                    subject: emailSubject,
                                    body: emailBody
                                  });
                                  setAlertActionToast(`✓ Email inviata con successo a ${wish.guestEmail}!`);
                                } catch (err) {
                                  setAlertActionToast('Errore durante l\'invio dell\'email via Gmail.');
                                } finally {
                                  setTimeout(() => setAlertActionToast(null), 3500);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-700 text-white text-[11px] font-bold rounded-lg hover:bg-amber-800 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Invia Email Proposta</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const newStatus = wish.status === 'CONFIRMED' ? 'RECEIVED' : 'CONFIRMED';
                              const updatedItem: TouristWishRequest = {
                                ...wish,
                                status: newStatus as any
                              };
                              const exists = wishRequests.some(w => w.id === wish.id);
                              const updatedWishes = exists 
                                ? wishRequests.map(w => w.id === wish.id ? updatedItem : w)
                                : [updatedItem, ...wishRequests];
                              onUpdateWishRequests(updatedWishes);
                              fetch('/api/wishes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updatedItem)
                              }).catch(() => {});
                              setAlertActionToast(`Stato desiderio aggiornato a: ${newStatus}`);
                              setTimeout(() => setAlertActionToast(null), 3000);
                            }}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                              wish.status === 'CONFIRMED'
                                ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {wish.status === 'CONFIRMED' ? 'Ripristina in Attesa' : 'Segna Confermato 🟢'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* 10. TAB: INCASSI & PAGAMENTI (OSPITI & SPOSI)                            */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (() => {
          // 1. Calcoli Incassi Ospiti
          const guestTotalExpected = (selectedWedding?.guests || []).reduce((acc, g) => acc + (g.totalAmountDue || 0), 0);
          const guestTotalCollected = (selectedWedding?.guests || []).filter(g => g.paymentStatus === 'PAID').reduce((acc, g) => acc + (g.totalAmountDue || 0), 0);
          const guestTotalPending = guestTotalExpected - guestTotalCollected;

          // 2. Raccogli Voci Offerte / A Carico degli Sposi
          const itemStatuses = selectedWedding?.itemPaymentStatuses || {};
          
          type CoupleItem = {
            id: string;
            title: string;
            category: 'TRANSFER' | 'EXPERIENCE' | 'EXTRA_SERVICE' | 'HOTEL' | 'REGALO';
            participantsCount: number;
            unitPrice: number;
            totalPrice: number;
            paymentMode: 'AGENCY_IBAN' | 'DIRECT_SUPPLIER';
            supplierNotes?: string;
            isPaid: boolean;
          };

          const coupleItemsList: CoupleItem[] = [];

          // Transfers offerti dagli sposi
          (selectedWedding?.transfers || []).filter(t => t.isPaidByCouple).forEach(t => {
            const bookedGuests = (selectedWedding?.guests || []).filter(g => g.transferBooked === t.title).length;
            const count = Math.max(bookedGuests, t.bookedSeats || 1);
            const total = t.pricePerSeat * count;
            const itemId = `couple-tr-${t.id}`;
            coupleItemsList.push({
              id: itemId,
              title: `Transfer Offerto: ${t.title}`,
              category: 'TRANSFER',
              participantsCount: count,
              unitPrice: t.pricePerSeat,
              totalPrice: total,
              paymentMode: t.negotiatedPerk?.includes('Fornitore') ? 'DIRECT_SUPPLIER' : 'AGENCY_IBAN',
              supplierNotes: `${t.vehicleType} · (${t.origin} ➔ ${t.destination})`,
              isPaid: itemStatuses[itemId] === 'PAID'
            });
          });

          // Esperienze offerte dagli sposi
          (selectedWedding?.experiences || []).filter(e => e.isHostSponsored).forEach(e => {
            const bookedGuests = (selectedWedding?.guests || []).filter(g => (g.experiences || []).includes(e.title)).length;
            const count = Math.max(bookedGuests, e.bookedParticipants || 1);
            const total = e.pricePerPerson * count;
            const itemId = `couple-exp-${e.id}`;
            coupleItemsList.push({
              id: itemId,
              title: `Esperienza Offerta: ${e.title}`,
              category: 'EXPERIENCE',
              participantsCount: count,
              unitPrice: e.pricePerPerson,
              totalPrice: total,
              paymentMode: e.paymentMode === 'ONLINE_LINK' ? 'DIRECT_SUPPLIER' : 'AGENCY_IBAN',
              supplierNotes: e.paymentLink ? `Link diretto: ${e.paymentLink}` : 'Organizzata tramite Agenzia AD Marketing',
              isPaid: itemStatuses[itemId] === 'PAID'
            });
          });

          // Servizi Extra offerti dagli sposi
          (selectedWedding?.extraServices || []).filter(s => s.isPaidByCouple).forEach(s => {
            const bookedGuests = (selectedWedding?.guests || []).filter(g => (g.extraServices || []).includes(s.title)).length;
            const count = Math.max(bookedGuests, 1);
            const total = s.price * count;
            const itemId = `couple-srv-${s.id}`;
            coupleItemsList.push({
              id: itemId,
              title: `Servizio Extra Offerto: ${s.title}`,
              category: 'EXTRA_SERVICE',
              participantsCount: count,
              unitPrice: s.price,
              totalPrice: total,
              paymentMode: s.paymentMode === 'ONLINE_LINK' ? 'DIRECT_SUPPLIER' : 'AGENCY_IBAN',
              supplierNotes: `Fornitore: ${s.providerName}`,
              isPaid: itemStatuses[itemId] === 'PAID'
            });
          });

          // Hotel a carico sposi o con tariffa gestita da agenzia
          (selectedWedding?.hotels || []).filter(h => h.pricingManagedByAgency).forEach(h => {
            const guestsInHotel = (selectedWedding?.guests || []).filter(g => g.hotelBooked === h.name);
            const total = guestsInHotel.reduce((acc, g) => acc + (g.hotelOfficialPrice || g.hotelEstimatePrice || h.negotiatedRate * (g.hotelNights || 2)), 0);
            const itemId = `couple-hotel-${h.id}`;
            if (total > 0 || guestsInHotel.length > 0) {
              coupleItemsList.push({
                id: itemId,
                title: `Hotel / Struttura Gestita: ${h.name}`,
                category: 'HOTEL',
                participantsCount: guestsInHotel.length,
                unitPrice: h.negotiatedRate,
                totalPrice: total > 0 ? total : h.negotiatedRate,
                paymentMode: h.paymentMode === 'ONLINE_LINK' ? 'DIRECT_SUPPLIER' : 'AGENCY_IBAN',
                supplierNotes: h.agencyPricingNotes || `Gruppo ${h.groupCode || 'Sposi'}`,
                isPaid: itemStatuses[itemId] === 'PAID'
              });
            }
          });

          // Richieste regali/servizi sposi approvati
          (selectedWedding?.giftRequests || []).filter(r => r.status === 'APPROVED').forEach(r => {
            const itemId = `couple-gift-${r.id}`;
            coupleItemsList.push({
              id: itemId,
              title: `Servizio Richiesto dagli Sposi: ${r.serviceTitle}`,
              category: 'REGALO',
              participantsCount: r.guestsCount || 1,
              unitPrice: r.unitPrice,
              totalPrice: r.totalEstimatedAmount,
              paymentMode: 'AGENCY_IBAN',
              supplierNotes: r.agencyNotes || r.coupleNotes || 'Approvato dall\'Agenzia Concierge',
              isPaid: itemStatuses[itemId] === 'PAID'
            });
          });

          const coupleTotalExpected = coupleItemsList.reduce((acc, i) => acc + i.totalPrice, 0);
          const coupleTotalPaid = coupleItemsList.filter(i => i.isPaid).reduce((acc, i) => acc + i.totalPrice, 0);
          const coupleTotalPending = coupleTotalExpected - coupleTotalPaid;

          // Funzione per inviare la mail di richiesta saldo / prospetto agli sposi
          const handleSendCouplePaymentEmail = async () => {
            if (!onSendGmail || !selectedWedding?.coupleEmail) {
              alert('Nessuna email degli sposi specificata per questo matrimonio! Aggiorna la scheda matrimonio.');
              return;
            }

            const agencyItems = coupleItemsList.filter(i => i.paymentMode === 'AGENCY_IBAN');
            const supplierItems = coupleItemsList.filter(i => i.paymentMode === 'DIRECT_SUPPLIER');

            const agencyRowsHtml = agencyItems.map(i => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;"><strong>${i.title}</strong><br/><span style="font-size: 11px; color: #777;">${i.supplierNotes || ''}</span></td>
                <td style="padding: 10px; text-align: center;">${i.participantsCount}</td>
                <td style="padding: 10px; text-align: right;">&euro; ${i.totalPrice}</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="color: ${i.isPaid ? 'green' : '#b91c1c'}; font-weight: bold;">
                    ${i.isPaid ? 'SALDATO 🟢' : 'DA SALDARE ⏳'}
                  </span>
                </td>
              </tr>
            `).join('');

            const supplierRowsHtml = supplierItems.map(i => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;"><strong>${i.title}</strong><br/><span style="font-size: 11px; color: #777;">${i.supplierNotes || ''}</span></td>
                <td style="padding: 10px; text-align: center;">${i.participantsCount}</td>
                <td style="padding: 10px; text-align: right;">&euro; ${i.totalPrice}</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="color: ${i.isPaid ? 'green' : '#b91c1c'}; font-weight: bold;">
                    ${i.isPaid ? 'SALDATO 🟢' : 'PAGAMENTO DIRETTO'}
                  </span>
                </td>
              </tr>
            `).join('');

            const emailBody = `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 25px; background-color: #faf8f5;">
                <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 20px;">
                  <h2 style="color: #4a3728; font-family: Georgia, serif; margin: 0;">Prospetto Conto Servizi &amp; Riepilogo Saldi</h2>
                  <p style="color: #888; font-size: 13px; margin-top: 5px;">Matrimonio ${selectedWedding.coupleNames} · Codice: <strong>${selectedWedding.weddingCode}</strong></p>
                </div>

                <p>Cari <strong>${selectedWedding.coupleNames}</strong>,</p>
                <p>Ecco il prospetto finanziario aggiornato dei servizi offerti con affetto ai vostri ospiti e delle prestazioni concordate con la nostra agenzia Concierge per il vostro matrimonio in Puglia.</p>

                ${agencyItems.length > 0 ? `
                  <h3 style="color: #4a3728; font-family: Georgia, serif; margin-top: 25px; border-left: 4px solid #d4af37; padding-left: 10px;">1. Servizi da saldare tramite Bonifico ad Agenzia AD Marketing</h3>
                  <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; font-size: 13px;">
                    <thead>
                      <tr style="background: #f3efe9; color: #4a3728;">
                        <th style="padding: 10px; text-align: left;">Servizio</th>
                        <th style="padding: 10px; text-align: center;">Qtà / Ospiti</th>
                        <th style="padding: 10px; text-align: right;">Importo</th>
                        <th style="padding: 10px; text-align: center;">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${agencyRowsHtml}
                    </tbody>
                  </table>

                  <div style="background: #fff; border: 1px solid #e2d9cd; padding: 15px; border-radius: 8px; margin-top: 12px; font-size: 12px; line-height: 1.5;">
                    <strong style="color: #4a3728;">Coordinate Bancarie per Bonifico ad Agenzia:</strong><br/>
                    <strong>Intestatario:</strong> ${adminSettings.agencyLegalName}<br/>
                    <strong>IBAN:</strong> <span style="font-family: monospace; font-weight: bold; color: #b45309;">${adminSettings.defaultIban}</span><br/>
                    <strong>BIC/SWIFT:</strong> ${adminSettings.defaultBic}<br/>
                    <strong>Causale:</strong> Saldo Servizi Sposi Matrimonio ${selectedWedding.weddingCode} - ${selectedWedding.coupleNames}
                  </div>
                ` : ''}

                ${supplierItems.length > 0 ? `
                  <h3 style="color: #4a3728; font-family: Georgia, serif; margin-top: 25px; border-left: 4px solid #b45309; padding-left: 10px;">2. Servizi con Pagamento Diretto al Fornitore Partner</h3>
                  <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; font-size: 13px;">
                    <thead>
                      <tr style="background: #fdf6ee; color: #7c2d12;">
                        <th style="padding: 10px; text-align: left;">Servizio</th>
                        <th style="padding: 10px; text-align: center;">Qtà / Ospiti</th>
                        <th style="padding: 10px; text-align: right;">Importo</th>
                        <th style="padding: 10px; text-align: center;">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${supplierRowsHtml}
                    </tbody>
                  </table>
                  <p style="font-size: 11px; color: #777; margin-top: 5px;">* I pagamenti diretti ai fornitori vengono regolati direttamente presso la struttura o tramite il link/IBAN fornito dalla singola struttura.</p>
                ` : ''}

                <div style="margin-top: 25px; background: #4a3728; color: #fff; padding: 18px; border-radius: 10px;">
                  <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    <tr>
                      <td><strong>Totale Complessivo Servizi Sposi:</strong></td>
                      <td style="text-align: right; font-weight: bold; font-size: 16px;">&euro; ${coupleTotalExpected}</td>
                    </tr>
                    <tr>
                      <td style="color: #86efac;"><strong>Totale Già Saldato:</strong></td>
                      <td style="text-align: right; color: #86efac; font-weight: bold;">&euro; ${coupleTotalPaid}</td>
                    </tr>
                    <tr style="border-top: 1px solid rgba(255,255,255,0.2);">
                      <td style="padding-top: 8px; font-size: 15px; color: #fde68a;"><strong>RESIDUO DA PAGARE:</strong></td>
                      <td style="padding-top: 8px; text-align: right; font-weight: bold; font-size: 18px; color: #fde68a;">&euro; ${coupleTotalPending}</td>
                    </tr>
                  </table>
                </div>

                <p style="margin-top: 25px; font-size: 13px; color: #555;">
                  Restiamo a vostra completa disposizione per qualsiasi chiarimento o variazione.<br/>
                  Un caro saluto,<br/>
                  <strong>Valeria &amp; Team Apulian Wedding Concierge</strong>
                </p>
              </div>
            `;

            try {
              setAlertActionToast('Invio prospetto pagamento agli sposi in corso...');
              await onSendGmail({
                to: selectedWedding.coupleEmail,
                subject: `Prospetto Conto Servizi - Matrimonio ${selectedWedding.coupleNames} [${selectedWedding.weddingCode}]`,
                body: emailBody
              });
              setAlertActionToast(`Email inviata con successo agli sposi (${selectedWedding.coupleEmail})!`);
            } catch (err) {
              setAlertActionToast('Errore durante l\'invio email via Gmail.');
            } finally {
              setTimeout(() => setAlertActionToast(null), 3500);
            }
          };

          return (
            <div className="space-y-6">
              {/* Header & Dashboard Financial Intelligence */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                      Financial Intelligence &bull; {selectedWedding?.coupleNames}
                    </span>
                    <span className="text-xs text-neutral-500">Codice: {selectedWedding?.weddingCode}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-stone-800 font-serif-luxury">
                    Gestione Incassi, Servizi Sposi &amp; Note Valeria
                  </h3>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    Monitora sia gli incassi dei singoli ospiti sia i servizi e trasferimenti a carico degli sposi. Genera e invia il prospetto pagamenti con distinzione bonifico agenzia / fornitore.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSendCouplePaymentEmail}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-amber-300" />
                    <span>Invia Saldo agli Sposi 📧</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!onSendGmail || !selectedWedding) return;
                      
                      const emailBody = `
                        <h2 style="color: #4a3728; font-family: serif;">Riepilogo Incassi Concierge - Matrimonio ${selectedWedding.coupleNames}</h2>
                        <p>Gentile Amministrazione,</p>
                        <p>Di seguito il riepilogo finanziario aggiornato per il matrimonio <strong>${selectedWedding.weddingCode}</strong>:</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                          <tr style="background: #f8f5f2;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Incassi Ospiti Previsti:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">&euro; ${guestTotalExpected}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Incassi Ospiti Raccolti:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; color: green;">&euro; ${guestTotalCollected}</td>
                          </tr>
                          <tr style="background: #fff8f0;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Servizi a Carico Sposi Totali:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">&euro; ${coupleTotalExpected}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Saldati dagli Sposi:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; color: green;">&euro; ${coupleTotalPaid}</td>
                          </tr>
                          <tr style="background: #fdf2f2;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>In Sospeso Sposi:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; color: #b91c1c; font-weight: bold;">&euro; ${coupleTotalPending}</td>
                          </tr>
                        </table>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">Documento generato automaticamente da Apulian Wedding Concierge Platform.</p>
                      `;

                      try {
                        setAlertActionToast('Invio email amministrazione in corso...');
                        await onSendGmail({
                          to: adminSettings.adminNotificationEmail || 'amministrazione@admarketing.it',
                          subject: `Riepilogo Financial Intelligence - ${selectedWedding.weddingCode} - ${selectedWedding.coupleNames}`,
                          body: emailBody
                        });
                        setAlertActionToast('Email inviata con successo all\'Amministrazione!');
                      } catch (err) {
                        setAlertActionToast('Errore durante l\'invio email.');
                      } finally {
                        setTimeout(() => setAlertActionToast(null), 3500);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-750 text-white text-xs font-bold hover:bg-stone-700 transition-all shadow-md cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Report Admin via Gmail</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards Ospiti + Sposi */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Previsto da Ospiti</span>
                  <span className="text-lg font-extrabold text-stone-800">&euro; {guestTotalExpected}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Saldati: € {guestTotalCollected}</span>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-center">
                  <span className="text-[10px] text-amber-900 uppercase font-bold block">Totale Servizi Sposi</span>
                  <span className="text-lg font-extrabold text-amber-900">&euro; {coupleTotalExpected}</span>
                  <span className="text-[10px] text-amber-800 block mt-0.5">{coupleItemsList.length} voci a carico sposi</span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Incassato da Sposi</span>
                  <span className="text-lg font-extrabold text-emerald-800">&euro; {coupleTotalPaid}</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Verificato da Valeria 🟢</span>
                </div>

                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center">
                  <span className="text-[10px] text-rose-800 uppercase font-bold block">In Sospeso Sposi</span>
                  <span className="text-lg font-extrabold text-rose-900">&euro; {coupleTotalPending}</span>
                  <span className="text-[10px] text-rose-700 block mt-0.5">Da saldare ad agenzia/fornitore</span>
                </div>
              </div>

              {/* SEZIONE 1: SERVIZI E SPESE A CARICO DEGLI SPOSI */}
              <div className="bg-white rounded-2xl border border-amber-200/70 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider inline-block mb-1">
                      Servizi Offerti &amp; Spese Sposi
                    </span>
                    <h4 className="text-base font-extrabold text-stone-800 font-serif-luxury">
                      Riepilogo Servizi Offerti con Affetto agli Ospiti / Riservati dagli Sposi
                    </h4>
                    <p className="text-neutral-500 text-xs">
                      Gestisci lo stato dei servizi (transfer, esperienze, servizi extra, hotel gestiti) pagati o regali degli sposi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendCouplePaymentEmail}
                    className="px-3.5 py-2 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    <span>Invia Email Prospetto Sposi ({selectedWedding?.coupleEmail || 'no-email'})</span>
                  </button>
                </div>

                {coupleItemsList.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic py-4 text-center">
                    Nessun servizio attualmente contrassegnato come offerto/a carico degli sposi per questo matrimonio.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {coupleItemsList.map(item => (
                      <div key={item.id} className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-stone-800 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded text-[10px] font-bold">{item.category}</span>
                            <span className="text-sm font-semibold">{item.title}</span>
                          </div>
                          <div className="text-[11px] text-neutral-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>Qtà / Partecipanti: <strong className="text-stone-800">{item.participantsCount}</strong></span>
                            <span>Prezzo Unitario: <strong className="text-stone-800">&euro; {item.unitPrice}</strong></span>
                            <span>Totale: <strong className="text-amber-900 font-bold">&euro; {item.totalPrice}</strong></span>
                            {item.supplierNotes && <span className="text-neutral-500 italic">({item.supplierNotes})</span>}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            item.paymentMode === 'AGENCY_IBAN' 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300/60' 
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}>
                            {item.paymentMode === 'AGENCY_IBAN' ? '🏦 Bonifico ad Agenzia' : '🔗 Diretto a Fornitore'}
                          </span>

                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            item.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {item.isPaid ? 'Saldato dagli Sposi 🟢' : 'In Sospeso ⏳'}
                          </span>

                          <button
                            type="button"
                            onClick={async () => {
                              const nextStatus: 'PAID' | 'PENDING' = item.isPaid ? 'PENDING' : 'PAID';
                              const updatedStatuses: Record<string, 'PAID' | 'PENDING'> = { ...itemStatuses, [item.id]: nextStatus };
                              const updatedWedding: WeddingData = { ...selectedWedding, itemPaymentStatuses: updatedStatuses };
                              await persistWeddingUpdate(updatedWedding);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                              item.isPaid 
                                ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            }`}
                          >
                            {item.isPaid ? 'Segna In Sospeso' : 'Segna Saldato 🟢'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEZIONE 2: ELENCO DETTAGLIATO INCASSI OSPITI */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-stone-800 font-serif-luxury">
                    Incassi e Prenotazioni Singoli Ospiti ({selectedWedding?.guests?.length || 0})
                  </h4>
                  <span className="text-xs text-neutral-500">
                    Coordinate IBAN Agenzia: <strong className="font-mono text-stone-700">{adminSettings.defaultIban}</strong>
                  </span>
                </div>

                {(!selectedWedding?.guests || selectedWedding.guests.length === 0) ? (
                  <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-500 shadow-xs">
                    <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-700 text-sm">Nessun ospite registrato per questo matrimonio</p>
                    <p className="text-xs text-neutral-400 mt-1">Gli ospiti che invieranno le preferenze appariranno automaticamente qui.</p>
                  </div>
                ) : (
                  selectedWedding.guests.map((g) => {
                    const guestItemStatuses = g.itemPaymentStatuses || {};

                    // Raccogli tutte le voci prenotate per questo ospite
                    const itemsList: Array<{ id: string; title: string; category: string; price: number; paymentMode: string }> = [];

                    if (g.hotelBooked && g.hotelBooked !== 'NONE' && !g.hotelBooked.includes('Nessun')) {
                      const hotelObj = (selectedWedding.hotels || []).find(h => h.name === g.hotelBooked);
                      const hotelPrice = g.hotelEstimatePrice || (hotelObj ? hotelObj.negotiatedRate * (g.hotelNights || 2) : 200);
                      itemsList.push({
                        id: `item-hotel-${g.id}`,
                        title: `${g.hotelBooked} (${g.roomType || 'Camera'})`,
                        category: 'HOTEL',
                        price: hotelPrice,
                        paymentMode: hotelObj?.paymentLink ? 'Link Pagamento Online / Fornitore' : 'Bonifico ad Agenzia'
                      });
                    }

                    if (g.transferBooked && g.transferBooked !== 'NONE' && !g.transferBooked.includes('Autonomo')) {
                      const trObj = (selectedWedding.transfers || []).find(t => t.title === g.transferBooked);
                      const trPrice = trObj ? (trObj.isPaidByCouple ? 0 : trObj.pricePerSeat) : 35;
                      itemsList.push({
                        id: `item-tr-${g.id}`,
                        title: g.transferBooked + (trObj?.isPaidByCouple ? ' (Offerto dagli Sposi)' : ''),
                        category: 'TRANSFER',
                        price: trPrice,
                        paymentMode: trObj?.isPaidByCouple ? 'A Carico Sposi' : 'Bonifico ad Agenzia'
                      });
                    }

                    (g.experiences || []).forEach((expName, idx) => {
                      const expObj = resolveExperience(expName);
                      const expPrice = expObj ? (expObj.isHostSponsored ? 0 : expObj.pricePerPerson) : 50;
                      itemsList.push({
                        id: `item-exp-${g.id}-${idx}`,
                        title: expObj.title + (expObj.isHostSponsored ? ' (Offerto dagli Sposi)' : ''),
                        category: 'EXPERIENCE',
                        price: expPrice,
                        paymentMode: expObj.isHostSponsored ? 'A Carico Sposi' : ((expObj as any)?.paymentLink ? 'Link Pagamento Online' : 'Bonifico ad Agenzia')
                      });
                    });

                    (g.extraServices || []).forEach((srvName, idx) => {
                      const srvObj = resolveExtraService(srvName);
                      const srvPrice = srvObj ? (srvObj.isPaidByCouple ? 0 : srvObj.price) : 80;
                      itemsList.push({
                        id: `item-srv-${g.id}-${idx}`,
                        title: srvObj.title + (srvObj.isPaidByCouple ? ' (Offerto dagli Sposi)' : ''),
                        category: 'EXTRA_SERVICE',
                        price: srvPrice,
                        paymentMode: srvObj.isPaidByCouple ? 'A Carico Sposi' : 'Bonifico ad Agenzia'
                      });
                    });

                    return (
                      <div key={g.id} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                        {/* Intestazione Ospite & Stato Globale */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{g.flag || '📍'}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-stone-800 text-sm">{g.name}</h4>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!onSendGmail) return;
                                    const serviceSummary = itemsList.map(i => `- ${i.title}: €${i.price} [Modalità: ${i.paymentMode}]`).join('\n');
                                    const subject = `Riepilogo Pagamenti e Prenotazioni - Matrimonio ${selectedWedding?.coupleNames}`;
                                    const body = `
                                      <h2>Ciao ${g.name},</h2>
                                      <p>Ecco il riepilogo delle tue prenotazioni per il matrimonio di <strong>${selectedWedding?.coupleNames}</strong>:</p>
                                      <pre style="background: #f8f5f2; padding: 12px; border-radius: 8px;">${serviceSummary}</pre>
                                      <p>Totale Dovuto: <strong>&euro; ${g.totalAmountDue || 0}</strong></p>
                                      <p>Coordinate Bonifico Agenzia:<br/>
                                      <strong>IBAN:</strong> ${adminSettings.defaultIban}<br/>
                                      <strong>BIC:</strong> ${adminSettings.defaultBic}<br/>
                                      <strong>Intestato a:</strong> ${adminSettings.agencyLegalName}<br/>
                                      <strong>Causale:</strong> Matrimonio ${selectedWedding?.weddingCode} - ${g.name}</p>
                                    `;
                                    try {
                                      await onSendGmail({ to: g.email, subject, body });
                                      alert(`Email inviata con successo all'ospite ${g.email}!`);
                                    } catch (err) {
                                      alert('Errore durante l\'invio dell\'email.');
                                    }
                                  }}
                                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Mail className="w-3 h-3" /> Invia Riepilogo Ospite
                                </button>
                              </div>
                              <span className="text-[11px] text-neutral-500">{g.email} • {g.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              g.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}>
                              Totale: € {g.totalAmountDue || 0} ({g.paymentStatus === 'PAID' ? 'SALDATO 🟢' : 'DA SALDARE ⏳'})
                            </span>
                          </div>
                        </div>

                        {/* Tabella Voci Prenotate per l'Ospite con Toggle Individuale */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                            Voci e Servizi Prenotati ({itemsList.length}):
                          </span>

                          {itemsList.length === 0 ? (
                            <p className="text-xs text-neutral-400 italic py-2">Nessun servizio o prodotto prenotato da questo ospite.</p>
                          ) : (
                            <div className="space-y-2">
                              {itemsList.map(item => {
                                const itemStatus = guestItemStatuses[item.id] || 'PENDING';
                                const isItemPaid = itemStatus === 'PAID';

                                return (
                                  <div key={item.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="space-y-0.5">
                                      <div className="font-bold text-stone-800 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-semibold">{item.category}</span>
                                        <span>{item.title}</span>
                                      </div>
                                      <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                                        <span>Prezzo: <strong className="text-stone-800">&euro; {item.price}</strong></span>
                                        <span>Modalità: <strong className="text-stone-700">{item.paymentMode}</strong></span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                        isItemPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                      }`}>
                                        {isItemPaid ? 'Pagato 🟢' : 'Da Pagare ⏳'}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const nextItemStatus = isItemPaid ? 'PENDING' : 'PAID';
                                          const updatedItemStatuses = { ...guestItemStatuses, [item.id]: nextItemStatus };
                                          
                                          // Verifica se tutti i servizi sono pagati per aggiornare lo stato generale dell'ospite
                                          const allPaid = itemsList.every(i => (i.id === item.id ? nextItemStatus : (guestItemStatuses[i.id] || 'PENDING')) === 'PAID');

                                          const updatedGuests = selectedWedding.guests.map(guest => {
                                            if (guest.id === g.id) {
                                              return {
                                                ...guest,
                                                itemPaymentStatuses: updatedItemStatuses as Record<string, 'PAID' | 'PENDING'>,
                                                paymentStatus: (allPaid ? 'PAID' : 'PENDING') as 'PAID' | 'PENDING' | 'FREE'
                                              };
                                            }
                                            return guest;
                                          });

                                          const updatedWedding = { ...selectedWedding, guests: updatedGuests };
                                          await persistWeddingUpdate(updatedWedding);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                                          isItemPaid 
                                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900' 
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                        }`}
                                      >
                                        {isItemPaid ? 'Segna Da Pagare' : 'Segna Pagato 🟢'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Voce Note Modificabili da Valeria */}
                        <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                          <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                            ✍️ Note Amministrazione (Modificabili da Valeria):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={g.notesByValeria || ''}
                              onBlur={async (e) => {
                                const val = e.target.value;
                                if (val === (g.notesByValeria || '')) return;
                                const updatedGuests = selectedWedding.guests.map(guest => 
                                  guest.id === g.id ? { ...guest, notesByValeria: val } : guest
                                );
                                const updatedWedding = { ...selectedWedding, guests: updatedGuests };
                                await persistWeddingUpdate(updatedWedding);
                              }}
                              placeholder="Inserisci note amministrative, acconti ricevuti, accordi particolari..."
                              className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={async (e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                const val = input ? input.value : '';
                                const updatedGuests = selectedWedding.guests.map(guest => 
                                  guest.id === g.id ? { ...guest, notesByValeria: val } : guest
                                );
                                const updatedWedding = { ...selectedWedding, guests: updatedGuests };
                                await persistWeddingUpdate(updatedWedding);
                                alert(`Note salvate con successo per ${g.name}!`);
                              }}
                              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-2xs shrink-0"
                            >
                              Salva Note
                            </button>
                          </div>
                        </div>

                        {/* Pulsante Copia Riepilogo Generale & Bonifico (per servizi senza link online) */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-neutral-400">
                            Coordinate IBAN Agenzia: <strong className="font-mono text-stone-700">{adminSettings.defaultIban}</strong>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const serviceSummary = itemsList.map(i => `- ${i.title}: €${i.price} [Modalità: ${i.paymentMode}]`).join('\n');
                              const summaryText = `Gentile ${g.name},\nEcco il riepilogo della scheda prenotazione per il matrimonio di ${selectedWedding.coupleNames}:\n\n` +
                                `${serviceSummary}\n\n` +
                                `Totale Complessivo Dovuto: €${g.totalAmountDue || 0}\n\n` +
                                `Potete effettuare il saldo complessivo tramite bonifico bancario:\n` +
                                `IBAN: ${adminSettings.defaultIban}\n` +
                                `BIC/SWIFT: ${adminSettings.defaultBic}\n` +
                                `Intestato a: ${adminSettings.agencyLegalName}\n` +
                                `Causale: Saldo Servizi Matrimonio ${selectedWedding.weddingCode} - ${g.name}\n\n` +
                                `Un caro saluto da Valeria e dal team di AD Marketing Concierge!`;

                              navigator.clipboard.writeText(summaryText);
                              alert(`Riepilogo scheda prenotazione e coordinate IBAN copiati negli appunti per ${g.name}!`);
                            }}
                            className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copia Email / WhatsApp Riepilogo &amp; IBAN</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

      </div>

      {/* ========================================================================= */}
      {/* MODALE: CREA / MODIFICA MATRIMONIO                                        */}
      {/* ========================================================================= */}
      {(showNewWeddingModal || editingWedding) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-stone-800 font-serif-luxury">
                {editingWedding ? 'Modifica Matrimonio' : 'Crea Nuovo Matrimonio Puglia'}
              </h3>
              <button
                onClick={() => {
                  setShowNewWeddingModal(false);
                  setEditingWedding(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeddingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nomi Sposi *</label>
                <input
                  type="text"
                  placeholder="Es. Marco & Giulia"
                  required
                  value={weddingForm.coupleNames || ''}
                  onChange={(e) => {
                    const newNames = e.target.value;
                    const autoCode = !editingWedding
                      ? generateAutomaticWeddingCode(newNames, weddingForm.weddingDate, weddings.map(w => (w.weddingCode || '').toUpperCase()))
                      : (weddingForm.weddingCode || '');
                    setWeddingForm({ 
                      ...weddingForm, 
                      coupleNames: newNames,
                      weddingCode: !editingWedding ? autoCode : (weddingForm.weddingCode || '')
                    });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-neutral-700">
                    Codice Matrimonio (per accesso ospiti e sposi)
                  </label>
                  {!editingWedding && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      Creato in automatico
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Generato automaticamente dai nomi sposi"
                    value={weddingForm.weddingCode || ''}
                    onChange={(e) => setWeddingForm({ ...weddingForm, weddingCode: e.target.value.toUpperCase() })}
                    className="w-full pl-3 pr-24 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs uppercase font-mono font-bold"
                  />
                  {!editingWedding && (
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = generateAutomaticWeddingCode(
                          weddingForm.coupleNames || 'PUGLIA',
                          weddingForm.weddingDate,
                          weddings.map(w => (w.weddingCode || '').toUpperCase())
                        );
                        setWeddingForm({ ...weddingForm, weddingCode: newCode });
                      }}
                      className="absolute right-1.5 top-1.5 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Rigenera codice automatico"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Rigenera</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {!editingWedding 
                    ? 'Il codice viene generato automaticamente in base ai nomi degli sposi (es. MARCO-GIULIA-2026).'
                    : 'Codice univoco del matrimonio per gli accessi ospiti e sposi.'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Data Matrimonio</label>
                  <input
                    type="text"
                    placeholder="Es. 18 Luglio 2026"
                    value={weddingForm.weddingDate || ''}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const autoCode = !editingWedding && weddingForm.coupleNames
                        ? generateAutomaticWeddingCode(weddingForm.coupleNames, newDate, weddings.map(w => (w.weddingCode || '').toUpperCase()))
                        : (weddingForm.weddingCode || '');
                      setWeddingForm({ 
                        ...weddingForm, 
                        weddingDate: newDate,
                        weddingCode: !editingWedding && weddingForm.coupleNames ? autoCode : (weddingForm.weddingCode || '')
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Password Area Sposi</label>
                  <input
                    type="text"
                    placeholder="Es. puglia2026"
                    value={weddingForm.couplePassword || ''}
                    onChange={(e) => setWeddingForm({ ...weddingForm, couplePassword: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dati Sposa: Email e Telefono (Facoltativi, modificabili successivamente da backend) */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-rose-50/60 rounded-2xl border border-rose-200/80">
                <div>
                  <label className="block font-semibold text-rose-950 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Email Sposa</span>
                    <span className="text-[10px] text-neutral-500 font-normal">(Facoltativa)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="es. sposa@gmail.com"
                    value={weddingForm.coupleEmail || ''}
                    onChange={(e) => setWeddingForm({ ...weddingForm, coupleEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-800 focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block leading-tight">
                    Richiesta per il login riservato sposi
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-rose-950 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Cellulare Sposa</span>
                    <span className="text-[10px] text-neutral-500 font-normal">(Facoltativo)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="es. +39 340 1234567"
                    value={weddingForm.couplePhone || ''}
                    onChange={(e) => setWeddingForm({ ...weddingForm, couplePhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-800 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block leading-tight">
                    Per invio credenziali via WhatsApp
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Location Masseria / Venue</label>
                <input
                  type="text"
                  value={weddingForm.venue || ''}
                  onChange={(e) => setWeddingForm({ ...weddingForm, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Comune / Città</label>
                  <input
                    type="text"
                    value={weddingForm.city || ''}
                    onChange={(e) => setWeddingForm({ ...weddingForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Dress Code</label>
                  <input
                    type="text"
                    value={weddingForm.dressCode || ''}
                    onChange={(e) => setWeddingForm({ ...weddingForm, dressCode: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Messaggio di Benvenuto agli Ospiti</label>
                <textarea
                  rows={3}
                  value={weddingForm.welcomeMessage || ''}
                  onChange={(e) => setWeddingForm({ ...weddingForm, welcomeMessage: e.target.value })}
                  placeholder="Siamo felici di celebrare con voi il nostro matrimonio in Puglia..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewWeddingModal(false);
                    setEditingWedding(null);
                  }}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 text-white rounded-xl font-bold hover:bg-amber-800 transition-colors shadow-xs"
                >
                  {editingWedding ? 'Salva Modifiche Cloud' : 'Crea Matrimonio Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: CONDIVISIONE WHATSAPP MATRIMONIO & CREDENZIALI SPOSA            */}
      {/* ========================================================================= */}
      {createdWeddingForWhatsApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-800 font-serif-luxury">
                  Matrimonio Creato con Successo!
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {createdWeddingForWhatsApp.coupleNames} · {createdWeddingForWhatsApp.weddingDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatedWeddingForWhatsApp(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Box Credenziali Riservate Sposa */}
            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-rose-950 uppercase tracking-wider flex items-center justify-between">
                <span>Credenziali di Accesso Sposa</span>
                <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-semibold">
                  Modificabili da Backend
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 block font-medium">Codice Matrimonio:</span>
                  <strong className="font-mono text-stone-900 text-xs">{createdWeddingForWhatsApp.weddingCode}</strong>
                </div>

                <div className="bg-white p-2 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 block font-medium">Password Sposi:</span>
                  <strong className="font-mono text-stone-900 text-xs">{createdWeddingForWhatsApp.couplePassword}</strong>
                </div>

                <div className="bg-white p-2 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 block font-medium">Email Sposa:</span>
                  <strong className="font-mono text-stone-800 truncate block text-[11px]" title={createdWeddingForWhatsApp.coupleEmail}>
                    {createdWeddingForWhatsApp.coupleEmail || 'Non impostata'}
                  </strong>
                </div>

                <div className="bg-white p-2 rounded-xl border border-rose-100 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 block font-medium">Cellulare Sposa:</span>
                  <strong className="font-mono text-stone-800 block text-[11px]">
                    {createdWeddingForWhatsApp.couplePhone || 'Non impostato'}
                  </strong>
                </div>
              </div>

              <p className="text-[10px] text-neutral-500 italic pt-1">
                L'accesso per la sposa richiede Codice Matrimonio, Email e Password. Se hai commesso un errore, puoi modificare questi dati in ogni momento cliccando su "Modifica" nella scheda matrimonio.
              </p>
            </div>

            {/* Azioni di invio e condivisione */}
            <div className="space-y-2 pt-1">
              <a
                href={createdWeddingForWhatsApp.couplePhone
                  ? `https://wa.me/${createdWeddingForWhatsApp.couplePhone.replace(/[^0-9]/g, '')}?text=${generateBrideWhatsAppCredentialsMessage(createdWeddingForWhatsApp)}`
                  : `https://wa.me/?text=${generateBrideWhatsAppCredentialsMessage(createdWeddingForWhatsApp)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Invia Credenziali alla Sposa su WhatsApp 📲</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const origin = window.location.origin;
                    const summary = `💐 Credenziali Portale Sposi - ${createdWeddingForWhatsApp.coupleNames}\n\n` +
                      `• Codice Matrimonio: ${createdWeddingForWhatsApp.weddingCode}\n` +
                      `• Email Sposa: ${createdWeddingForWhatsApp.coupleEmail || 'Non impostata'}\n` +
                      `• Password: ${createdWeddingForWhatsApp.couplePassword}\n` +
                      `• Link di Accesso: ${origin}/?role=couple&code=${encodeURIComponent(createdWeddingForWhatsApp.weddingCode)}&email=${encodeURIComponent(createdWeddingForWhatsApp.coupleEmail || '')}\n\n` +
                      `AD Marketing Concierge Puglia`;
                    navigator.clipboard.writeText(summary);
                    alert('Credenziali e link di accesso sposi copiati negli appunti!');
                  }}
                  className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-stone-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-stone-600" />
                  <span>Copia Credenziali</span>
                </button>

                <a
                  href={`https://wa.me/?text=${generateWeddingWhatsAppMessage(createdWeddingForWhatsApp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-stone-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors text-center cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>Invito Ospiti WA</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCreatedWeddingForWhatsApp(null)}
              className="w-full py-2 text-neutral-500 hover:text-neutral-700 text-xs font-medium cursor-pointer text-center"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE: AGGIUNGI / MODIFICA HOTEL                                         */}
      {/* ========================================================================= */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-800 font-serif-luxury">
                  {editingHotel ? 'Modifica Hotel Convenzionato' : 'Nuovo Hotel Convenzionato'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Per: {selectedWedding?.coupleNames} ({selectedWedding?.weddingCode})
                </p>
              </div>
              <button onClick={() => setShowHotelModal(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nome Struttura Hotel *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Masseria Torre Coccaro (5★ Lusso)"
                  value={hotelForm.name || ''}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Categoria Stelle (1-5)</label>
                  <select
                    value={hotelForm.stars || 5}
                    onChange={(e) => setHotelForm({ ...hotelForm, stars: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  >
                    <option value={5}>5 Stelle Lusso</option>
                    <option value={4}>4 Stelle Superior</option>
                    <option value={3}>3 Stelle Comfort</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Tariffa Negoziata (€ / notte) *</label>
                  <input
                    type="number"
                    required
                    value={hotelForm.negotiatedRate || ''}
                    onChange={(e) => setHotelForm({ ...hotelForm, negotiatedRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Indirizzo Completo</label>
                <input
                  type="text"
                  placeholder="Es. C.da Coccaro 8, Savelletri di Fasano (BR)"
                  value={hotelForm.address || ''}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Distanza dalla Masseria</label>
                  <input
                    type="text"
                    placeholder="Es. 8 min di auto"
                    value={hotelForm.distanceToVenue || ''}
                    onChange={(e) => setHotelForm({ ...hotelForm, distanceToVenue: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Codice Convenzione Gruppo</label>
                  <input
                    type="text"
                    value={hotelForm.groupCode || ''}
                    onChange={(e) => setHotelForm({ ...hotelForm, groupCode: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Vantaggio Esclusivo Negoziato dall'Agenzia</label>
                <input
                  type="text"
                  placeholder="Es. Bottiglia di Primitivo in camera, Late check-out e colazione pugliese inclusa"
                  value={hotelForm.negotiatedPerk || ''}
                  onChange={(e) => setHotelForm({ ...hotelForm, negotiatedPerk: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Link Booking Engine o Sito Struttura</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={hotelForm.websiteUrl || ''}
                  onChange={(e) => setHotelForm({ ...hotelForm, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              {/* SEZIONE TIPOLOGIE CAMERA / ROOM BLOCKS */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-stone-700 text-xs block">Camere Bloccate per gli Ospiti:</span>
                    <span className="text-[10px] text-neutral-400">Specifica nome camera, max ospiti per camera, prezzo e camere disponibili</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHotelRoomTypes([
                        ...hotelRoomTypes,
                        { id: `rt-${Date.now()}`, name: 'Deluxe Suite', pricePerNight: hotelForm.negotiatedRate || 300, totalBlocked: 5, availableRooms: 5, maxOccupancy: 2 }
                      ]);
                    }}
                    className="text-amber-900 font-bold hover:underline text-[11px] cursor-pointer"
                  >
                    + Aggiungi Tipologia Camera
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-neutral-500 uppercase px-1">
                    <span className="col-span-4">Nome Camera</span>
                    <span className="col-span-2 text-center">Max Ospiti</span>
                    <span className="col-span-3 text-center">Prezzo (€/notte)</span>
                    <span className="col-span-2 text-center">Disp.</span>
                    <span className="col-span-1"></span>
                  </div>
                  {hotelRoomTypes.map((rt, idx) => (
                    <div key={rt.id} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={rt.name}
                          placeholder="Nome Camera"
                          onChange={(e) => {
                            const next = [...hotelRoomTypes];
                            next[idx].name = e.target.value;
                            setHotelRoomTypes(next);
                          }}
                          className="w-full p-1 bg-white border border-neutral-200 rounded text-[11px] font-medium"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={rt.maxOccupancy || 2}
                          placeholder="Pax"
                          title="Numero massimo di ospiti ammessi per questa camera"
                          onChange={(e) => {
                            const next = [...hotelRoomTypes];
                            next[idx].maxOccupancy = Math.max(1, Number(e.target.value));
                            setHotelRoomTypes(next);
                          }}
                          className="w-full p-1 bg-white border border-neutral-200 rounded text-[11px] font-bold text-center text-amber-900"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={rt.pricePerNight}
                          placeholder="€ / notte"
                          onChange={(e) => {
                            const next = [...hotelRoomTypes];
                            next[idx].pricePerNight = Number(e.target.value);
                            setHotelRoomTypes(next);
                          }}
                          className="w-full p-1 bg-white border border-neutral-200 rounded text-[11px] font-bold text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={rt.availableRooms}
                          placeholder="Disp."
                          onChange={(e) => {
                            const next = [...hotelRoomTypes];
                            const val = Number(e.target.value);
                            next[idx].availableRooms = val;
                            next[idx].totalBlocked = Math.max(next[idx].totalBlocked, val);
                            setHotelRoomTypes(next);
                          }}
                          className="w-full p-1 bg-white border border-neutral-200 rounded text-[11px] text-center"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => setHotelRoomTypes(hotelRoomTypes.filter((_, i) => i !== idx))}
                          className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowHotelModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 text-white rounded-xl font-bold hover:bg-amber-800 transition-colors shadow-xs"
                >
                  Salva Hotel su Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE: AGGIUNGI / MODIFICA ESPERIENZA                                    */}
      {/* ========================================================================= */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-800 font-serif-luxury">
                  {editingExp ? 'Modifica Esperienza' : 'Nuova Esperienza Pugliese'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Per: {selectedWedding?.coupleNames} ({selectedWedding?.weddingCode})
                </p>
              </div>
              <button onClick={() => setShowExpModal(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="space-y-3.5 text-xs">
              {/* Selettore rapido da Database Master */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Carica da Database Master Esperienze:</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono">
                    {masterExperiencesList.length} modelli pronti
                  </span>
                </div>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setSelectedTemplateId(chosenId);
                    if (chosenId) {
                      const template = masterExperiencesList.find(m => m.id === chosenId || m.title === chosenId);
                      if (template) {
                        setExpForm(prev => ({
                          ...prev,
                          title: template.title,
                          category: template.category,
                          durationHours: template.durationHours,
                          meetingPoint: template.meetingPoint,
                          pricePerPerson: template.pricePerPerson,
                          dressCode: template.dressCode || 'Resort Chic',
                          description: template.description,
                          negotiatedPerk: template.negotiatedPerk || '',
                          supplierId: template.supplierId || '',
                          image: template.image || prev.image
                        }));
                      }
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs text-stone-800 font-medium"
                >
                  <option value="">-- Seleziona un modello da duplicare con 1 click --</option>
                  {masterExperiencesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} (€{m.pricePerPerson} · {m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Titolo Attività *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Gita in Barca al Tramonto alle Grotte di Polignano"
                  value={expForm.title || ''}
                  onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              {/* Fornitore Accreditato */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Fornitore Partner Puglia (Collegamento Fornitori)
                </label>
                <select
                  value={expForm.supplierId || ''}
                  onChange={(e) => setExpForm({ ...expForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                >
                  <option value="">-- Gestione diretta Agenzia AD Marketing --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category} · {s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Categoria</label>
                  <select
                    value={expForm.category || 'BOAT_TOUR'}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  >
                    <option value="BOAT_TOUR">Gita in Barca</option>
                    <option value="WELCOME_PARTY">Welcome Party &amp; Aperitivo</option>
                    <option value="COOKING_CLASS">Cooking Class (Orecchiette)</option>
                    <option value="WINE_TASTING">Degustazione Vini Pugliesi</option>
                    <option value="PIZZICA_NIGHT">Serata Tradizionale Pizzica</option>
                    <option value="OIL_TOUR">Tour Frantoio Ipogeo &amp; Olio EVO</option>
                    {Array.from(new Set([...(adminSettings.customExperienceCategories || []), ...(settingsForm.customExperienceCategories || [])])).map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Data Evento</label>
                  <input
                    type="text"
                    placeholder="2026-09-11"
                    value={expForm.eventDate || ''}
                    onChange={(e) => setExpForm({ ...expForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Orario</label>
                  <input
                    type="text"
                    placeholder="Es. 17:30 - 20:00"
                    value={expForm.startTime || ''}
                    onChange={(e) => setExpForm({ ...expForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Durata (Ore)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={expForm.durationHours || 2.5}
                    onChange={(e) => setExpForm({ ...expForm, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Punto d'Incontro / Meeting Point</label>
                <input
                  type="text"
                  placeholder="Es. Porto Turistico Cala Ponte, Polignano a Mare"
                  value={expForm.meetingPoint || ''}
                  onChange={(e) => setExpForm({ ...expForm, meetingPoint: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Prezzo (€ a persona)</label>
                  <input
                    type="number"
                    value={expForm.pricePerPerson || ''}
                    onChange={(e) => setExpForm({ ...expForm, pricePerPerson: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Capienza Massima Partecipanti</label>
                  <input
                    type="number"
                    value={expForm.maxParticipants || 30}
                    onChange={(e) => setExpForm({ ...expForm, maxParticipants: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Vantaggio Negoziato dall'Agenzia (Perk Esclusivo)</label>
                <input
                  type="text"
                  placeholder="Es. Aperitivo rinforzato con calice di benvenuto e stuzzichini"
                  value={expForm.negotiatedPerk || ''}
                  onChange={(e) => setExpForm({ ...expForm, negotiatedPerk: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2">
                <input
                  type="checkbox"
                  id="expSponsored"
                  checked={Boolean(expForm.isHostSponsored)}
                  onChange={(e) => setExpForm({ ...expForm, isHostSponsored: e.target.checked })}
                  className="w-4 h-4 text-amber-900 rounded"
                />
                <label htmlFor="expSponsored" className="font-semibold text-amber-950 cursor-pointer">
                  Offerto con affetto dagli Sposi (Gratuito per tutti gli ospiti)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Descrizione Dettagliata</label>
                <textarea
                  rows={3}
                  value={expForm.description || ''}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Descrivi l'atmosfera, cosa è incluso..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs resize-none"
                />
              </div>

              {/* Checkbox salvataggio master database */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveMasterExp"
                  checked={saveToMasterCatalogToo}
                  onChange={(e) => setSaveToMasterCatalogToo(e.target.checked)}
                  className="w-4 h-4 text-stone-900 rounded"
                />
                <label htmlFor="saveMasterExp" className="font-semibold text-stone-800 text-[11px] cursor-pointer">
                  Salva nel <strong>Database Master Condiviso</strong> (disponibile per tutti i matrimoni creati)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 text-white rounded-xl font-bold hover:bg-amber-800 transition-colors shadow-xs"
                >
                  Salva Esperienza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE: AGGIUNGI / MODIFICA TRANSFER                                      */}
      {/* ========================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-800 font-serif-luxury">
                  {editingTransfer ? 'Modifica Transfer' : 'Nuovo Collegamento / Navetta'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Per: {selectedWedding?.coupleNames} ({selectedWedding?.weddingCode})
                </p>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Titolo Navetta *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Navetta Collettiva Aeroporto Bari (BRI) → Savelletri"
                  value={transferForm.title || ''}
                  onChange={(e) => setTransferForm({ ...transferForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Tipologia</label>
                  <select
                    value={transferForm.type || 'AIRPORT_SHUTTLE'}
                    onChange={(e) => setTransferForm({ ...transferForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  >
                    <option value="AIRPORT_SHUTTLE">Navetta Aeroporto (Bari/Brindisi)</option>
                    <option value="VENUE_SHUTTLE">Navetta Hotel ↔ Masseria Cerimonia</option>
                    <option value="PRIVATE_NCC">NCC Privato Mercedes</option>
                    {Array.from(new Set([...(adminSettings.customTransferTypes || []), ...(settingsForm.customTransferTypes || [])])).map((t: string) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Veicolo</label>
                  <input
                    type="text"
                    value={transferForm.vehicleType || 'Mercedes Sprinter VIP 16 posti'}
                    onChange={(e) => setTransferForm({ ...transferForm, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Origine</label>
                  <input
                    type="text"
                    value={transferForm.origin || ''}
                    onChange={(e) => setTransferForm({ ...transferForm, origin: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Destinazione</label>
                  <input
                    type="text"
                    value={transferForm.destination || ''}
                    onChange={(e) => setTransferForm({ ...transferForm, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Orari</label>
                  <input
                    type="text"
                    placeholder="11:30 e 15:00"
                    value={transferForm.departureTime || ''}
                    onChange={(e) => setTransferForm({ ...transferForm, departureTime: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Capienza</label>
                  <input
                    type="number"
                    value={transferForm.capacity || 16}
                    onChange={(e) => setTransferForm({ ...transferForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Prezzo (€ / pax)</label>
                  <input
                    type="number"
                    value={transferForm.pricePerSeat || 35}
                    onChange={(e) => setTransferForm({ ...transferForm, pricePerSeat: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trPaidByCouple"
                  checked={Boolean(transferForm.isPaidByCouple)}
                  onChange={(e) => setTransferForm({ ...transferForm, isPaidByCouple: e.target.checked })}
                  className="w-4 h-4 text-blue-900 rounded"
                />
                <label htmlFor="trPaidByCouple" className="font-semibold text-blue-950 cursor-pointer">
                  Offerto dagli sposi (Gratuito per gli ospiti)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 text-white rounded-xl font-bold hover:bg-amber-800 transition-colors shadow-xs"
                >
                  Salva Transfer su Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE: CATALOGO MASTER COMPLETO ESPERIENZE CONDIVISE                     */}
      {/* ========================================================================= */}
      {showSharedCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                    Libreria Master Agenzia
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    Matrimonio attivo: {selectedWedding?.weddingCode}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 font-serif-luxury mt-1">
                  Database Master Esperienze &amp; Fornitori Puglia
                </h3>
                <p className="text-xs text-neutral-500">
                  Sfoglia tutte le esperienze create e accreditate. Aggiungile con 1 click a questo matrimonio o a qualsiasi altro.
                </p>
              </div>
              <button 
                onClick={() => setShowSharedCatalogModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-xl hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masterExperiencesList.map(exp => {
                const isAlreadyInActive = (selectedWedding?.experiences || []).some(
                  e => e.title.trim().toLowerCase() === exp.title.trim().toLowerCase()
                );
                const sup = suppliers.find(s => s.id === exp.supplierId);
                const weddingsUsing = weddings.filter(w => 
                  (w.experiences || []).some(e => e.title.trim().toLowerCase() === exp.title.trim().toLowerCase())
                );

                return (
                  <div key={exp.id} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between hover:bg-white hover:border-amber-300 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                          {exp.category}
                        </span>
                        <span className="text-sm font-bold text-stone-800">
                          € {exp.pricePerPerson} <span className="text-[10px] font-normal text-neutral-500">/ pax</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-stone-800 font-serif-luxury mt-2">
                        {exp.title}
                      </h4>

                      {sup && (
                        <div className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="font-semibold text-stone-700 truncate">{sup.name}</span>
                          <span className="text-[10px] text-neutral-400">({sup.city})</span>
                        </div>
                      )}

                      <p className="text-xs text-neutral-600 mt-2 line-clamp-2">
                        {exp.description}
                      </p>

                      {exp.negotiatedPerk && (
                        <div className="mt-2 p-1.5 bg-amber-50 rounded border border-amber-200/60 text-[10px] text-amber-900 italic">
                          🎁 {exp.negotiatedPerk}
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-neutral-200/60 text-[10px] text-neutral-400">
                        Usata in {weddingsUsing.length} matrimoni: {weddingsUsing.map(w => w.weddingCode).join(', ') || 'Nessuno ancora'}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-200 flex items-center justify-between">
                      {isAlreadyInActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Già presente in questo matrimonio</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            handleImportSharedExp(exp);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Importa in {selectedWedding?.weddingCode}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowSharedCatalogModal(false);
                          handleOpenNewExp(exp);
                        }}
                        className="text-[11px] text-amber-900 font-semibold hover:underline cursor-pointer"
                      >
                        Personalizza &amp; Aggiungi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setShowSharedCatalogModal(false)}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Chiudi Libreria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE: AGGIUNGI / MODIFICA SERVIZIO EXTRA & BEAUTY                       */}
      {/* ========================================================================= */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-stone-800 font-serif-luxury">
                {editingService ? 'Modifica Servizio Extra' : 'Nuovo Servizio Extra / Beauty'}
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Titolo Servizio *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.title || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="Es. Trucco Professionale per la Cerimonia"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Categoria</label>
                  <select
                    value={serviceForm.category || 'MAKEUP'}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  >
                    <option value="MAKEUP">Trucco (Makeup)</option>
                    <option value="HAIR_STYLING">Acconciatura (Hair Styling)</option>
                    <option value="BABYSITTING">Babysitting</option>
                    <option value="STEAMING_TAILORING">Stireria / Sarto</option>
                    <option value="VINTAGE_CAR">Auto Vintage</option>
                    {Array.from(new Set([...(adminSettings.customServiceCategories || []), ...(settingsForm.customServiceCategories || [])])).map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Prezzo (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={serviceForm.price ?? 90}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Durata</label>
                  <input
                    type="text"
                    value={serviceForm.duration || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    placeholder="Es. 50 min"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Fornitore / Operatore</label>
                  <input
                    type="text"
                    value={serviceForm.providerName || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, providerName: e.target.value })}
                    placeholder="Es. Chiara Valente Glam"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Descrizione</label>
                <textarea
                  rows={2}
                  value={serviceForm.description || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Descrivi il servizio offerto..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Agevolazione / Vantaggio Negoziato (Opzionale)</label>
                <input
                  type="text"
                  value={serviceForm.negotiatedPerk || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, negotiatedPerk: e.target.value })}
                  placeholder="Es. Ritocco incluso prima della cerimonia."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="paidByCoupleService"
                  checked={Boolean(serviceForm.isPaidByCouple)}
                  onChange={(e) => setServiceForm({ ...serviceForm, isPaidByCouple: e.target.checked })}
                  className="rounded border-neutral-300 text-amber-900 focus:ring-amber-900"
                />
                <label htmlFor="paidByCoupleService" className="font-semibold text-neutral-700 cursor-pointer">
                  Servizio offerto con affetto dagli Sposi (Gratuito per gli ospiti)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-800 transition-colors shadow-xs cursor-pointer"
                >
                  Salva Servizio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE: INSERISCI DESIDERIO MANUALE (AGENZIA/OSPITE)                      */}
      {/* ========================================================================= */}
      {showAddWishModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-stone-800 font-serif-luxury">
                  Inserisci Nuovo Desiderio / Richiesta Ospite
                </h3>
              </div>
              <button
                onClick={() => setShowAddWishModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewWish} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Matrimonio di Riferimento</label>
                <select
                  value={newWishForm.weddingCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const wed = weddings.find(w => w.weddingCode === code);
                    const firstGuest = wed?.guests?.[0];
                    setNewWishForm(prev => ({
                      ...prev,
                      weddingCode: code,
                      guestName: firstGuest?.name || prev.guestName,
                      guestEmail: firstGuest?.email || prev.guestEmail,
                      guestPhone: firstGuest?.phone || prev.guestPhone
                    }));
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                >
                  {weddings.map(w => (
                    <option key={w.id} value={w.weddingCode}>
                      {w.coupleNames} ({w.weddingCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleziona Ospite esistente se presente */}
              {(() => {
                const currentWed = weddings.find(w => w.weddingCode === newWishForm.weddingCode);
                if (currentWed && (currentWed.guests || []).length > 0) {
                  return (
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Seleziona Ospite Registrato (Opzionale)
                      </label>
                      <select
                        onChange={(e) => {
                          const gEmail = e.target.value;
                          const guest = currentWed.guests.find(g => g.email === gEmail);
                          if (guest) {
                            setNewWishForm(prev => ({
                              ...prev,
                              guestName: guest.name,
                              guestEmail: guest.email,
                              guestPhone: guest.phone || prev.guestPhone
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium"
                      >
                        <option value="">-- Seleziona un ospite dalla rubrica --</option>
                        {currentWed.guests.map(g => (
                          <option key={g.id} value={g.email}>
                            {g.name} ({g.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Nome Ospite *</label>
                  <input
                    type="text"
                    required
                    value={newWishForm.guestName}
                    onChange={(e) => setNewWishForm({ ...newWishForm, guestName: e.target.value })}
                    placeholder="Es. Eleanor Vance"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Email Ospite *</label>
                  <input
                    type="email"
                    required
                    value={newWishForm.guestEmail}
                    onChange={(e) => setNewWishForm({ ...newWishForm, guestEmail: e.target.value })}
                    placeholder="es. eleanor@gmail.com"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Titolo Desiderio / Esperienza *</label>
                <input
                  type="text"
                  required
                  value={newWishForm.title}
                  onChange={(e) => setNewWishForm({ ...newWishForm, title: e.target.value })}
                  placeholder="Es. Noleggio Vespa vintage per tour della Valle d'Itria"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Descrizione Dettagliata</label>
                <textarea
                  rows={3}
                  value={newWishForm.description}
                  onChange={(e) => setNewWishForm({ ...newWishForm, description: e.target.value })}
                  placeholder="Descrivi cosa desidera l'ospite..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Data Preferita</label>
                  <input
                    type="date"
                    value={newWishForm.preferredDate}
                    onChange={(e) => setNewWishForm({ ...newWishForm, preferredDate: e.target.value })}
                    className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Partecipanti (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    value={newWishForm.participantsCount}
                    onChange={(e) => setNewWishForm({ ...newWishForm, participantsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Costo Proposto (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={newWishForm.proposedCost}
                    onChange={(e) => setNewWishForm({ ...newWishForm, proposedCost: e.target.value })}
                    placeholder="160"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Note Interne Agenzia (Valeria)</label>
                <input
                  type="text"
                  value={newWishForm.agencyNotes}
                  onChange={(e) => setNewWishForm({ ...newWishForm, agencyNotes: e.target.value })}
                  placeholder="Es. Contattato fornitore partner per consegna Vespa in masseria."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddWishModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-800 transition-colors shadow-xs cursor-pointer"
                >
                  Salva Desiderio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
