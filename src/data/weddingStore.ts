import heroBanner from '../assets/images/wedding_concierge_hero_1791309110090.jpg';
import hotelSuiteImg from '../assets/images/wedding_hotel_suite_1791309120679.jpg';
import boatTourImg from '../assets/images/wedding_boat_experience_1791309131765.jpg';

export interface RoomTypeItem {
  id: string;
  name: string;
  pricePerNight: number;
  totalBlocked: number;
  availableRooms: number;
  maxOccupancy: number;
  description?: string;
}

export interface HotelItem {
  id: string;
  name: string;
  stars: number;
  address: string;
  distanceToVenue: string;
  negotiatedRate: number; // Prezzo base di riferimento stabilito dall'agenzia
  currency: string;
  roomTypes: RoomTypeItem[];
  bookingDeadline: string;
  groupCode: string;
  supplierId?: string;
  image?: string;
  negotiatedPerk?: string; // Dettaglio speciale "Negoziato per voi" dall'agenzia
  websiteUrl?: string; // Collegamento al booking engine della struttura
  bookingEngineType?: 'DIRECT_ENGINE' | 'BOOKING_COM' | 'INTERNAL_PMS';
  amenities?: string[];
  agencyPricingNotes?: string; // Note e criteri di valutazione giorni/tariffe inserite dall'agenzia
  pricingManagedByAgency?: boolean;
  paymentLink?: string; // Link di pagamento o prenotazione online dedicato
  paymentMode?: 'ONLINE_LINK' | 'GENERAL_SUMMARY_WIRE'; // ONLINE_LINK vs Somma in Email Generale / Bonifico
}

export interface TransferItem {
  id: string;
  type: 'AIRPORT_SHUTTLE' | 'PRIVATE_NCC' | 'VENUE_SHUTTLE' | string;
  title: string;
  origin: string;
  destination: string;
  departureTime: string;
  vehicleType: string;
  capacity: number;
  bookedSeats: number;
  pricePerSeat: number;
  isPaidByCouple: boolean;
  supplierId?: string;
  negotiatedPerk?: string; // Dettaglio speciale "Negoziato per voi" dall'agenzia
}

export interface ExperienceItem {
  id: string;
  title: string;
  category: 'BOAT_TOUR' | 'WELCOME_PARTY' | 'COOKING_CLASS' | 'WINE_TASTING' | 'PIZZICA_NIGHT' | 'OIL_TOUR' | string;
  eventDate: string;
  startTime: string;
  durationHours: number;
  meetingPoint: string;
  pricePerPerson: number;
  isHostSponsored: boolean; // Se true: offerto con affetto dagli sposi, gratuito per gli ospiti!
  maxParticipants: number;
  bookedParticipants: number;
  dressCode?: string;
  description: string;
  supplierId?: string;
  image?: string;
  negotiatedPerk?: string; // Dettaglio speciale "Negoziato per voi" dall'agenzia
  paymentLink?: string; // Link di pagamento o prenotazione online dedicato
  paymentMode?: 'ONLINE_LINK' | 'GENERAL_SUMMARY_WIRE'; // ONLINE_LINK vs Somma in Email Generale / Bonifico
}

// Servizi aggiuntivi: Trucco, Parrucchiere, Babysitting, Stireria abiti da cerimonia
export interface ExtraServiceItem {
  id: string;
  title: string;
  category: 'HAIR_STYLING' | 'MAKEUP' | 'BABYSITTING' | 'STEAMING_TAILORING' | 'VINTAGE_CAR' | string;
  price: number;
  isPaidByCouple: boolean; // Alcuni possono essere offerti dagli sposi, altri su richiesta
  duration: string;
  description: string;
  providerName: string;
  negotiatedPerk?: string; // Dettaglio speciale "Negoziato per voi" dall'agenzia
  paymentLink?: string;
  paymentMode?: 'ONLINE_LINK' | 'GENERAL_SUMMARY_WIRE';
}

export interface GuestItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  hotelBooked: string; // Se 'NONE' o '' -> non ha prenotato hotel
  roomType: string;
  transferBooked: string; // Se 'NONE' o '' -> autonomo
  flight: string;
  experiences: string[];
  extraServices: string[];
  diet: string;
  status: 'CONFIRMED' | 'PENDING' | 'WAITLIST';
  totalAmountDue: number; // Totale da pagare per i servizi non offerti dagli sposi
  paymentStatus: 'PAID' | 'PENDING' | 'FREE';
  registeredAt: string;
  // Dettagli Soggiorno Hotel & Quotazione Agenzia
  checkInDate?: string;
  checkOutDate?: string;
  hotelNights?: number;
  hotelEstimatePrice?: number; // Prima ipotesi calcolata in base alla tariffa agenzia
  hotelOfficialPrice?: number; // Quotazione ufficiale confermata dall'agenzia
  hotelBookingStatus?: 'NONE' | 'QUOTE_REQUESTED' | 'OFFICIAL_CONFIRMED' | 'PAID';
  hotelSpecialRequests?: string;
  hotelPaymentSentAt?: string;
  notesByValeria?: string; // Note modificabili da Valeria
  itemPaymentStatuses?: Record<string, 'PAID' | 'PENDING'>; // Stato pagamento per singolo servizio/prodotto
  companions?: FamilyCompanion[];
  familyName?: string;
  specialNeeds?: string;
  allergies?: string;
  intolerances?: string;
  serviceBookings?: Record<string, { quantity: number; notes?: string; totalPrice: number }>;
}

export interface FamilyCompanion {
  id: string;
  name: string; // Nome e Cognome
  relationship: string; // Coniuge, Partner, Figlio/a, Genitore, Amico/a, Altro
  dietary: string; // Standard, Celiaco, Senza Lattosio, Vegetariano, Vegano, ecc.
  notes?: string;
  intoleranceNotes?: string; // Note dettagliate intolleranze e allergie della singola persona
  ageCategory?: 'Adulto' | 'Bambino' | 'Neonato' | string;
}

// Richieste su misura / desideri dell'ospite da impacchettare in proposta
export interface TouristWishRequest {
  id: string;
  weddingCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  title: string;
  description: string;
  preferredDate?: string;
  participantsCount: number;
  budgetRange?: string;
  status: 'RECEIVED' | 'PROPOSAL_READY' | 'CONFIRMED' | 'ARCHIVED';
  agencyNotes?: string;
  proposedCost?: number;
  createdAt: string;
}

// Chat interna con Valeria e Sposi
export interface ChatMessage {
  id: string;
  weddingCode: string;
  guestName: string;
  guestEmail: string;
  sender: 'guest' | 'valeria' | 'couple';
  text: string;
  timestamp: string;
  readByAdmin: boolean;
}

