/**
 * Types pour l'application d'audit et de validation automatique de factures B2B
 */

export type StatutFacture = 'En attente' | 'Approuvé' | 'Bloqué' | 'Vérification manuelle';

export interface LigneFacture {
  description: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
}

/** Table Factures_Recues */
export interface FactureRecue {
  ID: string; // Clé unique, ex: "FAC-2026-001"
  Date_Reception: string; // YYYY-MM-DD
  Fichier_PDF: string; // Nom du fichier ou URL de prévisualisation
  Fournisseur_Nom: string;
  Numero_TVA: string;
  Montant_Extrait: number; // type Prix
  Montant_Attendu: number; // type Prix (extrait du Bon de Commande ERP)
  Statut: StatutFacture;
  
  // Champs complémentaires d'audit comptable
  Numero_Facture?: string;
  Numero_Bon_Commande?: string;
  Date_Echeance?: string;
  Devise?: string;
  Commentaire_Audit?: string;
  Lignes?: LigneFacture[];
  Date_Validation?: string;
  Utilisateur_Validateur?: string;
  Score_Confiance_IA?: number; // 0 à 100%
  Apercu_Document_Texte?: string;
}

/** Table Base_ERP_Reference */
export interface BaseERPReference {
  Numero_TVA: string; // Clé unique
  Fournisseur_Nom: string;
  Numero_Bon_Commande: string;
  Montant_Autorise: number; // type Prix
  
  // Métadonnées d'achat interne
  Date_Creation_BC?: string;
  Acheteur_Responsable?: string;
  Departement?: string;
  Statut_BC?: 'Actif' | 'Consommé' | 'Suspendu';
  Description_Achat?: string;
}

/** Schéma de réponse Clocked / Extraction IA */
export interface ClockedExtractionResult {
  fournisseur_nom: string;
  numero_tva: string;
  montant_ttc: number;
  numero_facture: string;
  date_facture?: string;
  lignes?: LigneFacture[];
  raw_text?: string;
  confidence?: number;
}
