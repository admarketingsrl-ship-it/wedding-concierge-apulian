import { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Car, 
  Sparkles, 
  Check, 
  MapPin, 
  Plane, 
  ShieldCheck, 
  Download, 
  Info, 
  MessageCircle, 
  LogOut,
  Send,
  Scissors,
  HelpCircle,
  Lightbulb,
  Clock,
  Printer,
  MailCheck,
  CheckCircle2,
  Calendar,
  Heart,
  Camera,
  Bell,
  Gift,
  Sun,
  Utensils,
  Compass,
  ShoppingCart,
  Users,
  ExternalLink,
  Calculator,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  XCircle,
  FileText,
  ChevronRight,
  ChevronLeft,
  Tag,
  CreditCard,
  Menu
} from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { 
  WeddingData, 
  HotelItem, 
  TransferItem, 
  ExperienceItem, 
  ExtraServiceItem,
  TouristWishRequest,
  ChatMessage,
  MasterSupplier,
  SupplierBookingOrder,
  AdminSettings
} from '../data/weddingStore';

interface GuestPortalProps {
  weddingData: WeddingData;
  guestInfo: {
    name: string;
    email: string;
    weddingCode: string;
    provider: 'google' | 'apple' | 'email';
    country?: string;
  };
  adminNotificationEmail: string;
  suppliers: MasterSupplier[];
  onLogout: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (msg: { text: string; guestName: string; guestEmail: string; weddingCode: string }) => void;
  onSendWish: (wish: { title: string; description: string; preferredDate: string; participantsCount: number; budgetRange: string; weddingCode?: string; guestName?: string; guestEmail?: string }) => void;
  onConfirmBookingToSuppliers?: (orders: SupplierBookingOrder[]) => void;
  onSaveGuestChoices?: (guestPayload: any) => void;
  adminSettings?: AdminSettings;
  wishRequests?: TouristWishRequest[];
  lang: 'it' | 'en';
  setLang: (lang: 'it' | 'en') => void;
  activeTab?: 'couple-info' | 'rsvp' | 'hotels' | 'transfers' | 'experiences' | 'services' | 'wishes' | 'chat' | 'itinerary' | 'payments';
  setActiveTab?: (tab: 'couple-info' | 'rsvp' | 'hotels' | 'transfers' | 'experiences' | 'services' | 'wishes' | 'chat' | 'itinerary' | 'payments') => void;
  onOpenMenu?: () => void;
}

interface Companion {
  id: string;
  name: string;
  relationship: 'Partner' | 'Figlio/a' | 'Genitore' | 'Amico/a' | 'Altro';
  dietary: string;
  notes: string;
}

export interface SelectedRoomBooking {
  bookingId: string;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  pricePerNight: number;
  maxOccupancy: number;
  roomsCount: number;
  guestsPerRoom: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
}