// Database Master Fornitori & Hotel
export interface MasterSupplier {
  id: string;
  name: string;
  category: 'HOTEL' | 'TRANSFER' | 'EXPERIENCE' | 'BEAUTY_HAIR' | 'OTHER';
  stars?: number;
  city: string;
  contactPerson: string;
  email: string;
  phone: string;
  standardRate: number;
  commissionPercent: number; // % commissione agenzia
  notes: string;
  accessPassword?: string; // Password di accesso assegnata dall'agenzia
  welcomeEmailSent?: boolean; // Stato invio email con credenziali e link
  emailSentAt?: string; // Data e ora invio email con credenziali
  websiteUrl?: string; // Link diretto al booking engine della struttura o booking.com
  bookingEngineType?: 'DIRECT_ENGINE' | 'BOOKING_COM' | 'INTERNAL_PMS';
  address?: string;
  distanceToVenue?: string;
  roomTypes?: RoomTypeItem[];
  amenities?: string[];
  negotiatedPerk?: string;
}

// Richieste degli sposi per regalare servizi agli ospiti
export interface CoupleGiftRequest {
  id: string;
  weddingCode: string;
  coupleNames: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: 'EXPERIENCE' | 'TRANSFER' | 'EXTRA_SERVICE' | 'HOTEL';
  guestsCount: number;
  unitPrice: number;
  totalEstimatedAmount: number;
  currency: string;
  coupleNotes?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  approvedAt?: string;
  agencyNotes?: string;
}

// Pacchetti creati dai fornitori per l'agenzia matrimoni
export interface SupplierPackage {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  title: string;
  category: 'HOTEL' | 'TRANSFER' | 'EXPERIENCE' | 'BEAUTY_HAIR' | 'CATERING' | 'OTHER';
  description: string;
  pricePerUnit: number;
  currency: string;
  commissionPercent: number; // % riservata ad agenzia AD Marketing
  capacityOrAvailability: string;
  includedFeatures: string[];
  image?: string;
  notesForAgency?: string;
  negotiatedPerk?: string; // Dettaglio speciale "Negoziato per voi" dall'agenzia
  createdAt: string;
}

// Ordini di prenotazione ricevuti dai fornitori sulla propria email
export interface SupplierBookingOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  weddingCode: string;
  coupleNames: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  serviceTitle: string;
  serviceCategory: string;
  dateRequested: string;
  participantsOrQuantity: number;
  totalAmount: number;
  currency: string;
  guestNotes?: string;
  status: 'RECEIVED' | 'CONFIRMED' | 'REJECTED';
  paymentMethodChosen?: 'DIRECT_AT_CHECKIN' | 'SUPPLIER_BANK_TRANSFER' | 'SUPPLIER_PAYMENT_LINK' | 'AGENCY_CENTRAL_BILLING';
  paymentNotes?: string;
  emailSentToSupplierAt: string;
  supplierResponseDate?: string;
  // Dettagli specifici per Hotel & Valutazione Agenzia
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  isHotelEstimate?: boolean;
  officialQuotedPrice?: number;
  officialConfirmationSentAt?: string;
}

// Richieste di pagamento generate dall'amministrazione
export interface PaymentRequest {
  id: string;
  weddingCode: string;
  guestName: string;
  guestEmail: string;
  amount: number;
  currency: string;
  items: { description: string; amount: number }[];
  status: 'SENT' | 'PAID' | 'CANCELLED';
  sentAt: string;
  paidAt?: string;
  paymentMethod: 'STRIPE_LINK' | 'BANK_TRANSFER_IBAN';
  invoiceCode: string;
}

export interface AdminSettings {
  // 1. Dati Societari, Legali & Fiscali
  agencyName: string;
  agencyLegalName: string;
  agencyVat: string;
  agencyAddress: string;
  agencyCity: string;
  agencyRea?: string;
  agencyShareCapital?: string;
  
  // 2. Contatti & Team Concierge
  adminNotificationEmail: string;
  agencyPhone: string;
  valeriaPhone: string;
  valeriaEmail?: string;
  valeriaRoleTitle?: string;
  emergencyPhone?: string;

  // 3. Dati Bancari & Pagamenti
  defaultIban: string;
  defaultBic: string;
  bankAccountHolder?: string;
  bankName?: string;
  stripePaymentLink: string;
  paymentInstructions?: string;
  standardCommissionPercent?: number;

  // 4. Impostazioni Grafiche & Branding
  themePalette?: 'terracotta-gold' | 'olive-salvia' | 'adriatic-navy' | 'monopoli-stone' | 'primitivo-wine';
  fontFamilyStyle?: 'serif-luxury' | 'modern-sans' | 'classic-editorial';
  cardStyle?: 'rounded-luxury' | 'sharp-elegance' | 'pill-soft';
  portalHeroEffect?: 'glassmorphism' | 'classic-warm' | 'minimalist';
  customLogoUrl?: string;
  badgeText?: string;

  // 5. Funzionalità & Moduli Portale
  enableGuestWishes?: boolean;
  enableConciergeChat?: boolean;
  enableRsvpCompanions?: boolean;
  enableBookingEngineCalculator?: boolean;
  enableAutomaticOrderToSupplier?: boolean;
  defaultCurrency?: 'EUR' | 'USD' | 'GBP';
  defaultWelcomeGreeting?: string;
  emailSubjectTemplate?: string;
  footerDisclaimer?: string;

  // 6. Custom Categories
  customExperienceCategories: string[];
  customTransferTypes: string[];
  customServiceCategories: string[];

  // 7. Onboarding Sposi & Template Invito
  onboardingInviteTextIt?: string;
  onboardingInviteTextEn?: string;
  customOnboardingUrl?: string;
}

export interface CoupleOnboardingDossier {
  id: string;
  submittedAt: string;
  status: 'NEW' | 'REVIEWED' | 'CONVERTED';
  // Dati Coppia
  brideName: string;
  groomName: string;
  coupleEmail: string;
  phoneWhatsapp: string;
  residenceCityCountry: string;
  preferredLanguage: 'it' | 'en';
  // Evento
  weddingDate: string;
  eventDuration: 'SINGLE_DAY' | 'WEEKEND_2DAYS' | 'MULTIDAY_3PLUS';
  datesDetails?: string;
  venueLocation: string;
  ceremonyTypeAndLocation?: string;
  weddingPlannerName?: string;
  // Ospiti & Logistica
  estimatedGuestsCount: number;
  outOfTownGuestsCount: number;
  mainArrivalHubs: string[];
  hotelAssistanceNeeded: 'YES' | 'NO' | 'PARTIAL';
  shuttleWeddingDayNeeded: 'YES' | 'NO' | 'MAYBE';
  airportTransfersNeeded: 'YES' | 'NO' | 'MAYBE';
  // Servizi & Esperienze desiderate
  requestedServices: string[];
  requestedExperiences: string[];
  // Atmosfera & Note
  desiredVibe: string;
  specialNotesForValeria: string;
  kickoffCallChannel: 'WHATSAPP' | 'MEET' | 'PHONE';
  kickoffCallTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
  convertedWeddingCode?: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  description?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

// Fotografie caricate dagli invitati nell'Album Nozze (fino a 30 per ospite, compresse con tracciamento memoria)
export interface WeddingAlbumPhoto {
  id: string;
  url: string; // Immagine compressa (base64 o URL)
  caption?: string;
  guestEmail: string;
  guestName: string;
  uploadedAt: string; // Data formattata (es. '04-11-2026 15:30')
  sizeBytes?: number; // Dimensione in byte per il calcolo memoria di Valeria
  takenWithCamera?: boolean; // Scattata direttamente tramite fotocamera smartphone
}

export interface SecondaryInfoSection {
  id: string;
  title: string;
  category: 'logistics' | 'weather' | 'gift' | 'food' | 'tourism' | 'other';
  content: string;
  iconName?: string;
}

export interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  urgent?: boolean;
}

