import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Building2, 
  Car, 
  Compass, 
  MessageCircle, 
  Phone, 
  Mail, 
  Globe, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Printer, 
  Download, 
  ShieldCheck, 
  Info, 
  Scissors, 
  Wine, 
  Anchor, 
  Camera, 
  Clock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  X
} from 'lucide-react';
import { CoupleOnboardingDossier, AdminSettings } from '../data/weddingStore';
import heroBanner from '../assets/images/wedding_concierge_hero_1791309110090.jpg';
import hotelSuiteImg from '../assets/images/wedding_hotel_suite_1791309120679.jpg';
import boatTourImg from '../assets/images/wedding_boat_experience_1791309131765.jpg';

interface CoupleOnboardingLandingProps {
  adminSettings: AdminSettings;
  onSubmitDossier: (dossier: CoupleOnboardingDossier) => Promise<boolean> | boolean;
  onNavigateHome?: () => void;
  onPreviewPortal?: () => void;
}

export default function CoupleOnboardingLanding({
  adminSettings,
  onSubmitDossier,
  onNavigateHome,
  onPreviewPortal
}: CoupleOnboardingLandingProps) {
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<CoupleOnboardingDossier | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CoupleOnboardingDossier>>({
    brideName: '',
    groomName: '',
    coupleEmail: '',
    phoneWhatsapp: '',
    residenceCityCountry: '',
    preferredLanguage: 'it',
    weddingDate: '',
    eventDuration: 'MULTIDAY_3PLUS',
    datesDetails: '',
    venueLocation: '',
    ceremonyTypeAndLocation: '',
    weddingPlannerName: '',
    estimatedGuestsCount: 90,
    outOfTownGuestsCount: 70,
    mainArrivalHubs: ['Aeroporto di Bari Karol Wojtyla (BRI)'],
    hotelAssistanceNeeded: 'YES',
    shuttleWeddingDayNeeded: 'YES',
    airportTransfersNeeded: 'YES',
    requestedServices: [
      'GUEST_CONCIERGE_CHAT',
      'WEB_APP_PORTAL',
      'HOTEL_ROOM_BLOCKS',
      'WEDDING_SHUTTLES',
      'AIRPORT_NCC'
    ],
    requestedExperiences: [
      'BOAT_TOUR_POLIGNANO',
      'WINE_OIL_TASTING'
    ],
    desiredVibe: 'Autentico, elegante e festoso, con atmosfera calda pugliese tra ulivi e muretti a secco',
    specialNotesForValeria: '',
    kickoffCallChannel: 'WHATSAPP',
    kickoffCallTime: 'AFTERNOON'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Helper toggle array
  const toggleArrayItem = (field: 'mainArrivalHubs' | 'requestedServices' | 'requestedExperiences', item: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.brideName?.trim()) errors.brideName = lang === 'it' ? 'Inserisci il nome della sposa' : 'Bride name is required';
      if (!formData.groomName?.trim()) errors.groomName = lang === 'it' ? 'Inserisci il nome dello sposo' : 'Groom name is required';
      if (!formData.coupleEmail?.trim() || !formData.coupleEmail.includes('@')) {
        errors.coupleEmail = lang === 'it' ? 'Inserisci un\'email valida' : 'Valid email is required';
      }
      if (!formData.phoneWhatsapp?.trim()) errors.phoneWhatsapp = lang === 'it' ? 'Inserisci un recapito WhatsApp' : 'WhatsApp number is required';
    } else if (step === 2) {
      if (!formData.weddingDate?.trim()) errors.weddingDate = lang === 'it' ? 'Seleziona la data del matrimonio' : 'Wedding date is required';
      if (!formData.venueLocation?.trim()) errors.venueLocation = lang === 'it' ? 'Indica la location o masseria' : 'Venue/Masseria is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) {
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);
    const fullDossier: CoupleOnboardingDossier = {
      id: `onboard-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'NEW',
      brideName: formData.brideName?.trim() || '',
      groomName: formData.groomName?.trim() || '',
      coupleEmail: formData.coupleEmail?.trim() || '',
      phoneWhatsapp: formData.phoneWhatsapp?.trim() || '',
      residenceCityCountry: formData.residenceCityCountry?.trim() || (lang === 'it' ? 'Italia' : 'International'),
      preferredLanguage: lang,
      weddingDate: formData.weddingDate || '',
      eventDuration: formData.eventDuration || 'MULTIDAY_3PLUS',
      datesDetails: formData.datesDetails?.trim() || '',
      venueLocation: formData.venueLocation?.trim() || '',
      ceremonyTypeAndLocation: formData.ceremonyTypeAndLocation?.trim() || '',
      weddingPlannerName: formData.weddingPlannerName?.trim() || '',
      estimatedGuestsCount: Number(formData.estimatedGuestsCount) || 80,
      outOfTownGuestsCount: Number(formData.outOfTownGuestsCount) || 60,
      mainArrivalHubs: formData.mainArrivalHubs || ['Bari BRI'],
      hotelAssistanceNeeded: formData.hotelAssistanceNeeded || 'YES',
      shuttleWeddingDayNeeded: formData.shuttleWeddingDayNeeded || 'YES',
      airportTransfersNeeded: formData.airportTransfersNeeded || 'YES',
      requestedServices: formData.requestedServices || [],
      requestedExperiences: formData.requestedExperiences || [],
      desiredVibe: formData.desiredVibe?.trim() || '',
      specialNotesForValeria: formData.specialNotesForValeria?.trim() || '',
      kickoffCallChannel: formData.kickoffCallChannel || 'WHATSAPP',
      kickoffCallTime: formData.kickoffCallTime || 'AFTERNOON'
    };

    try {
      await onSubmitDossier(fullDossier);
      setSubmittedData(fullDossier);
      setIsSubmitted(true);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err) {
      console.error('Errore invio dossier onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const valeriaPhoneClean = (adminSettings.valeriaPhone || '+39 340 1234567').replace(/\s+/g, '');
  const valeriaWhatsAppUrl = `https://wa.me/${valeriaPhoneClean.replace('+', '')}?text=${encodeURIComponent(
    lang === 'it'
      ? `Ciao Valeria! Sono ${formData.brideName || 'la sposa'}, abbiamo appena inviato il questionario di benvenuto per le nostre nozze con Apulian Wedding Concierge ✨ Non vediamo l'ora di conoscerti!`
      : `Hi Valeria! This is ${formData.brideName || 'the bride'}, we just completed our onboarding questionnaire with Apulian Wedding Concierge ✨ Excited to speak with you!`
  )}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-900 selection:text-white pb-20">
      
      {/* 1. TOP NAV / BARRA BRAND */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center font-serif-luxury font-bold text-lg shadow-sm border border-stone-800">
              P
            </div>
            <div>
              <span className="text-lg font-serif-luxury font-bold tracking-tight text-stone-900 block leading-tight">
                Apulian Wedding Concierge
              </span>
              <span className="text-[10px] text-amber-800 uppercase tracking-widest font-semibold block">
                AD Marketing Palagianello · Bespoke Hospitality
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lingua Switcher */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setLang('it')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  lang === 'it' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                🇮🇹 IT
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <span>Accedi all'App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO PRINCIPALE */}
      <section className="relative overflow-hidden bg-stone-900 text-white pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
          <img 
            src={heroBanner} 
            alt="Puglia Wedding Masseria" 
            className="w-full h-full object-cover object-center filter saturate-120"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent z-0" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'it' ? 'Bespoke Wedding Concierge in Puglia' : 'Bespoke Wedding Concierge in Puglia'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold tracking-tight text-[#FAF7F2] leading-tight">
            {lang === 'it' 
              ? 'Il vostro matrimonio da sogno in Puglia inizia qui' 
              : 'Your dream wedding in Puglia starts right here'}
          </h1>

          <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
            {lang === 'it'
              ? 'Un caloroso benvenuto da Valeria e dal team di Apulian Wedding Concierge. Siamo al vostro fianco per rendere l\'esperienza vostra e dei vostri ospiti indimenticabile, senza pensieri e ricca di magia pugliese.'
              : 'A warm welcome from Valeria and the Apulian Wedding Concierge team. We are by your side to make your celebration and your guests\' stay flawless, seamless and truly memorable.'}
          </p>

          {/* Badge di rassicurazione Valeria */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-amber-200">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/15">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'it' ? 'Concierge Dedicato H24' : '24/7 Dedicated Concierge'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/15">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'it' ? 'Blocchi Hotel in Masseria' : 'Curated Hotel Room Blocks'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/15">
              <Car className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'it' ? 'Transfer & Navette NCC' : 'Private Airport Transfers'}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. LETTERA DI BENVENUTO DA VALERIA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE4DC] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="shrink-0 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 text-white flex items-center justify-center font-serif-luxury font-bold text-3xl shadow-md border-2 border-white">
              V
            </div>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wide">
              Concierge Lead
            </span>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-xl font-serif-luxury font-bold text-stone-900">
                {lang === 'it' ? 'Un messaggio personale da Valeria' : 'A personal note from Valeria'}
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                AD Marketing S.r.l.s. · Palagianello (TA)
              </span>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed italic">
              {lang === 'it' ? (
                <>
                  "Cari futuri sposi, organizzare un matrimonio in Puglia con ospiti che arrivano da altre regioni o dall'estero è un'avventura magnifica. Il mio compito è sollevarvi da ogni fatica logistica: dalla ricerca dei migliori hotel convenzionati, all'accoglienza in aeroporto con navette dedicate, fino a tour in barca a Polignano ed esperienze tra gli ulivi secolari. Compilando questo questionario in pochi minuti, mi darete tutti gli elementi necessari per preparare il vostro <strong>Wedding Portal personalizzato</strong> e avviare l'accoglienza per i vostri invitati."
                </>
              ) : (
                <>
                  "Dear future newlyweds, hosting your wedding in Puglia with loved ones traveling from afar is truly magical. My role is to lift all logistical weight from your shoulders: negotiating partner hotel room blocks, airport private shuttles, wedding-day mobility, and unforgettable experiences. Taking just 3 minutes to share your vision will allow me to create your <strong>custom Wedding Portal</strong> and kick off services for your guests."
                </>
              )}
            </p>

            <div className="pt-1 flex items-center gap-4 text-xs font-semibold text-stone-700">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {adminSettings.valeriaPhone || '+39 340 1234567'}</span>
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">
                {adminSettings.adminNotificationEmail}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MODULO INTERATTIVO O SCHERMATA DI SUCCESSO */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        {!isSubmitted ? (
          <div className="bg-white rounded-3xl border border-[#EAE4DC] shadow-lg overflow-hidden">
            
            {/* Header del Form con Stepper */}
            <div className="bg-[#FAF8F5] p-6 border-b border-[#EAE4DC]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    {lang === 'it' ? 'Questionario di Kickoff' : 'Kickoff Questionnaire'}
                  </span>
                  <h3 className="text-xl font-bold font-serif-luxury text-stone-900 mt-0.5">
                    {lang === 'it' ? 'I dettagli per configurare il vostro matrimonio' : 'Details to set up your wedding portal'}
                  </h3>
                </div>
                <div className="text-xs font-medium text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-200 self-start sm:self-auto shadow-2xs">
                  {lang === 'it' ? `Passo ${activeStep} di 5` : `Step ${activeStep} of 5`}
                </div>
              </div>

              {/* Progress Steps Bar */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, label: lang === 'it' ? 'La Coppia' : 'Couple' },
                  { step: 2, label: lang === 'it' ? 'Date & Luogo' : 'Dates & Place' },
                  { step: 3, label: lang === 'it' ? 'Ospiti & Voli' : 'Guests & Travel' },
                  { step: 4, label: lang === 'it' ? 'Servizi Desiderati' : 'Services' },
                  { step: 5, label: lang === 'it' ? 'Visione & Note' : 'Vision & Notes' }
                ].map(item => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      if (item.step < activeStep || validateStep(activeStep)) {
                        setActiveStep(item.step);
                      }
                    }}
                    className={`text-left p-2 rounded-xl transition-all ${
                      activeStep === item.step
                        ? 'bg-stone-900 text-white shadow-xs'
                        : activeStep > item.step
                        ? 'bg-amber-100/70 text-amber-900 border border-amber-200'
                        : 'bg-white/80 text-stone-400 border border-stone-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      Step {item.step}
                    </div>
                    <div className="text-xs font-semibold truncate">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Corpo del Form per Step */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

              {/* STEP 1: LA COPPIA & CONTATTI */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-100 pb-3">
                    <h4 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span>{lang === 'it' ? '1. Chi sono i meravigliosi sposi?' : '1. Who are the wonderful newlyweds?'}</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {lang === 'it' 
                        ? 'I vostri nomi compariranno sul portale degli ospiti, sulle schede di benvenuto e nelle comunicazioni con i fornitori.'
                        : 'Your names will appear on the guest portal, welcome itineraries, and supplier communications.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Nome Sposa / Partner 1 *' : 'Bride / Partner 1 First Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brideName || ''}
                        onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                        placeholder={lang === 'it' ? 'es. Chiara' : 'e.g. Eleanor'}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-800 ${
                          formErrors.brideName ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50'
                        }`}
                      />
                      {formErrors.brideName && (
                        <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.brideName}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Nome Sposo / Partner 2 *' : 'Groom / Partner 2 First Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.groomName || ''}
                        onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                        placeholder={lang === 'it' ? 'es. Matteo' : 'e.g. Liam'}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-800 ${
                          formErrors.groomName ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50'
                        }`}
                      />
                      {formErrors.groomName && (
                        <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.groomName}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Email Principale della Coppia *' : 'Primary Couple Email *'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={formData.coupleEmail || ''}
                          onChange={(e) => setFormData({ ...formData, coupleEmail: e.target.value })}
                          placeholder="chiara.matteo2026@gmail.com"
                          className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-800 ${
                            formErrors.coupleEmail ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50'
                          }`}
                        />
                      </div>
                      {formErrors.coupleEmail && (
                        <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.coupleEmail}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Numero WhatsApp di riferimento (con prefisso) *' : 'WhatsApp Contact (with country code) *'}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={formData.phoneWhatsapp || ''}
                          onChange={(e) => setFormData({ ...formData, phoneWhatsapp: e.target.value })}
                          placeholder="+39 340 1234567 / +44 7911 123456"
                          className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-800 ${
                            formErrors.phoneWhatsapp ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50'
                          }`}
                        />
                      </div>
                      {formErrors.phoneWhatsapp && (
                        <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.phoneWhatsapp}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Città e Paese di residenza' : 'City & Country of Residence'}
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={formData.residenceCityCountry || ''}
                          onChange={(e) => setFormData({ ...formData, residenceCityCountry: e.target.value })}
                          placeholder={lang === 'it' ? 'es. Milano, Italia' : 'e.g. London, UK / New York, USA'}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Lingua preferita per le comunicazioni' : 'Preferred Language'}
                      </label>
                      <select
                        value={formData.preferredLanguage || 'it'}
                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      >
                        <option value="it">🇮🇹 Italiano (Italian)</option>
                        <option value="en">🇬🇧 English (International)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE & LOCATION DELLE NOZZE */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-100 pb-3">
                    <h4 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-800" />
                      <span>{lang === 'it' ? '2. Quando e dove festeggerete in Puglia?' : '2. When and where will you celebrate?'}</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {lang === 'it'
                        ? 'Indicate la data principale e la masseria o zona scelta per permetterci di selezionare gli hotel e i percorsi navetta ideali.'
                        : 'Provide your wedding date and venue to help us identify nearby partner hotels and optimize transfer routes.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Data Principale del Matrimonio *' : 'Main Wedding Date *'}
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.weddingDate || ''}
                        onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-800 ${
                          formErrors.weddingDate ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50'
                        }`}
                      />
                      {formErrors.weddingDate && (
                        <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.weddingDate}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Durata / Struttura dell\'Evento' : 'Event Format'}
                      </label>
                      <select
                        value={formData.eventDuration || 'MULTIDAY_3PLUS'}
                        onChange={(e) => setFormData({ ...formData, eventDuration: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      >
                        <option value="SINGLE_DAY">
                          {lang === 'it' ? 'Giorno Singolo (Cerimonia & Ricevimento)' : 'Single Day (Ceremony & Reception)'}
                        </option>
                        <option value="WEEKEND_2DAYS">
                          {lang === 'it' ? 'Weekend di nozze (2 giorni: es. Welcome Dinner + Nozze)' : '2-Day Wedding (e.g. Welcome Dinner + Wedding)'}
                        </option>
                        <option value="MULTIDAY_3PLUS">
                          {lang === 'it' ? 'Multi-Day Wedding Experience (3+ giorni: Welcome, Nozze, Pool/Pizza Party)' : 'Multi-Day Experience (3+ days: Welcome, Wedding, Pool Party)'}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'it' ? 'Location Principale / Masseria del Ricevimento *' : 'Main Reception Venue / Masseria *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.venueLocation || ''}
                      onChange={(e) => setFormData({ ...formData, venueLocation: e.target.value })}
                      placeholder={lang === 'it' ? 'es. Masseria San Domenico (Savelletri) / Borgo Egnazia / Pettolecchia / Valle d\'Itria' : 'e.g. Masseria San Domenico / Borgo Egnazia / Pettolecchia'}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-800 ${
                        formErrors.venueLocation ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50'
                      }`}
                    />
                    {formErrors.venueLocation && (
                      <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.venueLocation}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Luogo e tipo di Cerimonia' : 'Ceremony Type & Location'}
                      </label>
                      <input
                        type="text"
                        value={formData.ceremonyTypeAndLocation || ''}
                        onChange={(e) => setFormData({ ...formData, ceremonyTypeAndLocation: e.target.value })}
                        placeholder={lang === 'it' ? 'es. Rito simbolico in masseria / Chiesa a Monopoli' : 'e.g. Symbolic on site / Catholic church in town'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Wedding Planner (se già presente)' : 'Wedding Planner (if appointed)'}
                      </label>
                      <input
                        type="text"
                        value={formData.weddingPlannerName || ''}
                        onChange={(e) => setFormData({ ...formData, weddingPlannerName: e.target.value })}
                        placeholder={lang === 'it' ? 'es. Nome agenzia planner o "Nessuno"' : 'e.g. Planner name or agency'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'it' ? 'Dettagli programma o date collaterali previste' : 'Program Details & Secondary Events'}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.datesDetails || ''}
                      onChange={(e) => setFormData({ ...formData, datesDetails: e.target.value })}
                      placeholder={lang === 'it' 
                        ? 'es. Giovedì 18: Welcome drink serale a Polignano. Venerdì 19: Nozze ore 17:00. Sabato 20: Pizza party in piscina ore 13:00.'
                        : 'e.g. Thursday: Sunset Welcome cocktail. Friday: Ceremony at 5pm. Saturday: Farewell Pizza & Pool party.'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: OSPITI & LOGISTICA DI VIAGGIO */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-100 pb-3">
                    <h4 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>{lang === 'it' ? '3. Gli Ospiti & la Logistica di Viaggio' : '3. Guests & Travel Logistics'}</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {lang === 'it'
                        ? 'Ci prendiamo cura dell\'accoglienza dei vostri invitati: arrivi in aeroporto, alloggi e navette.'
                        : 'We take care of your guests from the moment they land: airport arrivals, hotel blocks, and shuttles.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Numero Totale Stimato di Invitati' : 'Estimated Total Guest Count'}
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={500}
                        value={formData.estimatedGuestsCount || 80}
                        onChange={(e) => setFormData({ ...formData, estimatedGuestsCount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Di cui da fuori Puglia / dall\'Estero' : 'Of which Traveling from Abroad / Out of Region'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={500}
                        value={formData.outOfTownGuestsCount || 60}
                        onChange={(e) => setFormData({ ...formData, outOfTownGuestsCount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      {lang === 'it' ? 'Aeroporti e Hub di arrivo previsti per gli ospiti' : 'Expected Arrival Hubs'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        'Aeroporto di Bari Karol Wojtyla (BRI)',
                        'Aeroporto di Brindisi Casale (BDS)',
                        'Stazioni Ferroviarie Frecce (Bari/Brindisi)',
                      ].map(hub => {
                        const isSelected = (formData.mainArrivalHubs || []).includes(hub);
                        return (
                          <button
                            key={hub}
                            type="button"
                            onClick={() => toggleArrayItem('mainArrivalHubs', hub)}
                            className={`p-3 rounded-xl border text-xs text-left font-medium flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-amber-900 text-white border-amber-900 shadow-2xs'
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            <span>{hub}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                      <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                        <Building2 className="w-4 h-4 text-amber-800" />
                        <span>{lang === 'it' ? 'Blocco Camere Hotel' : 'Hotel Room Blocks'}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        {lang === 'it' ? 'Volete che negoziamo tariffe agevolate in strutture vicine?' : 'Want us to negotiate hotel room blocks?'}
                      </p>
                      <select
                        value={formData.hotelAssistanceNeeded || 'YES'}
                        onChange={(e) => setFormData({ ...formData, hotelAssistanceNeeded: e.target.value as any })}
                        className="w-full p-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold"
                      >
                        <option value="YES">{lang === 'it' ? 'Sì, fondamentale' : 'Yes, essential'}</option>
                        <option value="PARTIAL">{lang === 'it' ? 'In parte / solo consigli' : 'Partial / recommendations'}</option>
                        <option value="NO">{lang === 'it' ? 'No, gestiscono da soli' : 'No, self-managed'}</option>
                      </select>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                      <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                        <Car className="w-4 h-4 text-amber-800" />
                        <span>{lang === 'it' ? 'Navette Giorno Nozze' : 'Wedding Day Shuttles'}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        {lang === 'it' ? 'Navette tra gli hotel degli ospiti e la masseria?' : 'Shuttles between hotels and venue?'}
                      </p>
                      <select
                        value={formData.shuttleWeddingDayNeeded || 'YES'}
                        onChange={(e) => setFormData({ ...formData, shuttleWeddingDayNeeded: e.target.value as any })}
                        className="w-full p-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold"
                      >
                        <option value="YES">{lang === 'it' ? 'Sì, molto consigliato' : 'Yes, highly recommended'}</option>
                        <option value="MAYBE">{lang === 'it' ? 'Da valutare con preventivo' : 'Maybe, need quotes'}</option>
                        <option value="NO">{lang === 'it' ? 'No, si muovono con auto' : 'No, private cars'}</option>
                      </select>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                      <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                        <Compass className="w-4 h-4 text-amber-800" />
                        <span>{lang === 'it' ? 'Transfer Aeroporto NCC' : 'Airport NCC Transfers'}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        {lang === 'it' ? 'Transfer privati per voi o per invitati VIP all\'arrivo?' : 'Private airport vans for VIP guests?'}
                      </p>
                      <select
                        value={formData.airportTransfersNeeded || 'YES'}
                        onChange={(e) => setFormData({ ...formData, airportTransfersNeeded: e.target.value as any })}
                        className="w-full p-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold"
                      >
                        <option value="YES">{lang === 'it' ? 'Sì, servizio utile' : 'Yes, very useful'}</option>
                        <option value="MAYBE">{lang === 'it' ? 'Solo su richiesta ospiti' : 'Only on guest request'}</option>
                        <option value="NO">{lang === 'it' ? 'Non necessario' : 'Not needed'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SERVIZI CONCIERGE & ESPERIENZE DESIDERATE */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-100 pb-3">
                    <h4 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-800" />
                      <span>{lang === 'it' ? '4. Quali servizi volete offrire ai vostri invitati?' : '4. Which concierge services would you like to offer?'}</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {lang === 'it'
                        ? 'Selezionate le funzionalità che desiderate attivare nel vostro Wedding Portal per stupire i vostri ospiti.'
                        : 'Select the bespoke features you want active on your wedding guest app.'}
                    </p>
                  </div>

                  {/* Servizi di Concierge & Assistenza */}
                  <div>
                    <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {lang === 'it' ? 'Concierge & Accoglienza Invitati' : 'Concierge & Hospitality'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'GUEST_CONCIERGE_CHAT', label: lang === 'it' ? 'Assistenza Concierge WhatsApp H24' : '24/7 WhatsApp Guest Concierge', desc: lang === 'it' ? 'Valeria risponde alle domande su dress code, transfer e orari' : 'Valeria answers guest questions live', icon: MessageCircle },
                        { id: 'WEB_APP_PORTAL', label: lang === 'it' ? 'Web App Nozze con Codice Riservato' : 'Custom Digital Wedding App', desc: lang === 'it' ? 'Itinerario, RSVP, mappe GPS e galleria foto condivisa' : 'Interactive schedule, RSVP and photo album', icon: Globe },
                        { id: 'HOTEL_ROOM_BLOCKS', label: lang === 'it' ? 'Gestione & Prenotazione Hotel Convenzionati' : 'Partner Hotel Booking Management', desc: lang === 'it' ? 'Supporto agli ospiti per bloccare le camere a prezzi speciali' : 'Special rates & booking support for guests', icon: Building2 },
                        { id: 'WEDDING_SHUTTLES', label: lang === 'it' ? 'Navette e Minivan Giorno Matrimonio' : 'Wedding Day Shuttle Logistics', desc: lang === 'it' ? 'Niente auto a noleggio per bere e festeggiare in serenità' : 'Guests can drink and celebrate safely', icon: Car },
                        { id: 'AIRPORT_NCC', label: lang === 'it' ? 'Transfer Aeroporto Bari / Brindisi NCC' : 'Airport Private NCC Transfers', desc: lang === 'it' ? 'Accoglienza con cartello nominativo agli arrivi' : 'Meet & greet at arrival terminals', icon: Compass },
                        { id: 'BEAUTY_STYLING', label: lang === 'it' ? 'Hair Stylist & Trucco in Camera' : 'Hair & Makeup Styling On-Site', desc: lang === 'it' ? 'Per la sposa, testimoni, damigelle e invitate' : 'Professional styling at masseria', icon: Scissors },
                        { id: 'BABYSITTING', label: lang === 'it' ? 'Babysitting & Animazione Bimbi' : 'Bilingual Babysitting Service', desc: lang === 'it' ? 'Personale qualificato per far divertire i più piccoli' : 'Allows parents to enjoy the celebration', icon: Users },
                        { id: 'VINTAGE_CAR', label: lang === 'it' ? 'Auto d\'Epoca o Cabriolet per gli Sposi' : 'Classic Vintage Car for Newlyweds', desc: lang === 'it' ? 'Alfa Romeo Spider, Maggiolino d\'epoca o Fiat 500' : 'Iconic Italian cars for your grand entrance', icon: Car },
                      ].map(srv => {
                        const Icon = srv.icon;
                        const isSelected = (formData.requestedServices || []).includes(srv.id);
                        return (
                          <div
                            key={srv.id}
                            onClick={() => toggleArrayItem('requestedServices', srv.id)}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-50/80 border-amber-800/60 shadow-xs ring-1 ring-amber-800'
                                : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-600'
                                }`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-stone-900">{srv.label}</span>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-amber-900 border-amber-900 text-white' : 'border-stone-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-1 pl-9">
                              {srv.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Esperienze Tipiche Pugliesi da Proporre */}
                  <div className="pt-2">
                    <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {lang === 'it' ? 'Esperienze in Puglia per gli Invitati' : 'Curated Apulian Guest Experiences'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'BOAT_TOUR_POLIGNANO', title: lang === 'it' ? 'Tour in Barca a Polignano' : 'Polignano Cave Boat Tour', subtitle: lang === 'it' ? 'Grotte marine, tuffi e prosecco' : 'Sea caves, swim stop & bubbles', icon: Anchor },
                        { id: 'WINE_OIL_TASTING', title: lang === 'it' ? 'Degustazione Vini & Olio EVO' : 'Wine & Olive Oil Tasting', subtitle: lang === 'it' ? 'Frantoio ipogeo & masseria' : 'Ancient mill & historic cellar', icon: Wine },
                        { id: 'COOKING_CLASS_ORECCHIETTE', title: lang === 'it' ? 'Cooking Class Orecchiette' : 'Traditional Cooking Class', subtitle: lang === 'it' ? 'Pasta fresca fatta a mano' : 'Handmade fresh pasta workshop', icon: Sparkles }
                      ].map(exp => {
                        const Icon = exp.icon;
                        const isSelected = (formData.requestedExperiences || []).includes(exp.id);
                        return (
                          <div
                            key={exp.id}
                            onClick={() => toggleArrayItem('requestedExperiences', exp.id)}
                            className={`p-3 rounded-2xl border cursor-pointer text-left transition-all ${
                              isSelected
                                ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-stone-600'}`} />
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                            </div>
                            <div className="text-xs font-bold">{exp.title}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                              {exp.subtitle}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: VISIONE, ATMOSFERA & NOTE PER VALERIA */}
              {activeStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-100 pb-3">
                    <h4 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-amber-800" />
                      <span>{lang === 'it' ? '5. Visione, Desideri & Allineamento con Valeria' : '5. Vision, Desires & Next Steps'}</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {lang === 'it'
                        ? 'Raccontateci l\'atmosfera che sognate e concordiamo il momento ideale per il kickoff call.'
                        : 'Share the vibe you imagine and let us know your preferred kickoff call time.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'it' ? 'Che atmosfera e sensazione sognate per i vostri invitati?' : 'What atmosphere do you dream for your guests?'}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.desiredVibe || ''}
                      onChange={(e) => setFormData({ ...formData, desiredVibe: e.target.value })}
                      placeholder={lang === 'it' 
                        ? 'es. Una grande festa calorosa e genuina, elegante ma rilassata tra gli ulivi, dove tutti si sentano a casa e accolti con amore.'
                        : 'e.g. Warm, authentic Mediterranean chic, relaxed yet refined, where everyone feels like family.'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'it' ? 'Note libere, domande o ospiti con esigenze particolari per Valeria' : 'Special Notes, Dietary Needs, Mobility, or Questions'}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.specialNotesForValeria || ''}
                      onChange={(e) => setFormData({ ...formData, specialNotesForValeria: e.target.value })}
                      placeholder={lang === 'it' 
                        ? 'es. Alcuni ospiti anziani necessitano di navette a pianale ribassato; abbiamo 12 invitati vegani; vorremmo regalare ai testimoni un tour speciale...'
                        : 'e.g. Any special accessibility needs, guest dietary requests, VIP arrival preferences, or special surprises...'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Canale preferito per il primo incontro con Valeria' : 'Preferred Kickoff Channel'}
                      </label>
                      <select
                        value={formData.kickoffCallChannel || 'WHATSAPP'}
                        onChange={(e) => setFormData({ ...formData, kickoffCallChannel: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      >
                        <option value="WHATSAPP">💬 Chat / Chiamata WhatsApp</option>
                        <option value="MEET">💻 Videochiamata Google Meet</option>
                        <option value="PHONE">📞 Chiamata Telefonica Classica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {lang === 'it' ? 'Fascia oraria preferita per sentirsi' : 'Preferred Time for Call'}
                      </label>
                      <select
                        value={formData.kickoffCallTime || 'AFTERNOON'}
                        onChange={(e) => setFormData({ ...formData, kickoffCallTime: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      >
                        <option value="MORNING">{lang === 'it' ? 'Mattina (10:00 - 13:00)' : 'Morning (10:00 - 13:00)'}</option>
                        <option value="AFTERNOON">{lang === 'it' ? 'Pomeriggio (14:30 - 18:00)' : 'Afternoon (14:30 - 18:00)'}</option>
                        <option value="EVENING">{lang === 'it' ? 'Sera (18:30 - 20:30)' : 'Evening (18:30 - 20:30)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Riepilogo veloce prima dell'invio */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-stone-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                      <span>{lang === 'it' ? 'Cosa accadrà dopo l\'invio:' : 'What happens after submitting:'}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {lang === 'it'
                        ? 'Valeria riceverà immediatamente la vostra scheda, configurerà il Wedding Portal per voi e i vostri ospiti, e vi contatterà sul canale prescelto entro 24 ore.'
                        : 'Valeria will immediately receive your dossier, set up your personalized Wedding Portal, and reach out on your preferred channel within 24 hours.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottoni Navigazione Form */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{lang === 'it' ? 'Indietro' : 'Back'}</span>
                  </button>
                ) : <div />}

                {activeStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer ml-auto"
                  >
                    <span>{lang === 'it' ? 'Prosegui al Passo Successivo' : 'Continue to Next Step'}</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer ml-auto disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{lang === 'it' ? 'Invio della Scheda in corso...' : 'Submitting dossier...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-300" />
                        <span>{lang === 'it' ? 'Invia la Scheda a Valeria & Avvia i Servizi' : 'Submit Dossier to Valeria & Start Concierge'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* SCHERMATA DI SUCCESSO E CONFERMA */
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {lang === 'it' ? 'Dossier Ricevuto con Successo' : 'Dossier Successfully Received'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
                {lang === 'it' 
                  ? `Grazie, ${submittedData?.brideName} & ${submittedData?.groomName}!` 
                  : `Thank you, ${submittedData?.brideName} & ${submittedData?.groomName}!`}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {lang === 'it' ? (
                  <>
                    I dettagli per il vostro matrimonio a <strong>{submittedData?.venueLocation}</strong> sono stati trasmessi con successo a <strong>Valeria</strong> e al team di Apulian Wedding Concierge.
                  </>
                ) : (
                  <>
                    Your wedding details for <strong>{submittedData?.venueLocation}</strong> have been received by <strong>Valeria</strong> and the Apulian Concierge team.
                  </>
                )}
              </p>
            </div>

            {/* Scheda Riepilogo dei Dati Trasmessi */}
            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#EAE4DC] max-w-lg mx-auto text-left text-xs space-y-2.5">
              <div className="font-bold text-stone-800 border-b border-stone-200 pb-2 flex items-center justify-between">
                <span>{lang === 'it' ? 'Riepilogo Scheda Sposi' : 'Newlywed Dossier Summary'}</span>
                <span className="font-mono text-[10px] text-stone-400">ID: {submittedData?.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Data Nozze:</span>
                  <span className="font-semibold text-stone-900">{submittedData?.weddingDate}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Invitati Stimati:</span>
                  <span className="font-semibold text-stone-900">{submittedData?.estimatedGuestsCount} ({submittedData?.outOfTownGuestsCount} da fuori)</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Contatto WhatsApp:</span>
                  <span className="font-semibold text-stone-900">{submittedData?.phoneWhatsapp}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Email Ufficiale:</span>
                  <span className="font-semibold text-stone-900 truncate block">{submittedData?.coupleEmail}</span>
                </div>
              </div>
              {submittedData?.requestedServices && submittedData.requestedServices.length > 0 && (
                <div className="pt-1">
                  <span className="text-stone-400 block text-[10px] uppercase mb-1">Servizi richiesti:</span>
                  <div className="flex flex-wrap gap-1">
                    {submittedData.requestedServices.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-[10px] font-medium">
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Azioni Rapide: WhatsApp Diretto a Valeria */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={valeriaWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'it' ? 'Scrivi subito a Valeria su WhatsApp' : 'Chat with Valeria on WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span>{lang === 'it' ? 'Stampa o Salva PDF' : 'Print or Save PDF'}</span>
              </button>

              {onPreviewPortal && (
                <button
                  type="button"
                  onClick={onPreviewPortal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-amber-300" />
                  <span>{lang === 'it' ? 'Esplora Anteprima Portale' : 'Preview Guest Portal'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 5. SEZIONE ANTEPRIMA ESPERIENZE E ACCOGLIENZA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-[#EAE4DC]">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
            {lang === 'it' ? 'Eccellenza del Territorio' : 'Apulian Hospitality'}
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
            {lang === 'it' ? 'Cosa vivranno i vostri invitati in Puglia' : 'What your guests will experience in Puglia'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            {lang === 'it'
              ? 'Dall\'accoglienza in aeroporto con navette dedicate alle cene sotto gli ulivi: curiamo ogni istante con la dedizione di AD Marketing.'
              : 'From airport private pickups to dining under ancient olive trees: every moment curated with care.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl overflow-hidden border border-[#EAE4DC] shadow-sm hover:shadow-md transition-shadow">
            <img src={hotelSuiteImg} alt="Hotel Suite Masseria" className="w-full h-44 object-cover" />
            <div className="p-5 space-y-2">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {lang === 'it' ? 'Soggiorni Convenzionati' : 'Partner Masserie & Hotels'}
              </div>
              <h4 className="text-base font-bold font-serif-luxury text-stone-900">
                {lang === 'it' ? 'Masserie & Dimore Storiche' : 'Historic Masserie & Luxury Suites'}
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === 'it'
                  ? 'Blocchiamo camere con tariffe negoziate e perks esclusivi (welcome drink, navette garantite e flessibilità cancellazione).'
                  : 'Negotiated room blocks with perks like welcome drinks and guaranteed wedding shuttles.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-[#EAE4DC] shadow-sm hover:shadow-md transition-shadow">
            <img src={boatTourImg} alt="Boat Tour Polignano" className="w-full h-44 object-cover" />
            <div className="p-5 space-y-2">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {lang === 'it' ? 'Esperienze di Gruppo' : 'Signature Experiences'}
              </div>
              <h4 className="text-base font-bold font-serif-luxury text-stone-900">
                {lang === 'it' ? 'Grotte di Polignano & Tramonti' : 'Polignano Boat Tours & Sunsets'}
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === 'it'
                  ? 'Gite private in barca, degustazioni di Primitivo e olio extravergine in frantoi millenari per arricchire il weekend di nozze.'
                  : 'Private catamaran cruises, wine tastings and olive oil mills to enrich your wedding week.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-[#EAE4DC] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full h-44 bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 flex flex-col items-center justify-center text-white p-6 text-center">
              <MessageCircle className="w-10 h-10 text-amber-300 mb-2" />
              <span className="font-serif-luxury font-bold text-lg">Concierge WhatsApp H24</span>
              <span className="text-xs text-amber-200 mt-1">Valeria & Assistenti Dedicati</span>
            </div>
            <div className="p-5 space-y-2">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {lang === 'it' ? 'Tranquillità per gli Sposi' : 'Peace of Mind'}
              </div>
              <h4 className="text-base font-bold font-serif-luxury text-stone-900">
                {lang === 'it' ? 'Zero stress per voi due' : 'Zero guest stress for you'}
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === 'it'
                  ? 'I vostri ospiti non vi chiameranno per sapere come raggiungere la masseria o quale taxi prendere: Valeria si occupa di ciascuno di loro.'
                  : 'Your guests won\'t call you asking about taxis or dress codes: Valeria handles every guest individually.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER ISTITUZIONALE */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 pt-8 border-t border-[#EAE4DC] text-center text-xs text-stone-500 space-y-2">
        <div className="font-serif-luxury font-bold text-stone-800 text-sm">
          Apulian Wedding Concierge · {adminSettings.agencyLegalName || 'AD Marketing S.r.l.s.'}
        </div>
        <p className="text-[11px] text-stone-400">
          {adminSettings.agencyAddress || 'Via Roma, 45'} · {adminSettings.agencyCity || '74018 Palagianello (TA) - Puglia, Italia'} · P.IVA {adminSettings.agencyVat || 'IT03124590731'}
        </p>
        <p className="text-[10px] text-stone-400">
          Servizio di incoming, logistica transfer e hospitality management per luxury destination weddings in Puglia.
        </p>
      </footer>

    </div>
  );
}
