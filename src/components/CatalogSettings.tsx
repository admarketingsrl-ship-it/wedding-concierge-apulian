import React, { useState } from 'react';
import { AdminSettings, CoupleOnboardingDossier } from '../data/weddingStore';
import { Plus, Trash2, Tag, Sparkles, Sliders } from 'lucide-react';
import OnboardingInviteSettings from './OnboardingInviteSettings';

export interface CatalogSettingsProps {
  settings: AdminSettings;
  onUpdate: (s: AdminSettings) => void;
  onboardingDossiers?: CoupleOnboardingDossier[];
  onConvertDossierToWedding?: (dossier: CoupleOnboardingDossier) => void;
  onOpenLandingPreview?: () => void;
}

export default function CatalogSettings({ 
  settings, 
  onUpdate,
  onboardingDossiers = [],
  onConvertDossierToWedding,
  onOpenLandingPreview
}: CatalogSettingsProps) {
  const [activeTab, setActiveTab] = useState<'invite' | 'catalog'>('invite');
  const [newExpCat, setNewExpCat] = useState('');
  const [newTransType, setNewTransType] = useState('');
  const [newServCat, setNewServCat] = useState('');

  const addCategory = (type: 'exp' | 'trans' | 'serv', value: string) => {
    if (!value.trim()) return;
    const updated = { ...settings };
    if (type === 'exp') updated.customExperienceCategories = [...(updated.customExperienceCategories || []), value.trim()];
    else if (type === 'trans') updated.customTransferTypes = [...(updated.customTransferTypes || []), value.trim()];
    else updated.customServiceCategories = [...(updated.customServiceCategories || []), value.trim()];
    onUpdate(updated);
    if (type === 'exp') setNewExpCat('');
    else if (type === 'trans') setNewTransType('');
    else setNewServCat('');
  };

  const removeCategory = (type: 'exp' | 'trans' | 'serv', value: string) => {
    const updated = { ...settings };
    if (type === 'exp') updated.customExperienceCategories = (updated.customExperienceCategories || []).filter(c => c !== value);
    else if (type === 'trans') updated.customTransferTypes = (updated.customTransferTypes || []).filter(c => c !== value);
    else updated.customServiceCategories = (updated.customServiceCategories || []).filter(c => c !== value);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Switcher Tab Interno Impostazioni */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-2xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('invite')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'invite'
              ? 'bg-amber-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Landing Page Onboarding Sposi &amp; Messaggio Invito</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Tag className="w-4 h-4 text-stone-400" />
          <span>Categorie Catalogo (Esperienze, Transfer, Servizi)</span>
        </button>
      </div>

      {/* Contenuto Tab 1: Invito Sposi Landing Page & Messaggio Valeria */}
      {activeTab === 'invite' && (
        <OnboardingInviteSettings 
          settings={settings}
          onUpdateSettings={onUpdate}
          onboardingDossiers={onboardingDossiers}
          onConvertDossierToWedding={onConvertDossierToWedding}
          onOpenLandingPreview={onOpenLandingPreview}
        />
      )}

      {/* Contenuto Tab 2: Categorie Catalogo */}
      {activeTab === 'catalog' && (
        <div className="space-y-8 p-6 bg-white rounded-3xl border border-neutral-200 shadow-2xs">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-lg font-bold text-stone-800 font-serif-luxury flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-800" /> 
              <span>Impostazioni Categorie Catalogo</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Personalizza le tipologie e i tag visualizzati nei filtri dell'agenzia e del portale ospiti.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <CategorySection 
              title="Categorie Esperienze" 
              items={settings.customExperienceCategories || []} 
              onAdd={(v: string) => addCategory('exp', v)} 
              onRemove={(v: string) => removeCategory('exp', v)} 
              value={newExpCat} 
              onChange={setNewExpCat} 
            />
            <CategorySection 
              title="Tipologie Transfer" 
              items={settings.customTransferTypes || []} 
              onAdd={(v: string) => addCategory('trans', v)} 
              onRemove={(v: string) => removeCategory('trans', v)} 
              value={newTransType} 
              onChange={setNewTransType} 
            />
            <CategorySection 
              title="Categorie Servizi Extra" 
              items={settings.customServiceCategories || []} 
              onAdd={(v: string) => addCategory('serv', v)} 
              onRemove={(v: string) => removeCategory('serv', v)} 
              value={newServCat} 
              onChange={setNewServCat} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySection({ title, items, onAdd, onRemove, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">{title}</h3>
      <div className="flex gap-2">
        <input 
          className="flex-1 p-2 border border-stone-200 rounded-xl text-xs bg-stone-50/50 focus:outline-none focus:ring-1 focus:ring-amber-900" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder="Aggiungi nuova..." 
        />
        <button 
          type="button"
          onClick={() => onAdd(value)} 
          className="p-2 bg-amber-900 text-white rounded-xl hover:bg-amber-950 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {items.length === 0 ? (
          <span className="text-[11px] text-stone-400 italic">Nessuna categoria personalizzata</span>
        ) : (
          items.map((item: string) => (
            <span key={item} className="flex items-center gap-1 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700">
              {item}
              <button 
                type="button"
                onClick={() => onRemove(item)} 
                className="text-stone-400 hover:text-rose-600 ml-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