// Segnalazioni & Feedback di Avviso per la Scheda Matrimoni
export interface WeddingAlertNotification {
  id: string;
  weddingCode: string;
  source: 'GUEST_WISH' | 'GUEST_RSVP' | 'GUEST_CHOICE_UPDATE' | 'HOTEL_QUOTE_REQUEST' | 'COUPLE_UPDATE' | 'COUPLE_GIFT' | 'CHAT_MESSAGE';
  authorName: string;
  authorRole: 'ospite' | 'sposi';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionTab?: 'weddings' | 'wishlist' | 'guests' | 'hotels' | 'chat' | 'payments' | 'services' | 'experiences' | 'transfers';
  preferredDate?: string;
  participantsCount?: number;
  budgetRange?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface WeddingData {
  id: string;
  weddingCode: string;
  coupleNames: string;
  weddingDate: string;
  coupleEmail?: string;
  couplePhone?: string;
  venue: string;
  city: string;
  country: string;
  bannerImage: string;
  welcomeMessage: string;
  currency: string;
  conciergeEmail: string;
  conciergePhone: string;
  conciergeWhatsApp: string;
  couplePassword?: string;
  dressCode?: string;
  story?: string;
  schedule?: ScheduleEvent[];
  galleryPhotos?: GalleryPhoto[];
  weddingAlbumPhotos?: WeddingAlbumPhoto[];
  secondaryInfo?: SecondaryInfoSection[];
  broadcastAnnouncements?: BroadcastAnnouncement[];
  hotels: HotelItem[];
  transfers: TransferItem[];
  experiences: ExperienceItem[];
  extraServices: ExtraServiceItem[];
  guests: GuestItem[];
  giftRequests?: CoupleGiftRequest[];
  notifications?: WeddingAlertNotification[];
  itemPaymentStatuses?: Record<string, 'PAID' | 'PENDING'>;
}

export const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  // Dati Societari
  agencyName: 'Apulian Wedding Concierge',
  agencyLegalName: 'AD Marketing S.r.l.s.',
  agencyVat: 'IT03124590731',
  agencyAddress: 'Via Roma, 45',
  agencyCity: '74018 Palagianello (TA) - Puglia, Italia',
  agencyRea: 'TA-201842',
  agencyShareCapital: '€10.000 i.v.',

  // Contatti
  adminNotificationEmail: 'domenicoantonacci@gmail.com',
  agencyPhone: '+39 099 8887766',
  valeriaPhone: '+39 340 1234567',
  valeriaEmail: 'valeria@admarketing.it',
  valeriaRoleTitle: 'Head of Destination Wedding Concierge & Guest Experience',
  emergencyPhone: '+39 340 9988776',

  // Coordinate Bancarie & Pagamenti
  defaultIban: 'IT98 X 03002 03280 000000123456',
  defaultBic: 'UNCRITM1B45',
  bankAccountHolder: 'AD Marketing S.r.l.s. - Conto Servizi Matrimoni Puglia',
  bankName: 'UniCredit Banca - Filiale di Taranto / Palagianello',
  stripePaymentLink: 'https://buy.stripe.com/demo_apulian_wedding_concierge',
  paymentInstructions: 'Inserire nella causale: "Saldo Servizi Concierge - [Codice Matrimonio] - [Nome Ospite]"',
  standardCommissionPercent: 15,

  // Impostazioni Grafiche & Branding
  themePalette: 'terracotta-gold',
  fontFamilyStyle: 'serif-luxury',
  cardStyle: 'rounded-luxury',
  portalHeroEffect: 'classic-warm',
  customLogoUrl: '',
  badgeText: 'AD Marketing · Official Puglia Concierge Partner',

  // Funzionalità Portali
  enableGuestWishes: true,
  enableConciergeChat: true,
  enableRsvpCompanions: true,
  enableBookingEngineCalculator: true,
  enableAutomaticOrderToSupplier: true,
  defaultCurrency: 'EUR',
  defaultWelcomeGreeting: 'Benvenuti in Puglia! Il team di Valeria e AD Marketing è al vostro fianco per rendere il soggiorno per questo matrimonio autentico e indimenticabile.',
  emailSubjectTemplate: 'Scheda Prenotazione e Voucher Servizi - Matrimonio {WEDDING_CODE}',
  footerDisclaimer: 'AD Marketing S.r.l.s. opera con sede a Palagianello (TA) come agenzia di concierge, logistica VIP e coordinamento territoriale per luxury destination weddings in Puglia.',
  customExperienceCategories: [],
  customTransferTypes: [],
  customServiceCategories: [],

  // 7. Onboarding Sposi & Template Invito
  onboardingInviteTextIt: `Carissimi {NOMI_SPOSI},

Congratulazioni di vero cuore per le vostre nozze in Puglia! 💍✨

Sono Valeria, responsabile del servizio di Apulian Wedding Concierge (AD Marketing). Da oggi siamo al vostro fianco per rendere l'esperienza vostra e dei vostri ospiti indimenticabile, curando ogni aspetto logistico: alloggi convenzionati nelle masserie più belle, transfer aeroportuali NCC, navette per il giorno delle nozze ed esperienze autentiche nella nostra terra.

Per permettermi di configurare la vostra area riservata, avviare i servizi su misura e preparare il Wedding Portal per i vostri invitati, vi chiedo la gentilezza di compilare questo breve questionario di benvenuto (richiede circa 3 minuti):

👉 {LINK_LANDING_PAGE}

Non appena riceverò i vostri dettagli, imposterò il vostro matrimonio e vi contatterò per un caloroso saluto di allineamento e per iniziare insieme questa meravigliosa avventura!

Con affetto e a disposizione per qualsiasi desiderio,
Valeria · Apulian Wedding Concierge
📱 WhatsApp: +39 340 1234567
🌐 AD Marketing S.r.l.s. · Palagianello (TA)`,

