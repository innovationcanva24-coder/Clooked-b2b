import React from 'react';
import { StatutFacture } from '../types';
import { CheckCircle2, AlertOctagon, HelpCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  statut: StatutFacture;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  statut,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  switch (statut) {
    case 'Approuvé':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/40 ${sizeClasses[size]}`}
          title="Facture approuvée automatiquement : Montant extrait = Montant attendu"
        >
          {showIcon && <CheckCircle2 className={`${iconSizes[size]} text-emerald-400 shrink-0`} />}
          <span>Approuvé</span>
        </span>
      );

    case 'Bloqué':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-950/40 ${sizeClasses[size]}`}
          title="Facture bloquée : Discordance entre montant extrait et montant autorisé"
        >
          {showIcon && <AlertOctagon className={`${iconSizes[size]} text-rose-400 shrink-0`} />}
          <span>Bloqué</span>
        </span>
      );

    case 'Vérification manuelle':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-950/40 ${sizeClasses[size]}`}
          title="Action requise : TVA non trouvée dans la base ERP ou anomalie de référencement"
        >
          {showIcon && <HelpCircle className={`${iconSizes[size]} text-amber-400 shrink-0`} />}
          <span>Vérification manuelle</span>
        </span>
      );

    case 'En attente':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses[size]}`}
          title="Facture reçue en attente d'extraction OCR"
        >
          {showIcon && <Clock className={`${iconSizes[size]} text-slate-400 shrink-0`} />}
          <span>En attente</span>
        </span>
      );
  }
};
