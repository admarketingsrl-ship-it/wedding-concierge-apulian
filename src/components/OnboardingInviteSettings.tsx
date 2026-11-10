import React, { useState } from 'react';
import { 
  Link as LinkIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  MessageCircle, 
  Mail, 
  Sparkles, 
  Heart, 
  Phone, 
  Edit3, 
  Save, 
  RefreshCw, 
  Eye, 
  ArrowRight, 
  Info,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Send
} from 'lucide-react';
import { AdminSettings, CoupleOnboardingDossier } from '../data/weddingStore';

interface OnboardingInviteSettingsProps {
  settings: AdminSettings;
  onUpdateSettings: (newSettings: AdminSettings) => void;
  onboardingDossiers?: CoupleOnboardingDossier[];
  onConvertDossierToWedding?: (dossier: CoupleOnboardingDossier) => void;
  onNavigateToWedding?: (weddingCode: string) => void;
  onOpenLandingPreview?: () => void;
}

export default function OnboardingInviteSettings({
  settings,
  onUpdateSettings,
  onboardingDossiers = [],
  onConvertDossierToWedding,
  onNavigateToWedding,
  onOpenLandingPreview
}: OnboardingInviteSettingsProps) {
  // Input personalizzazione rapida per Valeria
  const [brideName, setBrideName] = useState<string>('Chiara');
  const [groomName, setGroomName] = useState<string>('Matteo');
  const [targetPhone, setTargetPhone] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<'it' | 'en'>('it');
  const [msgFormat, setMsgFormat] = useState<'whatsapp' | 'email'>('whatsapp');
  
  // Feedback copia
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const [savedTemplateFeedback, setSavedTemplateFeedback] = useState<boolean>(false);

  // Modalità modifica template
  const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false);
  const [templateIt, setTemplateIt] = useState<string>(
    settings.onboardingInviteTextIt || `Carissimi {NOMI_SPOSI},

Congratulazioni di vero cuore per le vostre nozze in Puglia! 💍✨

Sono Valeria, responsabile del servizio di Apulian Wedding Concierge (AD Marketing). Da oggi siamo al vostro fianco per rendere l'esperienza vostra e dei vostri ospiti indimenticabile, curando ogni aspetto logistico: alloggi convenzionati nelle masserie più belle, transfer aeroportuali NCC, navette per il giorno delle nozze ed esperienze autentiche nella nostra terra.

Per permettermi di configurare la vostra area riservata, avviare i servizi su misura e preparare il Wedding Portal per i vostri invitati, vi chiedo la gentilezza di compilare questo breve questionario di benvenuto (richiede circa 3 minuti):

👉 {LINK_LANDING_PAGE}

Non appena riceverò i vostri dettagli, imposterò il vostro matrimonio e vi contatterò per un caloroso saluto di allineamento e per iniziare insieme questa meravigliosa avventura!

Con affetto e a disposizione per qualsiasi desiderio,
Valeria · Apulian Wedding Concierge
📱 WhatsApp: ${settings.valeriaPhone || '+39 340 1234567'}
🌐 AD Marketing S.r.l.s. · Palagianello (TA)`
  );

  const [templateEn, setTemplateEn] = useState<string>(
    settings.onboardingInviteTextEn || `Dearest {COUPLE_NAMES},

Warmest congratulations on your upcoming wedding in Puglia! 💍✨

I am Valeria, Head of Guest Experience & Concierge at Apulian Wedding Concierge (AD Marketing). We are thrilled to be by your side to make your celebration and your guests' stay completely stress-free, curating room blocks in authentic masserie, airport transfers, wedding day shuttles, and memorable Apulian experiences.

To allow me to configure your private wedding portal and begin tailoring services for you and your guests, please take 3 minutes to fill out our welcome onboarding form:

👉 {LINK_LANDING_PAGE}

As soon as I receive your details, I will set up your portal and reach out for our kickoff call.

With warm regards and excitement for your big day,
Valeria · Apulian Wedding Concierge
📱 WhatsApp: ${settings.valeriaPhone || '+39 340 1234567'}
🌐 AD Marketing S.r.l.s. · Puglia, Italy`
  );

  const PRODUCTION_DOMAIN = 'https://wedding-concierge-apulian.vercel.app';
  const [domainMode, setDomainMode] = useState<'production' | 'current'>('production');

  // Genera URL per la landing page onboarding
  const getLandingPageUrl = (): string => {
    if (domainMode === 'production') {
      return `${PRODUCTION_DOMAIN}/?view=onboarding`;
    }
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      return `${origin}${pathname}?view=onboarding`;
    }
    return `${PRODUCTION_DOMAIN}/?view=onboarding`;
  };

  const landingPageUrl = getLandingPageUrl();

  // Genera testo pronto personalizzato
  const getFormattedMessage = (): string => {
    const coupleNames = brideName && groomName 
      ? `${brideName.trim()} & ${groomName.trim()}`
      : brideName.trim() || groomName.trim() || (selectedLang === 'it' ? 'Futuri Sposi' : 'Future Newlyweds');

    const template = selectedLang === 'it' ? templateIt : templateEn;
    let text = template
      .replace(/{NOMI_SPOSI}/g, coupleNames)
      .replace(/{COUPLE_NAMES}/g, coupleNames)
      .replace(/{LINK_LANDING_PAGE}/g, landingPageUrl);

    if (msgFormat === 'whatsapp') {
      // Ottimizzato per WhatsApp
      text = text.replace(/Carissimi/g, '*Carissimi*').replace(/Dearest/g, '*Dearest*');
    }

    return text;
  };

  const currentMessage = getFormattedMessage();

  // Copia link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(landingPageUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      const input = document.createElement('input');
      input.value = landingPageUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Copia messaggio
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(currentMessage);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 3000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = currentMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 3000);
    }
  };

  // Salva template modificato
  const handleSaveTemplate = () => {
    const updated = {
      ...settings,
      onboardingInviteTextIt: templateIt,
      onboardingInviteTextEn: templateEn
    };
    onUpdateSettings(updated);
    setIsEditingTemplate(false);
    setSavedTemplateFeedback(true);
    setTimeout(() => setSavedTemplateFeedback(false), 3000);
  };

  // Condividi link nativo
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Apulian Wedding Concierge - Benvenuto Sposi',
          text: currentMessage,
          url: landingPageUrl
        });
      } catch {}
    } else {
      handleCopyMessage();
    }
  };

  // WhatsApp Web URL
  const phoneClean = targetPhone ? targetPhone.replace(/[\s\-\+]/g, '') : '';
  const waUrl = phoneClean 
    ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(currentMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(currentMessage)}`;

  // Email mailto URL
  const mailSubject = selectedLang === 'it' 
    ? `Benvenuti in Puglia! Questionario Concierge Matrimonio ${brideName} & ${groomName}`
    : `Welcome to Puglia! Wedding Concierge Questionnaire for ${brideName} & ${groomName}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(currentMessage)}`;

  return (
    <div className="space-y-6">
      
      {/* 1. HERO BOX LINK LANDING PAGE */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Landing Page Onboarding Sposi</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-white">
              Link Ufficiale da Inviare alla Sposa
            </h3>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              Questo è il link diretto alla landing page che Valeria deve inviare alla sposa/coppia. Aprendolo, gli sposi troveranno la calda lettera di benvenuto e il questionario in 5 passi per indicare date, masseria, invitati e servizi desiderati.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenLandingPreview ? onOpenLandingPreview : () => window.open(landingPageUrl, '_blank')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>Apri Anteprima</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Selettore Dominio */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-stone-300">
            <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">Dominio di riferimento:</span>
          </div>

          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/15 text-xs">
            <button
              type="button"
              onClick={() => setDomainMode('production')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                domainMode === 'production'
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>🌐 Produzione (Vercel)</span>
              {domainMode === 'production' && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setDomainMode('current')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                domainMode === 'current'
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>💻 Ambiente Locale / Preview</span>
              {domainMode === 'current' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Barra URL con Copia Rapida */}
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-amber-400/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5 px-2 overflow-hidden">
            <LinkIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                {domainMode === 'production' ? 'Link Ufficiale Vercel' : 'Link Anteprima'}
              </span>
              <span className="font-mono text-xs text-amber-200 select-all font-semibold">
                {landingPageUrl}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-900 shadow-sm'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copiato!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copia Link Landing Page</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              title="Condividi tramite app"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. GENERATORE TESTO PERSONALIZZATO PER VALERIA */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Copia &amp; Incolla per Valeria
            </span>
            <h3 className="text-lg font-bold font-serif-luxury text-stone-900 flex items-center gap-2 mt-0.5">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>Messaggio d'Invito Pronto per WhatsApp &amp; Email</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Inserisci i nomi degli sposi: il testo viene generato all'istante con il link della landing page già incluso. Valeria può copiarlo con un clic o inviarlo direttamente con WhatsApp Web.
            </p>
          </div>

          {/* Toggle Lingua e Formato */}
          <div className="flex items-center gap-2">
            <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedLang('it')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedLang === 'it' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇮🇹 Italiano
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedLang === 'en' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>

        {/* Campi di Personalizzazione Rapida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Nome Sposa
            </label>
            <input
              type="text"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              placeholder="es. Chiara"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-800"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Nome Sposo / Partner
            </label>
            <input
              type="text"
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              placeholder="es. Matteo"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-800"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Numero WhatsApp Sposa (Opzionale)
            </label>
            <input
              type="tel"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="es. +39 340 1234567"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-800"
            />
          </div>
        </div>

        {/* Anteprima del Messaggio da Inviare */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-stone-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Anteprima Testo Pronto (Generato con Link Integrato):</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingTemplate(!isEditingTemplate)}
              className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingTemplate ? 'Chiudi Editor Template' : 'Modifica Template Base'}</span>
            </button>
          </div>

          {/* Box Editor Template Base (se attivo) */}
          {isEditingTemplate ? (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">
                  Modifica Template per {selectedLang === 'it' ? 'Italiano' : 'Inglese'}
                </span>
                <span className="text-[11px] text-amber-800">
                  Tag supportati: {'{NOMI_SPOSI}'}, {'{LINK_LANDING_PAGE}'}
                </span>
              </div>
              <textarea
                rows={9}
                value={selectedLang === 'it' ? templateIt : templateEn}
                onChange={(e) => {
                  if (selectedLang === 'it') setTemplateIt(e.target.value);
                  else setTemplateEn(e.target.value);
                }}
                className="w-full p-3 rounded-xl border border-amber-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Salva Template Nelle Impostazioni</span>
                </button>
              </div>
            </div>
          ) : (
            /* Box Anteprima Testo con formattazione e scroll */
            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#EAE4DC] relative group">
              <pre className="font-sans text-xs text-stone-800 whitespace-pre-wrap leading-relaxed select-all">
                {currentMessage}
              </pre>
            </div>
          )}
        </div>

        {/* Feedback Salvataggio Template */}
        {savedTemplateFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Template salvato con successo nelle impostazioni della Web App!</span>
          </div>
        )}

        {/* Azioni di Invio / Copia per Valeria */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {/* Bottone Copia Testo */}
          <button
            type="button"
            onClick={handleCopyMessage}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
              copiedMsg
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {copiedMsg ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Messaggio Copiato negli Appunti!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-300" />
                <span>Copia Testo per Incollare su WhatsApp / Email</span>
              </>
            )}
          </button>

          {/* Bottone WhatsApp Diretto */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Invia subito su WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-emerald-200" />
          </a>

          {/* Bottone Email Diretto */}
          <a
            href={mailtoUrl}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-stone-500" />
            <span>Invia via Email</span>
          </a>
        </div>
      </div>

      {/* 3. DOSSIER QUESTIONARI RICEVUTI DAGLI SPOSI */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Cruscotto Onboarding
            </span>
            <h4 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2 mt-0.5">
              <Users className="w-4 h-4 text-amber-800" />
              <span>Dossier Sposi Ricevuti dalla Landing Page ({onboardingDossiers.length})</span>
            </h4>
          </div>
          <span className="text-xs text-stone-500">
            I dati inseriti dagli sposi compaiono qui in tempo reale per la creazione del matrimonio.
          </span>
        </div>

        {onboardingDossiers.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs space-y-1">
            <Info className="w-5 h-5 text-stone-400 mx-auto" />
            <div className="font-semibold text-stone-700">Nessun questionario ricevuto finora</div>
            <p>Quando invii il link agli sposi e loro lo compilano, vedrai comparire qui il loro dossier completo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onboardingDossiers.map(dossier => (
              <div
                key={dossier.id}
                className="p-5 rounded-2xl border border-stone-200 bg-[#FAF8F5] space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      {dossier.status === 'NEW' ? 'Nuovo Dossier' : dossier.status === 'CONVERTED' ? 'Matrimonio Creato' : 'Revisionato'}
                    </span>
                    <h5 className="text-base font-bold font-serif-luxury text-stone-900">
                      {dossier.brideName} &amp; {dossier.groomName}
                    </h5>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    dossier.status === 'NEW'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : dossier.status === 'CONVERTED'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-stone-200 text-stone-800'
                  }`}>
                    {dossier.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{dossier.weddingDate || 'Data da definire'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{dossier.estimatedGuestsCount} invitati ({dossier.outOfTownGuestsCount} da fuori)</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{dossier.venueLocation || 'Location Puglia'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{dossier.phoneWhatsapp} ({dossier.coupleEmail})</span>
                  </div>
                </div>

                {dossier.specialNotesForValeria && (
                  <p className="text-[11px] text-stone-500 italic bg-white p-2 rounded-xl border border-stone-200/80">
                    "{dossier.specialNotesForValeria}"
                  </p>
                )}

                {dossier.convertedWeddingCode ? (
                  <div className="pt-3 border-t border-stone-200/80 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Matrimonio attivo: <strong className="font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{dossier.convertedWeddingCode}</strong></span>
                      </div>
                      {onNavigateToWedding && (
                        <button
                          type="button"
                          onClick={() => onNavigateToWedding(dossier.convertedWeddingCode!)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          <span>Vai alla Scheda Matrimonio</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                        </button>
                      )}
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-600 space-y-0.5">
                      <div><strong>Codice Matrimonio:</strong> <span className="font-mono font-bold text-stone-900">{dossier.convertedWeddingCode}</span></div>
                      <div><strong>Email Sposa:</strong> {dossier.coupleEmail} | <strong>Password:</strong> <span className="font-mono font-bold text-stone-900">Sposi2026!</span></div>
                    </div>
                  </div>
                ) : (
                  onConvertDossierToWedding && (
                    <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500">
                        Kickoff: {dossier.kickoffCallChannel || 'WhatsApp'} ({dossier.kickoffCallTime || 'Pomeriggio'})
                      </span>
                      <button
                        type="button"
                        onClick={() => onConvertDossierToWedding(dossier)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Crea Matrimonio dal Dossier</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