  onboardingInviteTextEn: `Dearest {COUPLE_NAMES},

Warmest congratulations on your upcoming wedding in Puglia! 💍✨

I am Valeria, Head of Guest Experience & Concierge at Apulian Wedding Concierge (AD Marketing). We are thrilled to be by your side to make your celebration and your guests' stay completely stress-free, curating room blocks in authentic masserie, airport transfers, wedding day shuttles, and memorable Apulian experiences.

To allow me to configure your private wedding portal and begin tailoring services for you and your guests, please take 3 minutes to fill out our welcome onboarding form:

👉 {LINK_LANDING_PAGE}

As soon as I receive your details, I will set up your portal and reach out for our kickoff call.

With warm regards and excitement for your big day,
Valeria · Apulian Wedding Concierge
📱 WhatsApp: +39 340 1234567
🌐 AD Marketing S.r.l.s. · Puglia, Italy`
};

export const INITIAL_ONBOARDING_DOSSIERS: CoupleOnboardingDossier[] = [
  {
    id: 'onboard-demo-1',
    submittedAt: '2026-11-08T16:45:00.000Z',
    status: 'NEW',
    brideName: 'Camilla',
    groomName: 'Federico',
    coupleEmail: 'camilla.federico2026@gmail.com',
    phoneWhatsapp: '+39 333 9876543',
    residenceCityCountry: 'Milano, Italia',
    preferredLanguage: 'it',
    weddingDate: '2026-09-19',
    eventDuration: 'MULTIDAY_3PLUS',
    datesDetails: '18 Settembre: Welcome Drink al tramonto a Polignano; 19 Settembre: Cerimonia & Ricevimento a Masseria San Domenico; 20 Settembre: Farewell Pool & Pizza Party.',
    venueLocation: 'Masseria San Domenico, Savelletri di Fasano (BR)',
    ceremonyTypeAndLocation: 'Rito civile simbolico nel giardino degli ulivi secolari',
    weddingPlannerName: 'Elisa Moretti Event Design',
    estimatedGuestsCount: 110,
    outOfTownGuestsCount: 85,
    mainArrivalHubs: ['Aeroporto di Bari Karol Wojtyla (BRI)', 'Aeroporto di Brindisi (BDS)'],
    hotelAssistanceNeeded: 'YES',
    shuttleWeddingDayNeeded: 'YES',
    airportTransfersNeeded: 'YES',
    requestedServices: [
      'GUEST_CONCIERGE_CHAT',
      'WEB_APP_PORTAL',
      'HOTEL_ROOM_BLOCKS',
      'WEDDING_SHUTTLES',
      'AIRPORT_NCC',
      'BEAUTY_STYLING',
      'BABYSITTING'
    ],
    requestedExperiences: [
      'BOAT_TOUR_POLIGNANO',
      'WINE_OIL_TASTING',
      'COOKING_CLASS_ORECCHIETTE'
    ],
    desiredVibe: 'Autentico, elegante e festoso, con tanta musica pugliese, cibo genuino e totale relax per i nostri amici e parenti che viaggiano da lontano.',
    specialNotesForValeria: 'Abbiamo diversi ospiti che arrivano da Londra e New York con voli su Bari. Ci piacerebbe avere un cartello di benvenuto personalizzato in aeroporto e fare in modo che non debbano noleggiare auto.',
    kickoffCallChannel: 'WHATSAPP',
    kickoffCallTime: 'AFTERNOON'
  }
];

// Database Master Fornitori Registrati
export const INITIAL_SUPPLIERS: MasterSupplier[] = [
  {
    id: 'sup-borgo',
    name: 'Borgo Egnazia Resort & Spa',
    category: 'HOTEL',
    stars: 5,
    city: 'Savelletri di Fasano (BR)',
    address: 'Contrada Losciale, Fasano (BR)',
    contactPerson: 'Dott.ssa Marisa Greco',
    email: 'booking@borgoegnazia.it',
    phone: '+39 080 225500',
    standardRate: 520,
    commissionPercent: 12,
    websiteUrl: 'https://www.borgoegnazia.it/prenotazioni',
    bookingEngineType: 'DIRECT_ENGINE',
    notes: 'Partner gold per matrimoni esteri di lusso. Camere e ville private.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-10 11:30',
    amenities: ['Piscina scoperta', 'Spa Vair', 'Campo Golf 18 buche', 'Spiaggia privata Cala Masciola', 'Colazione pugliese inclusa']
  },
  {
    id: 'sup-masseria-torre',
    name: 'Masseria Torre Coccaro',
    category: 'HOTEL',
    stars: 5,
    city: 'Fasano (BR)',
    address: 'C.da Coccaro 8, Savelletri di Fasano (BR)',
    contactPerson: 'Vincenzo Muolo',
    email: 'events@torrecoccaro.com',
    phone: '+39 080 4829310',
    standardRate: 460,
    commissionPercent: 15,
    websiteUrl: 'https://www.torrecoccaro.com/booking',
    bookingEngineType: 'DIRECT_ENGINE',
    notes: 'Masseria cinquecentesca tra gli ulivi, spiaggia privata Coccaro Beach Club.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-12 14:15',
    amenities: ['Spiaggia privata Coccaro Beach Club', 'Piscina riscaldata', 'Aveda Spa in grotta', 'Navetta gratuita per la cerimonia']
  },
  {
    id: 'sup-masseria-san-domenico',
    name: 'Masseria San Domenico',
    category: 'HOTEL',
    stars: 5,
    city: 'Savelletri (BR)',
    address: 'Strada Provinciale 90, Fasano (BR)',
    contactPerson: 'Silvia Melpignano',
    email: 'concierge@masseriasandomenico.com',
    phone: '+39 080 4827777',
    standardRate: 490,
    commissionPercent: 12,
    websiteUrl: 'https://www.masseriasandomenico.com/booking',
    bookingEngineType: 'DIRECT_ENGINE',
    notes: 'Dimora storica fortificata del XIV secolo, talassoterapia e campo golf 18 buche.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-15 09:45',
    amenities: ['Centro Talassoterapia', 'Piscina con acqua di mare', 'Ristorante gourmet', 'San Domenico Golf Club']
  },
  {
    id: 'sup-ncc-puglia',
    name: 'Apulia VIP Transfer & NCC',
    category: 'TRANSFER',
    city: 'Bari / Brindisi',
    contactPerson: 'Pasquale Lisi',
    email: 'info@apuliaviptransfer.it',
    phone: '+39 338 9090123',
    standardRate: 45,
    commissionPercent: 20,
    notes: 'Flotta di 8 Mercedes Sprinter VIP e 12 Classe V Luxury. Conducenti in abito con inglese fluente.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-18 16:00'
  },
  {
    id: 'sup-boat-polignano',
    name: 'Polignano Sea Charters & Riva Yachts',
    category: 'EXPERIENCE',
    city: 'Polignano a Mare (BA)',
    contactPerson: 'Cap. Donato Zaccaria',
    email: 'donato@seacharters.it',
    phone: '+39 347 5544332',
    standardRate: 110,
    commissionPercent: 25,
    notes: 'Barche d\'epoca in mogano e gozzi tipici per tour grotte di Polignano e calici al tramonto.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-20 10:20'
  },
  {
    id: 'sup-beauty-glam',
    name: 'Apulian Bridal & Guest Glam Team',
    category: 'BEAUTY_HAIR',
    city: 'Monopoli & Valle d\'Itria',
    contactPerson: 'Chiara Valente Hair & Makeup',
    email: 'chiara@apulianglam.it',
    phone: '+39 349 7788990',
    standardRate: 120,
    commissionPercent: 18,
    notes: 'Staff di 6 truccatrici e acconciatori disponibili a domicilio in masseria.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-22 17:40'
  },
  {
    id: 'sup-cooking-massaia',
    name: 'Le Antiche Massaie della Murgia & Valle d\'Itria',
    category: 'EXPERIENCE',
    city: 'Alberobello / Fasano',
    contactPerson: 'Nonna Maria & Angela Colucci',
    email: 'massaie@apulianexperience.it',
    phone: '+39 348 1122334',
    standardRate: 75,
    commissionPercent: 20,
    notes: 'Laboratori di pasta fresca pugliese, orecchiette col ferro e focaccia barese cotta nel forno a legna.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-25 10:00'
  },
  {
    id: 'sup-pizzica-folk',
    name: 'Compagnia Popolare Pizzica del Salento',
    category: 'EXPERIENCE',
    city: 'Lecce & Fasano',
    contactPerson: 'Maestro Antonio Castrignanò Staff',
    email: 'folk@pizzicasalento.it',
    phone: '+39 339 6677889',
    standardRate: 60,
    commissionPercent: 20,
    notes: 'Ensemble musicale con tamburelli, organetti e ballerini tradizionali in costume storico.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-26 15:30'
  },
  {
    id: 'sup-olio-frantoio',
    name: 'Frantoio Ipogeo & Olii Storici di Puglia',
    category: 'EXPERIENCE',
    city: 'Fasano / Ostuni',
    contactPerson: 'Dott. Gianfranco Latorre',
    email: 'degustazioni@frantoioipogeo.it',
    phone: '+39 340 9988776',
    standardRate: 50,
    commissionPercent: 25,
    notes: 'Frantoio secolare scavato nella roccia, degustazioni comparative di oli monocultivar e visita ulivi millenari.',
    accessPassword: 'fornitore2026',
    welcomeEmailSent: true,
    emailSentAt: '2026-08-27 11:15'
  }
];

