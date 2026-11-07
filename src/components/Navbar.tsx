import React from 'react';
import {
  FileSpreadsheet,
  LayoutDashboard,
  Database,
  UploadCloud,
  Zap,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'factures' | 'erp' | 'webhook';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onResetData: () => void;
  facturesCount: number;
  erpCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenUpload,
  onResetData,
  facturesCount,
  erpCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  AuditFactures
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  B2B
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Service Comptable • Validation Automatique ERP
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => onTabChange('factures')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'factures'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Factures_Recues</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                currentTab === 'factures' ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {facturesCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('erp')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'erp'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Base_ERP_Reference</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                currentTab === 'erp' ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {erpCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('webhook')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'webhook'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>API Clocked / Webhook</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onResetData}
              title="Réinitialiser les données de démonstration"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              aria-label="Réinitialiser les données"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Téléverser Facture (PDF)</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-850 overflow-x-auto gap-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => onTabChange('factures')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'factures' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Factures_Recues ({facturesCount})
          </button>
          <button
            onClick={() => onTabChange('erp')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'erp' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Base_ERP ({erpCount})
          </button>
          <button
            onClick={() => onTabChange('webhook')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'webhook' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Clocked API
          </button>
        </div>
      </div>
    </header>
  );
};
