import React, { useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  LogOut, 
  Globe, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Heart
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subtitle?: string;
  badge?: string | number;
  highlight?: boolean;
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  items: MenuItem[];
  title?: string;
  subtitle?: string;
  weddingCode?: string;
  guestName?: string;
  onLogout?: () => void;
  onOpenChat?: () => void;
  onNavigateHome?: () => void;
  lang?: 'it' | 'en';
  setLang?: (lang: 'it' | 'en') => void;
}

export default function HamburgerMenu({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  items,
  title = 'Menu Navigazione',
  subtitle,
  weddingCode,
  guestName,
  onLogout,
  onOpenChat,
  onNavigateHome,
  lang = 'it',
  setLang
}: HamburgerMenuProps) {
  // Chiudi menu con tasto Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Blocca lo scroll del body quando il menu è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Sfondo semitrasparente con effetto sfocato delicato */}
      <div 
        className={`fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pannello menu a scorrimento laterale da sinistra */}
      <aside 
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-sm sm:max-w-md bg-[#FAF8F5] z-50 shadow-2xl flex flex-col justify-between border-r border-[#E6E0D6] transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu laterale"
      >
        {/* Header Drawer */}
        <div className="p-6 border-b border-[#E6E0D6] bg-white/80 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center font-serif-luxury font-bold text-lg shadow-sm border border-stone-800">
                P
              </div>
              <div>
                <span className="text-base font-serif-luxury font-bold tracking-tight text-stone-900 block leading-tight">
                  Apulian Concierge
                </span>
                <span className="text-[10px] text-amber-800 uppercase tracking-widest font-semibold block mt-0.5">
                  Bespoke Wedding & Tourism
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              title="Chiudi menu"
              aria-label="Chiudi menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dettagli contesto utente (Ospite o Matrimonio) */}
          {(guestName || weddingCode || subtitle) && (
            <div className="mt-4 pt-3.5 border-t border-[#EFECE6] flex items-center justify-between text-xs">
              <div className="truncate">
                {guestName && (
                  <p className="font-semibold text-stone-800 truncate">
                    {guestName}
                  </p>
                )}
                {subtitle && (
                  <p className="text-[11px] text-stone-500 truncate">
                    {subtitle}
                  </p>
                )}
              </div>

              {weddingCode && (
                <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 font-mono text-[10px] text-stone-700 font-bold shrink-0">
                  {weddingCode}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Lista Voci di Navigazione */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
          <div className="px-2 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {title}
            </span>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'text-stone-700 hover:bg-white hover:text-stone-900 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-white/15 text-amber-200' 
                        : 'bg-stone-200/60 text-stone-700 group-hover:bg-stone-200'
                    }`}>
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${
                          isActive ? 'text-white' : 'text-stone-800'
                        }`}>
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className={`text-[11px] truncate mt-0.5 ${
                          isActive ? 'text-stone-300' : 'text-stone-500'
                        }`}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-amber-200 translate-x-0.5' : 'text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5'
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer del Drawer */}
        <div className="p-4 border-t border-[#E6E0D6] bg-white/90 space-y-3">
          {/* Card Assistenza Valeria Concierge */}
          {onOpenChat && (
            <button
              onClick={() => {
                onOpenChat();
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    V
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-950">
                    Concierge Valeria
                  </span>
                  <span className="block text-[10px] text-emerald-700">
                    Assistenza live · Online
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-md">
                Chat
              </span>
            </button>
          )}

          {/* Controlli lingua e home */}
          <div className="flex items-center justify-between pt-1 text-xs text-stone-600">
            {setLang ? (
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                <Globe className="w-3.5 h-3.5 text-stone-500 ml-1" />
                <button
                  type="button"
                  onClick={() => setLang('it')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    lang === 'it' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  IT
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    lang === 'en' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  EN
                </button>
              </div>
            ) : <div />}

            {onNavigateHome && (
              <button
                onClick={() => {
                  onNavigateHome();
                  onClose();
                }}
                className="text-stone-600 hover:text-stone-900 text-xs font-medium cursor-pointer"
              >
                Torna alla Home
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 text-rose-700 hover:text-rose-900 font-semibold text-xs cursor-pointer px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Esci</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