// =========================================================================
// CATALOGO MASTER ESPERIENZE CONDIVISE (DISPONIBILI PER TUTTI I MATRIMONI)
// =========================================================================
export const INITIAL_MASTER_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'master-exp-1',
    title: 'Gita in Barca al Tramonto alle Grotte di Polignano',
    category: 'BOAT_TOUR',
    eventDate: '',
    startTime: '17:30 - 20:00',
    durationHours: 2.5,
    meetingPoint: 'Porto Turistico Cala Ponte, Polignano a Mare (BA)',
    pricePerPerson: 85,
    isHostSponsored: false,
    maxParticipants: 28,
    bookedParticipants: 0,
    dressCode: 'Resort Chic & Scarpe da barca',
    description: 'Tour in motoscafo d\'epoca tra le falesie calcaree e le grotte marine di Polignano con sosta bagno nella Grotta Palazzese, calici di Verdeca ghiacciata, focaccia barese calda e taralli al finocchietto.',
    supplierId: 'sup-boat-polignano',
    image: boatTourImg,
    negotiatedPerk: 'Aperitivo rinforzato con prosecco doc e tagliere tipico pugliese a bordo.'
  },
  {
    id: 'master-exp-2',
    title: 'Degustazione Vini DOC & Olio in Masseria Storica',
    category: 'WINE_TASTING',
    eventDate: '',
    startTime: '16:30 - 18:30',
    durationHours: 2.0,
    meetingPoint: 'Frantoio Ipogeo & Corte degli Ulivi, Fasano (BR)',
    pricePerPerson: 65,
    isHostSponsored: false,
    maxParticipants: 40,
    bookedParticipants: 0,
    dressCode: 'Casual Chic',
    description: 'Passeggiata tra gli ulivi millenari e l\'antico frantoio ipogeo del XVI secolo. Degustazione comparata di oli extravergine d\'oliva pluripremiati e calici di Primitivo di Manduria e Susumaniello abbinati a friselline e capocollo di Martina Franca.',
    supplierId: 'sup-masseria-torre',
    image: hotelSuiteImg,
    negotiatedPerk: 'Bottiglietta omaggio di olio extravergine d\'oliva monocultivar Coratina per ogni ospite.'
  },
  {
    id: 'master-exp-3',
    title: 'Cooking Class di Orecchiette e Focaccia con la Massaia',
    category: 'COOKING_CLASS',
    eventDate: '',
    startTime: '10:30 - 13:30',
    durationHours: 3.0,
    meetingPoint: 'Aia in pietra della Masseria, Savelletri di Fasano',
    pricePerPerson: 75,
    isHostSponsored: false,
    maxParticipants: 25,
    bookedParticipants: 0,
    dressCode: 'Comodo (Grembiuli forniti in loco)',
    description: 'Masterclass pratica e coinvolgente con le sapienti massaie pugliesi. Imparerete a stendere l\'impasto con semola rimacinata e a modellare con il coltello le autentiche orecchiette pugliesi e la focaccia con pomodorini di San Foca. A seguire pranzo conviviale con quanto preparato!',
    supplierId: 'sup-cooking-massaia',
    image: heroBanner,
    negotiatedPerk: 'Grembiule in lino personalizzato con nomi degli sposi in regalo.'
  },
  {
    id: 'master-exp-4',
    title: 'Notte Magica della Pizzica Salentina & Tamburellisti dal Vivo',
    category: 'PIZZICA_NIGHT',
    eventDate: '',
    startTime: '20:30 - 23:30',
    durationHours: 3.0,
    meetingPoint: 'Corte Grande della Masseria sotto le Luminarie',
    pricePerPerson: 60,
    isHostSponsored: false,
    maxParticipants: 60,
    bookedParticipants: 0,
    dressCode: 'Folk Chic & Scarpe comode per ballare',
    description: 'Festa di folklore pugliese autentico sotto il cielo stellato e le tradizionali luminarie salentine. Spettacolo con ensemble di tamburellisti, organetti e ballerini professionisti, con workshop introduttivo di passi di pizzica per tutti gli invitati.',
    supplierId: 'sup-pizzica-folk',
    image: heroBanner,
    negotiatedPerk: 'Tamburello artigianale decorato a mano regalato a ogni coppia di invitati.'
  },
  {
    id: 'master-exp-5',
    title: 'Tour tra gli Ulivi Millenari & Frantoio Ipogeo con Spuntino Rurale',
    category: 'OIL_TOUR',
    eventDate: '',
    startTime: '10:00 - 12:30',
    durationHours: 2.5,
    meetingPoint: 'Parco Naturale degli Ulivi Secolari, Fasano (BR)',
    pricePerPerson: 50,
    isHostSponsored: false,
    maxParticipants: 35,
    bookedParticipants: 0,
    dressCode: 'Casual & Scarpe da ginnastica',
    description: 'Camminata o pedalata tra gli ulivi monumentali protetti dall\'UNESCO, visita all\'antico mulino sotterraneo e spuntino campestre con panzerotti caldi, caciocavallo podolico e fichi mandorlati.',
    supplierId: 'sup-olio-frantoio',
    image: hotelSuiteImg,
    negotiatedPerk: 'Degustazione esclusiva di pane cotto a legna con tre varietà di oli novelli.'
  },
  {
    id: 'master-exp-6',
    title: 'Welcome Party & Sagra Pugliese con Casari dal Vivo',
    category: 'WELCOME_PARTY',
    eventDate: '',
    startTime: '19:00 - 23:00',
    durationHours: 4.0,
    meetingPoint: 'Piazza della Masseria / Borgo Antico',
    pricePerPerson: 95,
    isHostSponsored: false,
    maxParticipants: 80,
    bookedParticipants: 0,
    dressCode: 'Puglia Summer White & Linen',
    description: 'Festa di benvenuto pre-matrimonio in autentico stile sagra pugliese: banchi di casari che filano mozzarelle al momento, panzerotti fritti a vista, calici di rosato di Puglia e musica jazz/folk dal vivo.',
    supplierId: 'sup-borgo',
    image: boatTourImg,
    negotiatedPerk: 'Carretto vintage con gelati artigianali ai fichi e mandorle offerto per la chiusura serata.'
  }
];

