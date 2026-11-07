import React, { useState } from 'react';
import { BaseERPReference } from '../types';
import { formaterPrix, normaliserNumeroTVA } from '../utils/auditEngine';
import {
  Database,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  FileCheck2,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface BaseERPTableProps {
  baseERP: BaseERPReference[];
  onAddERP: (item: BaseERPReference) => void;
  onUpdateERP: (numeroTVA: string, updated: Partial<BaseERPReference>) => void;
  onDeleteERP: (numeroTVA: string) => void;
}

export const BaseERPTable: React.FC<BaseERPTableProps> = ({
  baseERP,
  onAddERP,
  onUpdateERP,
  onDeleteERP,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTVA, setEditingTVA] = useState<string | null>(null);
  const [editingMontant, setEditingMontant] = useState<string>('');

  // Formulaire d'ajout
  const [newTVA, setNewTVA] = useState('');
  const [newNom, setNewNom] = useState('');
  const [newBC, setNewBC] = useState('');
  const [newMontant, setNewMontant] = useState('');
  const [newDept, setNewDept] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = baseERP.filter(
    (item) =>
      searchTerm === '' ||
      item.Fournisseur_Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Numero_TVA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Numero_Bon_Commande.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTVA.trim() || !newNom.trim() || !newBC.trim() || !newMontant) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const tvaNorm = normaliserNumeroTVA(newTVA);
    if (baseERP.some((b) => normaliserNumeroTVA(b.Numero_TVA) === tvaNorm)) {
      setErrorMsg('Ce numéro de TVA existe déjà dans la base ERP (clé unique).');
      return;
    }

    const montant = parseFloat(newMontant);
    if (isNaN(montant) || montant < 0) {
      setErrorMsg('Montant invalide.');
      return;
    }

    onAddERP({
      Numero_TVA: tvaNorm,
      Fournisseur_Nom: newNom.trim(),
      Numero_Bon_Commande: newBC.trim(),
      Montant_Autorise: montant,
      Departement: newDept.trim() || 'Achats Généraux',
      Statut_BC: 'Actif',
      Date_Creation_BC: new Date().toISOString().split('T')[0],
    });

    // Reset
    setNewTVA('');
    setNewNom('');
    setNewBC('');
    setNewMontant('');
    setNewDept('');
    setErrorMsg('');
    setIsAdding(false);
  };

  const startEdit = (item: BaseERPReference) => {
    setEditingTVA(item.Numero_TVA);
    setEditingMontant(item.Montant_Autorise.toString());
  };

  const saveEdit = (tva: string) => {
    const val = parseFloat(editingMontant);
    if (!isNaN(val) && val >= 0) {
      onUpdateERP(tva, { Montant_Autorise: val });
    }
    setEditingTVA(null);
  };

  return (
    <div className="space-y-4">
      {/* Table Header & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Table &quot;Base_ERP_Reference&quot;
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              {baseERP.length} Bons de Commande actifs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Base de données interne de contrôle. Utilisée pour le rapprochement automatique par clé <code className="font-mono text-cyan-400">Numero_TVA</code>.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setErrorMsg('');
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Nouveau Bon de Commande ERP</span>
        </button>
      </div>

      {/* Formulaire d'ajout rapide */}
      {isAdding && (
        <form
          onSubmit={handleSaveNew}
          className="bg-slate-900/90 border border-cyan-500/40 p-5 rounded-2xl space-y-4 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <FileCheck2 className="w-4 h-4" />
              <span>Créer une référence de contrôle (Bon de commande approuvé)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Numero_TVA (Clé unique) *</label>
              <input
                type="text"
                placeholder="Ex: FR12345678901"
                value={newTVA}
                onChange={(e) => setNewTVA(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Fournisseur_Nom *</label>
              <input
                type="text"
                placeholder="Ex: CloudScale Infra SAS"
                value={newNom}
                onChange={(e) => setNewNom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Numero_Bon_Commande *</label>
              <input
                type="text"
                placeholder="Ex: BC-2026-110"
                value={newBC}
                onChange={(e) => setNewBC(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Montant_Autorise (€ TTC) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 3450.00"
                value={newMontant}
                onChange={(e) => setNewMontant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Enregistrer dans l'ERP
            </button>
          </div>
        </form>
      )}

      {/* Barre de recherche */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par N° TVA, Fournisseur ou N° Bon de Commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          💡 La colonne <strong className="text-white font-mono">Numero_TVA</strong> est la clé de jointure automatique avec Clocked.
        </div>
      </div>

      {/* Table Base_ERP_Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 font-mono">Numero_TVA (Clé unique)</th>
                <th className="py-3 px-4">Fournisseur_Nom</th>
                <th className="py-3 px-4">Numero_Bon_Commande</th>
                <th className="py-3 px-4 text-right">Montant_Autorise (Plafond TTC)</th>
                <th className="py-3 px-4">Département / Acheteur</th>
                <th className="py-3 px-4 text-center">Statut BC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    Aucune référence trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isEditing = editingTVA === item.Numero_TVA;
                  return (
                    <tr
                      key={item.Numero_TVA}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-cyan-400">
                        {item.Numero_TVA}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.Fournisseur_Nom}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {item.Numero_Bon_Commande}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={editingMontant}
                              onChange={(e) => setEditingMontant(e.target.value)}
                              className="w-24 bg-slate-950 border border-cyan-500 text-white rounded px-2 py-0.5 text-xs text-right"
                            />
                            <button
                              onClick={() => saveEdit(item.Numero_TVA)}
                              className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingTVA(null)}
                              className="p-1 text-slate-400 hover:bg-slate-800 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-white">{formaterPrix(item.Montant_Autorise)}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div>{item.Departement || 'Achats'}</div>
                        {item.Acheteur_Responsable && (
                          <div className="text-slate-500">{item.Acheteur_Responsable}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.Statut_BC || 'Actif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Modifier le montant autorisé"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteERP(item.Numero_TVA)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="Supprimer la référence ERP"
                          >
                            <Trash2 className="w-3 h-3" />
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
