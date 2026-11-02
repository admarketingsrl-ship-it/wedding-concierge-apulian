import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Car, 
  Compass, 
  Users, 
  Plane, 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Luggage,
  Sparkles,
  Phone,
  Mail,
  FileSpreadsheet,
  Download,
  RotateCcw,
  UserPlus,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Percent,
  History,
  Activity,
  Check,
  X,
  DollarSign,
  Plus
} from 'lucide-react';
import { 
  WeddingData, 
  GuestItem, 
  SupplierBookingOrder, 
  PaymentRequest,
  MasterSupplier,
  SupplierPackage,
  ExperienceItem,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIER_PACKAGES,
  getSharedExperiencesDatabase,
  getSavedMasterExperiences,
  saveCustomMasterExperience
} from '../data/weddingStore';
import { saveWeddingToFirestore } from '../lib/firebase';

interface SocioItem {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  quotaPercent: number;
  status: string;
  badge: string;
  assignedWeddings: string;
  permissions: string[];
  joinedDate: string;
  recentActivity: string;
}

interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  entityType: string;
  entityTitle: string;
  details: string;
  timestamp: string;
}

interface AgencyDashboardProps {
  weddings: WeddingData[];
  bookingOrders: SupplierBookingOrder[];
  paymentRequests: PaymentRequest[];
  onNavigateToAdminTab?: (tab: string, weddingId?: string) => void;
  onUpdateWeddings?: (weddings: WeddingData[]) => void;
  suppliers?: MasterSupplier[];
  packages?: SupplierPackage[];
}