export const MASTER_EXP_STORAGE_KEY = 'apulian_master_experiences_v1';

export function getSavedMasterExperiences(): ExperienceItem[] {
  try {
    const raw = localStorage.getItem(MASTER_EXP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

export function saveCustomMasterExperience(exp: ExperienceItem): void {
  try {
    const existing = getSavedMasterExperiences();
    const map = new Map<string, ExperienceItem>();
    existing.forEach(e => map.set(e.title.trim().toLowerCase(), e));
    map.set(exp.title.trim().toLowerCase(), exp);
    localStorage.setItem(MASTER_EXP_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
  } catch {}
}

export function getSharedExperiencesDatabase(
  weddings: WeddingData[] = [],
  customStored: ExperienceItem[] = [],
  packages: SupplierPackage[] = []
): ExperienceItem[] {
  const map = new Map<string, ExperienceItem>();

  // 1. Inserisci le esperienze master iniziali
  INITIAL_MASTER_EXPERIENCES.forEach(exp => {
    map.set(exp.title.trim().toLowerCase(), exp);
  });

  // 2. Inserisci le esperienze master personalizzate salvate in localStorage
  customStored.forEach(exp => {
    map.set(exp.title.trim().toLowerCase(), exp);
  });

  // 3. Raccogli e unifica tutte le esperienze salvate in ciascun matrimonio esistente
  weddings.forEach(w => {
    (w.experiences || []).forEach(exp => {
      const key = exp.title.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, exp);
      } else {
        // Se l'esperienza nel matrimonio ha dettagli aggiornati (o fornitore collegato), unisci le informazioni utili
        const existing = map.get(key)!;
        if (!existing.supplierId && exp.supplierId) {
          map.set(key, { ...existing, supplierId: exp.supplierId });
        }
      }
    });
  });

  // 4. Integra eventuali pacchetti esperienza creati dai fornitori
  packages.filter(p => p.category === 'EXPERIENCE').forEach(pkg => {
    const key = pkg.title.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: `pkg-exp-${pkg.id}`,
        title: pkg.title,
        category: 'BOAT_TOUR',
        eventDate: '',
        startTime: '17:30',
        durationHours: 2.5,
        meetingPoint: pkg.capacityOrAvailability || 'Puglia',
        pricePerPerson: pkg.pricePerUnit,
        isHostSponsored: false,
        maxParticipants: 30,
        bookedParticipants: 0,
        dressCode: 'Resort Chic',
        description: pkg.description,
        supplierId: pkg.supplierId,
        image: pkg.image,
        negotiatedPerk: pkg.negotiatedPerk || 'Tariffa e condizioni riservate tramite AD Marketing.'
      });
    }
  });

  return Array.from(map.values());
}

// Matrimonio Ufficiale
export const MONTECCHI_CAPULETI_WEDDING: WeddingData = {
  id: 'wed-montecchi-capuleti',
  weddingCode: 'MONTECCHI-CAPULETI-2026',
  coupleNames: 'Giulietta Capuleti & Romeo Montecchi',
  weddingDate: '2026-06-20',
  coupleEmail: 'giulietta@capuleti.it',
  couplePhone: '+39 340 1234567',
  venue: 'Castello di Verona',
  city: 'Verona (VR)',
  country: 'Italia',
  bannerImage: '',
  welcomeMessage: 'Benvenuti al nostro matrimonio eterno!',
  currency: 'EUR',
  conciergeEmail: 'info@admarketing.it',
  conciergePhone: '+39 099 8887766',
  conciergeWhatsApp: '+39 340 1234567',
  couplePassword: 'password123',
  hotels: [],
  transfers: [],
  experiences: [],
  extraServices: [],
  guests: [],
  giftRequests: [],
  notifications: [],
  weddingAlbumPhotos: [
    {
      id: 'album-photo-demo-1',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
      caption: 'Brindisi all\'arrivo nel cortile storico! 🥂',
      guestEmail: 'eleanor.vance@gmail.com',
      guestName: 'Eleanor Vance',
      uploadedAt: '20-06-2026 18:40',
      sizeBytes: 114500, // ~112 KB
      takenWithCamera: true
    },
    {
      id: 'album-photo-demo-2',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      caption: 'La sposa è meravigliosa! Momento dell\'ingresso',
      guestEmail: 'eleanor.vance@gmail.com',
      guestName: 'Eleanor Vance',
      uploadedAt: '20-06-2026 19:15',
      sizeBytes: 98400, // ~96 KB
      takenWithCamera: true
    },
    {
      id: 'album-photo-demo-3',
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
      caption: 'Tavolata magica sotto le stelle di Verona',
      guestEmail: 'william.sterling@barclays.co.uk',
      guestName: 'William Sterling',
      uploadedAt: '20-06-2026 21:30',
      sizeBytes: 105200, // ~103 KB
      takenWithCamera: false
    }
  ]
};

export const INITIAL_WEDDINGS: WeddingData[] = [MONTECCHI_CAPULETI_WEDDING];

