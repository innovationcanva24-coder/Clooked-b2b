import { BaseERPReference, FactureRecue, StatutFacture } from '../types';

/**
 * Normalise un numéro de TVA (suppression des espaces, tirets et conversion en majuscules)
 */
export function normaliserNumeroTVA(tva: string): string {
  if (!tva) return '';
  return tva.replace(/[\s\.\-_]/g, '').toUpperCase();
}

/**
 * Règle de validation automatique :
 * AppSheet équivalent : IF([Montant_Extrait] = [Montant_Attendu], "Approuvé", "Bloqué")
 * Complété pour les règles d'audit compta :
 * - Si le montant n'a pas encore été extrait : "En attente"
 * - Si le fournisseur / TVA n'existe pas dans le référentiel ERP : "Vérification manuelle"
 * - Si Montant_Extrait == Montant_Attendu (à 0.01€ près) : "Approuvé"
 * - Sinon (surcoût, sous-facturation, anomalie) : "Bloqué"
 */
export function evaluerStatutFacture(
  montantExtrait: number | null | undefined,
  montantAttendu: number | null | undefined,
  erpFound: boolean = true
): { statut: StatutFacture; raison: string } {
  if (montantExtrait === null || montantExtrait === undefined || montantExtrait <= 0) {
    return {
      statut: 'En attente',
      raison: 'En attente de transmission ou d\'extraction du montant par l\'IA.',
    };
  }

  if (!erpFound || montantAttendu === null || montantAttendu === undefined) {
    return {
      statut: 'Vérification manuelle',
      raison: 'Numéro de TVA non répertorié dans la base ERP ou aucun bon de commande associé.',
    };
  }

  // Seuil d'égalité stricte avec tolérance d'arrondi décimal à 0.01€
  const ecart = Math.round((montantExtrait - montantAttendu) * 100) / 100;

  if (Math.abs(ecart) < 0.01) {
    return {
      statut: 'Approuvé',
      raison: 'Conforme : Le montant extrait correspond exactement au bon de commande validé.',
    };
  }

  if (ecart > 0) {
    return {
      statut: 'Bloqué',
      raison: `Dépassement budgétaire : +${ecart.toFixed(2)} € par rapport au montant autorisé sur le BC.`,
    };
  }

  return {
    statut: 'Bloqué',
    raison: `Discordance comptable : sous-facturation de ${Math.abs(ecart).toFixed(2)} € par rapport au BC prévu.`,
  };
}

/**
 * Rapproche une facture reçue avec la base ERP de référence
 */
export function rapprocherAvecERP(
  numeroTVA: string,
  baseERP: BaseERPReference[]
): BaseERPReference | undefined {
  const tvaNormalisee = normaliserNumeroTVA(numeroTVA);
  return baseERP.find(
    (item) => normaliserNumeroTVA(item.Numero_TVA) === tvaNormalisee
  );
}

/**
 * Calcule l'écart financier entre montant extrait et montant attendu
 */
export function calculerEcart(montantExtrait: number, montantAttendu: number) {
  const diff = Math.round((montantExtrait - montantAttendu) * 100) / 100;
  const pct = montantAttendu > 0 ? (diff / montantAttendu) * 100 : 0;
  return {
    difference: diff,
    pourcentage: pct,
    estEgal: Math.abs(diff) < 0.01,
    estDepassement: diff > 0.009,
    estSousFacture: diff < -0.009,
  };
}

/**
 * Formatage monétaire en euros
 */
export function formaterPrix(montant: number | undefined | null, devise: string = '€'): string {
  if (montant === undefined || montant === null || isNaN(montant)) {
    return `0,00 ${devise}`;
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montant);
}

/**
 * Formatage d'une date ISO en format français lisible (ex: 04 nov. 2026)
 */
export function formaterDateFR(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}
