import React, { useState } from 'react';
import { FactureRecue, BaseERPReference, StatutFacture } from '../types';
import { StatusBadge } from './StatusBadge';
import { formaterPrix, formaterDateFR, calculerEcart } from '../utils/auditEngine';
import {
  X,
  FileText,
  Building2,
  Receipt,
  Scale,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Code,
  Download,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InvoiceDetailModalProps {
  facture: FactureRecue | null;
  baseERP: BaseERPReference[];
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: StatutFacture, comment: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  facture,
  baseERP,
  onClose,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'preview' | 'json'>('audit');
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideComment, setOverrideComment] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<StatutFacture>('Approuvé');

  if (!facture) return null;

  const ecart = calculerEcart(facture.Montant_Extrait, facture.Montant_Attendu);
  const matchedERP = baseERP.find(
    (e) => e.Numero_TVA.replace(/\s+/g, '') === facture.Numero_TVA.replace(/\s+/g, '')
  );

  const handleApplyOverride = () => {
    if (!overrideComment.trim()) return;
    onUpdateStatus(
      facture.ID,
      overrideStatus,
      `Forçage manuel comptable (${overrideStatus}) : ${overrideComment}`
    );
    setShowOverrideForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Facture {facture.Numero_Facture || facture.ID}
                </h2>
                <StatusBadge statut={facture.Statut} size="lg" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ID interne : <span className="font-mono text-slate-300">{facture.ID}</span> • Reçue le {formaterDateFR(facture.Date_Reception)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fermer la fenêtre d'audit"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Rapprochement & Audit ERP</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Aperçu Document ({facture.Fichier_PDF})</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 px-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Schéma JSON Clocked Extrait</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'audit' && (
            <>
              {/* Règle de validation en vedette */}
              <div
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  facture.Statut === 'Approuvé'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : facture.Statut === 'Bloqué'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {facture.Statut === 'Approuvé' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : facture.Statut === 'Bloqué' ? (
                    <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      Règle de validation : IF([Montant_Extrait] = [Montant_Attendu], &quot;Approuvé&quot;, &quot;Bloqué&quot;)
                    </h3>
                    <p className="text-sm mt-1 text-slate-300">
                      {facture.Commentaire_Audit || 'Contrôle automatique exécuté lors de la réception du document.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Écart financier</div>
                  <div className={`text-xl font-bold font-mono ${ecart.estEgal ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ecart.difference > 0 ? `+${formaterPrix(ecart.difference)}` : formaterPrix(ecart.difference)}
                  </div>
                </div>
              </div>

              {/* Comparatif 2 Tables : Factures_Recues vs Base_ERP_Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Table 1 : Facture Reçue */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Table : Factures_Recues
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Source : PDF / Clocked
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Fournisseur_Nom :</span>
                      <span className="font-medium text-white">{facture.Fournisseur_Nom}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Numero_TVA :</span>
                      <span className="font-mono text-slate-200">{facture.Numero_TVA}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Date_Reception :</span>
                      <span className="text-slate-200">{formaterDateFR(facture.Date_Reception)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Fichier_PDF :</span>
                      <span className="text-sky-400 font-mono text-xs truncate max-w-[180px]">
                        {facture.Fichier_PDF}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 pt-2 bg-slate-900/80 px-2 rounded-lg">
                      <span className="text-slate-300 font-semibold">Montant_Extrait (TTC) :</span>
                      <span className="font-mono font-bold text-base text-white">
                        {formaterPrix(facture.Montant_Extrait)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table 2 : Base ERP Référence */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Table : Base_ERP_Reference
                    </span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Contrôle Interne
                    </span>
                  </div>

                  {matchedERP ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Fournisseur_Nom :</span>
                        <span className="font-medium text-white">{matchedERP.Fournisseur_Nom}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Numero_TVA :</span>
                        <span className="font-mono text-slate-200">{matchedERP.Numero_TVA}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Numero_Bon_Commande :</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          {matchedERP.Numero_Bon_Commande}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Acheteur / Dép. :</span>
                        <span className="text-slate-300 text-xs">
                          {matchedERP.Acheteur_Responsable || matchedERP.Departement || 'Non spécifié'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 pt-2 bg-slate-900/80 px-2 rounded-lg">
                        <span className="text-slate-300 font-semibold">Montant_Autorise (BC) :</span>
                        <span className="font-mono font-bold text-base text-cyan-300">
                          {formaterPrix(matchedERP.Montant_Autorise)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-amber-400 space-y-2">
                      <AlertOctagon className="w-8 h-8 mx-auto text-amber-400" />
                      <p className="text-sm font-semibold">TVA non enregistrée dans l'ERP</p>
                      <p className="text-xs text-slate-400">
                        Le numéro de TVA <code className="font-mono text-slate-300">{facture.Numero_TVA}</code> n'a aucune correspondance dans la table Base_ERP_Reference.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lignes d'articles extraites */}
              {facture.Lignes && facture.Lignes.length > 0 && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Détail des prestations extraites ({facture.Lignes.length} lignes)
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/40 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Qté</th>
                        <th className="py-2 px-3 text-right">Prix Unit. HT</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {facture.Lignes.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="py-2 px-3 text-slate-200">{line.description}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{line.quantite}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">
                            {formaterPrix(line.prixUnitaire)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-white">
                            {formaterPrix(line.montantTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Forçage manuel comptable */}
              {showOverrideForm ? (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <h4 className="text-sm font-semibold text-white">
                    Modification manuelle du Statut comptable
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Nouveau Statut</label>
                      <select
                        value={overrideStatus}
                        onChange={(e) => setOverrideStatus(e.target.value as StatutFacture)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      >
                        <option value="Approuvé">Approuvé (Dérogation acceptée)</option>
                        <option value="Bloqué">Bloqué (Rejet confirmé)</option>
                        <option value="Vérification manuelle">Vérification manuelle</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Motif comptable obligatoire</label>
                      <input
                        type="text"
                        placeholder="Ex: Avenant bon de commande signé par DAF"
                        value={overrideComment}
                        onChange={(e) => setOverrideComment(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowOverrideForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleApplyOverride}
                      disabled={!overrideComment.trim()}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50"
                    >
                      Enregistrer la décision
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowOverrideForm(true)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    Action Comptable / Dérogation manuelle
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'preview' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-sans space-y-6 relative overflow-hidden">
              {/* Tampon de validation visuel */}
              <div className="absolute right-8 top-8 transform rotate-12 pointer-events-none select-none">
                {facture.Statut === 'Approuvé' && (
                  <div className="border-4 border-emerald-500 text-emerald-500 px-4 py-2 rounded-xl text-lg font-black tracking-widest uppercase opacity-80 shadow-lg shadow-emerald-500/20">
                    APPROUVÉ • CONFORME
                  </div>
                )}
                {facture.Statut === 'Bloqué' && (
                  <div className="border-4 border-rose-500 text-rose-500 px-4 py-2 rounded-xl text-lg font-black tracking-widest uppercase opacity-80 shadow-lg shadow-rose-500/20">
                    BLOQUÉ • ÉCART DÉTECTÉ
                  </div>
                )}
                {facture.Statut === 'Vérification manuelle' && (
                  <div className="border-4 border-amber-500 text-amber-500 px-4 py-2 rounded-xl text-lg font-black tracking-widest uppercase opacity-80 shadow-lg shadow-amber-500/20">
                    AUDIT COMPTABLE REQUIS
                  </div>
                )}
              </div>

              {/* Header Facture */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{facture.Fournisseur_Nom}</h3>
                  <p className="text-xs text-slate-400 mt-1">Numéro TVA Intracommunautaire : <span className="font-mono text-slate-300">{facture.Numero_TVA}</span></p>
                  <p className="text-xs text-slate-400">Siège social • Document certifié conforme</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Facture N°</div>
                  <div className="text-lg font-bold font-mono text-white">{facture.Numero_Facture || facture.ID}</div>
                  <div className="text-xs text-slate-400 mt-1">Date : {formaterDateFR(facture.Date_Reception)}</div>
                  {facture.Numero_Bon_Commande && (
                    <div className="text-xs text-emerald-400 font-mono mt-0.5">Réf BC : {facture.Numero_Bon_Commande}</div>
                  )}
                </div>
              </div>

              {/* Aperçu texte brut numérisé */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {facture.Apercu_Document_Texte || `FACTURE NUMÉRISÉE
Fournisseur : ${facture.Fournisseur_Nom}
TVA : ${facture.Numero_TVA}
Montant Total TTC : ${formaterPrix(facture.Montant_Extrait)}`}
              </div>

              {/* Total Box */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Montant Extrait TTC :</span>
                    <span className="font-mono font-bold text-white text-sm">{formaterPrix(facture.Montant_Extrait)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Montant Attendu (ERP) :</span>
                    <span className="font-mono text-cyan-400">{formaterPrix(facture.Montant_Attendu)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                    <span className="font-semibold text-slate-300">Statut de validation :</span>
                    <span className="font-bold">{facture.Statut}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  Payload JSON conforme au schéma d'extraction Clocked demandé
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Score Confiance : {facture.Score_Confiance_IA || 98}%
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    fournisseur_nom: facture.Fournisseur_Nom,
    numero_tva: facture.Numero_TVA,
    montant_ttc: facture.Montant_Extrait,
    numero_facture: facture.Numero_Facture || facture.ID,
    validation_status: facture.Statut,
    matched_purchase_order: facture.Numero_Bon_Commande || null,
    expected_amount: facture.Montant_Attendu,
    timestamp: facture.Date_Validation || new Date().toISOString(),
  },
  null,
  2
)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <div>
            Validateur : <span className="text-slate-300 font-medium">{facture.Utilisateur_Validateur || 'Automate Clocked OCR'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