export default function AgencyDashboard({ 
  weddings, 
  bookingOrders, 
  paymentRequests, 
  onNavigateToAdminTab,
  onUpdateWeddings,
  suppliers = INITIAL_SUPPLIERS,
  packages = INITIAL_SUPPLIER_PACKAGES
}: AgencyDashboardProps) {
  // Tab Principale Dashboard Agenzia
  const [activeTab, setActiveTab] = useState<'guests-report' | 'soci' | 'audit-logs' | 'hotels' | 'transfers' | 'experiences' | 'payments'>('guests-report');

  // Filtro Matrimonio per Logistica, Esperienze e Hotel
  const [selectedWeddingCodeForHotels, setSelectedWeddingCodeForHotels] = useState<string>('ALL');
  const [selectedWeddingCodeForTransfers, setSelectedWeddingCodeForTransfers] = useState<string>('ALL');
  const [selectedWeddingCodeForExperiences, setSelectedWeddingCodeForExperiences] = useState<string>('ALL');

  // Gestione Database Master Esperienze e Fornitori
  const [searchAgencyExp, setSearchAgencyExp] = useState('');
  const [selectedAgencyExpCategory, setSelectedAgencyExpCategory] = useState<string>('ALL');
  const [assignTargetWeddingCode, setAssignTargetWeddingCode] = useState<Record<string, string>>({});
  const [agencyExpFeedback, setAgencyExpFeedback] = useState<string | null>(null);

  const activeSuppliers = suppliers && suppliers.length > 0 ? suppliers : INITIAL_SUPPLIERS;
  const activePackages = packages && packages.length > 0 ? packages : INITIAL_SUPPLIER_PACKAGES;
  const masterExperiencesList = getSharedExperiencesDatabase(weddings, getSavedMasterExperiences(), activePackages);

  const handleAssignExpToWedding = async (exp: ExperienceItem, targetWeddingCode: string) => {
    if (!targetWeddingCode) return;
    const targetWedding = weddings.find(w => w.weddingCode === targetWeddingCode);
    if (!targetWedding) return;

    const alreadyPresent = (targetWedding.experiences || []).some(
      e => e.title.trim().toLowerCase() === exp.title.trim().toLowerCase()
    );
    if (alreadyPresent) {
      setAgencyExpFeedback(`"${exp.title}" è già configurata in ${targetWedding.coupleNames}!`);
      setTimeout(() => setAgencyExpFeedback(null), 3500);
      return;
    }

    const newExp: ExperienceItem = {
      ...exp,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventDate: targetWedding.weddingDate || '2026-09-12',
      bookedParticipants: 0
    };

    const updatedWedding: WeddingData = {
      ...targetWedding,
      experiences: [...(targetWedding.experiences || []), newExp]
    };

    const updatedWeddings = weddings.map(w => w.id === updatedWedding.id ? updatedWedding : w);
    if (onUpdateWeddings) {
      onUpdateWeddings(updatedWeddings);
    }
    saveCustomMasterExperience(newExp);
    try {
      await saveWeddingToFirestore(updatedWedding);
    } catch {}

    setAgencyExpFeedback(`✓ Esperienza "${exp.title}" assegnata con successo a ${targetWedding.coupleNames} (${targetWedding.weddingCode})!`);
    setTimeout(() => setAgencyExpFeedback(null), 3500);
  };

  // Dati da API Server
  const [sociList, setSociList] = useState<SocioItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtri Report Ospiti
  const [selectedWeddingCode, setSelectedWeddingCode] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState<string>('ALL');

  // Filtri Audit Log
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  // Modale Nuovo Socio
  const [showAddSocioModal, setShowAddSocioModal] = useState(false);
  const [newSocioName, setNewSocioName] = useState('');
  const [newSocioRole, setNewSocioRole] = useState('');
  const [newSocioEmail, setNewSocioEmail] = useState('');
  const [newSocioPhone, setNewSocioPhone] = useState('+39 ');
  const [newSocioQuota, setNewSocioQuota] = useState('10');
  const [newSocioBadge, setNewSocioBadge] = useState('Concierge');
  const [newSocioWeddings, setNewSocioWeddings] = useState('Tutti i matrimoni Puglia');
  const [socioSuccessMessage, setSocioSuccessMessage] = useState('');

  // Caricamento dati Soci e Audit Logs dal backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sociRes, logsRes] = await Promise.all([
        fetch('/api/soci').catch(() => null),
        fetch('/api/audit-logs').catch(() => null)
      ]);

      if (sociRes && sociRes.ok && sociRes.headers.get('content-type')?.includes('application/json')) {
        const sociData = await sociRes.json();
        if (sociData?.soci) setSociList(sociData.soci);
      }
      if (logsRes && logsRes.ok && logsRes.headers.get('content-type')?.includes('application/json')) {
        const logsData = await logsRes.json();
        if (logsData?.logs) setAuditLogs(logsData.logs);
      }
    } catch (err) {
      console.warn('Errore caricamento dati agenzia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Aggregazione di TUTTI gli ospiti reali da tutti i matrimoni
  const allGuestsCrossWedding = weddings.flatMap(w => 
    (w.guests || []).map(g => ({
      ...g,
      weddingId: w.id,
      weddingCode: w.weddingCode,
      coupleNames: w.coupleNames,
      weddingDate: w.weddingDate,
      venue: w.venue || w.city,
      countryCity: `${w.city}, ${w.country}`
    }))
  );

  // Filtraggio Ospiti
  const filteredGuests = allGuestsCrossWedding.filter(g => {
    if (selectedWeddingCode !== 'ALL' && g.weddingCode.toUpperCase() !== selectedWeddingCode.toUpperCase()) return false;
    if (selectedStatus !== 'ALL' && g.status !== selectedStatus) return false;
    if (selectedCountry !== 'ALL' && !g.country.toLowerCase().includes(selectedCountry.toLowerCase())) return false;
    if (selectedDiet !== 'ALL') {
      if (selectedDiet === 'SPECIAL' && (!g.diet || g.diet.toLowerCase().includes('nessuna'))) return false;
      if (selectedDiet === 'CELIACI' && !g.diet?.toLowerCase().includes('glutine') && !g.diet?.toLowerCase().includes('celiac')) return false;
      if (selectedDiet === 'VEG' && !g.diet?.toLowerCase().includes('veg')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q) ||
        (g.flight && g.flight.toLowerCase().includes(q)) ||
        (g.hotelBooked && g.hotelBooked.toLowerCase().includes(q)) ||
        g.weddingCode.toLowerCase().includes(q) ||
        g.coupleNames.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // KPI Computati in tempo reale
  const totalGuestsCount = allGuestsCrossWedding.length;
  const confirmedGuestsCount = allGuestsCrossWedding.filter(g => g.status === 'CONFIRMED').length;
  const pendingGuestsCount = allGuestsCrossWedding.filter(g => g.status === 'PENDING').length;
  const hotelBookedCount = allGuestsCrossWedding.filter(g => g.hotelBooked && g.hotelBooked !== 'NONE' && !g.hotelBooked.includes('Nessun')).length;
  const transferBookedCount = allGuestsCrossWedding.filter(g => g.transferBooked && g.transferBooked !== 'NONE' && !g.transferBooked.includes('Autonomo')).length;
  const totalEstimatedRevenue = allGuestsCrossWedding.reduce((acc, g) => acc + (g.totalAmountDue || 0), 0);

  // Esportazione CSV
  const handleExportCsv = () => {
    const headers = ['Matrimonio', 'Codice Nozze', 'Data Nozze', 'Nome Ospite', 'Email', 'Telefono', 'Paese', 'Hotel', 'Camera', 'Transfer', 'Volo', 'Esperienze', 'Esigenze Dietetiche', 'Stato RSVP', 'Totale €', 'Pagamento'];
    const rows = filteredGuests.map(g => [
      `"${g.coupleNames}"`,
      `"${g.weddingCode}"`,
      `"${g.weddingDate}"`,
      `"${g.name}"`,
      `"${g.email}"`,
      `"${g.phone}"`,
      `"${g.country}"`,
      `"${g.hotelBooked || 'Nessuno'}"`,
      `"${g.roomType || '-'}"`,
      `"${g.transferBooked || 'Autonomo'}"`,
      `"${g.flight || '-'}"`,
      `"${(g.experiences || []).join('; ')}"`,
      `"${g.diet || 'Nessuna'}"`,
      `"${g.status}"`,
      g.totalAmountDue || 0,
      `"${g.paymentStatus || 'PENDING'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_ospiti_admarketing_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Creazione Nuovo Socio
  const handleCreateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocioName.trim() || !newSocioEmail.trim()) return;

    try {
      const res = await fetch('/api/soci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSocioName.trim(),
          role: newSocioRole.trim() || 'Socio Operativo',
          email: newSocioEmail.trim(),
          phone: newSocioPhone.trim(),
          quotaPercent: Number(newSocioQuota) || 0,
          badge: newSocioBadge,
          assignedWeddings: newSocioWeddings,
          permissions: ['GUEST_MANAGEMENT', 'TRANSFERS', 'HOTELS']
        })
      });
      const data = await res.json();
      if (data?.success && data?.socio) {
        setSociList(prev => [...prev, data.socio]);
        setSocioSuccessMessage(`Socio "${data.socio.name}" aggiunto con successo all'organigramma di AD Marketing!`);
        setTimeout(() => setSocioSuccessMessage(''), 5000);
        setShowAddSocioModal(false);
        setNewSocioName('');
        setNewSocioRole('');
        setNewSocioEmail('');
      }
    } catch (err) {
      console.error('Errore creazione socio:', err);
    }
  };

  // Filtraggio Audit Log
  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditActionFilter !== 'ALL' && log.entityType !== auditActionFilter) return false;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      return (
        (log.actorName && log.actorName.toLowerCase().includes(q)) ||
        (log.entityTitle && log.entityTitle.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.actionType && log.actionType.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Panoramica Agenzia AD Marketing */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-800 uppercase tracking-wider">
                AD Marketing &bull; Palagianello (TA)
              </span>
              <span className="text-xs text-neutral-300">P.IVA IT03124590731 &bull; Hospitality & Concierge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Control Room Agenzia & Hospitality Intelligence
            </h1>
            <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Monitoraggio centralizzato cross-matrimonio in Puglia: gestione ospiti, governance dei soci, logistica trasporti NCC, convenzioni alberghiere e registro azioni in tempo reale.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 text-white font-semibold text-xs rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizza</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-full shadow-sm transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esporta Report (.CSV)</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Matrimoni Attivi</span>
            <span className="text-xl font-extrabold text-white">{weddings.length}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Totale Ospiti</span>
            <span className="text-xl font-extrabold text-white">{totalGuestsCount}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-emerald-400 block text-[10px] uppercase font-semibold">RSVP Confermati</span>
            <span className="text-xl font-extrabold text-emerald-300">{confirmedGuestsCount}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-amber-400 block text-[10px] uppercase font-semibold">In Attesa</span>
            <span className="text-xl font-extrabold text-amber-300">{pendingGuestsCount}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-sky-400 block text-[10px] uppercase font-semibold">Camere Hotel</span>
            <span className="text-xl font-extrabold text-sky-300">{hotelBookedCount}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-purple-400 block text-[10px] uppercase font-semibold">Transfer / NCC</span>
            <span className="text-xl font-extrabold text-purple-300">{transferBookedCount}</span>
          </div>
        </div>
      </div>

      {socioSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{socioSuccessMessage}</span>
          </div>
          <button onClick={() => setSocioSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigazione Schede dell'Agenzia */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('guests-report')}
          className={`px-5 py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'guests-report'
              ? 'bg-stone-800 text-white shadow-sm'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Dashboard Ospiti</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-800 font-bold">
            {allGuestsCrossWedding.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('soci')}
          className={`px-5 py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'soci'
              ? 'bg-stone-800 text-white shadow-sm'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Soci AD Marketing</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-800 font-bold">
            {sociList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit-logs')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit-logs'
              ? 'bg-stone-750 text-white shadow-sm'
              : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
          }`}
        >
          <History className="w-4 h-4 text-amber-400" />
          <span>Elenco Avanzato Azioni &amp; Info App</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-700 font-extrabold">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'hotels'
              ? 'bg-stone-750 text-white shadow-sm'
              : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-500" />
          <span>Room Blocks Hotel</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'transfers'
              ? 'bg-stone-750 text-white shadow-sm'
              : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
          }`}
        >
          <Car className="w-4 h-4 text-blue-500" />
          <span>Logistica &amp; Transfer NCC</span>
        </button>

        <button
          onClick={() => setActiveTab('experiences')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'experiences'
              ? 'bg-stone-750 text-white shadow-sm'
              : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>Esperienze &amp; Tour Nozze</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-stone-750 text-white shadow-sm'
              : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>Incassi &amp; Pagamenti</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: DASHBOARD REPORT SU OGNI OSPITE (RICHIESTA UTENTE)               */}
      {/* ========================================================================= */}
      {activeTab === 'guests-report' && (
        <div className="space-y-4">
          {/* Barra Filtri Avanzati */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca ospite, email, volo, hotel, sposi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filtro Matrimonio */}
              <select
                value={selectedWeddingCode}
                onChange={(e) => setSelectedWeddingCode(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold text-neutral-700"
              >
                <option value="ALL">Tutti i Matrimoni ({weddings.length})</option>
                {weddings.map(w => (
                  <option key={w.id} value={w.weddingCode}>{w.coupleNames} ({w.weddingCode})</option>
                ))}
              </select>

              {/* Filtro Stato */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-700"
              >
                <option value="ALL">Tutti gli Stati RSVP</option>
                <option value="CONFIRMED">Solo Confermati</option>
                <option value="PENDING">In Attesa di Risposta</option>
              </select>

              {/* Filtro Dieta */}
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-700"
              >
                <option value="ALL">Tutte le Preferenze Alimentari</option>
                <option value="SPECIAL">Solo Esigenze Speciali</option>
                <option value="CELIACI">Senza Glutine (Celiachia)</option>
                <option value="VEG">Vegetariani / Vegani</option>
              </select>
            </div>
          </div>

          {/* Elenco Tabellare Dettagliato Report Ospiti */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-stone-800">
                  Elenco Dettagliato Ospiti ({filteredGuests.length} di {allGuestsCrossWedding.length})
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Dati sincronizzati in tempo reale con i portali invitati e il database centrale
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                Valuta: EUR &bull; Puglia, Italia
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ospite &amp; Origine</th>
                    <th className="py-3 px-4">Matrimonio &amp; Data</th>
                    <th className="py-3 px-4">Soggiorno Hotel</th>
                    <th className="py-3 px-4">Transfer &amp; Volo</th>
                    <th className="py-3 px-4">Esperienze</th>
                    <th className="py-3 px-4">Dieta / Note</th>
                    <th className="py-3 px-4 text-center">Stato RSVP</th>
                    <th className="py-3 px-4 text-right">Azioni Rapide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="font-semibold text-neutral-700">Nessun ospite trovato per i filtri selezionati</p>
                        <p className="text-[11px] text-neutral-400 mt-1">Modifica i criteri di ricerca o seleziona un altro matrimonio.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => {
                      const whatsappText = `Gentile ${g.name}, qui è il team Concierge di AD Marketing per il matrimonio di ${g.coupleNames}. Restiamo a completa disposizione per qualsiasi assistenza sul vostro arrivo in Puglia!`;
                      const whatsappUrl = `https://wa.me/${g.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappText)}`;
                      const mailtoUrl = `mailto:${g.email}?subject=${encodeURIComponent(`Wedding Concierge Puglia - ${g.coupleNames}`)}`;

                      return (
                        <tr key={`${g.weddingCode}-${g.id}`} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-stone-800 flex items-center gap-1.5">
                              <span>{g.flag || '📍'}</span>
                              <span>{g.name}</span>
                            </div>
                            <div className="text-[11px] text-neutral-500">{g.email}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{g.phone}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-stone-800">{g.coupleNames}</div>
                            <div className="text-[11px] font-mono font-bold text-amber-800">{g.weddingCode}</div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-neutral-400" />
                              <span>{g.weddingDate}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {g.hotelBooked && g.hotelBooked !== 'NONE' && !g.hotelBooked.includes('Nessun') ? (
                              <div>
                                <div className="font-semibold text-stone-800">{g.hotelBooked}</div>
                                <div className="text-[11px] text-amber-800 font-medium">{g.roomType || 'Camera Standard'}</div>
                                {g.hotelNights && (
                                  <div className="text-[10px] text-neutral-500">{g.hotelNights} Notti &bull; € {g.hotelEstimatePrice || 0}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic text-[11px]">Nessun hotel richiesto</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {g.transferBooked && g.transferBooked !== 'NONE' && !g.transferBooked.includes('Autonomo') ? (
                              <div>
                                <div className="font-semibold text-stone-800">{g.transferBooked}</div>
                                {g.flight && (
                                  <div className="text-[10px] text-sky-800 font-mono font-bold flex items-center gap-1 mt-0.5">
                                    <Plane className="w-3 h-3 text-sky-600" />
                                    <span>{g.flight}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic text-[11px]">Arrivo autonomo</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {g.experiences && g.experiences.length > 0 ? (
                              <div className="space-y-0.5 max-w-[200px]">
                                {g.experiences.map((expName, idx) => {
                                  const weddingObj = weddings.find(w => w.weddingCode === g.weddingCode);
                                  const foundExp = (weddingObj?.experiences || []).find(e => e.id === expName || e.title.toLowerCase() === expName.toLowerCase()) ||
                                                   masterExperiencesList.find(e => e.id === expName || e.title.toLowerCase() === expName.toLowerCase());
                                  const displayTitle = foundExp ? foundExp.title : expName.replace(/^master-exp-/, '').replace(/^exp-/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                  return (
                                    <span key={idx} className="block text-[11px] text-stone-700 truncate" title={displayTitle}>
                                      &bull; {displayTitle}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic text-[11px]">Nessuna</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {g.diet && !g.diet.toLowerCase().includes('nessuna') ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                {g.diet}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">Nessuna restrizione</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {g.status === 'CONFIRMED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Confermato</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>In Attesa</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {g.phone && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                  title="Invia WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <a
                                href={mailtoUrl}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                                title="Invia Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: ELENCO SOCI AD MARKETING PALAGIANELLO (RICHIESTA UTENTE)         */}
      {/* ========================================================================= */}
      {activeTab === 'soci' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                  Governance Societaria
                </span>
                <span className="text-xs text-neutral-500">AD Marketing S.r.l.s. &bull; Sede: Palagianello (TA)</span>
              </div>
              <h2 className="text-xl font-extrabold text-stone-800 mt-1">Elenco Soci &amp; Struttura Agenzia</h2>
              <p className="text-neutral-500 text-xs">
                Membri del team societario con relative quote partecipative, ruoli operativi, permessi e matrimoni assegnati.
              </p>
            </div>

            <button
              onClick={() => setShowAddSocioModal(true)}
              className="px-4 py-2.5 bg-stone-750 hover:bg-stone-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto hover:scale-105"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>+ Inserisci Nuovo Socio</span>
            </button>
          </div>

          {/* Griglia Schede Soci */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sociList.map((socio) => (
              <div 
                key={socio.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-stone-800">{socio.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-stone-700 border border-neutral-200">
                        {socio.badge}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-700 mt-0.5">{socio.role}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Quota Sociale</span>
                    <span className="text-lg font-black text-amber-600">{socio.quotaPercent}%</span>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-neutral-100 text-xs text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Email Aziendale:</span>
                    <a href={`mailto:${socio.email}`} className="font-semibold text-stone-800 hover:text-indigo-600 truncate max-w-[220px]">
                      {socio.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Telefono / WhatsApp:</span>
                    <a href={`tel:${socio.phone}`} className="font-mono font-semibold text-stone-800 hover:text-indigo-600">
                      {socio.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Matrimoni Assegnati:</span>
                    <span className="font-semibold text-stone-700">{socio.assignedWeddings}</span>
                  </div>
                  {socio.recentActivity && (
                    <div className="pt-1 text-[11px] text-neutral-500 italic bg-neutral-50 p-2 rounded-lg">
                      <span className="font-bold text-neutral-700 not-italic">Attività Recente:</span> {socio.recentActivity}
                    </div>
                  )}
                </div>

                {/* Permessi & Azioni */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {(socio.permissions || []).map((p, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[9px] font-mono">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://wa.me/${socio.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                      title="Contatta su WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`mailto:${socio.email}`}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                      title="Invia Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: ELENCO AVANZATO AZIONI & AUDIT LOG (RICHIESTA UTENTE)             */}
      {/* ========================================================================= */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                  Audit Log &amp; Resoconto
                </span>
                <span className="text-xs text-neutral-500">Tracciamento Totale Azioni sull'App</span>
              </div>
              <h2 className="text-xl font-extrabold text-stone-800 mt-1">Registro Avanzato Azioni Eseguite</h2>
              <p className="text-neutral-500 text-xs">
                Cronologia certificata di tutte le operazioni svolte da amministratori, soci, sposi e ospiti esteri.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-xs text-neutral-700"
              >
                <option value="ALL">Tutti i Tipi di Evento</option>
                <option value="WEDDING">Matrimoni</option>
                <option value="GUEST">Ospiti &amp; RSVP</option>
                <option value="HOTEL">Hotel &amp; Camere</option>
                <option value="TRANSFER">Transfer &amp; Voli</option>
                <option value="EMAIL">Email Gateway</option>
                <option value="STAFF">Soci &amp; Staff</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-neutral-100">
              {filteredAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  <Activity className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="font-semibold text-neutral-700">Nessuna azione registrata per questo filtro</p>
                </div>
              ) : (
                filteredAuditLogs.map((log) => {
                  let badgeColor = 'bg-neutral-100 text-stone-700';
                  if (log.actionType.includes('CREATED') || log.actionType.includes('INIT')) badgeColor = 'bg-emerald-100 text-emerald-800';
                  if (log.actionType.includes('EMAIL')) badgeColor = 'bg-blue-100 text-blue-800';
                  if (log.actionType.includes('TRANSFER')) badgeColor = 'bg-purple-100 text-purple-800';
                  if (log.actionType.includes('HOTEL')) badgeColor = 'bg-amber-100 text-amber-800';
                  if (log.actionType.includes('RSVP')) badgeColor = 'bg-teal-100 text-teal-800';

                  const dateFormatted = new Date(log.timestamp).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={log.id} className="p-4 hover:bg-neutral-50/70 transition-colors flex items-start justify-between gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 font-bold text-neutral-700 text-xs mt-0.5">
                          {log.actorName ? log.actorName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-800">{log.actorName}</span>
                            <span className="text-[10px] text-neutral-400">({log.actorRole})</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${badgeColor}`}>
                              {log.actionType}
                            </span>
                          </div>
                          <div className="font-semibold text-stone-700 text-xs mt-0.5">
                            {log.entityTitle}
                          </div>
                          <p className="text-neutral-500 text-xs mt-0.5 max-w-2xl">
                            {log.details}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 text-[11px] text-neutral-400 font-mono">
                        {dateFormatted}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: ROOM BLOCKS HOTEL                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-stone-800">Hotel Convenzionati &amp; Room Blocks</h2>
              <p className="text-neutral-500 text-xs">Monitoraggio disponibilità camere opzionate e tariffe negoziate da AD Marketing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weddings.flatMap(w => w.hotels || []).map((h, idx) => (
              <div key={`${h.id}-${idx}`} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-extrabold text-base text-stone-800">{h.name}</h3>
                  <span className="text-xs font-bold text-amber-500">{'★'.repeat(h.stars)}</span>
                </div>
                <p className="text-xs text-neutral-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{h.address}</span>
                </p>

                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl mb-3 text-xs">
                  <span className="text-amber-900 font-bold block mb-1">Tariffa Negoziata Agenzia:</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-amber-800">€ {h.negotiatedRate} <span className="text-xs font-normal text-neutral-600">/ notte</span></span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900">
                      {h.groupCode}
                    </span>
                  </div>
                  {h.negotiatedPerk && (
                    <p className="text-[11px] text-amber-800/90 mt-1 italic">&bull; {h.negotiatedPerk}</p>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Camere Bloccate:</span>
                  {(h.roomTypes || []).map(rt => (
                    <div key={rt.id} className="flex items-center justify-between text-neutral-700 bg-neutral-50 px-2.5 py-1.5 rounded-lg">
                      <span className="font-medium truncate max-w-[150px]">{rt.name}</span>
                      <span className="font-bold text-stone-800 font-mono">
                        {rt.availableRooms} / {rt.totalBlocked} disp.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: TRASFERIMENTI & LOGISTICA NCC                                    */}
      {/* ========================================================================= */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-stone-800">Navette &amp; Transfer NCC Puglia</h2>
              <p className="text-neutral-500 text-xs">Flotta Mercedes Sprinter VIP e Classe V per collegamenti Bari (BRI) e Brindisi (BDS)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weddings.flatMap(w => w.transfers || []).map((tr, idx) => (
              <div key={`${tr.id}-${idx}`} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm text-stone-800">{tr.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {tr.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-neutral-100">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Origine:</span>
                    <span className="font-semibold text-stone-700">{tr.origin}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Destinazione:</span>
                    <span className="font-semibold text-stone-700">{tr.destination}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Orario:</span>
                    <span className="font-semibold text-stone-700">{tr.departureTime}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Veicolo:</span>
                    <span className="font-semibold text-stone-700 truncate block">{tr.vehicleType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <span className="text-neutral-500">Posti Prenotati:</span>
                    <span className="font-extrabold font-mono text-stone-800 ml-1">
                      {tr.bookedSeats} / {tr.capacity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-stone-800">
                      {tr.isPaidByCouple ? 'Offerto dagli Sposi' : `€ ${tr.pricePerSeat} / pax`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: DATABASE MASTER ESPERIENZE & FORNITORI PUGLIA                     */}
      {/* ========================================================================= */}
      {activeTab === 'experiences' && (
        <div className="space-y-6">
          {/* Toast feedback assegnazione esperienza */}
          {agencyExpFeedback && (
            <div className="p-3 bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>{agencyExpFeedback}</span>
              </div>
              <button onClick={() => setAgencyExpFeedback(null)} className="text-emerald-200 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Header Control Room Esperienze & Fornitori */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                  Database Condiviso Cross-Matrimonio
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {masterExperiencesList.length} Esperienze Master · {activeSuppliers.length} Fornitori
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-stone-800 mt-1">
                Database Master Esperienze &amp; Fornitori Puglia
              </h2>
              <p className="text-neutral-500 text-xs max-w-3xl">
                Tutte le esperienze salvate o create per qualsiasi matrimonio sono costantemente condivise e disponibili per tutti i matrimoni dell'agenzia. Da qui puoi monitorare i fornitori convenzionati, le percentuali di commissione, i partecipanti e assegnare qualsiasi attività a qualsiasi coppia con 1-click.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cerca attività, fornitore, città..."
                  value={searchAgencyExp}
                  onChange={(e) => setSearchAgencyExp(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl w-48 sm:w-64 focus:bg-white focus:outline-none"
                />
              </div>
              {onNavigateToAdminTab && (
                <button
                  onClick={() => onNavigateToAdminTab('experiences')}
                  className="px-3.5 py-2 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuova nel DB</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Strip Esperienze */}
          {(() => {
            const weddingsWithExperiences = weddings.filter(w => (w.experiences || []).length > 0).length;
            const totalBookedExperienceGuests = weddings.reduce((sum, w) => {
              return sum + (w.experiences || []).reduce((expSum, e) => expSum + (e.bookedParticipants || 0), 0);
            }, 0);

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Esperienze Master DB</span>
                  <span className="text-2xl font-black text-amber-900 mt-0.5 block">{masterExperiencesList.length}</span>
                  <span className="text-[10px] text-neutral-500">Disponibili per tutti i matrimoni</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Fornitori Accreditati</span>
                  <span className="text-2xl font-black text-stone-800 mt-0.5 block">{activeSuppliers.length}</span>
                  <span className="text-[10px] text-neutral-500">Barche, masserie, folk &amp; tour</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Matrimoni con Esperienze</span>
                  <span className="text-2xl font-black text-indigo-700 mt-0.5 block">{weddingsWithExperiences} / {weddings.length}</span>
                  <span className="text-[10px] text-neutral-500">Coppie con catalogo attivo</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block">Ospiti Prenotati</span>
                  <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{totalBookedExperienceGuests} pax</span>
                  <span className="text-[10px] text-neutral-500">Partecipanti totali confermati</span>
                </div>
              </div>
            );
          })()}

          {/* Filtri Categoria */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'Tutte le Esperienze' },
              { id: 'BOAT_TOUR', label: '⛵ Gite in Barca' },
              { id: 'WINE_TASTING', label: '🍷 Degustazioni Vini' },
              { id: 'COOKING_CLASS', label: '👩‍🍳 Cooking Class' },
              { id: 'PIZZICA_NIGHT', label: '💃 Pizzica & Folklore' },
              { id: 'OIL_TOUR', label: '🫒 Tour Frantoi & Olio' },
              { id: 'WELCOME_PARTY', label: '🎉 Welcome Party' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedAgencyExpCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedAgencyExpCategory === cat.id
                    ? 'bg-amber-900 text-white font-bold shadow-2xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Griglia Master Esperienze & Fornitori */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {masterExperiencesList
              .filter(exp => {
                if (selectedAgencyExpCategory !== 'ALL' && exp.category !== selectedAgencyExpCategory) return false;
                if (searchAgencyExp.trim()) {
                  const q = searchAgencyExp.toLowerCase();
                  const sup = activeSuppliers.find(s => s.id === exp.supplierId);
                  return (
                    exp.title.toLowerCase().includes(q) ||
                    exp.description.toLowerCase().includes(q) ||
                    exp.meetingPoint.toLowerCase().includes(q) ||
                    (sup && (sup.name.toLowerCase().includes(q) || sup.city.toLowerCase().includes(q)))
                  );
                }
                return true;
              })
              .map(exp => {
                const sup = activeSuppliers.find(s => s.id === exp.supplierId);

                // Trova tutti i matrimoni che usano questa esperienza
                const weddingsUsing = weddings.filter(w => 
                  (w.experiences || []).some(e => e.title.trim().toLowerCase() === exp.title.trim().toLowerCase())
                );

                // Matrimoni a cui NON è ancora assegnata
                const weddingsNotUsing = weddings.filter(w => 
                  !(w.experiences || []).some(e => e.title.trim().toLowerCase() === exp.title.trim().toLowerCase())
                );

                const currentSelectedTarget = assignTargetWeddingCode[exp.title] || (weddingsNotUsing[0]?.weddingCode || '');

                return (
                  <div key={exp.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                          {exp.category}
                        </span>
                        <div className="text-right">
                          <span className="text-base font-black text-amber-900">€ {exp.pricePerPerson}</span>
                          <span className="text-[10px] text-neutral-400 block font-normal">a persona</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-stone-800 leading-snug font-serif-luxury">
                        {exp.title}
                      </h3>

                      {/* Scheda Fornitore Accreditato */}
                      {sup ? (
                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-neutral-500" />
                              <span>Fornitore Convenzionato:</span>
                            </span>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                              Comm. {sup.commissionPercent}% AD Marketing
                            </span>
                          </div>

                          <div className="font-bold text-stone-800">{sup.name}</div>
                          <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                            <span>Ref: {sup.contactPerson}</span>
                            <span>{sup.city}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 text-[11px]">
                            <a href={`tel:${sup.phone}`} className="text-indigo-600 font-mono hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {sup.phone}
                            </a>
                            <a
                              href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Buongiorno, ti contatto da AD Marketing per l'esperienza "${exp.title}".`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 italic">
                          Fornitore interno diretto AD Marketing
                        </div>
                      )}

                      <div className="space-y-1 text-xs text-neutral-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Durata: {exp.durationHours} ore · {exp.startTime || 'Orario flessibile'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{exp.meetingPoint || 'Puglia'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {exp.description}
                      </p>

                      {exp.negotiatedPerk && (
                        <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 italic">
                          🎁 {exp.negotiatedPerk}
                        </div>
                      )}

                      {/* Stato nei Matrimoni */}
                      <div className="pt-2 border-t border-neutral-100 text-[11px]">
                        <span className="font-bold text-stone-700 block mb-1">
                          Attiva in {weddingsUsing.length} matrimoni:
                        </span>
                        {weddingsUsing.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {weddingsUsing.map(w => (
                              <span key={w.id} className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10px]">
                                {w.weddingCode}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">Non ancora inclusa in alcun matrimonio. Pronta per l'assegnazione.</span>
                        )}
                      </div>
                    </div>

                    {/* Barra di Assegnazione Rapida a Qualsiasi Matrimonio */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                      {weddingsNotUsing.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={currentSelectedTarget}
                            onChange={(e) => setAssignTargetWeddingCode({ ...assignTargetWeddingCode, [exp.title]: e.target.value })}
                            className="flex-1 p-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-stone-800"
                          >
                            {weddingsNotUsing.map(w => (
                              <option key={w.id} value={w.weddingCode}>
                                {w.coupleNames} ({w.weddingCode})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignExpToWedding(exp, currentSelectedTarget)}
                            className="px-2.5 py-1.5 bg-amber-900 hover:bg-amber-800 text-white font-bold text-[11px] rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
                            title="Assegna questa esperienza al matrimonio selezionato con 1 click"
                          >
                            ⚡ Assegna
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded-lg text-center border border-emerald-200">
                          ✓ Attiva in tutti i {weddings.length} matrimoni registrati
                        </div>
                      )}

                      {onNavigateToAdminTab && (
                        <button
                          onClick={() => onNavigateToAdminTab('experiences', weddingsUsing[0]?.id)}
                          className="w-full text-center text-[11px] text-neutral-500 hover:text-amber-900 font-medium pt-1"
                        >
                          Modifica orari o dettagli nel Pannello Amministrativo &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: INCASSI & PAGAMENTI (RICHIESTA UTENTE)                             */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <h2 className="text-xl font-extrabold text-stone-800">Incassi &amp; Stato Pagamenti</h2>
            <p className="text-neutral-500 text-xs">Riepilogo scelte ospiti, importi totali, stato dei pagamenti e link per pagamenti online.</p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ospite</th>
                  <th className="py-3 px-4">Scelte Servizi</th>
                  <th className="py-3 px-4">Importo Totale</th>
                  <th className="py-3 px-4">Stato Pagamento</th>
                  <th className="py-3 px-4">Dettagli / Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {allGuestsCrossWedding.map((g) => {
                  const guestOrders = bookingOrders.filter(o => o.guestEmail === g.email && o.weddingCode === g.weddingCode);
                  const isPaid = g.paymentStatus === 'PAID';
                  return (
                    <tr key={g.id} className="hover:bg-neutral-50/80">
                      <td className="py-3 px-4 font-semibold text-stone-800">{g.name}</td>
                      <td className="py-3 px-4">
                        {g.experiences?.join(', ') || 'Nessuna scelta'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-700">€ {g.totalAmountDue || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {g.paymentStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {guestOrders.map((o, idx) => (
                          <div key={idx} className="text-[10px] text-neutral-500 mb-1">
                            {o.serviceTitle} ({o.paymentMethodChosen})
                            {o.paymentMethodChosen === 'SUPPLIER_PAYMENT_LINK' && (
                              <span className="text-sky-600 font-semibold block underline cursor-pointer">Link Pagamento</span>
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALI INTERATTIVI */}
      {/* ========================================================================= */}
      {showAddSocioModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-lg font-extrabold text-stone-800">Inserisci Nuovo Socio</h3>
                <p className="text-xs text-neutral-500">Aggiungi un membro societario all'organigramma di AD Marketing</p>
              </div>
              <button 
                onClick={() => setShowAddSocioModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSocio} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nome e Cognome *</label>
                <input
                  type="text"
                  required
                  value={newSocioName}
                  onChange={(e) => setNewSocioName(e.target.value)}
                  placeholder="Es. Roberta Mancini"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Ruolo Operativo *</label>
                <input
                  type="text"
                  required
                  value={newSocioRole}
                  onChange={(e) => setNewSocioRole(e.target.value)}
                  placeholder="Es. Socia & Coordinatrice Welcome Dinner"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Email Aziendale *</label>
                  <input
                    type="email"
                    required
                    value={newSocioEmail}
                    onChange={(e) => setNewSocioEmail(e.target.value)}
                    placeholder="nome@admarketing.it"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Telefono / WhatsApp</label>
                  <input
                    type="text"
                    value={newSocioPhone}
                    onChange={(e) => setNewSocioPhone(e.target.value)}
                    placeholder="+39 340 0000000"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Quota Sociale %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newSocioQuota}
                    onChange={(e) => setNewSocioQuota(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Badge Visuale</label>
                  <input
                    type="text"
                    value={newSocioBadge}
                    onChange={(e) => setNewSocioBadge(e.target.value)}
                    placeholder="Es. Event Manager"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Matrimoni o Settore Assegnato</label>
                <input
                  type="text"
                  value={newSocioWeddings}
                  onChange={(e) => setNewSocioWeddings(e.target.value)}
                  placeholder="Es. Tutti i matrimoni o Fasano / Monopoli"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowAddSocioModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-100 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-750 hover:bg-stone-700 text-white rounded-xl font-bold shadow-md"
                >
                  Salva Socio nel Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
