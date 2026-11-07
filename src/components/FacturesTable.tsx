import React, { useState } from 'react';
import { FactureRecue, StatutFacture } from '../types';
import { StatusBadge } from './StatusBadge';
import { formaterPrix, formaterDateFR, calculerEcart } from '../utils/auditEngine';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface FacturesTableProps {
  factures: FactureRecue[];
  onSelectFacture: (facture: FactureRecue) => void;
  onOpenUpload: () => void;
  onDeleteFacture: (id: string) => void;
}

export const FacturesTable: React.FC<FacturesTableProps> = ({
  factures,
  onSelectFacture,
  onOpenUpload,
  onDeleteFacture,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('Tous');
  const [sortField, setSortField] = useState<'Date_Reception' | 'Montant_Extrait' | 'Fournisseur_Nom'>('Date_Reception');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filtrage
  const filtered = factures
    .filter((f) => {
      const matchSearch =
        searchTerm === '' ||
        f.Fournisseur_Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.Numero_TVA.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.Numero_Facture && f.Numero_Facture.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatut = filterStatut === 'Tous' || f.Statut === filterStatut;
      return matchSearch && matchStatut;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  const exportCSV = () => {
    const headers = [
      'ID',
      'Date_Reception',
      'Fichier_PDF',
      'Fournisseur_Nom',
      'Numero_TVA',
      'Montant_Extrait',
      'Montant_Attendu',
      'Statut',
      'Ecart',
    ];
    const rows = factures.map((f) => [
      f.ID,
      f.Date_Reception,
      `"${f.Fichier_PDF}"`,
      `"${f.Fournisseur_Nom}"`,
      f.Numero_TVA,
      f.Montant_Extrait.toFixed(2),
      f.Montant_Attendu.toFixed(2),
      f.Statut,
      (f.Montant_Extrait - f.Montant_Attendu).toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Factures_Recues_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Table &quot;Factures_Recues&quot;
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {filtered.length} enregistrements
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Table principale des factures fournisseurs reçues, avec montants extraits par OCR et statuts calculés.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Ajouter une Facture (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filtrer la table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 shrink-0">Filtrer Statut :</span>
          {['Tous', 'Approuvé', 'Bloqué', 'Vérification manuelle', 'En attente'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatut(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                filterStatut === st
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3.5 font-mono">ID (Clé)</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('Date_Reception');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Date_Reception</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Fichier_PDF</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('Fournisseur_Nom');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Fournisseur_Nom</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-mono">Numero_TVA</th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('Montant_Extrait');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Montant_Extrait</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Montant_Attendu</th>
                <th className="py-3 px-3 text-center">Statut (Formule)</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    Aucune facture trouvée correspondant aux critères.
                  </td>
                </tr>
              ) : (
                filtered.map((facture) => {
                  const ecart = calculerEcart(facture.Montant_Extrait, facture.Montant_Attendu);
                  return (
                    <tr
                      key={facture.ID}
                      onClick={() => onSelectFacture(facture)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        {facture.ID}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {formaterDateFR(facture.Date_Reception)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-mono text-[11px] bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          <FileText className="w-3 h-3" />
                          {facture.Fichier_PDF}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{facture.Fournisseur_Nom}</div>
                        {facture.Numero_Facture && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            N° {facture.Numero_Facture}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {facture.Numero_TVA}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-sm text-white">
                          {formaterPrix(facture.Montant_Extrait)}
                        </div>
                        {facture.Statut === 'Bloqué' && ecart.difference !== 0 && (
                          <div className="text-[10px] font-mono text-rose-400 font-semibold">
                            +{formaterPrix(ecart.difference)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-cyan-400">
                        {facture.Montant_Attendu > 0 ? formaterPrix(facture.Montant_Attendu) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge statut={facture.Statut} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectFacture(facture)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Auditer la facture"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFacture(facture.ID)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="Supprimer la facture"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
  );
};
