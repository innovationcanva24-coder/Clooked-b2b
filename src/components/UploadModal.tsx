import React, { useState } from 'react';
import { FactureRecue, BaseERPReference } from '../types';
import { SAMPLE_INVOICE_TEMPLATES } from '../data/mockData';
import { evaluerStatutFacture, formaterPrix, normaliserNumeroTVA } from '../utils/auditEngine';
import {
  X,
  UploadCloud,
  FileCheck,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Cpu,
  Layers,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseERP: BaseERPReference[];
  onAddFacture: (nouvelleFacture: FactureRecue) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  baseERP,
  onAddFacture,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Custom Form fields if user wants to enter custom invoice
  const [customNom, setCustomNom] = useState('');
  const [customTVA, setCustomTVA] = useState('FR12345678901');
  const [customMontant, setCustomMontant] = useState('3450.00');
  const [customFactureNum, setCustomFactureNum] = useState('FAC-2026-999');

  // Audit processing state
  const [processingStep, setProcessingStep] = useState<number>(0); // 0: Idle, 1: OCR, 2: ERP Lookup, 3: Rule, 4: Done
  const [analyzedFacture, setAnalyzedFacture] = useState<FactureRecue | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    setIsCustomMode(false);
    setSelectedFile(null);
  };

  const handleStartAnalysis = async () => {
    setProcessingStep(1);

    let extractedData = {
      fournisseur_nom: '',
      numero_tva: '',
      montant_ttc: 0,
      numero_facture: '',
      fileName: 'facture_document.pdf',
      raw_text: '',
      lignes: [] as any[],
    };

    if (isCustomMode) {
      extractedData = {
        fournisseur_nom: customNom || 'Fournisseur Personnalisé',
        numero_tva: customTVA,
        montant_ttc: parseFloat(customMontant) || 0,
        numero_facture: customFactureNum || `INV-${Date.now().toString().slice(-4)}`,
        fileName: selectedFile ? selectedFile.name : 'Facture_Upload.pdf',
        raw_text: `Facture personnalisée\nTVA: ${customTVA}\nTotal TTC: ${customMontant} €`,
        lignes: [
          { description: 'Prestation / Marchandise fournie', quantite: 1, prixUnitaire: parseFloat(customMontant) || 0, montantTotal: parseFloat(customMontant) || 0 }
        ],
      };
    } else {
      const template = SAMPLE_INVOICE_TEMPLATES[selectedTemplateIndex];
      extractedData = {
        fournisseur_nom: template.payload.fournisseur_nom,
        numero_tva: template.payload.numero_tva,
        montant_ttc: template.payload.montant_ttc,
        numero_facture: template.payload.numero_facture,
        fileName: template.fileName,
        raw_text: template.payload.raw_text,
        lignes: template.payload.lignes,
      };
    }

    // Step 1: OCR Clocked schema extraction via server proxy /api/clocked/extract
    try {
      const apiRes = await fetch('/api/clocked/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_text: extractedData.raw_text,
          file_name: extractedData.fileName,
        }),
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json?.data) {
          if (json.data.fournisseur_nom) extractedData.fournisseur_nom = json.data.fournisseur_nom;
          if (json.data.numero_tva) extractedData.numero_tva = json.data.numero_tva;
          if (typeof json.data.montant_ttc === 'number') extractedData.montant_ttc = json.data.montant_ttc;
          if (json.data.numero_facture) extractedData.numero_facture = json.data.numero_facture;
        }
      }
    } catch (e) {
      console.warn('Fallback extraction locale :', e);
    }

    await new Promise((r) => setTimeout(r, 450));
    setProcessingStep(2);

    // Step 2: Rapprochement avec Base_ERP_Reference
    await new Promise((r) => setTimeout(r, 450));
    const matchedERP = baseERP.find(
      (item) => normaliserNumeroTVA(item.Numero_TVA) === normaliserNumeroTVA(extractedData.numero_tva)
    );
    const montantAttendu = matchedERP ? matchedERP.Montant_Autorise : 0;
    const erpFound = !!matchedERP;

    setProcessingStep(3);

    // Step 3: Application de la règle de validation automatique AppSheet
    await new Promise((r) => setTimeout(r, 450));
    const decision = evaluerStatutFacture(extractedData.montant_ttc, montantAttendu, erpFound);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

    const newFacture: FactureRecue = {
      ID: `FAC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      Date_Reception: dateStr,
      Fichier_PDF: extractedData.fileName,
      Fournisseur_Nom: extractedData.fournisseur_nom,
      Numero_TVA: extractedData.numero_tva,
      Montant_Extrait: extractedData.montant_ttc,
      Montant_Attendu: montantAttendu,
      Statut: decision.statut,
      Numero_Facture: extractedData.numero_facture,
      Numero_Bon_Commande: matchedERP ? matchedERP.Numero_Bon_Commande : undefined,
      Commentaire_Audit: decision.raison,
      Date_Validation: `${dateStr} ${timeStr}`,
      Utilisateur_Validateur: 'Automate Clocked OCR v2',
      Score_Confiance_IA: 98,
      Lignes: extractedData.lignes,
      Apercu_Document_Texte: extractedData.raw_text,
    };

    setAnalyzedFacture(newFacture);
    setProcessingStep(4);
  };

  const handleConfirmAndAdd = () => {
    if (analyzedFacture) {
      onAddFacture(analyzedFacture);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setProcessingStep(0);
    setAnalyzedFacture(null);
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Téléverser & Valider une Facture (PDF)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit automatique : extraction Clocked et rapprochement avec la table Base_ERP_Reference
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fermer le dialogue d'ajout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {processingStep === 0 && (
            <>
              {/* Choix du mode d'insertion */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  1. Sélectionner un jeu de test ou déposer un fichier
                </label>

                {/* Templates rapides pour démonstration en direct */}
                <div className="grid grid-cols-1 gap-2.5">
                  {SAMPLE_INVOICE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectTemplate(idx)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        !isCustomMode && selectedTemplateIndex === idx
                          ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          idx === 0
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : idx === 1
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{tmpl.name}</span>
                          <span className="text-xs font-mono text-slate-400">{tmpl.payload.numero_tva}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{tmpl.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Ou glisser/déposer un fichier réel ou saisie libre */}
                <div className="pt-2">
                  <div
                    onClick={() => setIsCustomMode(true)}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      isCustomMode
                        ? 'border-emerald-500 bg-slate-800/50'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      className="hidden"
                      id="custom-pdf-upload"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          setIsCustomMode(true);
                          setCustomNom(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                    <label htmlFor="custom-pdf-upload" className="cursor-pointer block">
                      <FileText className="w-7 h-7 mx-auto text-slate-400 mb-1" />
                      <span className="text-xs font-medium text-slate-200">
                        {selectedFile ? `Fichier sélectionné : ${selectedFile.name}` : 'Téléverser votre propre fichier PDF / Image'}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Glissez-déposez ou cliquez pour parcourir (PDF, PNG, JPG)
                      </span>
                    </label>
                  </div>
                </div>

                {isCustomMode && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
                    <div className="text-xs font-semibold text-slate-300">Paramètres de la facture personnalisée :</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Fournisseur</label>
                        <input
                          type="text"
                          value={customNom}
                          onChange={(e) => setCustomNom(e.target.value)}
                          placeholder="Nom de l'entreprise"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Numéro TVA Intracommunautaire</label>
                        <input
                          type="text"
                          value={customTVA}
                          onChange={(e) => setCustomTVA(e.target.value)}
                          placeholder="FR12345678901"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Montant Extrait TTC (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customMontant}
                          onChange={(e) => setCustomMontant(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Numéro Facture</label>
                        <input
                          type="text"
                          value={customFactureNum}
                          onChange={(e) => setCustomFactureNum(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Étapes d'analyse en cours */}
          {processingStep >= 1 && processingStep < 4 && (
            <div className="py-8 space-y-6 text-center">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Cpu className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Audit et Rapprochement Automatique en cours...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Exécution du schéma d'instruction Clocked & interconnexion avec Base_ERP_Reference
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto text-left">
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-3 transition-colors ${
                  processingStep >= 1 ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>1. Extraction OCR stricte (Fournisseur, TVA, Montant TTC, N° Facture)</span>
                </div>
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-3 transition-colors ${
                  processingStep >= 2 ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>2. Rapprochement par Numero_TVA dans la table Base_ERP_Reference</span>
                </div>
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-3 transition-colors ${
                  processingStep >= 3 ? 'bg-purple-950/30 border-purple-500/40 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>3. Application de la règle : IF([Montant_Extrait] = [Montant_Attendu], &quot;Approuvé&quot;, &quot;Bloqué&quot;)</span>
                </div>
              </div>
            </div>
          )}

          {/* Résultat instantané de l'audit */}
          {processingStep === 4 && analyzedFacture && (
            <div className="space-y-5 animate-fade-in">
              <div
                className={`p-5 rounded-2xl border text-center transition-all shadow-xl ${
                  analyzedFacture.Statut === 'Approuvé'
                    ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-300'
                    : analyzedFacture.Statut === 'Bloqué'
                    ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/30 text-rose-300'
                    : 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/30 text-amber-300'
                }`}
              >
                <div className="inline-flex p-3 rounded-2xl mb-2 bg-slate-950/40">
                  {analyzedFacture.Statut === 'Approuvé' && (
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  )}
                  {analyzedFacture.Statut === 'Bloqué' && (
                    <AlertOctagon className="w-10 h-10 text-rose-400" />
                  )}
                  {analyzedFacture.Statut === 'Vérification manuelle' && (
                    <HelpCircle className="w-10 h-10 text-amber-400" />
                  )}
                </div>

                <div className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                  RÉSULTAT DE L'AUDIT AUTOMATIQUE
                </div>
                <div className="text-2xl font-black mt-1 text-white">
                  Statut : {analyzedFacture.Statut}
                </div>
                <p className="text-sm mt-1 max-w-lg mx-auto text-slate-200">
                  {analyzedFacture.Commentaire_Audit}
                </p>
              </div>

              {/* Tableau comparatif des deux tables */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Montant Extrait (PDF Clocked)</span>
                  <span className="font-mono font-bold text-base text-white">
                    {formaterPrix(analyzedFacture.Montant_Extrait)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Montant Attendu (Bon de Commande ERP)</span>
                  <span className="font-mono font-bold text-base text-cyan-400">
                    {analyzedFacture.Montant_Attendu ? formaterPrix(analyzedFacture.Montant_Attendu) : '0,00 € (Aucun BC)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fournisseur</span>
                  <span className="font-medium text-slate-200">{analyzedFacture.Fournisseur_Nom}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Numéro TVA</span>
                  <span className="font-mono text-slate-200">{analyzedFacture.Numero_TVA}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
          >
            Annuler
          </button>

          {processingStep === 0 && (
            <button
              onClick={handleStartAnalysis}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lancer l'audit automatique (Clocked IA)</span>
            </button>
          )}

          {processingStep === 4 && (
            <button
              onClick={handleConfirmAndAdd}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <span>Ajouter à la table Factures_Recues</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
