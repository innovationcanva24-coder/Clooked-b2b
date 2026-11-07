import { BaseERPReference, FactureRecue } from '../types';

export const INITIAL_BASE_ERP: BaseERPReference[] = [
  {
    Numero_TVA: 'FR12345678901',
    Fournisseur_Nom: 'CloudScale Infra SAS',
    Numero_Bon_Commande: 'BC-2026-104',
    Montant_Autorise: 3450.00,
    Date_Creation_BC: '2026-10-15',
    Acheteur_Responsable: 'Élodie Mercier (DSI)',
    Departement: 'Informatique & Cloud',
    Statut_BC: 'Actif',
    Description_Achat: 'Abonnement clusters serveurs & sauvegardes T4 2026',
  },
  {
    Numero_TVA: 'FR98765432100',
    Fournisseur_Nom: 'Papeterie & Mobilier Pro',
    Numero_Bon_Commande: 'BC-2026-105',
    Montant_Autorise: 840.00,
    Date_Creation_BC: '2026-10-20',
    Acheteur_Responsable: 'Thomas Lefevre (Moyens Généraux)',
    Departement: 'Services Généraux',
    Statut_BC: 'Actif',
    Description_Achat: 'Fournitures de bureau et consommables ergonomiques',
  },
  {
    Numero_TVA: 'FR55443322110',
    Fournisseur_Nom: 'SecurGroup CyberDéfense',
    Numero_Bon_Commande: 'BC-2026-106',
    Montant_Autorise: 12500.00,
    Date_Creation_BC: '2026-10-01',
    Acheteur_Responsable: 'Marc Vasseur (RSSI)',
    Departement: 'Cybersécurité',
    Statut_BC: 'Actif',
    Description_Achat: 'Audit annuel de pénétration et certification SOC 2',
  },
  {
    Numero_TVA: 'FR88997766554',
    Fournisseur_Nom: 'LogiTrans Express SARL',
    Numero_Bon_Commande: 'BC-2026-107',
    Montant_Autorise: 1920.50,
    Date_Creation_BC: '2026-10-28',
    Acheteur_Responsable: 'Sophie Durant (Logistique)',
    Departement: 'Supply Chain',
    Statut_BC: 'Actif',
    Description_Achat: 'Fret express palettes distribution France & Bénélux',
  },
  {
    Numero_TVA: 'FR33221144556',
    Fournisseur_Nom: 'Cabinet Audit & Juridique ABL',
    Numero_Bon_Commande: 'BC-2026-108',
    Montant_Autorise: 4800.00,
    Date_Creation_BC: '2026-10-12',
    Acheteur_Responsable: 'Claire Moreau (Direction Financière)',
    Departement: 'Juridique & Fiscal',
    Statut_BC: 'Actif',
    Description_Achat: 'Conseil fiscal clôture semestrielle et restructuration',
  },
  {
    Numero_TVA: 'FR77112233445',
    Fournisseur_Nom: 'DevOps Agile Consulting',
    Numero_Bon_Commande: 'BC-2026-109',
    Montant_Autorise: 6200.00,
    Date_Creation_BC: '2026-11-01',
    Acheteur_Responsable: 'Julien Roux (CTO)',
    Departement: 'Engineering',
    Statut_BC: 'Actif',
    Description_Achat: 'Accompagnement migration Kubernetes & pipeline CI/CD',
  },
];

