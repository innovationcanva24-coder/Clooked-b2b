import React, { useState, useEffect } from 'react';
import { FactureRecue, BaseERPReference, StatutFacture } from './types';
import { INITIAL_BASE_ERP, INITIAL_FACTURES_RECUES } from './data/mockData';
import { evaluerStatutFacture, normaliserNumeroTVA } from './utils/auditEngine';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { FacturesTable } from './components/FacturesTable';
import { BaseERPTable } from './components/BaseERPTable';
import { ClockedWebhookDocs } from './components/ClockedWebhookDocs';
import { UploadModal } from './components/UploadModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { ShieldCheck, Database, Zap, FileSpreadsheet, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Tables connectées
  const [baseERP, setBaseERP] = useState<BaseERPReference[]>(() => {
    try {
      const saved = localStorage.getItem('audit_base_erp_ref');
      return saved ? JSON.parse(saved) : INITIAL_BASE_ERP;
    } catch {
      return INITIAL_BASE_ERP;
    }
  });

  const [factures, setFactures] = useState<FactureRecue[]>(() => {
    try {
      const saved = localStorage.getItem('audit_factures_recues');
      return saved ? JSON.parse(saved) : INITIAL_FACTURES_RECUES;
    } catch {
      return INITIAL_FACTURES_RECUES;
    }
  });

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<FactureRecue | null>(null);

  // Synchronisation avec LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('audit_base_erp_ref', JSON.stringify(baseERP));
    } catch (e) {
      console.warn('Erreur de sauvegarde base ERP', e);
    }
  }, [baseERP]);

  useEffect(() => {
    try {
      localStorage.setItem('audit_factures_recues', JSON.stringify(factures));
    } catch (e) {
      console.warn('Erreur de sauvegarde factures', e);
    }
  }, [factures]);

  // Ajouter une facture (provenant de l'upload / OCR Clocked)
  const handleAddFacture = (nouvelleFacture: FactureRecue) => {
    setFactures((prev) => [nouvelleFacture, ...prev]);
    // Auto-select to show the immediate result
    setSelectedFacture(nouvelleFacture);
  };

  // Supprimer une facture
  const handleDeleteFacture = (id: string) => {
    setFactures((prev) => prev.filter((f) => f.ID !== id));
    if (selectedFacture?.ID === id) {
      setSelectedFacture(null);
    }
  };

  // Mise à jour manuelle du statut (dérogation comptable)
  const handleUpdateStatus = (id: string, newStatus: StatutFacture, comment: string) => {
    setFactures((prev) =>
      prev.map((f) =>
        f.ID === id
          ? {
              ...f,
              Statut: newStatus,
              Commentaire_Audit: comment,
              Date_Validation: new Date().toISOString().replace('T', ' ').slice(0, 16),
              Utilisateur_Validateur: 'Responsable Comptable (Manuel)',
            }
          : f
      )
    );
    if (selectedFacture && selectedFacture.ID === id) {
      setSelectedFacture((prev) =>
        prev
          ? {
              ...prev,
              Statut: newStatus,
              Commentaire_Audit: comment,
              Date_Validation: new Date().toISOString().replace('T', ' ').slice(0, 16),
              Utilisateur_Validateur: 'Responsable Comptable (Manuel)',
            }
          : null
      );
    }
  };

  // Actions Base_ERP_Reference
  const handleAddERP = (item: BaseERPReference) => {
    setBaseERP((prev) => [item, ...prev]);

    // Re-evaluer les factures en attente ou vérification manuelle pour ce fournisseur
    setFactures((prev) =>
      prev.map((fac) => {
        if (
          normaliserNumeroTVA(fac.Numero_TVA) === normaliserNumeroTVA(item.Numero_TVA) &&
          fac.Statut === 'Vérification manuelle'
        ) {
          const decision = evaluerStatutFacture(fac.Montant_Extrait, item.Montant_Autorise, true);
          return {
            ...fac,
            Montant_Attendu: item.Montant_Autorise,
            Numero_Bon_Commande: item.Numero_Bon_Commande,
            Statut: decision.statut,
            Commentaire_Audit: `Rapprochement automatique suite à l'ajout du BC ${item.Numero_Bon_Commande} : ${decision.raison}`,
          };
        }
        return fac;
      })
    );
  };

  const handleUpdateERP = (numeroTVA: string, updated: Partial<BaseERPReference>) => {
    const tvaNorm = normaliserNumeroTVA(numeroTVA);
    setBaseERP((prev) =>
      prev.map((item) =>
        normaliserNumeroTVA(item.Numero_TVA) === tvaNorm ? { ...item, ...updated } : item
      )
    );

    // Si le montant autorisé a changé, ré-évaluer les factures associées
    if (updated.Montant_Autorise !== undefined) {
      setFactures((prev) =>
        prev.map((fac) => {
          if (normaliserNumeroTVA(fac.Numero_TVA) === tvaNorm) {
            const decision = evaluerStatutFacture(
              fac.Montant_Extrait,
              updated.Montant_Autorise,
              true
            );
            return {
              ...fac,
              Montant_Attendu: updated.Montant_Autorise!,
              Statut: decision.statut,
              Commentaire_Audit: `Ajustement automatique suite à la mise à jour du Bon de Commande : ${decision.raison}`,
            };
          }
          return fac;
        })
      );
    }
  };

  const handleDeleteERP = (numeroTVA: string) => {
    const tvaNorm = normaliserNumeroTVA(numeroTVA);
    setBaseERP((prev) => prev.filter((item) => normaliserNumeroTVA(item.Numero_TVA) !== tvaNorm));
  };

  // Réinitialiser les données de démo
  const handleResetData = () => {
    setBaseERP(INITIAL_BASE_ERP);
    setFactures(INITIAL_FACTURES_RECUES);
    localStorage.removeItem('audit_base_erp_ref');
    localStorage.removeItem('audit_factures_recues');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetData={handleResetData}
        facturesCount={factures.length}
        erpCount={baseERP.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            factures={factures}
            baseERP={baseERP}
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectFacture={setSelectedFacture}
            onSwitchToERP={() => setCurrentTab('erp')}
            onSwitchToWebhook={() => setCurrentTab('webhook')}
          />
        )}

        {currentTab === 'factures' && (
          <FacturesTable
            factures={factures}
            onSelectFacture={setSelectedFacture}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDeleteFacture={handleDeleteFacture}
          />
        )}

        {currentTab === 'erp' && (
          <BaseERPTable
            baseERP={baseERP}
            onAddERP={handleAddERP}
            onUpdateERP={handleUpdateERP}
            onDeleteERP={handleDeleteERP}
          />
        )}

        {currentTab === 'webhook' && <ClockedWebhookDocs />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">
              Système de Validation Automatique Connecté • Règle AppSheet : <code className="font-mono text-emerald-400">IF([Montant_Extrait] = [Montant_Attendu], &quot;Approuvé&quot;, &quot;Bloqué&quot;)</code>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Table 1: <strong className="text-slate-200">Factures_Recues</strong> ({factures.length})</span>
            <span>•</span>
            <span>Table 2: <strong className="text-slate-200">Base_ERP_Reference</strong> ({baseERP.length})</span>
          </div>
        </div>
      </footer>

      {/* Modal d'Upload & Extraction Clocked */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        baseERP={baseERP}
        onAddFacture={handleAddFacture}
      />

      {/* Modal de détail d'audit & rapprochement */}
      <InvoiceDetailModal
        facture={selectedFacture}
        baseERP={baseERP}
        onClose={() => setSelectedFacture(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