// Richieste iniziali desideri ospiti
export const INITIAL_WISH_REQUESTS: TouristWishRequest[] = [
  {
    id: 'wish-montecchi-1',
    weddingCode: 'MONTECCHI-CAPULETI-2026',
    guestName: 'Eleanor Vance',
    guestEmail: 'eleanor.vance@gmail.com',
    guestPhone: '+1 312 555 0198',
    title: 'Noleggio Vespa vintage per tour tra gli ulivi millenari',
    description: 'Vorremmo noleggiare una Vespa PX 125 d\'epoca per esplorare la costa di Polignano e i trulli di Alberobello con consegna in masseria.',
    preferredDate: '2026-06-21',
    participantsCount: 2,
    budgetRange: '€150 - €250',
    status: 'RECEIVED',
    agencyNotes: 'Contattato fornitore partner Vintage Moto Puglia per consegna in masseria.',
    proposedCost: 160,
    createdAt: '2026-10-26 10:15'
  },
  {
    id: 'wish-montecchi-2',
    weddingCode: 'MONTECCHI-CAPULETI-2026',
    guestName: 'William & Charlotte Sterling',
    guestEmail: 'william.sterling@barclays.co.uk',
    guestPhone: '+44 20 7946 0888',
    title: 'Giro privato in catamarano al tramonto a Polignano a Mare',
    description: 'Siamo in 6 persone e vorremmo riservare un catamarano privato per un tour di 3 ore lungo le grotte di Polignano a Mare con prosecco e focaccia calda.',
    preferredDate: '2026-06-22',
    participantsCount: 6,
    budgetRange: '€400 - €600',
    status: 'PROPOSAL_READY',
    agencyNotes: 'Opzionata imbarcazione d\'epoca Cala Ponte Yachting con skipper e aperitivo sfizioso.',
    proposedCost: 480,
    createdAt: '2026-10-26 16:30'
  },
  {
    id: 'wish-chiara-1',
    weddingCode: 'CHIARA-MATTEO-2026',
    guestName: 'James & Sarah Kensington',
    guestEmail: 'james.kensington@londonlaw.co.uk',
    guestPhone: '+44 20 7946 0199',
    title: 'Noleggio Vespa d\'epoca per tour della Valle d\'Itria',
    description: 'Vorremmo noleggiare una Vespa vintage 125 per il giorno 14 Settembre per esplorare i trulli di Alberobello e Locorotondo in autonomia. È possibile averla con consegna direttamente in masseria con due caschi?',
    preferredDate: '2026-09-14',
    participantsCount: 2,
    budgetRange: '€150 - €250',
    status: 'PROPOSAL_READY',
    agencyNotes: 'Contattato fornitore Vintage Apulia Moto a Martina Franca. Disponibile Vespa PX 125 color crema con consegna in masseria a €160/giorno inclusa assicurazione kasko.',
    proposedCost: 160,
    createdAt: '2026-10-05 14:22'
  }
];

// Messaggi iniziali chat con Valeria
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    weddingCode: 'CHIARA-MATTEO-2026',
    guestName: 'Aidan & Clodagh Murphy',
    guestEmail: 'aidan.murphy@dublin.ie',
    sender: 'valeria',
    text: 'Buongiorno Aidan e Clodagh! Sono Valeria, la vostra assistente personale per il matrimonio di Chiara e Matteo a Borgo Egnazia. Sono qui per qualsiasi informazione su orari navette, prenotazioni o consigli sul vostro soggiorno in Puglia!',
    timestamp: '2026-10-06 10:00',
    readByAdmin: true
  },
  {
    id: 'chat-2',
    weddingCode: 'CHIARA-MATTEO-2026',
    guestName: 'Aidan & Clodagh Murphy',
    guestEmail: 'aidan.murphy@dublin.ie',
    sender: 'guest',
    text: 'Ciao Valeria, grazie mille! Il nostro volo Aer Lingus atterra a Bari alle 10:45. La navetta delle 11:30 ci aspetterà se c\'è un piccolo ritardo nel ritiro bagagli?',
    timestamp: '2026-10-06 10:14',
    readByAdmin: true
  },
  {
    id: 'chat-3',
    weddingCode: 'CHIARA-MATTEO-2026',
    guestName: 'Aidan & Clodagh Murphy',
    guestEmail: 'aidan.murphy@dublin.ie',
    sender: 'valeria',
    text: 'Assolutamente sì! Il nostro autista Pasquale monitora il vostro volo in tempo reale sul tabellone aeroportuale. Vi aspetterà all\'uscita con il cartello con il vostro nome. Sarete comodissimi!',
    timestamp: '2026-10-06 10:20',
    readByAdmin: true
  }
];

// Richieste di pagamento iniziali
export const INITIAL_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: 'pay-req-1',
    weddingCode: 'CHIARA-MATTEO-2026',
    guestName: 'James & Sarah Kensington',
    guestEmail: 'james.kensington@londonlaw.co.uk',
    amount: 345,
    currency: 'EUR',
    items: [
      { description: 'NCC Privato Dedicato Aeroporto Bari -> Savelletri', amount: 180 },
      { description: 'Gita in Barca a Polignano a Mare (2 pax)', amount: 85 },
      { description: 'Acconciatura & Hair Styling Cerimonia', amount: 80 }
    ],
    status: 'SENT',
    sentAt: '2026-10-06 16:30',
    paymentMethod: 'STRIPE_LINK',
    invoiceCode: 'INV-2026-089'
  }
];

