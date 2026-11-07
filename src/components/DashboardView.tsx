import React, { useState } from 'react';
import { FactureRecue, BaseERPReference } from '../types';
import { KPICards } from './KPICards';
import { StatusBadge } from './StatusBadge';
import { formaterPrix, formaterDateFR, calculerEcart } from '../utils/auditEngine';
import {
  UploadCloud,
  ArrowUpDown,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DashboardViewProps {
  factures: FactureRecue[];
  baseERP: BaseERPReference[];
  onOpenUpload: () => void;
  onSelectFacture: (facture: FactureRecue) => void;
  onSwitchToERP: () => void;
  onSwitchToWebhook: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  factures,
  baseERP,
  onOpenUpload,
  onSelectFacture,
  onSwitchToERP,
  onSwitchToWebhook,
}) => {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage et recherche
  const filteredFactures = factures.filter((f) => {
    const matchesStatus = filterStatus ? f.Statut === filterStatus : true;
    const matchesSearch =
      searchTerm === '' ||
      f.Fournisseur_Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.Numero_TVA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.Numero_Facture && f.Numero_Facture.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.ID.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses = [
    { key: 'Approuvé', label: 'Approuvées (Conformes)', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' },
    { key: 'Bloqué', label: 'Bloquées (Litiges budgétaires)', color: 'border-rose-500/40 text-rose-400 bg-rose-950/20' },
    { key: 'Vérification manuelle', label: 'Vérification manuelle', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
    { key: 'En attente', label: 'En attente de traitement', color: 'border-slate-700 text-slate-300 bg-slate-900/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with AppSheet Formula Reminder & Upload Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Système Autonome de Rapprochement Comptable</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tableau de bord d'Audit & Validation
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Validation automatique en direct connectant la table <strong className="text-white font-mono">Factures_Recues</strong> à la table <strong className="text-white font-mono">Base_ERP_Reference</strong> via la règle :
              <span className="block mt-1 font-mono text-xs bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-emerald-400">
                IF([Montant_Extrait] = [Montant_Attendu], &quot;Approuvé&quot;, &quot;Bloqué&quot;)
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <UploadCloud className="w-5 h-5 text-slate-950" />
              <span>Téléverser un nouveau PDF</span>
            </button>
            <button
              onClick={onSwitchToWebhook}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>API Clocked / Webhook</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards
        factures={factures}
        activeFilter={filterStatus}
        onFilterStatus={(st) => setFilterStatus(st)}
      />

      {/* Controls Bar: Search, View Mode, Reset filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher par Fournisseur, TVA, N° Facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {filterStatus && (
            <button
              onClick={() => setFilterStatus(null)}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
            >
              <span>Filtre : {filterStatus}</span>
              <span className="font-bold">×</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Disposition :</span>
          <button
            onClick={() => setViewMode('grouped')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'grouped'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Vue groupée par Statut"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Groupé par Statut</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Vue liste continue"
          >
            <List className="w-4 h-4" />
            <span>Liste continue</span>
          </button>
        </div>
      </div>

      {/* Mode Groupé par Statut (Colonnes de contrôle visuel Vert / Rouge / Ambre / Ardoise) */}
      {viewMode === 'grouped' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statuses.map(({ key, label, color }) => {
            const items = filteredFactures.filter((f) => f.Statut === key);
            return (
              <div
                key={key}
                className="flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 min-h-[420px]"
              >
                {/* En-tête de colonne */}
                <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-950/60 font-mono">
                    {items.length}
                  </span>
                </div>

                {/* Cartes factures */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 italic">
                      Aucune facture dans cette catégorie
                    </div>
                  ) : (
                    items.map((facture) => {
                      const ecart = calculerEcart(facture.Montant_Extrait, facture.Montant_Attendu);
                      return (
                        <div
                          key={facture.ID}
                          onClick={() => onSelectFacture(facture)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer group bg-slate-950/70 hover:bg-slate-850 hover:shadow-lg ${
                            facture.Statut === 'Approuvé'
                              ? 'border-emerald-950 hover:border-emerald-500/50'
                              : facture.Statut === 'Bloqué'
                              ? 'border-rose-950 hover:border-rose-500/50'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-xs font-mono text-slate-400">{facture.ID}</span>
                            <StatusBadge statut={facture.Statut} size="sm" />
                          </div>

                          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {facture.Fournisseur_Nom}
                          </h3>

                          <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                            TVA : {facture.Numero_TVA}
                          </div>

                          {/* Comparaison des montants */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs">
                            <div className="flex justify-between items-baseline">
                              <span className="text-slate-400 text-[11px]">Montant Extrait :</span>
                              <span className="font-mono font-bold text-white">
                                {formaterPrix(facture.Montant_Extrait)}
                              </span>
                            </div>

                            <div className="flex justify-between items-baseline">
                              <span className="text-slate-400 text-[11px]">Montant Attendu (BC) :</span>
                              <span className="font-mono text-cyan-400">
                                {facture.Montant_Attendu ? formaterPrix(facture.Montant_Attendu) : '-'}
                              </span>
                            </div>

                            {/* Alerte d'écart si bloqué */}
                            {facture.Statut === 'Bloqué' && ecart.difference !== 0 && (
                              <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 text-[11px] font-mono font-medium flex items-center justify-between">
                                <span>Écart non autorisé :</span>
                                <span>+{formaterPrix(ecart.difference)}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 truncate max-w-[140px]">
                              <FileText className="w-3 h-3 shrink-0" />
                              {facture.Fichier_PDF}
                            </span>
                            <span className="group-hover:text-slate-300 flex items-center gap-0.5">
                              Audit <Eye className="w-3 h-3 ml-0.5 inline" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vue Liste Table Continue */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Date Réception</th>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4">N° TVA</th>
                  <th className="py-3 px-4 text-right">Montant Extrait</th>
                  <th className="py-3 px-4 text-right">Montant Attendu</th>
                  <th className="py-3 px-4 text-center">Statut (AppSheet Formula)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredFactures.map((facture) => {
                  const ecart = calculerEcart(facture.Montant_Extrait, facture.Montant_Attendu);
                  return (
                    <tr
                      key={facture.ID}
                      onClick={() => onSelectFacture(facture)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-emerald-400">{facture.ID}</td>
                      <td className="py-3 px-4 text-slate-300">{formaterDateFR(facture.Date_Reception)}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div>{facture.Fournisseur_Nom}</div>
                        <div className="text-[11px] font-mono text-slate-400">{facture.Fichier_PDF}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{facture.Numero_TVA}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        {formaterPrix(facture.Montant_Extrait)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-cyan-400">
                        {facture.Montant_Attendu ? formaterPrix(facture.Montant_Attendu) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge statut={facture.Statut} size="md" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFacture(facture);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Détails</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