export const INITIAL_FACTURES_RECUES: FactureRecue[] = [
  {
    ID: 'FAC-2026-0891',
    Numero_Facture: 'INV-2026-891',
    Date_Reception: '2026-11-04',
    Fichier_PDF: 'Facture_CloudScale_Nov2026.pdf',
    Fournisseur_Nom: 'CloudScale Infra SAS',
    Numero_TVA: 'FR12345678901',
    Montant_Extrait: 3450.00,
    Montant_Attendu: 3450.00,
    Statut: 'Approuvé',
    Numero_Bon_Commande: 'BC-2026-104',
    Date_Echeance: '2026-12-04',
    Devise: 'EUR',
    Commentaire_Audit: 'Validation automatique réussie : Montant conforme à 100% avec le bon de commande BC-2026-104.',
    Score_Confiance_IA: 99,
    Date_Validation: '2026-11-04 14:22',
    Utilisateur_Validateur: 'Automate Clocked OCR v2',
    Lignes: [
      { description: 'Instances serveurs haute performance (4 nodes)', quantite: 1, prixUnitaire: 2200.00, montantTotal: 2200.00 },
      { description: 'Stockage SSD répliqué 5 To multi-zone', quantite: 5, prixUnitaire: 150.00, montantTotal: 750.00 },
      { description: 'Bande passante dédiée et IP Anycast', quantite: 1, prixUnitaire: 500.00, montantTotal: 500.00 },
    ],
    Apercu_Document_Texte: `FACTURE CloudScale Infra SAS
N° Facture : INV-2026-891 | Date : 04/11/2026
TVA Intracommunautaire : FR12345678901
Bon de commande client réf : BC-2026-104
Total HT : 2 875,00 € | TVA (20%) : 575,00 €
TOTAL TTC : 3 450,00 €`,
  },
  {
    ID: 'FAC-2026-0892',
    Numero_Facture: 'F-2026-0922',
    Date_Reception: '2026-11-05',
    Fichier_PDF: 'Facture_SecurGroup_Audit.pdf',
    Fournisseur_Nom: 'SecurGroup CyberDéfense',
    Numero_TVA: 'FR55443322110',
    Montant_Extrait: 13850.00,
    Montant_Attendu: 12500.00,
    Statut: 'Bloqué',
    Numero_Bon_Commande: 'BC-2026-106',
    Date_Echeance: '2026-11-30',
    Devise: 'EUR',
    Commentaire_Audit: 'Alerte blocage automatique : Dépassement budgétaire de +1 350,00 € détecté par rapport au Bon de Commande BC-2026-106 (12 500,00 € max autorisé). Frais non négociés ajoutés.',
    Score_Confiance_IA: 97,
    Date_Validation: '2026-11-05 09:15',
    Utilisateur_Validateur: 'Règle Contrôle Automatique ERP',
    Lignes: [
      { description: 'Audit de sécurité réseau et pentest externe', quantite: 1, prixUnitaire: 12500.00, montantTotal: 12500.00 },
      { description: 'Frais de rédaction rapport exécutif d\'urgence (Hors Devis)', quantite: 1, prixUnitaire: 1350.00, montantTotal: 1350.00 },
    ],
    Apercu_Document_Texte: `FACTURE SecurGroup CyberDéfense
N° Facture : F-2026-0922 | Date : 05/11/2026
N° TVA : FR55443322110
Réf Bon de Commande : BC-2026-106
Prestations : Pentest 12 500 € + Frais d'urgence 1 350 €
TOTAL TTC : 13 850,00 €`,
  },
  {
    ID: 'FAC-2026-0893',
    Numero_Facture: 'PAP-88319',
    Date_Reception: '2026-11-05',
    Fichier_PDF: 'Papeterie_Mobilier_0883.pdf',
    Fournisseur_Nom: 'Papeterie & Mobilier Pro',
    Numero_TVA: 'FR98765432100',
    Montant_Extrait: 840.00,
    Montant_Attendu: 840.00,
    Statut: 'Approuvé',
    Numero_Bon_Commande: 'BC-2026-105',
    Date_Echeance: '2026-12-05',
    Devise: 'EUR',
    Commentaire_Audit: 'Validation automatique effectuée avec succès. Montant extrait strictement égal au montant autorisé.',
    Score_Confiance_IA: 98,
    Date_Validation: '2026-11-05 11:40',
    Utilisateur_Validateur: 'Automate Clocked OCR v2',
    Lignes: [
      { description: 'Chaises de bureau ergonomiques mesh respirant', quantite: 4, prixUnitaire: 180.00, montantTotal: 720.00 },
      { description: 'Lots ramettes de papier recyclé 80g & stylos', quantite: 10, prixUnitaire: 12.00, montantTotal: 120.00 },
    ],
    Apercu_Document_Texte: `FACTURE Papeterie & Mobilier Pro
Facture N° : PAP-88319 | TVA : FR98765432100
Réf BC : BC-2026-105
Montant TTC : 840,00 €`,
  },
  {
    ID: 'FAC-2026-0894',
    Numero_Facture: 'FL-2026-441',
    Date_Reception: '2026-11-06',
    Fichier_PDF: 'Facture_Studio_Design_Paris.pdf',
    Fournisseur_Nom: 'Studio Grafik Nova',
    Numero_TVA: 'FR44998877665',
    Montant_Extrait: 2150.00,
    Montant_Attendu: 0,
    Statut: 'Vérification manuelle',
    Date_Echeance: '2026-11-25',
    Devise: 'EUR',
    Commentaire_Audit: 'Action requise : Fournisseur et numéro de TVA non reconnus dans la base ERP de référence. Aucun Bon de Commande actif n\'a pu être apparié.',
    Score_Confiance_IA: 94,
    Date_Validation: '2026-11-06 08:30',
    Utilisateur_Validateur: 'Système ERP Rapprochement',
    Lignes: [
      { description: 'Refonte charte graphique et bannières corporate', quantite: 1, prixUnitaire: 2150.00, montantTotal: 2150.00 },
    ],
    Apercu_Document_Texte: `FACTURE Studio Grafik Nova
Facture N° : FL-2026-441 | TVA : FR44998877665
Nouveau Fournisseur - Prestation graphique
Montant TTC : 2 150,00 €`,
  },
  {
    ID: 'FAC-2026-0895',
    Numero_Facture: 'LOG-77210',
    Date_Reception: '2026-11-06',
    Fichier_PDF: 'Bordereau_LogiTrans_Palettes.pdf',
    Fournisseur_Nom: 'LogiTrans Express SARL',
    Numero_TVA: 'FR88997766554',
    Montant_Extrait: 2450.00,
    Montant_Attendu: 1920.50,
    Statut: 'Bloqué',
    Numero_Bon_Commande: 'BC-2026-107',
    Date_Echeance: '2026-11-20',
    Devise: 'EUR',
    Commentaire_Audit: 'Bloqué automatiquement : Écart de +529,50 € constaté (+27,5% au-dessus du plafond négocié de 1 920,50 €). Surcharge carburant non contractuelle.',
    Score_Confiance_IA: 96,
    Date_Validation: '2026-11-06 10:04',
    Utilisateur_Validateur: 'Règle Contrôle Automatique ERP',
    Lignes: [
      { description: 'Transport palettes hub Lyon -> Lille', quantite: 1, prixUnitaire: 1920.50, montantTotal: 1920.50 },
      { description: 'Supplément livraison créneau samedi matin & péages', quantite: 1, prixUnitaire: 529.50, montantTotal: 529.50 },
    ],
    Apercu_Document_Texte: `FACTURE LogiTrans Express SARL
N° Facture : LOG-77210 | TVA : FR88997766554
Réf Commande : BC-2026-107
Montant Attendu sur BC : 1 920,50 €
Montant Total Facturé TTC : 2 450,00 €`,
  },
  {
    ID: 'FAC-2026-0896',
    Numero_Facture: 'ABL-2026-550',
    Date_Reception: '2026-11-06',
    Fichier_PDF: 'Note_Honoraires_ABL_Novembre.pdf',
    Fournisseur_Nom: 'Cabinet Audit & Juridique ABL',
    Numero_TVA: 'FR33221144556',
    Montant_Extrait: 0,
    Montant_Attendu: 4800.00,
    Statut: 'En attente',
    Numero_Bon_Commande: 'BC-2026-108',
    Date_Echeance: '2026-12-15',
    Devise: 'EUR',
    Commentaire_Audit: 'Document PDF déposé par le portail comptabilité. En attente de numérisation OCR et d\'extraction des montants.',
    Score_Confiance_IA: 0,
    Apercu_Document_Texte: `NOTE D'HONORAIRES
Cabinet Audit & Juridique ABL
Document reçu en attente d'audit par l'automate.`,
  },
];

