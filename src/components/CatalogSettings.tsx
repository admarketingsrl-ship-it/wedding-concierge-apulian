import React, { useState } from 'react';
import { AdminSettings } from '../data/weddingStore';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function CatalogSettings({ settings, onUpdate }: { settings: AdminSettings, onUpdate: (s: AdminSettings) => void }) {
  const [newExpCat, setNewExpCat] = useState('');
  const [newTransType, setNewTransType] = useState('');
  const [newServCat, setNewServCat] = useState('');

  const addCategory = (type: 'exp' | 'trans' | 'serv', value: string) => {
    if (!value.trim()) return;
    const updated = { ...settings };
    if (type === 'exp') updated.customExperienceCategories = [...updated.customExperienceCategories, value.trim()];
    else if (type === 'trans') updated.customTransferTypes = [...updated.customTransferTypes, value.trim()];
    else updated.customServiceCategories = [...updated.customServiceCategories, value.trim()];
    onUpdate(updated);
    if (type === 'exp') setNewExpCat('');
    else if (type === 'trans') setNewTransType('');
    else setNewServCat('');
  };

  const removeCategory = (type: 'exp' | 'trans' | 'serv', value: string) => {
    const updated = { ...settings };
    if (type === 'exp') updated.customExperienceCategories = updated.customExperienceCategories.filter(c => c !== value);
    else if (type === 'trans') updated.customTransferTypes = updated.customTransferTypes.filter(c => c !== value);
    else updated.customServiceCategories = updated.customServiceCategories.filter(c => c !== value);
    onUpdate(updated);
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-2xl border border-neutral-200">
      <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5" /> Impostazioni Catalogo (Esperienze, Transfer, Servizi)
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <CategorySection title="Categorie Esperienze" items={settings.customExperienceCategories} onAdd={(v: string) => addCategory('exp', v)} onRemove={(v: string) => removeCategory('exp', v)} value={newExpCat} onChange={setNewExpCat} />
        <CategorySection title="Tipologie Transfer" items={settings.customTransferTypes} onAdd={(v: string) => addCategory('trans', v)} onRemove={(v: string) => removeCategory('trans', v)} value={newTransType} onChange={setNewTransType} />
        <CategorySection title="Categorie Servizi Extra" items={settings.customServiceCategories} onAdd={(v: string) => addCategory('serv', v)} onRemove={(v: string) => removeCategory('serv', v)} value={newServCat} onChange={setNewServCat} />
      </div>
    </div>
  );
}

function CategorySection({ title, items, onAdd, onRemove, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      <div className="flex gap-2">
        <input className="flex-1 p-2 border rounded-lg text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Aggiungi nuova..." />
        <button onClick={() => onAdd(value)} className="p-2 bg-stone-750 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item: string) => (
          <span key={item} className="flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded text-xs">
            {item}
            <button onClick={() => onRemove(item)} className="text-neutral-500 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}