export default function GuestPortal({ 
  weddingData, 
  guestInfo, 
  adminNotificationEmail,
  suppliers,
  onLogout,
  chatMessages,
  onSendMessage,
  onSendWish,
  onConfirmBookingToSuppliers,
  onSaveGuestChoices,
  adminSettings,
  wishRequests = [],
  lang,
  setLang,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onOpenMenu
}: GuestPortalProps) {
  if (!weddingData) return null;

  const [internalActiveTab, setInternalActiveTab] = useState<'couple-info' | 'rsvp' | 'hotels' | 'transfers' | 'experiences' | 'services' | 'wishes' | 'chat' | 'itinerary' | 'payments'>('couple-info');
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setActiveTab = (tab: any) => {
    if (propSetActiveTab) propSetActiveTab(tab);
    setInternalActiveTab(tab);
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'couple-info', label: 'Dagli Sposi', icon: <Heart className="w-5 h-5" /> },
    { id: 'rsvp', label: 'RSVP & Famiglia', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'hotels', label: 'Hotel', icon: <Building2 className="w-5 h-5" /> },
    { id: 'transfers', label: 'Transfer', icon: <Car className="w-5 h-5" /> },
    { id: 'experiences', label: 'Esperienze', icon: <Compass className="w-5 h-5" /> },
    { id: 'services', label: 'Servizi Extra', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'wishes', label: 'Desideri', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'itinerary', label: 'Programma', icon: <Calendar className="w-5 h-5" /> },
    { id: 'payments', label: 'Pagamenti', icon: <CreditCard className="w-5 h-5" /> },
  ];
  
  // ... (rest of the state and handlers remain, I just need to remove the nav block at the end)

  // Stato RSVP & Famiglia dell'ospite
  const [rsvpStatus, setRsvpStatus] = useState('PENDING');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`guest_rsvp_${weddingData.weddingCode}_${guestInfo.email}`);
      if (saved) setRsvpStatus(JSON.parse(saved).status);
    } catch {}
  }, [weddingData.weddingCode, guestInfo.email]);

  const [dietaryChoices, setDietaryChoices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`guest_rsvp_${weddingData.weddingCode}_${guestInfo.email}`);
      return saved ? JSON.parse(saved).dietaryChoices || [] : [];
    } catch {
      return [];
    }
  });

  const [dietaryDetails, setDietaryDetails] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`guest_rsvp_${weddingData.weddingCode}_${guestInfo.email}`);
      return saved ? JSON.parse(saved).dietaryDetails || '' : '';
    } catch {
      return '';
    }
  });



  const [specialNeeds, setSpecialNeeds] = useState(() => {
    try {
      const saved = localStorage.getItem(`guest_rsvp_${weddingData.weddingCode}_${guestInfo.email}`);
      return saved ? JSON.parse(saved).specialNeeds || '' : '';
    } catch {
      return '';
    }
  });

  const [familyName, setFamilyName] = useState(() => {
    try {
      const saved = localStorage.getItem(`guest_rsvp_${weddingData.weddingCode}_${guestInfo.email}`);
      return saved ? JSON.parse(saved).familyName || `${guestInfo.name} & Famiglia` : `${guestInfo.name} & Famiglia`;
    } catch {
      return `${guestInfo.name} & Famiglia`;
    }
  });

  const [companions, setCompanions] = useState<Companion[]>(() => {
    try {
      const saved = localStorage.getItem(`guest_rsvp_${weddingData.weddingCode}_${guestInfo.email}`);
      return saved ? JSON.parse(saved).companions || [] : [];
    } catch {
      return [];
    }
  });

  const [newCompanionName, setNewCompanionName] = useState('');
  const [newCompanionRel, setNewCompanionRel] = useState<'Partner' | 'Figlio/a' | 'Genitore' | 'Amico/a' | 'Altro'>('Partner');
  const [newCompanionDiet, setNewCompanionDiet] = useState('Standard');
  const [rsvpSavedSuccess, setRsvpSavedSuccess] = useState(false);

  const handleSaveRsvpAndFamily = () => {
    const payload = {
      status: rsvpStatus,
      dietaryChoices,
      dietaryDetails,
      specialNeeds,
      familyName,
      companions,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`guest_rsvp_${weddingData.weddingCode}_${guestInfo.email}`, JSON.stringify(payload));
    } catch {}

    if (onSaveGuestChoices) {
      onSaveGuestChoices({
        name: guestInfo.name,
        email: guestInfo.email,
        weddingCode: weddingData.weddingCode,
        country: guestInfo.country,
        diet: `${dietaryChoices.join(', ')}${dietaryDetails ? ' (' + dietaryDetails + ')' : ''}`,
        hotelBooked: wantsHotel ? currentHotel?.name : 'Autonomo',
        roomType: selectedRoomTypeName,
        transferBooked: wantsTransfer ? currentTransfer?.title : 'Autonomo',
        experiences: selectedExperienceIds,
        extraServices: selectedServiceIds,
        familyName,
        companions,
        specialNeeds,
        dietaryChoices,
        dietaryDetails
      });
    }

    setRsvpSavedSuccess(true);
    setTimeout(() => setRsvpSavedSuccess(false), 4000);
  };

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

  // Selezione Hotel (Opzionale: l'ospite può non volere l'hotel!)
  const [wantsHotel, setWantsHotel] = useState<boolean>(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string>(hotels[0]?.id || '');
  const [selectedRoomTypeName, setSelectedRoomTypeName] = useState<string>(
    hotels[0]?.roomTypes[0]?.name || ''
  );
  const [checkIn, setCheckIn] = useState('2026-09-10');
  const [checkOut, setCheckOut] = useState('2026-09-13');
  const [hotelSpecialRequests, setHotelSpecialRequests] = useState('');

  // Selezione Multipla Hotel & Camere
  const [selectedHotelBookings, setSelectedHotelBookings] = useState<SelectedRoomBooking[]>(() => {
    try {
      const saved = localStorage.getItem(`guest_hotel_bookings_${weddingData.weddingCode}_${guestInfo.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`guest_hotel_bookings_${weddingData.weddingCode}_${guestInfo.email}`, JSON.stringify(selectedHotelBookings));
    } catch {}
  }, [selectedHotelBookings, weddingData.weddingCode, guestInfo.email]);

  const handleAddHotelBooking = (hotel: HotelItem, roomType: { id: string; name: string; pricePerNight: number; maxOccupancy?: number }) => {
    setWantsHotel(true);
    const nights = calculateNights();
    const maxOcc = roomType.maxOccupancy || 2;
    const existingIndex = selectedHotelBookings.findIndex(b => b.hotelId === hotel.id && b.roomTypeName === roomType.name);

    if (existingIndex >= 0) {
      const updated = [...selectedHotelBookings];
      const prev = updated[existingIndex];
      const newRoomsCount = prev.roomsCount + 1;
      updated[existingIndex] = {
        ...prev,
        roomsCount: newRoomsCount,
        totalPrice: prev.pricePerNight * nights * newRoomsCount
      };
      setSelectedHotelBookings(updated);
    } else {
      const newBooking: SelectedRoomBooking = {
        bookingId: `hb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomTypeId: roomType.id,
        roomTypeName: roomType.name,
        pricePerNight: roomType.pricePerNight,
        maxOccupancy: maxOcc,
        roomsCount: 1,
        guestsPerRoom: Math.min(2, maxOcc),
        checkIn,
        checkOut,
        nights,
        totalPrice: roomType.pricePerNight * nights * 1
      };
      setSelectedHotelBookings([...selectedHotelBookings, newBooking]);
    }
  };

  const handleRemoveHotelBooking = (bookingId: string) => {
    const updated = selectedHotelBookings.filter(b => b.bookingId !== bookingId);
    setSelectedHotelBookings(updated);
    if (updated.length === 0) {
      // keep wantsHotel true or guest choice
    }
  };

  const handleUpdateHotelBooking = (bookingId: string, updates: Partial<SelectedRoomBooking>) => {
    setSelectedHotelBookings(prev => prev.map(b => {
      if (b.bookingId !== bookingId) return b;
      const updated = { ...b, ...updates };
      const nights = calculateNights();
      updated.nights = nights;
      updated.totalPrice = updated.pricePerNight * nights * updated.roomsCount;
      return updated;
    }));
  };

  // Selezione Transfer (Opzionale: l'ospite può viaggiare in autonomia!)
  const [wantsTransfer, setWantsTransfer] = useState<boolean>(false);
  const [selectedTransferIds, setSelectedTransferIds] = useState<Array<string>>([]);
  const [isRequestingTaxi, setIsRequestingTaxi] = useState<boolean>(false);
  const [taxiDetails, setTaxiDetails] = useState('');
  const [transferDetails, setTransferDetails] = useState('');
  const [flightNumber, setFlightNumber] = useState('Ryanair FR7082');
  const [flightArrivalDate, setFlightArrivalDate] = useState('2026-09-11 10:45');
  const [luggageCount, setLuggageCount] = useState(2);

  // Selezione Esperienze (Multi-selezione libera: include quelle offerte gratis dagli sposi e quelle extra)
  const [selectedExperienceIds, setSelectedExperienceIds] = useState<Array<string>>(() => {
    // Di default preseleziona l'esperienza offerta dagli sposi (welcome party) se presente
    const sponsored = experiences.find(e => e.isHostSponsored);
    return sponsored ? [sponsored.id] : [];
  });

  // Selezione Servizi Extra (Trucco, Parrucco, Babysitting, etc.)
  const [selectedServiceIds, setSelectedServiceIds] = useState<Array<string>>([]);

  // Quantità e Note per Esperienze e Servizi
  const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});
  const [serviceNotes, setServiceNotes] = useState<Record<string, string>>({});

  // Modulo Nuova Richiesta / Desiderio Ospite
  const [wishTitle, setWishTitle] = useState('');
  const [wishDescription, setWishDescription] = useState('');
  const [wishDate, setWishDate] = useState('2026-09-14');
  const [wishParticipants, setWishParticipants] = useState(2);
  const [wishBudget, setWishBudget] = useState('€150 - €300');
  const [wishSuccessMessage, setWishSuccessMessage] = useState(false);

  // Input Chat con Valeria
  const [newChatMessage, setNewChatMessage] = useState('');

  // Stato Invio Voucher Email
  const [emailSentStatus, setEmailSentStatus] = useState<{ sent: boolean; message: string; timestamp?: string } | null>(null);

  // Modale Esito "Conferma e Invia" con spiegazione Prima Ipotesi & Conferma Ufficiale Agenzia
  const [guestConfirmSuccessModal, setGuestConfirmSuccessModal] = useState<{
    show: boolean;
    hotelTitle?: string;
    hotelDates?: string;
    hotelEstimate?: number;
    totalDueImmediate?: number;
    itemsCount: number;
  } | null>(null);

  // Stato Calcolatore Booking Engine Struttura / Booking.com
  const [calcAdults, setCalcAdults] = useState<number>(2);
  const [calcChildren, setCalcChildren] = useState<number>(0);
  const [calcRoomsCount, setCalcRoomsCount] = useState<number>(1);
  const [isQueryingBookingEngine, setIsQueryingBookingEngine] = useState<boolean>(false);
  const [calculatedQuote, setCalculatedQuote] = useState<{
    hotelId: string;
    hotelName: string;
    roomType: string;
    nights: number;
    pricePerNight: number;
    totalAmount: number;
    available: boolean;
    directBookingUrl: string;
    sourceName: string;
  } | null>(null);

  // Stato Scheda Prenotazione Confermata dall'Ospite (Riepilogo Opzioni con modifica, annulla, aggiungi)
  const [confirmedBookingCard, setConfirmedBookingCard] = useState<{
    id: string;
    confirmedAt: string;
    status: 'CONFERMATO' | 'IN_GESTIONE' | 'MODIFICATO' | 'ANNULLATO';
    items: {
      category: 'HOTEL' | 'TRANSFER' | 'EXPERIENCE' | 'SERVICE';
      title: string;
      details: string;
      cost: number;
      freeByCouple?: boolean;
      cancellationPolicy: string;
      canCancel: boolean;
      canModify: boolean;
      deadlineDate: string;
    }[];
    totalDue: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(`guest_confirmed_booking_${weddingData.weddingCode}_${guestInfo.email}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const currentGuestInWedding = useMemo(() => {
    return (weddingData.guests || []).find(g => 
      (g.email && g.email.toLowerCase().trim() === guestInfo.email.toLowerCase().trim()) ||
      (g.name && g.name.toLowerCase().trim() === guestInfo.name.toLowerCase().trim())
    );
  }, [weddingData.guests, guestInfo.email, guestInfo.name]);

  const currentHotel = wantsHotel ? hotels.find(h => h.id === selectedHotelId) : null;
  const selectedTransfers = wantsTransfer ? transfers.filter(t => selectedTransferIds.includes(t.id)) : [];
  const currentTransfer = selectedTransfers[0] || null;


  // Toggle Esperienza
  const toggleExperience = (id: string) => {
    if (selectedExperienceIds.includes(id)) {
      setSelectedExperienceIds(selectedExperienceIds.filter(item => item !== id));
    } else {
      setSelectedExperienceIds([...selectedExperienceIds, id]);
    }
  };

  // Toggle Servizio
  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(item => item !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Invio messaggio in chat a Valeria
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    onSendMessage({
      text: newChatMessage.trim(),
      guestName: guestInfo.name,
      guestEmail: guestInfo.email,
      weddingCode: weddingData.weddingCode
    });
    setNewChatMessage('');
  };

  // Invio richiesta desiderio
  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishTitle.trim() || !wishDescription.trim()) return;

    onSendWish({
      title: wishTitle.trim(),
      description: wishDescription.trim(),
      preferredDate: wishDate,
      participantsCount: Number(wishParticipants),
      budgetRange: wishBudget,
      weddingCode: weddingData.weddingCode,
      guestName: guestInfo.name,
      guestEmail: guestInfo.email
    });

    setWishSuccessMessage(true);
    setWishTitle('');
    setWishDescription('');
    setTimeout(() => setWishSuccessMessage(false), 5000);
  };

  // Calcolo notti di soggiorno
  const calculateNights = () => {
    try {
      const dIn = new Date(checkIn);
      const dOut = new Date(checkOut);
      const diffTime = dOut.getTime() - dIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  // Interroga il booking engine della struttura o Booking.com per calcolo rapido e disponibilità
  const handleQueryBookingEngine = (hotel: HotelItem) => {
    setIsQueryingBookingEngine(true);
    const nights = calculateNights();
    
    // Tasso base camera selezionata o prima disponibile
    const currentRt = hotel.roomTypes.find(rt => rt.name === selectedRoomTypeName) || hotel.roomTypes[0];
    const baseRate = currentRt ? currentRt.pricePerNight : hotel.negotiatedRate;
    
    // Supplemento occupanti extra oltre 2 adulti (+20% per persona extra)
    const extraOccupants = Math.max(0, (calcAdults + calcChildren) - 2);
    const extraMultiplier = 1 + (extraOccupants * 0.2);
    const effectiveRatePerNight = Math.round(baseRate * extraMultiplier * calcRoomsCount);
    const totalCost = effectiveRatePerNight * nights;

    // Costruzione URL diretto verso il booking engine interno o Booking.com
    let directUrl = hotel.websiteUrl;
    let sourceName = 'Booking Engine Diretto Struttura';

    if (hotel.websiteUrl) {
      // Parametri query di prenotazione passati al booking engine dell'hotel
      directUrl = `${hotel.websiteUrl}?checkin=${checkIn}&checkout=${checkOut}&adults=${calcAdults}&children=${calcChildren}&rooms=${calcRoomsCount}&code=${encodeURIComponent(hotel.groupCode || weddingData.weddingCode)}`;
      sourceName = `Booking Engine Ufficiale (${hotel.name})`;
    } else {
      // In assenza di booking engine proprio, collega a Booking.com
      const checkinDate = new Date(checkIn);
      const checkoutDate = new Date(checkOut);
      directUrl = `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(hotel.name + ' ' + hotel.address)}&checkin_year=${checkinDate.getFullYear()}&checkin_month=${checkinDate.getMonth() + 1}&checkin_monthday=${checkinDate.getDate()}&checkout_year=${checkoutDate.getFullYear()}&checkout_month=${checkoutDate.getMonth() + 1}&checkout_monthday=${checkoutDate.getDate()}&group_adults=${calcAdults}&group_children=${calcChildren}&no_rooms=${calcRoomsCount}`;
      sourceName = 'Booking.com (Servizio Esterno Partner)';
    }

    setTimeout(() => {
      setCalculatedQuote({
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomType: currentRt ? currentRt.name : 'Camera Matrimoniale',
        nights,
        pricePerNight: effectiveRatePerNight,
        totalAmount: totalCost,
        available: true,
        directBookingUrl: directUrl,
        sourceName
      });
      setIsQueryingBookingEngine(false);
    }, 700);
  };

  // Opziona la struttura con il preventivo calcolato
  const handleSelectCalculatedQuote = () => {
    if (!calculatedQuote) return;
    setSelectedHotelId(calculatedQuote.hotelId);
    setSelectedRoomTypeName(calculatedQuote.roomType);
    setWantsHotel(true);
  };

  // Conferma definitiva e invio scelte (Crea o Aggiorna la Scheda Opzioni Scelte con Restrizioni Admin)
  const handleConfirmAndSendChoices = () => {
    const timestamp = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const fullDate = new Date().toISOString().split('T')[0];

    const items: {
      category: 'HOTEL' | 'TRANSFER' | 'EXPERIENCE' | 'SERVICE';
      title: string;
      details: string;
      cost: number;
      freeByCouple?: boolean;
      cancellationPolicy: string;
      canCancel: boolean;
      canModify: boolean;
      deadlineDate: string;
    }[] = [];

    // 1. Hotel
    let hotelEstimateForModal: number | undefined = undefined;
    let hotelTitleForModal: string | undefined = undefined;
    let hotelDatesForModal: string | undefined = undefined;

    if (wantsHotel) {
      if (selectedHotelBookings.length > 0) {
        let totalHotelCost = 0;
        selectedHotelBookings.forEach(booking => {
          totalHotelCost += booking.totalPrice;
          items.push({
            category: 'HOTEL',
            title: `${booking.hotelName} - ${booking.roomTypeName}`,
            details: `Check-in: ${booking.checkIn} | Check-out: ${booking.checkOut} (${booking.nights} notti) · ${booking.roomsCount} camera/e (${booking.guestsPerRoom} ospiti/camera, max occ. ${booking.maxOccupancy})`,
            cost: booking.totalPrice,
            freeByCouple: false,
            cancellationPolicy: `Tariffa convenzionata AD Marketing: €${booking.pricePerNight}/notte per camera. Stima soggiorno: €${booking.totalPrice}. La quotazione esatta e le istruzioni di saldo verranno inviate via mail dall'agenzia. Cancellazione gratuita fino al 15 Luglio 2026.`,
            canCancel: true,
            canModify: true,
            deadlineDate: '2026-07-15'
          });
        });
        hotelEstimateForModal = totalHotelCost;
        hotelTitleForModal = selectedHotelBookings.length === 1 
          ? `${selectedHotelBookings[0].hotelName} - ${selectedHotelBookings[0].roomTypeName}`
          : `${selectedHotelBookings.length} Sistemazioni Selezionate (${selectedHotelBookings.map(b => b.hotelName).join(', ')})`;
        hotelDatesForModal = `${checkIn} → ${checkOut} (${calculateNights()} notti)`;
      } else if (currentHotel) {
        const currentRt = currentHotel.roomTypes.find(rt => rt.name === selectedRoomTypeName) || currentHotel.roomTypes[0];
        const hotelRatePerNight = currentRt ? currentRt.pricePerNight : currentHotel.negotiatedRate;
        const nightsCount = calculateNights();
        const hotelEstimatedTotal = hotelRatePerNight * nightsCount;

        hotelEstimateForModal = hotelEstimatedTotal;
        hotelTitleForModal = `${currentHotel.name} - ${selectedRoomTypeName}`;
        hotelDatesForModal = `${checkIn} → ${checkOut} (${nightsCount} notti)`;

        items.push({
          category: 'HOTEL',
          title: `${currentHotel.name} - ${selectedRoomTypeName}`,
          details: `Check-in: ${checkIn} | Check-out: ${checkOut} (${nightsCount} notti) · ${calcAdults} Adulti${calcChildren > 0 ? `, ${calcChildren} Ragazzi` : ''}`,
          cost: hotelEstimatedTotal,
          freeByCouple: false,
          cancellationPolicy: `Tariffa di riferimento AD Marketing: €${hotelRatePerNight}/notte. Prima ipotesi di prezzo: €${hotelEstimatedTotal}. La quotazione esatta e le istruzioni di saldo verranno inviate via mail dall'agenzia dopo la valutazione dei giorni. Cancellazione gratuita fino al ${currentHotel.bookingDeadline || '15 Luglio 2026'}.`,
          canCancel: true,
          canModify: true,
          deadlineDate: currentHotel.bookingDeadline || '2026-07-15'
        });
      }
    }

    // 2. Transfer
    if (wantsTransfer && currentTransfer) {
      items.push({
        category: 'TRANSFER',
        title: currentTransfer.title,
        details: `Volo ${flightNumber} del ${flightArrivalDate} · ${luggageCount} Bagagli`,
        cost: currentTransfer.isPaidByCouple ? 0 : currentTransfer.pricePerSeat * 2,
        freeByCouple: currentTransfer.isPaidByCouple,
        cancellationPolicy: 'Restrizione Amministratore: Modifica orario consentita fino a 48h prima del volo. Cancellazione gratuita entro 7 giorni.',
        canCancel: true,
        canModify: true,
        deadlineDate: '2026-09-04'
      });
    }

    // 3. Esperienze
    selectedExperienceIds.forEach(id => {
      const exp = weddingData.experiences.find(e => e.id === id);
      if (exp) {
        items.push({
          category: 'EXPERIENCE',
          title: exp.title,
          details: `${exp.eventDate} alle ore ${exp.startTime} · ${exp.meetingPoint}`,
          cost: exp.isHostSponsored ? 0 : exp.pricePerPerson * 2,
          freeByCouple: exp.isHostSponsored,
          cancellationPolicy: exp.isHostSponsored 
            ? 'Esperienza offerta dagli sposi: comunicare disdetta con almeno 3 giorni di anticipo per liberare i posti ad altri ospiti.'
            : 'Restrizione Amministratore: Rimborsabile al 100% se annullata entro 5 giorni prima dell\'evento per rispetto dei fornitori locali.',
          canCancel: true,
          canModify: false,
          deadlineDate: '2026-09-05'
        });
      }
    });

    // 4. Servizi Extra
    selectedServiceIds.forEach(id => {
      const srv = weddingData.extraServices.find(s => s.id === id);
      if (srv) {
        items.push({
          category: 'SERVICE',
          title: srv.title,
          details: `${srv.providerName} (${srv.duration}) - Servizio in camera`,
          cost: srv.isPaidByCouple ? 0 : srv.price,
          freeByCouple: srv.isPaidByCouple,
          cancellationPolicy: 'Restrizione Amministratore: Orario concordato con la truccatrice/parrucchiere; modifiche consentite solo in base agli slot residui dell\'agenda.',
          canCancel: true,
          canModify: true,
          deadlineDate: '2026-09-08'
        });
      }
    });

    const newCard = {
      id: `conf-${Date.now()}`,
      confirmedAt: `${fullDate} ${timestamp}`,
      status: 'CONFERMATO' as const,
      items,
      totalDue: calculateTotalDue()
    };

    setConfirmedBookingCard(newCard);
    try {
      localStorage.setItem(`guest_confirmed_booking_${weddingData.weddingCode}_${guestInfo.email}`, JSON.stringify(newCard));
    } catch {
      // Ignora errori storage
    }

    const serviceBookings: Record<string, { quantity: number; notes?: string; totalPrice: number }> = {};
    selectedExperienceIds.forEach(id => {
      const exp = weddingData.experiences.find(e => e.id === id);
      if (exp) {
        const qty = serviceQuantities[id] || 1;
        serviceBookings[id] = {
          quantity: qty,
          notes: serviceNotes[id],
          totalPrice: exp.isHostSponsored ? 0 : exp.pricePerPerson * qty
        };
      }
    });
    selectedServiceIds.forEach(id => {
      const srv = weddingData.extraServices.find(s => s.id === id);
      if (srv) {
        const qty = serviceQuantities[id] || 1;
        serviceBookings[id] = {
          quantity: qty,
          notes: serviceNotes[id],
          totalPrice: srv.isPaidByCouple ? 0 : srv.price * qty
        };
      }
    });

    if (onSaveGuestChoices) {
      onSaveGuestChoices({
        name: guestInfo.name,
        email: guestInfo.email,
        weddingCode: weddingData.weddingCode,
        country: guestInfo.country || 'Italia',
        hotelBooked: wantsHotel && currentHotel ? `${currentHotel.name} - ${selectedRoomTypeName}` : 'Nessun hotel',
        roomType: selectedRoomTypeName,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        hotelNights: calculateNights(),
        hotelEstimatePrice: hotelEstimateForModal || 0,
        hotelBookingStatus: 'QUOTE_REQUESTED',
        hotelSpecialRequests: hotelSpecialRequests,
        transferBooked: wantsTransfer && currentTransfer ? currentTransfer.title : 'Autonomo',
        flight: flightNumber,
        experiences: selectedExperienceIds,
        extraServices: selectedServiceIds,
        totalAmountDue: calculateTotalDue(),
        serviceBookings,
        familyName,
        companions,
        specialNeeds,
        diet: `${dietaryChoices.join(', ')}${dietaryDetails ? ' (' + dietaryDetails + ')' : ''}`,
      });
    }

    // Invio automatico a Formspree (https://formspree.io/f/xaeqloob)
    try {
      const formspreePayload = {
        _subject: `Nuova Prenotazione Ospite - ${guestInfo.name} (${weddingData.weddingCode})`,
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        weddingCode: weddingData.weddingCode,
        coupleNames: weddingData.coupleNames,
        hotel: wantsHotel && currentHotel ? `${currentHotel.name} - ${selectedRoomTypeName} (${checkIn} al ${checkOut})` : 'Nessun hotel',
        transfer: wantsTransfer && currentTransfer ? `${currentTransfer.title} (Volo: ${flightNumber})` : 'Autonomo',
        experiences: selectedExperienceIds.map(id => weddingData.experiences.find(e => e.id === id)?.title).filter(Boolean).join(', '),
        services: selectedServiceIds.map(id => weddingData.extraServices.find(s => s.id === id)?.title).filter(Boolean).join(', '),
        totalDue: `€${calculateTotalDue()}`,
        timestamp: `${fullDate} ${timestamp}`
      };

      fetch('https://formspree.io/f/xaeqloob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formspreePayload)
      }).then(res => {
        console.log("Formspree response:", res.status);
      }).catch(err => {
        console.warn("Formspree error:", err);
      });
    } catch (e) {
      console.warn("Formspree dispatch exception:", e);
    }

    // Esegui anche notifica email e ordini fornitori
    handleSendVoucherEmail();

    // Mostra modale esplicativo del flusso: prima ipotesi inviata & successiva conferma ufficiale via email
    setGuestConfirmSuccessModal({
      show: true,
      hotelTitle: hotelTitleForModal,
      hotelDates: hotelDatesForModal,
      hotelEstimate: hotelEstimateForModal,
      totalDueImmediate: calculateTotalDue(),
      itemsCount: items.length
    });
  };

  // Annulla una voce confermata in base alle restrizioni
  const handleCancelConfirmedItem = (category: string, title: string) => {
    if (!confirmedBookingCard) return;

    if (category === 'HOTEL') {
      setWantsHotel(false);
    } else if (category === 'TRANSFER') {
      setWantsTransfer(false);
    } else if (category === 'EXPERIENCE') {
      const exp = weddingData.experiences.find(e => e.title === title);
      if (exp) {
        setSelectedExperienceIds(prev => prev.filter(id => id !== exp.id));
      }
    } else if (category === 'SERVICE') {
      const srv = weddingData.extraServices.find(s => s.title === title);
      if (srv) {
        setSelectedServiceIds(prev => prev.filter(id => id !== srv.id));
      }
    }

    const updatedItems = confirmedBookingCard.items.filter(it => it.title !== title);
    const updatedCard = {
      ...confirmedBookingCard,
      items: updatedItems,
      status: 'MODIFICATO' as const,
      totalDue: calculateTotalDue()
    };
    setConfirmedBookingCard(updatedCard);
    try {
      localStorage.setItem(`guest_confirmed_booking_${weddingData.weddingCode}_${guestInfo.email}`, JSON.stringify(updatedCard));
    } catch {}
  };

  // Calcolo totale da saldare per servizi a pagamento
  const calculateTotalDue = () => {
    let total = 0;
    // Hotel (se desiderato)
    if (wantsHotel) {
      if (selectedHotelBookings.length > 0) {
        selectedHotelBookings.forEach(b => {
          total += b.totalPrice;
        });
      } else if (currentHotel) {
        const currentRt = currentHotel.roomTypes.find(rt => rt.name === selectedRoomTypeName) || currentHotel.roomTypes[0];
        const hotelRatePerNight = currentRt ? currentRt.pricePerNight : currentHotel.negotiatedRate;
        const nightsCount = calculateNights();
        total += hotelRatePerNight * nightsCount * (calcRoomsCount || 1);
      }
    }
    // Transfer (se a pagamento)
    if (wantsTransfer && currentTransfer && !currentTransfer.isPaidByCouple) {
      total += currentTransfer.pricePerSeat * (calcAdults + calcChildren || 2);
    }
    // Esperienze (solo quelle non offerte dagli sposi)
    selectedExperienceIds.forEach(id => {
      const exp = weddingData.experiences.find(e => e.id === id);
      if (exp && !exp.isHostSponsored) {
        const qty = serviceQuantities[id] || 1;
        total += exp.pricePerPerson * qty;
      }
    });
    // Servizi extra
    selectedServiceIds.forEach(id => {
      const srv = weddingData.extraServices.find(s => s.id === id);
      if (srv && !srv.isPaidByCouple) {
        const qty = serviceQuantities[id] || 1;
        total += srv.price * qty;
      }
    });
    return total;
  };

  // Test e invio effettivo voucher via email e notifica ai Fornitori Partner
  const handleSendVoucherEmail = () => {
    const timestamp = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const orders: SupplierBookingOrder[] = [];
    const notifiedSuppliersList: string[] = [];

    // 1. Hotel Partner
    if (wantsHotel) {
      if (selectedHotelBookings.length > 0) {
        selectedHotelBookings.forEach((booking) => {
          const hotelObj = hotels.find(h => h.id === booking.hotelId);
          const sup = suppliers.find(s => s.id === hotelObj?.supplierId || s.name.toLowerCase().includes('borgo') || s.category === 'HOTEL') || suppliers[0];
          const hotelOrder: SupplierBookingOrder = {
            id: `ord-hotel-${booking.bookingId}-${Date.now()}`,
            supplierId: sup.id,
            supplierName: sup.name,
            supplierEmail: sup.email,
            weddingCode: weddingData.weddingCode,
            coupleNames: weddingData.coupleNames,
            guestName: guestInfo.name,
            guestEmail: guestInfo.email,
            guestPhone: '+39 340 1234567',
            serviceTitle: `${booking.hotelName} - ${booking.roomTypeName}`,
            serviceCategory: 'HOTEL',
            dateRequested: `${booking.checkIn} al ${booking.checkOut}`,
            roomType: booking.roomTypeName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights,
            participantsOrQuantity: booking.roomsCount * booking.guestsPerRoom,
            totalAmount: booking.totalPrice,
            isHotelEstimate: true,
            currency: 'EUR',
            guestNotes: `${hotelSpecialRequests || 'Nessuna preferenza'} | ${booking.roomsCount} camere (${booking.guestsPerRoom} ospiti/camera, max occ. ${booking.maxOccupancy})`,
            status: 'RECEIVED',
            emailSentToSupplierAt: `${new Date().toISOString().split('T')[0]} ${timestamp}`
          };
          orders.push(hotelOrder);
          if (!notifiedSuppliersList.includes(`${sup.name} (${sup.email})`)) {
            notifiedSuppliersList.push(`${sup.name} (${sup.email})`);
          }
        });
      } else if (currentHotel) {
        const sup = suppliers.find(s => s.id === currentHotel.supplierId || s.name.toLowerCase().includes('borgo') || s.category === 'HOTEL') || suppliers[0];
        const currentRt = currentHotel.roomTypes.find(rt => rt.name === selectedRoomTypeName) || currentHotel.roomTypes[0];
        const hotelRatePerNight = currentRt ? currentRt.pricePerNight : currentHotel.negotiatedRate;
        const nightsCount = calculateNights();
        const hotelEstimatedTotal = hotelRatePerNight * nightsCount;

        const hotelOrder: SupplierBookingOrder = {
          id: `ord-hotel-${Date.now()}`,
          supplierId: sup.id,
          supplierName: sup.name,
          supplierEmail: sup.email,
          weddingCode: weddingData.weddingCode,
          coupleNames: weddingData.coupleNames,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          guestPhone: '+39 340 1234567',
          serviceTitle: `${currentHotel.name} - ${selectedRoomTypeName}`,
          serviceCategory: 'HOTEL',
          dateRequested: `${checkIn} al ${checkOut}`,
          roomType: selectedRoomTypeName,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: nightsCount,
          participantsOrQuantity: calcAdults + calcChildren,
          totalAmount: hotelEstimatedTotal,
          isHotelEstimate: true,
          currency: 'EUR',
          guestNotes: hotelSpecialRequests || 'Nessuna preferenza specificata',
          status: 'RECEIVED',
          emailSentToSupplierAt: `${new Date().toISOString().split('T')[0]} ${timestamp}`
        };
        orders.push(hotelOrder);
        notifiedSuppliersList.push(`${sup.name} (${sup.email})`);
      }
    }

    // 2. Transfer / NCC Partner
    if (wantsTransfer && currentTransfer) {
      const sup = suppliers.find(s => s.id === currentTransfer.supplierId || s.category === 'TRANSFER') || suppliers[3];
      const transferOrder: SupplierBookingOrder = {
        id: `ord-tr-${Date.now()}`,
        supplierId: sup.id,
        supplierName: sup.name,
        supplierEmail: sup.email,
        weddingCode: weddingData.weddingCode,
        coupleNames: weddingData.coupleNames,
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        guestPhone: '+39 340 1234567',
        serviceTitle: currentTransfer.title,
        serviceCategory: 'TRANSFER',
        dateRequested: flightArrivalDate,
        participantsOrQuantity: 2,
        totalAmount: currentTransfer.isPaidByCouple ? 0 : currentTransfer.pricePerSeat * 2,
        currency: 'EUR',
        guestNotes: `Volo: ${flightNumber}, Valigie: ${luggageCount}`,
        status: 'RECEIVED',
        emailSentToSupplierAt: `${new Date().toISOString().split('T')[0]} ${timestamp}`
      };
      orders.push(transferOrder);
      if (!notifiedSuppliersList.some(s => s.includes(sup.name))) {
        notifiedSuppliersList.push(`${sup.name} (${sup.email})`);
      }
    }

    // 3. Esperienze Partner
    selectedExperienceIds.forEach(id => {
      const exp = weddingData.experiences.find(e => e.id === id);
      if (exp) {
        const sup = suppliers.find(s => s.id === exp.supplierId || s.category === 'EXPERIENCE') || suppliers[4];
        const expOrder: SupplierBookingOrder = {
          id: `ord-exp-${Date.now()}-${id}`,
          supplierId: sup.id,
          supplierName: sup.name,
          supplierEmail: sup.email,
          weddingCode: weddingData.weddingCode,
          coupleNames: weddingData.coupleNames,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          guestPhone: '+39 340 1234567',
          serviceTitle: exp.title,
          serviceCategory: 'EXPERIENCE',
          dateRequested: `${exp.eventDate} ore ${exp.startTime}`,
          participantsOrQuantity: 2,
          totalAmount: exp.isHostSponsored ? 0 : exp.pricePerPerson * 2,
          currency: 'EUR',
          guestNotes: exp.isHostSponsored ? 'Offerto con affetto dagli sposi (Gratuito)' : 'Servizio a pagamento',
          status: 'RECEIVED',
          emailSentToSupplierAt: `${new Date().toISOString().split('T')[0]} ${timestamp}`
        };
        orders.push(expOrder);
        if (!notifiedSuppliersList.some(s => s.includes(sup.name))) {
          notifiedSuppliersList.push(`${sup.name} (${sup.email})`);
        }
      }
    });

    // 4. Servizi Extra Beauty / Acconciatura Partner
    selectedServiceIds.forEach(id => {
      const srv = weddingData.extraServices.find(s => s.id === id);
      if (srv) {
        const sup = suppliers.find(s => s.category === 'BEAUTY_HAIR') || suppliers[5];
        const srvOrder: SupplierBookingOrder = {
          id: `ord-srv-${Date.now()}-${id}`,
          supplierId: sup.id,
          supplierName: sup.name,
          supplierEmail: sup.email,
          weddingCode: weddingData.weddingCode,
          coupleNames: weddingData.coupleNames,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          guestPhone: '+39 340 1234567',
          serviceTitle: srv.title,
          serviceCategory: 'BEAUTY_HAIR',
          dateRequested: 'Giorno Cerimonia in Masseria',
          participantsOrQuantity: 1,
          totalAmount: srv.price,
          currency: 'EUR',
          guestNotes: 'Servizio richiesto direttamente in camera',
          status: 'RECEIVED',
          emailSentToSupplierAt: `${new Date().toISOString().split('T')[0]} ${timestamp}`
        };
        orders.push(srvOrder);
        if (!notifiedSuppliersList.some(s => s.includes(sup.name))) {
          notifiedSuppliersList.push(`${sup.name} (${sup.email})`);
        }
      }
    });

    // Notifica Fornitori
    if (orders.length > 0 && onConfirmBookingToSuppliers) {
      onConfirmBookingToSuppliers(orders);
    }

    const suppliersNotice = notifiedSuppliersList.length > 0
      ? `Notifica di prenotazione trasmessa via email anche ai Fornitori Partner: ${notifiedSuppliersList.join(', ')}. I fornitori riceveranno l'ordine sulla propria casella e definiranno la modalità di saldo.`
      : '';

    setEmailSentStatus({
      sent: true,
      timestamp,
      message: `Voucher inviato con successo all'ospite (${guestInfo.email}) e trasmesso alla centrale operativa AD Marketing (${adminNotificationEmail}). ${suppliersNotice}`
    });
  };

  // Stampa Voucher
  const handlePrintVoucher = () => {
    window.print();
  };

  // Filtra i messaggi di questa specifica conversazione con l'ospite
  const guestChatHistory = chatMessages.filter(m => {
    const cleanGuestEmail = (guestInfo.email || '').trim().toLowerCase();
    const cleanGuestName = (guestInfo.name || '').trim().toLowerCase();
    const msgEmail = (m.guestEmail || '').trim().toLowerCase();
    const msgName = (m.guestName || '').trim().toLowerCase();

    if (cleanGuestEmail && msgEmail && cleanGuestEmail === msgEmail) return true;
    if (cleanGuestName && msgName && cleanGuestName === msgName) return true;

    const matchCode = !m.weddingCode || 
      (m.weddingCode || '').trim().toUpperCase() === (weddingData.weddingCode || '').trim().toUpperCase() ||
      (m.weddingCode || '').replace(/[\s\-_]+/g, '') === (weddingData.weddingCode || '').replace(/[\s\-_]+/g, '');

    if (matchCode) {
      if (cleanGuestEmail && msgEmail && cleanGuestEmail === msgEmail) return true;
      if (cleanGuestName && msgName && cleanGuestName === msgName) return true;
      if (!msgEmail && (m.sender === 'couple' || m.sender === 'valeria')) return true;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Banner Intestazione Ospite & Indicatore Sezione */}
      <div className="border border-stone-200/90 rounded-3xl p-6 sm:p-8 bg-white shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider">
              <span>✦ Apulian Destination Wedding Concierge</span>
              <span aria-hidden="true">·</span>
              <span>Puglia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-1">
              Benvenuto, {guestInfo.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Sei invitato alle nozze di <strong className="text-stone-900">{weddingData.coupleNames}</strong> a {weddingData.venue} ({weddingData.city}).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Valeria Concierge · Online</span>
            </button>
          </div>
        </div>

        {/* Barra di Stato Sezione Attiva */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Sezione Attiva:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 text-white font-semibold text-xs shadow-2xs">
              {navItems.find(n => n.id === activeTab)?.icon}
              <span>{navItems.find(n => n.id === activeTab)?.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>🗓 {new Date(weddingData.weddingDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>•</span>
            <span>📍 {weddingData.venue}</span>
          </div>
        </div>

        {/* Messaggio Personalizzato degli Sposi */}
        {weddingData.welcomeMessage && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-900">Messaggio dagli Sposi per te:</span>
              <p className="leading-relaxed italic">
                "{weddingData.welcomeMessage}"
              </p>
            </div>
          </div>
        )}

        {/* Avvisi in Evidenza Pubblicati dagli Sposi */}
        {weddingData.broadcastAnnouncements && weddingData.broadcastAnnouncements.length > 0 && (
          <div className="space-y-2">
            {weddingData.broadcastAnnouncements.map((ann) => (
              <div 
                key={ann.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
                  ann.urgent 
                    ? 'bg-rose-50 border-rose-200 text-rose-950' 
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}
              >
                <Bell className={`w-4 h-4 shrink-0 mt-0.5 ${ann.urgent ? 'text-rose-600' : 'text-amber-700'}`} />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    {ann.urgent && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white uppercase">
                        Urgente dagli Sposi
                      </span>
                    )}
                    <span className="font-bold">{ann.title}</span>
                    <span className="text-[10px] text-stone-500 font-normal">• {ann.date}</span>
                  </div>
                  <p className="leading-relaxed">{ann.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEZIONE 0: DAGLI SPOSI (FOTO, TIMELINE, DRESS CODE & GUIDA VIAGGIO)      */}
      {/* ========================================================================= */}
      {activeTab === 'couple-info' && (
        <div className="space-y-6">
          {/* Card Dettagli & Dress Code */}
          <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                La Nostra Festa in Puglia
              </span>
              <h2 className="text-2xl font-serif-luxury font-bold text-stone-800 mt-2">
                {weddingData.coupleNames} {weddingData.couplePhone && `(${weddingData.couplePhone})`} · Informazioni & Dettagli
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-2">
                <span>🗓 {new Date(weddingData.weddingDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>📍 {weddingData.venue}, {weddingData.city}</span>
                <span>•</span>
                <span>🔑 Codice: <strong className="font-mono text-stone-700">{weddingData.weddingCode}</strong></span>
              </div>
            </div>

            {/* Dress code & Note di stile */}
            {weddingData.dressCode && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Dress Code & Stile Suggerito dagli Sposi:</span>
                </span>
                <p className="text-amber-900 leading-relaxed">
                  {weddingData.dressCode}
                </p>
              </div>
            )}

            {/* Storia */}
            {weddingData.story && (
              <div className="text-xs text-neutral-600 leading-relaxed italic bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                "{weddingData.story}"
              </div>
            )}
          </div>

          {/* Programma Nozze / Timeline della Giornata */}
          {weddingData.schedule && weddingData.schedule.length > 0 && (
            <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-4">
              <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Programma del Nostro Matrimonio</span>
              </h3>
              <div className="space-y-2.5">
                {weddingData.schedule.map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start sm:items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-stone-750 text-white font-mono text-xs font-bold shrink-0">
                      {ev.time}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-stone-800 flex items-center gap-2">
                        <span>{ev.title}</span>
                        <span className="text-[11px] font-normal text-neutral-500">📍 {ev.location}</span>
                      </div>
                      {ev.description && (
                        <div className="text-[11px] text-neutral-600 mt-0.5">{ev.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Galleria Foto Caricata dagli Sposi */}
          {weddingData.galleryPhotos && weddingData.galleryPhotos.length > 0 && (
            <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-4">
              <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-600" />
                <span>Galleria Fotografica della Nostra Storia in Puglia</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {weddingData.galleryPhotos.map((photo) => (
                  <div key={photo.id} className="rounded-xl overflow-hidden border border-neutral-200 bg-stone-750 group">
                    <div className="aspect-4/3 overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || 'Foto sposi'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {photo.caption && (
                      <div className="p-2.5 bg-white text-[11px] font-semibold text-stone-700 truncate border-t border-neutral-100">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schede Informazioni Secondarie per il Viaggio */}
          {weddingData.secondaryInfo && weddingData.secondaryInfo.length > 0 && (
            <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-4">
              <h3 className="text-lg font-serif-luxury font-bold text-stone-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600" />
                <span>Guida Utile & Informazioni Pratiche per il Soggiorno</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weddingData.secondaryInfo.map((sec) => (
                  <div key={sec.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="text-xs font-bold text-stone-800 block">
                      {sec.title}
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE RSVP & GESTIONE ACCOMPAGNATORI / FAMIGLIA                        */}
      {/* ========================================================================= */}
      {activeTab === 'rsvp' && (
        <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Conferma di Presenza & Nucleo Familiare
            </span>
            <h2 className="text-2xl font-serif-luxury font-bold text-stone-800 mt-2">
              Conferma RSVP Digitale & Accompagnatori
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Conferma la tua presenza al matrimonio di <strong className="text-stone-800">{weddingData.coupleNames}</strong>, specifica eventuali intolleranze o esigenze alimentari e gestisci il tuo nucleo familiare o accompagnatori.
            </p>
          </div>

          {rsvpSavedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>RSVP e preferenze salvate con successo!</strong> Gli sposi e il concierge dell'agenzia sono stati aggiornati.</span>
            </div>
          )}

          {/* 1. Stato di Conferma Presenza */}
          <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-700" />
              <span>1. Conferma Presenza all'Evento</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRsvpStatus('CONFIRMED')}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  rsvpStatus === 'CONFIRMED'
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs ring-2 ring-emerald-900/20 font-semibold'
                    : 'bg-white text-stone-700 border-neutral-200 hover:bg-emerald-50/50'
                }`}
              >
                <div>
                  <span className="block text-sm">Sì, parteciperò con gioia! ❤️</span>
                  <span className={`block text-[11px] mt-0.5 ${rsvpStatus === 'CONFIRMED' ? 'text-emerald-200' : 'text-neutral-500'}`}>
                    Confermo la presenza per me e i miei accompagnatori
                  </span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${rsvpStatus === 'CONFIRMED' ? 'bg-white text-emerald-900 border-white' : 'border-neutral-300'}`}>
                  {rsvpStatus === 'CONFIRMED' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRsvpStatus('DECLINED')}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  rsvpStatus === 'DECLINED'
                    ? 'bg-stone-700 text-white border-stone-700 shadow-xs ring-2 ring-neutral-900/20 font-semibold'
                    : 'bg-white text-stone-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div>
                  <span className="block text-sm">Spiacente, non potrò partecipare</span>
                  <span className={`block text-[11px] mt-0.5 ${rsvpStatus === 'DECLINED' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Non sarò presente all'evento ma auguro il meglio agli sposi
                  </span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${rsvpStatus === 'DECLINED' ? 'bg-white text-stone-800 border-white' : 'border-neutral-300'}`}>
                  {rsvpStatus === 'DECLINED' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {rsvpStatus === 'CONFIRMED' && (
            <>
              {/* 2. Intolleranze Alimentari, Allergie e Menu Speciali */}
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-700" />
                  <span>2. Esigenze Alimentari, Allergie e Menu Speciali</span>
                </h3>
                <p className="text-xs text-neutral-600">
                  Specifica il regime alimentare o eventuali intolleranze e allergie gravi (es. celiachia, allergia frutta secca) per te e il tuo nucleo.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    'Standard (Nessuna restrizione)',
                    'Vegetariano',
                    'Vegano',
                    'Celiaco / Gluten Free',
                    'Intollerante al Lattosio',
                    'Menu Bambini',
                    'Allergia Frutta Secca',
                    'Altro'
                  ].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => {
                        if (diet === 'Standard (Nessuna restrizione)') {
                          setDietaryChoices(['Standard (Nessuna restrizione)']);
                        } else {
                          setDietaryChoices(prev => {
                            const withoutStandard = prev.filter(d => d !== 'Standard (Nessuna restrizione)');
                            if (prev.includes(diet)) {
                              return withoutStandard.filter(d => d !== diet);
                            } else {
                              return [...withoutStandard, diet];
                            }
                          });
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                        dietaryChoices.includes(diet)
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-amber-50/60'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    Dettagli specifici intolleranze, allergie o richieste di menu particolari:
                  </label>
                  <textarea
                    rows={2}
                    value={dietaryDetails}
                    onChange={(e) => setDietaryDetails(e.target.value)}
                    placeholder="Es. Celiachia severa per il primo commensale, allergia alle arachidi per l'accompagnatore..."
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-900/20"
                  />
                </div>
              </div>

              {/* 3. Gestione Accompagnatori e Famiglia (Nucleo Familiare) */}
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-700" />
                      <span>3. Gestione Accompagnatori & Nucleo Familiare</span>
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Raggruppa gli invitati del tuo nucleo familiare o gruppo di amici per assegnare posti e servizi insieme.
                    </p>
                  </div>
                  <div className="w-full sm:w-64">
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Nome Nucleo Familiare</label>
                    <input
                      type="text"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="Es. Famiglia Rossi"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white text-stone-800 font-semibold"
                    />
                  </div>
                </div>

                {/* Lista Accompagnatori */}
                {companions.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-700 block">Accompagnatori inseriti ({companions.length}):</span>
                    <div className="space-y-2">
                      {companions.map((comp) => (
                        <div key={comp.id} className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-stone-800 flex items-center gap-2">
                              <span>{comp.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {comp.relationship}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500">
                              Preferenza alimentare: <strong className="text-neutral-700">{comp.dietary}</strong>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCompanions(companions.filter(c => c.id !== comp.id))}
                            className="text-xs text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Rimuovi accompagnatore"
                          >
                            Rimuovi
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-neutral-300 text-center text-xs text-neutral-500">
                    Nessun accompagnatore aggiunto al tuo nucleo. Se partecipi con partner, figli o amici, aggiungili qui sotto.
                  </div>
                )}

                {/* Form Aggiungi Accompagnatore */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                  <span className="text-xs font-bold text-stone-800 block">Aggiungi un Accompagnatore al Nucleo:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">Nome e Cognome</label>
                      <input
                        type="text"
                        value={newCompanionName}
                        onChange={(e) => setNewCompanionName(e.target.value)}
                        placeholder="Es. Marco Rossi"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">Relazione / Ruolo</label>
                      <select
                        value={newCompanionRel}
                        onChange={(e) => setNewCompanionRel(e.target.value as any)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-stone-800"
                      >
                        <option value="Partner">Partner / Coniuge</option>
                        <option value="Figlio/a">Figlio / Figlia</option>
                        <option value="Genitore">Genitore</option>
                        <option value="Amico/a">Amico / Amica</option>
                        <option value="Altro">Altro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">Esigenza Alimentare</label>
                      <select
                        value={newCompanionDiet}
                        onChange={(e) => setNewCompanionDiet(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-stone-800"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Vegetariano">Vegetariano</option>
                        <option value="Vegano">Vegano</option>
                        <option value="Celiaco">Celiaco</option>
                        <option value="Menu Bimbi">Menu Bimbi</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCompanionName.trim()) return;
                        setCompanions([
                          ...companions,
                          {
                            id: `comp-${Date.now()}`,
                            name: newCompanionName.trim(),
                            relationship: newCompanionRel,
                            dietary: newCompanionDiet,
                            notes: ''
                          }
                        ]);
                        setNewCompanionName('');
                      }}
                      className="px-4 py-2 bg-stone-750 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Aggiungi Accompagnatore</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Ulteriori Note / Necessità Particolari */}
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <label className="block text-xs font-bold text-stone-800">
                  4. Ulteriori Necessità Particolari (Mobilità, Orari Arrivo, Richieste Speciali):
                </label>
                <textarea
                  rows={2}
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="Es. Necessità di seggiolone per bimbo, arrivo posticipato, esigenze di transfer personalizzato..."
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-900/20"
                />
              </div>
            </>
          )}

          {/* Pulsante Salva RSVP */}
          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleSaveRsvpAndFamily}
              className="px-6 py-3 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Salva e Invia Conferma RSVP & Nucleo Familiare</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 1: HOTEL & ALLOGGIO (MULTI-SELEZIONE HOTEL & MAX OSPITI CAMERE)   */}
      {/* ========================================================================= */}
      {activeTab === 'hotels' && (
        <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif-luxury font-bold text-stone-800">
                Hotel e Dimore Convenzionate
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Tariffe convenzionate riservate agli invitati. Puoi scegliere più di un hotel e diverse tipologie di camera per te o per i tuoi ospiti.
              </p>
            </div>

            {/* Switch: Voglio un hotel convenzionato vs Ho già un alloggio */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setWantsHotel(true)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${wantsHotel ? 'bg-white text-stone-800 shadow-2xs font-semibold' : 'text-neutral-600'}`}
              >
                Prenota Hotel
              </button>
              <button
                type="button"
                onClick={() => {
                  setWantsHotel(false);
                  setSelectedHotelBookings([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${!wantsHotel ? 'bg-white text-stone-800 shadow-2xs font-semibold' : 'text-neutral-600'}`}
              >
                Ho già un alloggio autonomo
              </button>
            </div>
          </div>

          {!wantsHotel ? (
            <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-semibold text-stone-800">Alloggio Autonomo Selezionato</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Perfetto! Non è richiesta alcuna prenotazione alberghiera tramite il nostro concierge. Potrai comunque usufruire dei transfer, delle esperienze e dei servizi make-up.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* DATE GLOBALI DEL SOGGIORNO */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-800 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-950 block">Date del Soggiorno ({calculateNights()} notti):</span>
                    <span className="text-amber-900/80 text-[11px]">Le date verranno applicate alle sistemazioni selezionate</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase mb-0.5">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        const newIn = e.target.value;
                        setCheckIn(newIn);
                        setSelectedHotelBookings(prev => prev.map(b => {
                          const inD = new Date(newIn);
                          const outD = new Date(b.checkOut);
                          const diff = Math.max(1, Math.ceil((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24)));
                          return {
                            ...b,
                            checkIn: newIn,
                            nights: diff,
                            totalPrice: b.pricePerNight * diff * b.roomsCount
                          };
                        }));
                      }}
                      className="p-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase mb-0.5">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => {
                        const newOut = e.target.value;
                        setCheckOut(newOut);
                        setSelectedHotelBookings(prev => prev.map(b => {
                          const inD = new Date(b.checkIn);
                          const outD = new Date(newOut);
                          const diff = Math.max(1, Math.ceil((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24)));
                          return {
                            ...b,
                            checkOut: newOut,
                            nights: diff,
                            totalPrice: b.pricePerNight * diff * b.roomsCount
                          };
                        }));
                      }}
                      className="p-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* RIEPILOGO SISTEMAZIONI SCELTE E TOTALE COMPLESSIVO */}
              {selectedHotelBookings.length > 0 && (
                <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-4 shadow-md animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-400" />
                      <div>
                        <h3 className="text-sm font-bold font-serif-luxury text-stone-100">
                          Riepilogo Sistemazioni Scelte ({selectedHotelBookings.length})
                        </h3>
                        <p className="text-[11px] text-stone-400">
                          Somma di tutte le sistemazioni e camere selezionate per il soggiorno
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">Totale Soggiorni Scelti</span>
                      <span className="text-2xl font-bold font-mono text-amber-300">
                        €{selectedHotelBookings.reduce((sum, b) => sum + b.totalPrice, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedHotelBookings.map((b) => (
                      <div key={b.bookingId} className="p-3.5 bg-stone-800/80 rounded-xl border border-stone-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-100 text-sm">{b.hotelName}</span>
                            <span className="text-[11px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-400/30">
                              {b.roomTypeName}
                            </span>
                          </div>
                          <div className="text-stone-400 text-[11px] flex flex-wrap items-center gap-3">
                            <span>€{b.pricePerNight} / notte</span>
                            <span>•</span>
                            <span>{b.checkIn} → {b.checkOut} ({b.nights} notti)</span>
                            <span>•</span>
                            <span className="text-amber-200">Max {b.maxOccupancy} ospiti/camera</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-stone-700">
                          {/* Configurator Camere e Ospiti */}
                          <div className="flex items-center gap-3 bg-stone-900/90 p-2 rounded-lg border border-stone-700">
                            {/* N. Camere */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-stone-400 uppercase font-bold">Camere:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (b.roomsCount > 1) {
                                    handleUpdateHotelBooking(b.bookingId, { roomsCount: b.roomsCount - 1 });
                                  } else {
                                    handleRemoveHotelBooking(b.bookingId);
                                  }
                                }}
                                className="w-5 h-5 rounded bg-stone-700 hover:bg-stone-600 text-white font-bold text-center leading-none flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-stone-100 px-1">{b.roomsCount}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateHotelBooking(b.bookingId, { roomsCount: b.roomsCount + 1 })}
                                className="w-5 h-5 rounded bg-stone-700 hover:bg-stone-600 text-white font-bold text-center leading-none flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-stone-700">|</span>

                            {/* Ospiti per Camera */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-stone-400 uppercase font-bold">Ospiti/cam:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (b.guestsPerRoom > 1) {
                                    handleUpdateHotelBooking(b.bookingId, { guestsPerRoom: b.guestsPerRoom - 1 });
                                  }
                                }}
                                className="w-5 h-5 rounded bg-stone-700 hover:bg-stone-600 text-white font-bold text-center leading-none flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-stone-100 px-1">{b.guestsPerRoom}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (b.guestsPerRoom < b.maxOccupancy) {
                                    handleUpdateHotelBooking(b.bookingId, { guestsPerRoom: b.guestsPerRoom + 1 });
                                  }
                                }}
                                className={`w-5 h-5 rounded text-white font-bold text-center leading-none flex items-center justify-center cursor-pointer ${
                                  b.guestsPerRoom < b.maxOccupancy ? 'bg-stone-700 hover:bg-stone-600' : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-stone-100 text-sm">€{b.totalPrice}</div>
                            <button
                              type="button"
                              onClick={() => handleRemoveHotelBooking(b.bookingId)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                            >
                              Rimuovi
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CATALOGO HOTEL E TIPOLOGIE CAMERE */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-neutral-200 pb-2">
                  Seleziona Camere nei Nostri Hotel Convenzionati
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotels.map((h) => {
                    const hotelBookings = selectedHotelBookings.filter(b => b.hotelId === h.id);
                    const isAnyRoomSelected = hotelBookings.length > 0;

                    return (
                      <div
                        key={h.id}
                        className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between space-y-4 ${
                          isAnyRoomSelected
                            ? 'border-amber-500 bg-amber-50/30 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                              {h.stars} Stelle · da €{h.negotiatedRate} / notte
                            </span>
                            {isAnyRoomSelected && (
                              <span className="text-[11px] font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>{hotelBookings.reduce((acc, b) => acc + b.roomsCount, 0)} Camere Selezionate</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-serif-luxury font-bold text-stone-800">{h.name}</h3>
                          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{h.address}</span>
                          </p>
                          <p className="text-xs text-neutral-600 italic">{h.distanceToVenue}</p>

                          {h.websiteUrl && (
                            <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                              <a 
                                href={h.websiteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
                              >
                                <span>Booking Engine Ufficiale</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHotelId(h.id);
                                  handleQueryBookingEngine(h);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-black bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200 cursor-pointer"
                              >
                                <Calculator className="w-3 h-3 text-neutral-600" />
                                <span>Calcolo Rapido Prezzo</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* LISTA E CONFIGURAZIONE TIPOLOGIE CAMERE CON MAX OSPITI */}
                        <div className="pt-4 border-t border-neutral-200 space-y-2.5">
                          <span className="font-bold text-stone-800 block text-xs uppercase tracking-wider">
                            Camere Riservate & Occupazione Massima:
                          </span>

                          <div className="space-y-2">
                            {h.roomTypes.map((rt) => {
                              const existing = selectedHotelBookings.find(b => b.hotelId === h.id && b.roomTypeName === rt.name);
                              const maxGuests = rt.maxOccupancy || 2;

                              return (
                                <div
                                  key={rt.id}
                                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                                    existing ? 'bg-amber-100/80 border-amber-400 font-medium' : 'bg-neutral-50/80 border-neutral-200 hover:bg-neutral-100/80'
                                  }`}
                                >
                                  <div className="space-y-0.5">
                                    <div className="font-bold text-stone-800 flex items-center gap-2">
                                      <span>{rt.name}</span>
                                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                                        Max {maxGuests} ospiti
                                      </span>
                                    </div>
                                    <div className="text-stone-600 text-[11px]">
                                      €{rt.pricePerNight} / notte · {rt.availableRooms || 10} camere rimaste
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                                    {existing ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-amber-900 bg-amber-200 px-2 py-1 rounded">
                                          {existing.roomsCount} cam. ({existing.guestsPerRoom} osp/cam)
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleAddHotelBooking(h, rt)}
                                          className="px-2.5 py-1 bg-stone-800 hover:bg-stone-950 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                                        >
                                          +1 Camera
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleAddHotelBooking(h, rt)}
                                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-950 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        <span>Aggiungi Sistemazione</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RICHIESTE SPECIALI HOTEL */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Richieste Speciali per gli Hotel (Culla per neonati, piano alto, orario di arrivo, camere vicine...):
                </label>
                <input
                  type="text"
                  value={hotelSpecialRequests}
                  onChange={(e) => setHotelSpecialRequests(e.target.value)}
                  placeholder="Es. Desideriamo 2 camere adiacenti, 1 culla per neonato, arrivo previsto ore 18:00..."
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
            <span className="text-xs text-neutral-500">
              Puoi passare liberamente alle altre sezioni in alto senza perdere i dati.
            </span>
            <button
              onClick={() => setActiveTab('transfers')}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Vai ai Transfer Aeroporto →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 2: TRANSFER & NAVETTE AEROPORTO (OPZIONALE!)                      */}
      {/* ========================================================================= */}
      {activeTab === 'transfers' && (
        <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif-luxury font-bold text-stone-800">
                Transfer Aeroportuali & Navette Nozze
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Collegamenti dagli aeroporti di Bari (BRI) e Brindisi (BDS) fino alle masserie, oltre alla navetta ufficiale per la cerimonia.
              </p>
            </div>

            <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setWantsTransfer(true)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${wantsTransfer ? 'bg-white text-stone-800 shadow-2xs font-semibold' : 'text-neutral-600'}`}
              >
                Richiedi Transfer
              </button>
              <button
                type="button"
                onClick={() => setWantsTransfer(false)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${!wantsTransfer ? 'bg-white text-stone-800 shadow-2xs font-semibold' : 'text-neutral-600'}`}
              >
                Mi sposterò in autonomia
              </button>
            </div>
          </div>

          {!wantsTransfer ? (
            <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-semibold text-stone-800">Nessun Transfer Richiesto</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Hai scelto di spostarti in autonomia (es. noleggio auto o auto propria). Potrai comunque salire a bordo della navetta ufficiale offerta per la festa nuziale!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {transfers.map((t) => {
                  const isSelected = selectedTransferIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTransferIds(selectedTransferIds.filter(id => id !== t.id));
                        } else {
                          setSelectedTransferIds([...selectedTransferIds, t.id]);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected ? 'border-stone-700 bg-neutral-50/60' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded">
                            {t.type}
                          </span>
                          <span className="text-xs font-mono font-bold text-stone-800">
                            {t.isPaidByCouple ? 'Gratuito (Offerto dagli sposi)' : `€${t.pricePerSeat} / persona`}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-stone-800">{t.title}</h3>
                        <p className="text-xs text-neutral-600">
                          Tratta: {t.origin} → {t.destination} ({t.vehicleType})
                        </p>
                        <p className="text-xs text-neutral-500 font-mono">Orari partenze: {t.departureTime}</p>
                      </div>

                      <span className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'border-stone-700 bg-stone-750 text-white' : 'border-neutral-300'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Taxi Privato / Request Quote */}
              <div 
                onClick={() => setIsRequestingTaxi(!isRequestingTaxi)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isRequestingTaxi ? 'border-stone-700 bg-neutral-50/60' : 'border-neutral-200 hover:border-neutral-300'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-stone-800">Taxi Privato (Auto d'epoca / Personalizzato)</h3>
                  <span className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${isRequestingTaxi ? 'border-stone-700 bg-stone-750 text-white' : 'border-neutral-300'}`}>
                      {isRequestingTaxi && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
                {isRequestingTaxi && (
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <p className="text-xs text-amber-800 font-semibold mb-2 italic">Richiesta quotazione (a partire da...)</p>
                    <input 
                      type="text" 
                      value={taxiDetails}
                      onChange={(e) => setTaxiDetails(e.target.value)}
                      placeholder="Descrivi la tipologia di auto o il servizio richiesto..."
                      className="w-full p-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Dettagli Transfer */}
              <div className="pt-4 border-t border-neutral-200">
                <label className="block text-neutral-700 font-semibold text-xs mb-1">Dettagli Aggiuntivi Transfer</label>
                <textarea
                  value={transferDetails}
                  onChange={(e) => setTransferDetails(e.target.value)}
                  placeholder="Inserisci qui eventuali dettagli o richieste speciali per i transfer..."
                  className="w-full p-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden"
                  rows={2}
                />
              </div>

              {/* Dettagli Volo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Compagnia & Numero Volo</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="Es. Ryanair FR7082"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Giorno & Orario di Arrivo</label>
                  <input
                    type="text"
                    value={flightArrivalDate}
                    onChange={(e) => setFlightArrivalDate(e.target.value)}
                    placeholder="Es. 11 Settembre - 10:45"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Numero Valigie</label>
                  <input
                    type="number"
                    value={luggageCount}
                    onChange={(e) => setLuggageCount(Number(e.target.value))}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
            <button
              onClick={() => setActiveTab('hotels')}
              className="text-xs text-neutral-600 hover:text-stone-800"
            >
              ← Torna agli Hotel
            </button>
            <button
              onClick={() => setActiveTab('experiences')}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Vai alle Esperienze & Party →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 3: ESPERIENZE (OFFERTE GRATIS DAGLI SPOSI E SU RICHIESTA)        */}
      {/* ========================================================================= */}
      {activeTab === 'experiences' && (
        <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-serif-luxury font-bold text-stone-800">
              Esperienze, Tour & Eventi Conviviali
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Abbiamo selezionato per te le migliori attività per vivere la magia della Puglia. Le serate offerte dagli sposi sono contrassegnate come <strong>gratuite</strong>.
            </p>
          </div>

          {/* Inserimento Categoria Manuale */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <label className="block text-xs font-bold text-stone-800 mb-2">
              Hai in mente un'esperienza non in elenco? Suggeriscila qui:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Es. Lezioni di cucina, Tour in vespa..."
                className="flex-1 p-2 text-xs border border-neutral-300 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Logic to save this new category to Firestore/local state would go here
                    alert('Grazie! Il tuo suggerimento è stato inviato all\'agenzia.');
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {experiences.map((exp) => {
              const isSelected = selectedExperienceIds.includes(exp.id);
              return (
                <div
                  key={exp.id}
                  onClick={() => toggleExperience(exp.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    isSelected ? 'border-stone-700 bg-neutral-50/60' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded">
                        {exp.eventDate} · {exp.startTime}
                      </span>
                      {exp.isHostSponsored ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-700" />
                          <span>Offerto con affetto dagli Sposi (Gratuito)</span>
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-xs text-stone-800">
                          €{exp.pricePerPerson} / persona
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-serif-luxury font-bold text-stone-800">{exp.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{exp.description}</p>
                    
                    <div className="text-[11px] text-neutral-500 pt-1 flex items-center gap-4">
                      <span>Ritrovo: {exp.meetingPoint}</span>
                      {exp.dressCode && <span>Dress code: {exp.dressCode}</span>}
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-3 border-t border-neutral-100 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-stone-700">Numero Partecipanti:</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setServiceQuantities(prev => ({ ...prev, [exp.id]: Math.max(1, (prev[exp.id] || 1) - 1) }))}
                              className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-stone-700 hover:bg-neutral-200"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{serviceQuantities[exp.id] || 1}</span>
                            <button
                              type="button"
                              onClick={() => setServiceQuantities(prev => ({ ...prev, [exp.id]: (prev[exp.id] || 1) + 1 }))}
                              className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-stone-700 hover:bg-neutral-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Note / Nomi Partecipanti / Richieste:</label>
                          <input
                            type="text"
                            value={serviceNotes[exp.id] || ''}
                            onChange={(e) => setServiceNotes(prev => ({ ...prev, [exp.id]: e.target.value }))}
                            placeholder="Es. Nomi ospiti, allergie specifiche per l'attività..."
                            className="w-full p-2 text-xs bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-stone-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'border-stone-700 bg-stone-750 text-white' : 'border-neutral-300'}`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
            <button
              onClick={() => setActiveTab('transfers')}
              className="text-xs text-neutral-600 hover:text-stone-800"
            >
              ← Torna ai Transfer
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Vai ai Servizi Trucco & Parrucco →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 4: SERVIZI BEAUTY & STYLING (TRUCCO, PARRUCCHIERE, BABYSITTING)  */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-serif-luxury font-bold text-stone-800">
              Servizi di Bellezza, Styling & Assistenza
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Desideri un make-up artist direttamente in camera, un parrucchiere specializzato o una babysitter durante il matrimonio? Puoi richiederli qui.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extraServices.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
              return (
                <div
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected ? 'border-stone-700 bg-neutral-50/60 shadow-xs' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded">
                        €{srv.price} · {srv.duration}
                      </span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-stone-700 bg-stone-750 text-white' : 'border-neutral-300'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-stone-800 pt-1">{srv.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{srv.description}</p>
                    <p className="text-[11px] text-neutral-400 mb-2">Operatore: {srv.providerName}</p>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-stone-700">Quantità / Persone:</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setServiceQuantities(prev => ({ ...prev, [srv.id]: Math.max(1, (prev[srv.id] || 1) - 1) }))}
                              className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-stone-700 hover:bg-neutral-200"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{serviceQuantities[srv.id] || 1}</span>
                            <button
                              type="button"
                              onClick={() => setServiceQuantities(prev => ({ ...prev, [srv.id]: (prev[srv.id] || 1) + 1 }))}
                              className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-stone-700 hover:bg-neutral-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">Dettagli / Note:</label>
                          <input
                            type="text"
                            value={serviceNotes[srv.id] || ''}
                            onChange={(e) => setServiceNotes(prev => ({ ...prev, [srv.id]: e.target.value }))}
                            placeholder="Orario preferito, nomi..."
                            className="w-full p-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-stone-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
            <button
              onClick={() => setActiveTab('experiences')}
              className="text-xs text-neutral-600 hover:text-stone-800"
            >
              ← Torna alle Esperienze
            </button>
            <button
              onClick={() => setActiveTab('wishes')}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Hai un Desiderio Speciale? →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 5: DESIDERI & RICHIESTE SU MISURA DELL'OSPITE TURISTA            */}
      {/* ========================================================================= */}
      {activeTab === 'wishes' && (
        <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Bespoke Puglia Experience
            </span>
            <h2 className="text-xl font-serif-luxury font-bold text-stone-800 mt-1">
              Esprimi un Desiderio per la Tua Vacanza in Puglia
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Vuoi noleggiare una Vespa vintage, prenotare un giro a cavallo in spiaggia, una cena privata in un trullo o un tour in elicottero? Scrivi la tua idea: Valeria e il team di AD Marketing la trasformeranno in una proposta su misura per te!
            </p>
          </div>

          {wishSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                La tua richiesta è stata inviata a Valeria! La analizzeremo subito e ti invieremo una proposta personalizzata con tutti i dettagli.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitWish} className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Titolo dell'Attività Desiderata
              </label>
              <input
                type="text"
                required
                value={wishTitle}
                onChange={(e) => setWishTitle(e.target.value)}
                placeholder="Es. Noleggio Vespa vintage per tour tra i trulli di Alberobello"
                className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Descrivici nei dettagli cosa ti piacerebbe fare
              </label>
              <textarea
                rows={3}
                required
                value={wishDescription}
                onChange={(e) => setWishDescription(e.target.value)}
                placeholder="Es. Vorremmo esplorare la Valle d'Itria in autonomia il 14 Settembre. Saremo in due e vorremmo la consegna direttamente in masseria con caschi inclusi..."
                className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Data Preferita</label>
                <input
                  type="date"
                  value={wishDate}
                  onChange={(e) => setWishDate(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Partecipanti</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={wishParticipants}
                  onChange={(e) => setWishParticipants(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Budget Indicativo</label>
                <input
                  type="text"
                  value={wishBudget}
                  onChange={(e) => setWishBudget(e.target.value)}
                  placeholder="Es. €100 - €200"
                  className="w-full p-2 bg-white border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-750 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Invia Desiderio al Concierge</span>
              </button>
            </div>
          </form>

          {/* Riepilogo Desideri Inviati */}
          {(() => {
            const gEmail = (guestInfo.email || '').trim().toLowerCase();
            const gName = (guestInfo.name || '').trim().toLowerCase();
            const selCode = (weddingData.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');

            const myWishes = wishRequests.filter(w => {
              const wEmail = (w.guestEmail || '').trim().toLowerCase();
              const wName = (w.guestName || '').trim().toLowerCase();
              const wCode = (w.weddingCode || '').trim().toUpperCase().replace(/[\s\-_]+/g, '');

              const matchesEmail = gEmail && wEmail && gEmail === wEmail;
              const matchesName = gName && wName && gName === wName;
              const matchesCode = !wCode || wCode === selCode;

              return (matchesEmail || matchesName) && matchesCode;
            });

            return (
              <div className="pt-6 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>I tuoi Desideri Inviati ({myWishes.length})</span>
                </h3>
                
                <div className="space-y-3">
                  {myWishes.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">Non hai ancora inviato richieste personalizzate per questo matrimonio.</p>
                  ) : (
                    myWishes.map(wish => (
                      <div key={wish.id} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{wish.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            wish.status === 'RECEIVED' ? 'bg-amber-50 text-amber-700' :
                            wish.status === 'PROPOSAL_READY' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {wish.status === 'RECEIVED' ? 'IN ATTESA' : 
                             wish.status === 'PROPOSAL_READY' ? 'PROPOSTA PRONTA' : 
                             wish.status === 'CONFIRMED' ? 'CONFERMATO' : 'ARCHIVIATO'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">"{wish.description}"</p>
                        <div className="flex items-center gap-4 text-[10px] text-neutral-500 pt-1">
                          <span>Data: {wish.preferredDate || 'Da definire'}</span>
                          <span>Partecipanti: {wish.participantsCount}</span>
                          {wish.proposedCost && <span className="font-bold text-emerald-700">Costo Proposto: € {wish.proposedCost}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 6: ASSISTENZA & CHAT INTERNA CON VALERIA                         */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="border border-neutral-200 rounded-2xl bg-white shadow-xs overflow-hidden flex flex-col h-[560px]">
          {/* Header Chat */}
          <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center font-bold text-sm">
                V
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span>Valeria · Assistente Dedicata</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[11px] text-emerald-200">
                  Concierge per il matrimonio di {weddingData.coupleNames} · AD Marketing
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-emerald-200">
              Notifica diretta allo staff attiva
            </div>
          </div>

          {/* Area Messaggi */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/60">
            {guestChatHistory.length === 0 ? (
              <div className="p-4 rounded-xl bg-white border border-neutral-200 max-w-md text-xs text-neutral-700 space-y-1">
                <div className="font-bold text-emerald-900">Valeria:</div>
                <p>
                  "Ciao {guestInfo.name}! Sono Valeria, la tua assistente personale per il matrimonio di {weddingData.coupleNames} a {weddingData.venue}. Scrivimi pure per qualsiasi dubbio su alloggi, orari delle navette, transfer o consigli sulle bellezze della Puglia. Riceverò subito la tua notifica!"
                </p>
              </div>
            ) : (
              guestChatHistory.map((m, idx, arr) => {
                const isGuest = m.sender === 'guest';
                const isCouple = m.sender === 'couple';
                const isValeria = m.sender === 'valeria';
                
                const prevMsg = idx > 0 ? arr[idx - 1] : null;
                const isConsecutive = prevMsg && prevMsg.sender === m.sender;

                return (
                  <div
                    key={m.id || idx}
                    className={`flex ${isGuest ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-3'}`}
                  >
                    <div
                      className={`max-w-sm rounded-2xl p-3 text-xs shadow-2xs space-y-1 ${
                        isGuest
                          ? 'bg-stone-750 text-white ' + (isConsecutive ? 'rounded-tr-md rounded-br-md' : 'rounded-br-none')
                          : isCouple
                          ? 'bg-rose-50 border border-rose-200 text-rose-950 ' + (isConsecutive ? 'rounded-tl-md rounded-bl-md' : 'rounded-bl-none')
                          : 'bg-white border border-neutral-200 text-stone-800 ' + (isConsecutive ? 'rounded-tl-md rounded-bl-md' : 'rounded-bl-none')
                      }`}
                    >
                      {!isConsecutive && (
                        <div className={`text-[10px] font-semibold flex items-center justify-between gap-2 pb-0.5 ${
                          isGuest ? 'text-neutral-300' : isCouple ? 'text-rose-700' : 'text-emerald-700'
                        }`}>
                          <span>
                            {isGuest ? 'Tu (Ospite)' : isCouple ? `❤️ Sposi (${weddingData.coupleNames}) · Cliente` : '🌿 Valeria (Concierge AD Marketing)'}
                          </span>
                        </div>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <div className={`text-[9px] text-right pt-0.5 ${isGuest ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Form Invio Messaggio */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              placeholder={`Scrivi un messaggio a Valeria...`}
              className="flex-1 text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invia</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 8: PAGAMENTI DIRETTI, RIASSUNTO COSTI & APPROVAZIONI AGENZIA      */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Banner Notifica Pagamento Ricevuto & Verificato da Valeria */}
          {currentGuestInWedding && (
            currentGuestInWedding.paymentStatus === 'PAID' || 
            currentGuestInWedding.hotelBookingStatus === 'PAID' || 
            Object.values(currentGuestInWedding.itemPaymentStatuses || {}).includes('PAID')
          ) && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-sm space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>🎉 RICEVUTA DI PAGAMENTO VERIFICATA E APPROVATA DA VALERIA (AD MARKETING)</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Il pagamento / bonifico effettuato per il matrimonio di <strong>{weddingData.coupleNames}</strong> è stato contabilizzato con successo dal team dell'agenzia. Le posizioni saldate risultano ufficialmente confermate.
              </p>
              {currentGuestInWedding.notesByValeria && (
                <div className="text-xs bg-white/90 p-3 rounded-xl border border-emerald-200 text-stone-800 font-medium">
                  <span className="font-bold text-emerald-900 block mb-0.5">Note dall'Agenzia:</span>
                  {currentGuestInWedding.notesByValeria}
                </div>
              )}
            </div>
          )}

          {/* Header Pagamenti & Approvazioni */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  <span>Portale Pagamenti & Approvazioni · AD Marketing</span>
                </div>
                <h2 className="text-2xl font-serif-luxury font-bold text-stone-800 mt-1">
                  Pagamenti Diretti, Riepilogo Costi & Voci in Attesa
                </h2>
                <p className="text-xs text-neutral-600 mt-1 max-w-2xl leading-relaxed">
                  Gestisci i pagamenti diretti online per i servizi abilitati dai fornitori partner, visualizza il riassunto completo dei costi e consulta le voci che necessitano di approvazione da parte dell'agenzia (hotel e desideri su misura).
                </p>
              </div>

              <div className="text-right p-3 bg-stone-50 rounded-xl border border-stone-200 shrink-0">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Totale Selezionato</span>
                <span className="text-xl font-mono font-black text-stone-900">€{calculateTotalDue()}</span>
              </div>
            </div>

            {/* 1. SEZIONE PAGAMENTI DIRETTI ON-LINE (Fornitori con metodi online validi) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>1. Pagamenti Diretti ai Fornitori (Metodi On-line Validi)</span>
              </h3>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fornitori con checkout o bonifico diretto abilitato</span>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  Per le esperienze e i servizi extra i cui fornitori partner hanno fornito coordinate bancarie o link di pagamento sicuro diretto, puoi procedere al saldo immediato.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedExperienceIds.concat(selectedServiceIds).length === 0 ? (
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 text-xs italic sm:col-span-2">
                    Nessuna esperienza o servizio extra selezionato al momento. Scegli nelle schede dedicate per abilitare i pagamenti diretti.
                  </div>
                ) : (
                  selectedExperienceIds.concat(selectedServiceIds).map((itemId, idx) => {
                    const exp = weddingData.experiences.find(e => e.id === itemId);
                    const srv = weddingData.extraServices.find(s => s.id === itemId);
                    const title = exp ? exp.title : srv ? srv.title : 'Servizio';
                    const cost = exp ? (exp.isHostSponsored ? 0 : exp.pricePerPerson * 2) : srv ? srv.price : 0;
                    const isFree = exp ? exp.isHostSponsored : false;

                    if (isFree) return null;

                    const isItemPaid = currentGuestInWedding?.itemPaymentStatuses?.[itemId] === 'PAID' || currentGuestInWedding?.paymentStatus === 'PAID';

                    return (
                      <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              isItemPaid ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}>
                              {isItemPaid ? '🟢 Pagato e Verificato' : 'Pagamento Diretto Fornitore'}
                            </span>
                            <h4 className="font-bold text-stone-800 text-sm mt-1">{title}</h4>
                          </div>
                          <span className="font-mono font-bold text-stone-900 text-sm">€{cost}</span>
                        </div>

                        <div className="text-[11px] text-neutral-600">
                          Metodo Online: <strong>Bonifico o Link Sicuro Fornitore Partner</strong> (IBAN/POS verificato da AD Marketing).
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Transazione Protetta</span>
                          </span>

                          {isItemPaid ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Pagamento Verificato</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Reindirizzamento al gateway di pagamento sicuro del fornitore per "${title}" (Importo: €${cost}). Servizio collegato con successo!`);
                              }}
                              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                              <span>Paga Online (€{cost})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)
                )}
              </div>
            </div>

            {/* 2. RIASSUNTO DEI COSTI */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-stone-700" />
                <span>2. Riassunto Dettagliato dei Costi</span>
              </h3>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">
                    Hotel Convenzionato ({wantsHotel ? (selectedHotelBookings.length > 0 ? `${selectedHotelBookings.length} sistemazioni` : currentHotel?.name || 'Selezionato') : 'Nessuno'}):
                  </span>
                  <span className="font-mono font-bold text-stone-800">
                    {wantsHotel ? `€${selectedHotelBookings.reduce((acc, b) => acc + b.totalPrice, 0) || (currentHotel ? currentHotel.negotiatedRate * calculateNights() : 0)}` : '€0 (Autonomo)'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Transfer Aeroporto / Navetta:</span>
                  <span className="font-mono font-bold text-stone-800">
                    {wantsTransfer && currentTransfer ? (currentTransfer.isPaidByCouple ? 'Gratuito (Offerto dagli Sposi)' : `€${currentTransfer.pricePerSeat * 2}`) : '€0'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Esperienze & Tour Selezionati ({selectedExperienceIds.length}):</span>
                  <span className="font-mono font-bold text-stone-800">
                    €{selectedExperienceIds.reduce((acc, id) => {
                      const e = weddingData.experiences.find(exp => exp.id === id);
                      return acc + (e && !e.isHostSponsored ? e.pricePerPerson * 2 : 0);
                    }, 0)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Servizi Beauty & Styling ({selectedServiceIds.length}):</span>
                  <span className="font-mono font-bold text-stone-800">
                    €{selectedServiceIds.reduce((acc, id) => {
                      const s = weddingData.extraServices.find(srv => srv.id === id);
                      return acc + (s ? s.price : 0);
                    }, 0)}
                  </span>
                </div>

                <div className="flex justify-between pt-2 text-sm font-black text-stone-900">
                  <span>Totale Stimato da Saldare:</span>
                  <span className="font-mono">€{calculateTotalDue()}</span>
                </div>
              </div>
            </div>

            {/* 3. SEZIONE A PARTE PER VOCI CHE NECESSITANO DI APPROVAZIONE DELL'AGENZIA (Hotel & Desideri) */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>3. Voci in Attesa di Approvazione & Valutazione da parte dell'Agenzia</span>
              </h3>

              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <Clock className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Hotel & Desideri su Misura (Richiedono Conferma Ufficiale AD Marketing)</span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  Come da regolamento organizzativo, le prenotazioni alberghiere (Room Blocks) e le richieste di desideri su misura inserite non vengono addebitate direttamente online, ma necessitano di <strong>approvazione e quotazione ufficiale da parte dell'agenzia AD Marketing</strong> per verificare disponibilità e tariffe esatte.
                </p>

                <div className="space-y-2 pt-2">
                  {/* Hotel opzionato */}
                  {wantsHotel && (selectedHotelBookings.length > 0 || currentHotel) ? (
                    <div className="p-3 rounded-lg bg-white border border-amber-200 text-stone-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                          Hotel / Alloggi Selezionati ({selectedHotelBookings.length || 1})
                        </span>
                        <div className="font-bold text-xs mt-1">
                          {selectedHotelBookings.length > 0
                            ? selectedHotelBookings.map(b => `${b.hotelName} (${b.roomTypeName})`).join(', ')
                            : `${currentHotel?.name} - ${selectedRoomTypeName}`}
                        </div>
                        <div className="text-[11px] text-neutral-500">Check-in: {checkIn} → Check-out: {checkOut}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                        currentGuestInWedding?.hotelBookingStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {currentGuestInWedding?.hotelBookingStatus === 'PAID' ? '🟢 Pagato e Verificato' : '⏳ In attesa di approvazione agenzia'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-white border border-neutral-200 text-neutral-500 italic">
                      Nessun hotel opzionato (l'ospite ha scelto alloggio autonomo).
                    </div>
                  )}

                  {/* Desideri inviati */}
                  <div className="p-3 rounded-lg bg-white border border-amber-200 text-stone-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                        Desideri / Richieste Bespoke
                      </span>
                      <div className="font-bold text-xs mt-1">Gestione tramite assistente Valeria & Staff AD Marketing</div>
                      <div className="text-[11px] text-neutral-500">Le richieste inviate tramite la scheda "Desideri" sono in fase di valutazione.</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                      ⏳ In lavorazione
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. COORDINATE BANCARIE UFFICIALI & PAGAMENTO UNIFICATO AD MARKETING */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span>4. Coordinate Bancarie Ufficiali Agenzia &amp; Pagamento Centralizzato</span>
              </h3>

              <div className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 text-xs">
                  <div>
                    <span className="font-bold text-stone-900 block text-sm">
                      {adminSettings?.agencyLegalName || 'AD Marketing S.r.l.s.'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {adminSettings?.agencyCity || 'Palagianello (TA) - Puglia'} · P.IVA: {adminSettings?.agencyVat || 'IT03124590731'}
                    </span>
                  </div>

                  {adminSettings?.stripePaymentLink && (
                    <a
                      href={adminSettings.stripePaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Paga con Carta di Credito (Stripe)</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Intestatario Conto
                    </span>
                    <span className="font-bold text-stone-800 block text-[11px]">
                      {adminSettings?.bankAccountHolder || 'AD Marketing S.r.l.s. - Servizi Matrimoni Puglia'}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      {adminSettings?.bankName || 'UniCredit Banca - Filiale di Taranto'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Coordinate IBAN &amp; BIC / SWIFT
                    </span>
                    <div className="font-mono font-bold text-stone-800 text-[11px] select-all bg-neutral-50 p-1 rounded border border-neutral-200">
                      IBAN: {adminSettings?.defaultIban || 'IT98 X 03002 03280 000000123456'}
                    </div>
                    <div className="font-mono text-neutral-600 text-[10px] select-all">
                      BIC/SWIFT: {adminSettings?.defaultBic || 'UNCRITM1B45'}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-600 bg-amber-50/80 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                  <strong>Causale Bonifico Raccomandata:</strong>{' '}
                  <span className="font-mono text-amber-950 font-bold">
                    {adminSettings?.paymentInstructions || `Saldo Servizi Concierge - ${weddingData.weddingCode} - ${guestInfo.name}`}
                  </span>
                  <div className="mt-1 text-[10px] text-neutral-500">
                    Per qualsiasi chiarimento sul saldo o per inviare la contabile, contatta Valeria ({adminSettings?.valeriaPhone || '+39 340 1234567'}) o scrivi a {adminSettings?.adminNotificationEmail || 'info@admarketing.it'}.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEZIONE 7: RIEPILOGO, SCHEDA SCELTE CONFERMATE & GESTIONE RESTRIZIONI    */}
      {/* ========================================================================= */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Se l'ospite ha già una scheda confermata, mostra la Scheda Opzioni Scelte con restrizioni admin */}
          {confirmedBookingCard && (
            <div className="border-2 border-emerald-600 rounded-2xl p-6 sm:p-8 bg-white shadow-md space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Scheda Opzioni Scelte & Confermate</span>
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      ID: {confirmedBookingCard.id} · Confermato il {confirmedBookingCard.confirmedAt}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif-luxury font-bold text-stone-800 mt-1.5">
                    Riepilogo Scelte Ufficiale per {guestInfo.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    confirmedBookingCard.status === 'CONFERMATO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    confirmedBookingCard.status === 'MODIFICATO' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-neutral-100 text-neutral-700'
                  }`}>
                    Stato: {confirmedBookingCard.status}
                  </span>
                </div>
              </div>

              {/* Elenco Servizi Scelti con Restrizioni Imposte dall'Amministratore */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Voci Prenotate & Condizioni di Modifica/Cancellazione:
                </h3>

                {confirmedBookingCard.items.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
                    Tutte le scelte precedenti sono state annullate o rimosse. Puoi selezionare nuovi servizi dalle schede dedicate.
                  </div>
                ) : (
                  confirmedBookingCard.items.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600 mr-2">
                            {item.category}
                          </span>
                          <strong className="text-sm text-stone-800">{item.title}</strong>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-stone-800">
                            {item.freeByCouple ? 'Gratuito (Regalo Sposi)' : `€${item.cost}`}
                          </span>
                        </div>
                      </div>

                      <p className="text-neutral-600 text-[11px]">{item.details}</p>

                      {/* Box Restrizioni Imposte dall'Amministratore */}
                      <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-semibold">{item.cancellationPolicy}</span>
                        </div>
                      </div>

                      {/* Azioni per Voce (Cambia, Annulla, Regole) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200/60">
                        <span className="text-[10px] text-neutral-400">
                          Termine ultimo policy: {item.deadlineDate}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.category === 'HOTEL') setActiveTab('hotels');
                              else if (item.category === 'TRANSFER') setActiveTab('transfers');
                              else if (item.category === 'EXPERIENCE') setActiveTab('experiences');
                              else setActiveTab('services');
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:text-black bg-white rounded border border-neutral-300 hover:bg-neutral-50 cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Cambia</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelConfirmedItem(item.category, item.title)}
                            className="px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:text-rose-900 bg-rose-50 rounded border border-rose-200 hover:bg-rose-100 cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Annulla Servizio</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Azioni Globali Scheda (Aggiungi Servizi, Riconferma, Stampa) */}
              <div className="p-4 rounded-xl bg-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Totale Saldo Servizi Selezionati:</span>
                  <span className="text-lg font-mono font-bold text-stone-800">
                    €{calculateTotalDue()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('experiences')}
                    className="px-3 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Aggiungi Altri Servizi / Esperienze</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndSendChoices}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aggiorna & Re-Invia Scheda Opzioni</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scheda Riepilogo Standard con Pulsante "Conferma e Invia" */}
          <div className="border border-neutral-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Riepilogo Scelte & Voucher di Soggiorno</span>
                </div>
                <h2 className="text-xl font-serif-luxury font-bold text-stone-800 mt-1">
                  Itinerario per {guestInfo.name}
                </h2>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Codice Voucher</div>
                <div className="text-sm font-mono font-bold text-stone-800">
                  {weddingData.weddingCode}-{guestInfo.name.substring(0, 3).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Dettagli Selezionati */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. Alloggi Selezionati */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Alloggio ({wantsHotel ? (selectedHotelBookings.length || 1) : 0})</span>
                </span>

                {wantsHotel && selectedHotelBookings.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {selectedHotelBookings.map((b, bIdx) => (
                      <div key={bIdx} className="p-2.5 bg-white rounded-lg border border-neutral-200 space-y-0.5">
                        <div className="font-bold text-stone-800 text-xs">{b.hotelName}</div>
                        <div className="text-neutral-600 text-[11px] font-medium">{b.roomTypeName} ({b.roomsCount} camera/e, {b.guestsPerRoom} ospiti/camera)</div>
                        <div className="text-neutral-500 text-[10px]">Check-in: {b.checkIn} · Check-out: {b.checkOut} ({b.nights} notti)</div>
                        <div className="font-mono text-emerald-800 font-bold text-[11px]">€{b.totalPrice}</div>
                      </div>
                    ))}
                  </div>
                ) : wantsHotel && currentHotel ? (
                  <>
                    <div className="text-sm font-bold text-stone-800">{currentHotel.name}</div>
                    <div className="text-neutral-600">{selectedRoomTypeName}</div>
                    <div className="text-neutral-500 text-[11px] pt-1">
                      Check-in: {checkIn} · Check-out: {checkOut}
                    </div>
                  </>
                ) : (
                  <div className="text-neutral-500 italic pt-1">Hai scelto di alloggiare in autonomia.</div>
                )}
              </div>

              {/* 2. Trasferimento */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Trasferimento</span>
                </span>
                <div className="text-sm font-bold text-stone-800">
                  {wantsTransfer && currentTransfer ? currentTransfer.title : 'Nessun transfer richiesto'}
                </div>
                {wantsTransfer && currentTransfer ? (
                  <>
                    <div className="text-neutral-600 font-mono">Volo: {flightNumber}</div>
                    <div className="text-neutral-500 text-[11px] pt-1">
                      Arrivo: {flightArrivalDate} · {luggageCount} Valigie
                    </div>
                  </>
                ) : (
                  <div className="text-neutral-500 italic">Ti sposterai in autonomia.</div>
                )}
              </div>

              {/* 3. Esperienze & Servizi */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Attività & Servizi ({selectedExperienceIds.length + selectedServiceIds.length})</span>
                </span>
                <div className="space-y-0.5 text-neutral-700 pt-1">
                  {selectedExperienceIds.map(id => {
                    const exp = weddingData.experiences.find(e => e.id === id);
                    return exp ? (
                      <div key={id} className="flex justify-between items-center text-[11px]">
                        <span>• {exp.title}</span>
                        <span className="font-bold text-stone-800">
                          {exp.isHostSponsored ? 'Gratuito (Sposi)' : `€${exp.pricePerPerson}`}
                        </span>
                      </div>
                    ) : null;
                  })}

                  {selectedServiceIds.map(id => {
                    const srv = weddingData.extraServices.find(s => s.id === id);
                    return srv ? (
                      <div key={id} className="flex justify-between items-center text-[11px]">
                        <span>• {srv.title}</span>
                        <span className="font-bold text-stone-800">€{srv.price}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Cronoprogramma / Day-by-Day Personalized Timeline */}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Cronoprogramma & Itinerario Personalizzato per {guestInfo.name}</span>
              </h3>

              <div className="space-y-3">
                {/* Giorno 1: Arrivo */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    G1
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-stone-800 text-sm">Giorno di Arrivo & Check-in Hotel</div>
                    <p className="text-neutral-600">
                      {wantsTransfer && currentTransfer 
                        ? `Navetta / Transfer programmato: ${currentTransfer.title} (${flightNumber ? 'Volo ' + flightNumber : 'Orario concordato'}).` 
                        : 'Arrivo in autonomia in Puglia.'}
                    </p>
                    {wantsHotel && (selectedHotelBookings.length > 0 || currentHotel) && (
                      <div className="text-emerald-800 font-semibold text-[11px]">
                        Check-in presso: {selectedHotelBookings.length > 0 ? selectedHotelBookings.map(b => b.hotelName).join(', ') : currentHotel?.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Giorno 2: Il Matrimonio */}
                <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    G2
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">Il Grande Giorno · Matrimonio {weddingData.coupleNames}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">Evento Principale</span>
                    </div>
                    <p className="text-stone-800 font-medium">
                      Sede Cerimonia & Ricevimento: <strong>{weddingData.venue}</strong> ({weddingData.city || 'Puglia'})
                    </p>
                    <p className="text-neutral-600 text-[11px]">
                      Orario di inizio: 16:30 · Dress Code: {weddingData.dressCode || 'Elegante / Cocktail Chic'}.
                    </p>
                    {selectedServiceIds.length > 0 && (
                      <div className="text-amber-900 font-semibold text-[11px] pt-1">
                        Servizi Beauty / Styling prenotati in camera: {selectedServiceIds.map(id => weddingData.extraServices.find(s => s.id === id)?.title).filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Giorno 3: Esperienze */}
                {selectedExperienceIds.length > 0 && (
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                      G3
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-stone-800 text-sm">Esperienze & Escursioni in Puglia</div>
                      <div className="space-y-1 pt-1">
                        {selectedExperienceIds.map(id => {
                          const exp = weddingData.experiences.find(e => e.id === id);
                          if (!exp) return null;
                          return (
                            <div key={id} className="p-2 bg-white rounded-lg border border-neutral-200 text-[11px]">
                              <strong className="text-stone-800">{exp.title}</strong>
                              <span className="text-neutral-500 ml-2">({exp.eventDate} ore {exp.startTime})</span>
                              <div className="text-neutral-600 text-[10px]">Punto di ritrovo: {exp.meetingPoint}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Giorno 4: Check-out & Partenza */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center shrink-0">
                    G4
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-stone-800 text-sm">Check-out & Saluti</div>
                    <p className="text-neutral-600">
                      Check-out entro le ore 11:00. Trasferimento in aeroporto/stazione coordinato dallo staff Valeria AD Marketing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Riepilogo Costi per i Servizi a Pagamento */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block">Totale Servizi Selezionati a Pagamento:</span>
                <span className="text-lg font-mono font-bold text-stone-800">
                  €{calculateTotalDue()}
                </span>
                <span className="text-[11px] text-neutral-500 ml-2">
                  (Le esperienze offerte dagli sposi sono completamente gratuite)
                </span>
              </div>

              <div className="text-right text-[11px] text-neutral-500">
                Istruzioni di saldo a cura di {adminSettings?.agencyLegalName || 'AD Marketing S.r.l.s.'}
                {adminSettings?.defaultIban && (
                  <div className="font-mono text-stone-700 font-semibold mt-0.5">
                    IBAN: {adminSettings.defaultIban}
                  </div>
                )}
              </div>
            </div>

            {/* Risultato Test Invio Email */}
            {emailSentStatus && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <MailCheck className="w-4 h-4 text-emerald-700" />
                  <span>Test Invio Email Riuscito alle ore {emailSentStatus.timestamp}</span>
                </div>
                <p>{emailSentStatus.message}</p>
                <div className="text-[11px] text-emerald-800 font-mono">
                  Destinatario Ospite: {guestInfo.email} | Copia Amministrazione: {adminNotificationEmail}
                </div>
              </div>
            )}

            {/* Azioni: Pulsante "Conferma e Invia" + Stampa & Modifica */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setActiveTab('hotels')}
                className="text-xs text-neutral-600 hover:text-stone-800 font-medium cursor-pointer"
              >
                ← Torna alle sezioni per modificare
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-stone-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Stampa Riepilogo</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndSendChoices}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Conferma e Invia Scelte</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finestra di Riepilogo Sempre Attiva in Basso (Carrello della spesa in tempo reale) */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-neutral-300 p-3 sm:p-4 shadow-2xl z-40 flex items-center justify-between md:px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-500">
              Riepilogo Scelte in Tempo Reale:
            </div>
            <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <span>Totale a Saldo:</span>
              <span className="font-mono text-emerald-800 text-base">€{calculateTotalDue()}</span>
              <span className="text-[11px] font-normal text-neutral-500 hidden sm:inline">
                ({selectedExperienceIds.length + selectedServiceIds.length + (wantsHotel ? 1 : 0) + (wantsTransfer ? 1 : 0)} voci selezionate)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'itinerary' && (
            <button
              onClick={() => setActiveTab('itinerary')}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              Vedi Riepilogo
            </button>
          )}

          <button 
            onClick={handleConfirmAndSendChoices} 
            className="px-4 sm:px-6 py-2 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer bg-emerald-800 hover:bg-emerald-900 text-white flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Conferma e Invia</span>
          </button>
        </div>
      </div>

      {/* Modale Esito Conferma e Invio Scelte (Ben visibile all'ospite) */}
      {guestConfirmSuccessModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-emerald-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Prima Ipotesi Inoltrata con Successo
              </span>
              <h3 className="text-2xl font-serif-luxury font-bold text-stone-800 mt-2">
                Grazie, {guestInfo.name}!
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Le tue scelte per il matrimonio di <strong className="text-stone-800">{weddingData.coupleNames}</strong> sono state registrate e trasmesse con successo all'agenzia <strong className="text-emerald-900">AD Marketing</strong> e agli sposi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs">
              <div className="font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200 pb-2">
                <span>Riepilogo Esito Invio:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                  {guestConfirmSuccessModal.itemsCount} Voci Selezionate
                </span>
              </div>
              
              {guestConfirmSuccessModal.hotelTitle && (
                <div className="flex justify-between items-center text-neutral-700">
                  <span className="text-neutral-500">Alloggio:</span>
                  <span className="font-semibold text-stone-800 truncate max-w-[240px]">{guestConfirmSuccessModal.hotelTitle}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-neutral-700">
                <span className="text-neutral-500">Totale Prima Ipotesi:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">€{guestConfirmSuccessModal.totalDueImmediate}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Cosa succede adesso?</span>
              </div>
              <p className="leading-relaxed">
                Lo staff di AD Marketing verificherà le disponibilità e ti invierà al più presto la <strong>conferma ufficiale via email</strong> ({guestInfo.email}) con le istruzioni per il saldo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setGuestConfirmSuccessModal(null);
                  setActiveTab('itinerary');
                }}
                className="w-full py-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Visualizza Scheda Dettaglio Scelte</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
