import React from 'react';
import { FactureRecue } from '../types';
import { formaterPrix } from '../utils/auditEngine';
import { FileText, CheckCircle2, AlertOctagon, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

interface KPICardsProps {
  factures: FactureRecue[];
  onFilterStatus?: (statut: string | null) => void;
  activeFilter?: string | null;
}

export const KPICards: React.FC<KPICardsProps> = ({
  factures,
  onFilterStatus,
  activeFilter,
}) => {
  const totalCount = factures.length;
  const approuvees = factures.filter((f) => f.Statut === 'Approuvé');
  const bloquees = factures.filter((f) => f.Statut === 'Bloqué');
  const enAttente = factures.filter((f) => f.Statut === 'En attente');
  const verifManuelle = factures.filter((f) => f.Statut === 'Vérification manuelle');

  const totalMontantExtrait = factures.reduce((acc, f) => acc + (f.Montant_Extrait || 0), 0);
  const montantApprouve = approuvees.reduce((acc, f) => acc + (f.Montant_Extrait || 0), 0);
  const montantBloque = bloquees.reduce((acc, f) => acc + (f.Montant_Extrait || 0), 0);

  // Calcul du taux d'automatisation (factures traitées automatiquement sans intervention manuelle)
  const traiteesAuto = approuvees.length + bloquees.length;
  const tauxAuto = totalCount > 0 ? Math.round((traiteesAuto / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Factures */}
      <button
        onClick={() => onFilterStatus && onFilterStatus(null)}
        className={`p-4 rounded-xl border transition-all text-left group ${
          activeFilter === null
            ? 'bg-slate-800/90 border-emerald-500/50 ring-1 ring-emerald-500/30'
            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Factures Reçues
          </span>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-slate-700 transition-colors">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{totalCount}</span>
          <span className="text-xs text-slate-400">({formaterPrix(totalMontantExtrait)})</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
          <span>Taux d'automatisation : <strong className="text-slate-200">{tauxAuto}%</strong></span>
        </div>
      </button>

      {/* Approuvées (Vert) */}
      <button
        onClick={() => onFilterStatus && onFilterStatus('Approuvé')}
        className={`p-4 rounded-xl border transition-all text-left group ${
          activeFilter === 'Approuvé'
            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
            : 'bg-slate-900/70 border-emerald-900/30 hover:border-emerald-500/50 hover:bg-emerald-950/20'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Approuvées (Conformes)
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">
            {approuvees.length}
          </span>
          <span className="text-xs text-emerald-300/80">
            {formaterPrix(montantApprouve)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Validation automatique : <span className="font-mono text-emerald-400">Montant = BC</span>
        </p>
      </button>

      {/* Bloquées (Rouge) */}
      <button
        onClick={() => onFilterStatus && onFilterStatus('Bloqué')}
        className={`p-4 rounded-xl border transition-all text-left group ${
          activeFilter === 'Bloqué'
            ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
            : 'bg-slate-900/70 border-rose-900/30 hover:border-rose-500/50 hover:bg-rose-950/20'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Bloquées (Litiges / Écart)
          </span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-400 tracking-tight">
            {bloquees.length}
          </span>
          <span className="text-xs text-rose-300/80">
            {formaterPrix(montantBloque)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Rejet automatique : <span className="text-rose-400">Dépassement de devis</span>
        </p>
      </button>

      {/* En attente & Vérification manuelle */}
      <button
        onClick={() => onFilterStatus && onFilterStatus(activeFilter === 'En attente' ? 'Vérification manuelle' : 'En attente')}
        className={`p-4 rounded-xl border transition-all text-left group ${
          activeFilter === 'En attente' || activeFilter === 'Vérification manuelle'
            ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
            : 'bg-slate-900/70 border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            À Traiter / En attente
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 flex gap-1">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-white tracking-tight">
            {enAttente.length + verifManuelle.length}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400" title="En cours d'OCR">
              ⏳ {enAttente.length} attente
            </span>
            <span className="text-amber-400" title="TVA hors ERP">
              🔍 {verifManuelle.length} audit
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Nécessite OCR ou vérification référentiel TVA
        </p>
      </button>
    </div>
  );
};