// Pacchetti Iniziali inseriti dai Fornitori e pronti per l'Agenzia
export const INITIAL_SUPPLIER_PACKAGES: SupplierPackage[] = [
  {
    id: 'pkg-borgo-1',
    supplierId: 'sup-borgo',
    supplierName: 'Borgo Egnazia Resort & Spa',
    supplierEmail: 'booking@borgoegnazia.it',
    supplierPhone: '+39 080 225500',
    title: 'Pacchetto Camere Corte & Borgo Luxury',
    category: 'HOTEL',
    description: 'Blocco camere deluxe e suite riservate per invitati con prima colazione mediterranea, accesso alla Spa Vair, transfer golf cart all\'interno del resort e cancellazione flessibile.',
    pricePerUnit: 520,
    currency: 'EUR',
    commissionPercent: 12,
    capacityOrAvailability: '25 Camere disponibili per blocco',
    includedFeatures: ['Colazione a buffet inclusa', 'Accesso Vair Spa', 'Parcheggio VIP', 'Concierge dedicato in loco'],
    image: hotelSuiteImg,
    notesForAgency: 'Tariffa netta concordata per matrimoni gestiti da AD Marketing. Possibilità di opzione fino a 45 giorni prima.',
    createdAt: '2026-10-01'
  },
  {
    id: 'pkg-ncc-1',
    supplierId: 'sup-ncc-puglia',
    supplierName: 'Apulia VIP Transfer & NCC',
    supplierEmail: 'info@apuliaviptransfer.it',
    supplierPhone: '+39 338 9090123',
    title: 'Pacchetto Flotta Navette Aeroportuali Bari / Brindisi',
    category: 'TRANSFER',
    description: 'Servizio di navetta collettiva e trasferimenti privati NCC con Mercedes Classe V e Sprinter Luxury. Include accoglienza con cartello personalizzato con i nomi degli sposi, monitoraggio voli in tempo reale e acqua minerale a bordo.',
    pricePerUnit: 35,
    currency: 'EUR',
    commissionPercent: 20,
    capacityOrAvailability: 'Fino a 8 van contemporanei (64 pax/ora)',
    includedFeatures: ['Monitoraggio volo live', 'Cartello di benvenuto sposi', 'Autisti parlanti inglese', 'Assicurazione totale bagagli'],
    notesForAgency: 'Tariffa speciale €35/persona per navette collettive, €180 per NCC privato esclusivo.',
    createdAt: '2026-10-02'
  },
  {
    id: 'pkg-boat-1',
    supplierId: 'sup-boat-polignano',
    supplierName: 'Polignano Sea Charters & Riva Yachts',
    supplierEmail: 'donato@seacharters.it',
    supplierPhone: '+39 347 5544332',
    title: 'Sunset Cruise Grotte di Polignano & Aperitivo a Bordo',
    category: 'EXPERIENCE',
    description: 'Tour in motoscafo d\'epoca e gozzi marinari per gli ospiti del matrimonio. Sosta tuffo nella Grotta Palazzese, aperitivo con calici di vino Verdeca locale, focaccia calda barese e tagliere di formaggi tipici al tramonto.',
    pricePerUnit: 85,
    currency: 'EUR',
    commissionPercent: 25,
    capacityOrAvailability: '2 gozzi da 14 posti (totale 28 persone)',
    includedFeatures: ['Skipper professionista', 'Aperitivo e vino inclusi', 'Teli mare e maschere snorkeling', 'Musica personalizzabile'],
    image: boatTourImg,
    notesForAgency: 'Orario ideale 17:30 - 20:00. Partenza dal porto di Polignano (Cala Ponte Marina).',
    createdAt: '2026-10-03'
  },
  {
    id: 'pkg-glam-1',
    supplierId: 'sup-beauty-glam',
    supplierName: 'Apulian Bridal & Guest Glam Team',
    supplierEmail: 'chiara@apulianglam.it',
    supplierPhone: '+39 349 7788990',
    title: 'Servizio Beauty & Hair Styling a Domicilio in Masseria',
    category: 'BEAUTY_HAIR',
    description: 'Team di truccatrici e hairstylist professioniste dedicate alle invitate. Sessioni personalizzate direttamente nelle camere dell\'hotel con prodotti professionali a lunga tenuta water-resistant e pieghe resistenti all\'umidità estiva.',
    pricePerUnit: 90,
    currency: 'EUR',
    commissionPercent: 18,
    capacityOrAvailability: 'Fino a 20 invitate preparate in contemporanea',
    includedFeatures: ['Make-up long-lasting', 'Kit ritocco labbra omaggio', 'Servizio in camera hotel', 'Orari coordinati con la cerimonia'],
    notesForAgency: 'Pacchetto combinato trucco + acconciatura a €160 anziché €170 se prenotati insieme.',
    createdAt: '2026-10-04'
  }
];

// Prenotazioni inviate dagli ospiti e ricevute sulla email dei fornitori
export const INITIAL_SUPPLIER_BOOKINGS: SupplierBookingOrder[] = [
  {
    id: 'ord-sup-1',
    supplierId: 'sup-ncc-puglia',
    supplierName: 'Apulia VIP Transfer & NCC',
    supplierEmail: 'info@apuliaviptransfer.it',
    weddingCode: 'CHIARA-MATTEO-2026',
    coupleNames: 'Chiara Rossi & Matteo De Luca',
    guestName: 'James & Sarah Kensington',
    guestEmail: 'james.kensington@londonlaw.co.uk',
    guestPhone: '+44 20 7946 0199',
    serviceTitle: 'NCC Privato Dedicato con Autista (Qualsiasi Orario/Aeroporto)',
    serviceCategory: 'TRANSFER',
    dateRequested: '2026-09-11 13:15',
    participantsOrQuantity: 2,
    totalAmount: 180,
    currency: 'EUR',
    guestNotes: 'Volo British Airways BA2602 atterra a Bari alle 13:15. 2 bagagli grandi e porta-abito da cerimonia.',
    status: 'RECEIVED',
    paymentMethodChosen: 'SUPPLIER_BANK_TRANSFER',
    paymentNotes: 'In attesa di bonifico diretto da parte del cliente su IBAN fornitore.',
    emailSentToSupplierAt: '2026-10-06 14:10'
  },
  {
    id: 'ord-sup-2',
    supplierId: 'sup-boat-polignano',
    supplierName: 'Polignano Sea Charters & Riva Yachts',
    supplierEmail: 'donato@seacharters.it',
    weddingCode: 'CHIARA-MATTEO-2026',
    coupleNames: 'Chiara Rossi & Matteo De Luca',
    guestName: 'James & Sarah Kensington',
    guestEmail: 'james.kensington@londonlaw.co.uk',
    guestPhone: '+44 20 7946 0199',
    serviceTitle: 'Gita in Barca & Calice al Tramonto tra le Grotte di Polignano a Mare',
    serviceCategory: 'EXPERIENCE',
    dateRequested: '2026-09-10 17:30',
    participantsOrQuantity: 2,
    totalAmount: 170,
    currency: 'EUR',
    guestNotes: 'Preferenza per barca in legno tradizionale.',
    status: 'CONFIRMED',
    paymentMethodChosen: 'DIRECT_AT_CHECKIN',
    paymentNotes: 'Confermato. Il cliente salderà direttamente all\'imbarco prima della partenza in contanti o carta.',
    emailSentToSupplierAt: '2026-10-06 14:15',
    supplierResponseDate: '2026-10-06 15:00'
  },
  {
    id: 'ord-sup-3',
    supplierId: 'sup-borgo',
    supplierName: 'Borgo Egnazia Resort & Spa',
    supplierEmail: 'booking@borgoegnazia.it',
    weddingCode: 'CHIARA-MATTEO-2026',
    coupleNames: 'Chiara Rossi & Matteo De Luca',
    guestName: 'Aidan & Clodagh Murphy',
    guestEmail: 'aidan.murphy@dublin.ie',
    guestPhone: '+353 1 496 0000',
    serviceTitle: 'Corte Bella Suite (Vista Ulivi) - 3 Notti',
    serviceCategory: 'HOTEL',
    dateRequested: '2026-09-10 / 2026-09-13',
    participantsOrQuantity: 1,
    totalAmount: 1560,
    currency: 'EUR',
    guestNotes: 'Letto matrimoniale king size, check-in anticipato se possibile.',
    status: 'CONFIRMED',
    paymentMethodChosen: 'AGENCY_CENTRAL_BILLING',
    paymentNotes: 'Camera confermata e garantita tramite convenzione agenzia AD Marketing.',
    emailSentToSupplierAt: '2026-10-05 18:20',
    supplierResponseDate: '2026-10-05 19:10'
  }
];

// Credenziali amministrative per l'accesso Agenzia AD Marketing
export const ADMIN_CREDENTIALS = {
  email: 'info@admarketing.it',
  alternativeEmail: 'admin@weddingconcierge.it',
  password: 'admin2026',
  name: 'Staff Concierge AD Marketing (Valeria)',
  role: 'CHIEF_CONCIERGE'
};