/**
 * Modèles de factures prêtes pour la simulation d'upload / OCR
 */
export const SAMPLE_INVOICE_TEMPLATES = [
  {
    name: 'DevOps Agile Consulting (Conforme 100%)',
    description: 'Montant attendu : 6 200,00 € -> Extrait : 6 200,00 € -> Devient Vert (Approuvé)',
    fileName: 'Facture_DevOps_Agile_BC109.pdf',
    payload: {
      fournisseur_nom: 'DevOps Agile Consulting',
      numero_tva: 'FR77112233445',
      montant_ttc: 6200.00,
      numero_facture: 'DEV-2026-9901',
      date_facture: '2026-11-06',
      lignes: [
        { description: 'Sprint 14 migration Kubernetes & GitOps', quantite: 10, prixUnitaire: 500.00, montantTotal: 5000.00 },
        { description: 'Support et astreinte week-end de bascule', quantite: 1, prixUnitaire: 1200.00, montantTotal: 1200.00 },
      ],
      raw_text: `FACTURE DevOps Agile Consulting
N° Facture : DEV-2026-9901 | Date : 06/11/2026
TVA Intracommunautaire : FR77112233445
Bon de commande ERP : BC-2026-109
Total HT : 5 166,67 €
TVA 20% : 1 033,33 €
Total TTC : 6 200,00 €`,
    },
  },
  {
    name: 'CloudScale Infra SAS (Surcoût anormal)',
    description: 'Montant attendu : 3 450,00 € -> Extrait : 3 890,00 € (+440 €) -> Devient Rouge (Bloqué)',
    fileName: 'Facture_CloudScale_Surcout.pdf',
    payload: {
      fournisseur_nom: 'CloudScale Infra SAS',
      numero_tva: 'FR12345678901',
      montant_ttc: 3890.00,
      numero_facture: 'INV-2026-945',
      date_facture: '2026-11-06',
      lignes: [
        { description: 'Instances serveurs haute performance', quantite: 1, prixUnitaire: 3450.00, montantTotal: 3450.00 },
        { description: 'Frais de support premium non autorisés', quantite: 1, prixUnitaire: 440.00, montantTotal: 440.00 },
      ],
      raw_text: `FACTURE CloudScale Infra SAS
N° Facture : INV-2026-945 | Date : 06/11/2026
TVA : FR12345678901
Bon de commande associé : BC-2026-104
Total TTC Facturé : 3 890,00 €`,
    },
  },
  {
    name: 'Nouveau Fournisseur Inconnu (Hors ERP)',
    description: 'TVA FR11998822334 non trouvée dans l\'ERP -> Passe en Orange (Vérification manuelle)',
    fileName: 'Facture_Acme_Agency.pdf',
    payload: {
      fournisseur_nom: 'Acme Digital Agency Ltd',
      numero_tva: 'FR11998822334',
      montant_ttc: 1750.00,
      numero_facture: 'ACM-2026-110',
      date_facture: '2026-11-06',
      lignes: [
        { description: 'Création de vidéo promotionnelle 4K', quantite: 1, prixUnitaire: 1750.00, montantTotal: 1750.00 },
      ],
      raw_text: `FACTURE Acme Digital Agency Ltd
N° Facture : ACM-2026-110 | Date : 06/11/2026
TVA : FR11998822334 (Non référencé ERP)
Total TTC : 1 750,00 €`,
    },
  },
];
