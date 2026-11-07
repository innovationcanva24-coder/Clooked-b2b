import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluerStatutFacture,
  normaliserNumeroTVA,
  rapprocherAvecERP,
  calculerEcart,
} from './auditEngine';
import { BaseERPReference } from '../types';

test('normaliserNumeroTVA strips spaces, dots, dashes and upper cases', () => {
  assert.equal(normaliserNumeroTVA('fr 12 345 678 901'), 'FR12345678901');
  assert.equal(normaliserNumeroTVA('FR-99.888-777'), 'FR99888777');
  assert.equal(normaliserNumeroTVA(''), '');
});

test('evaluerStatutFacture approves when extracted equals expected', () => {
  const result = evaluerStatutFacture(1500.00, 1500.00, true);
  assert.equal(result.statut, 'Approuvé');
});

test('evaluerStatutFacture blocks when extracted amount exceeds expected amount', () => {
  const result = evaluerStatutFacture(1650.00, 1500.00, true);
  assert.equal(result.statut, 'Bloqué');
  assert.match(result.raison, /Dépassement/);
});

test('evaluerStatutFacture blocks when extracted amount is lower than expected', () => {
  const result = evaluerStatutFacture(1200.00, 1500.00, true);
  assert.equal(result.statut, 'Bloqué');
  assert.match(result.raison, /Discordance/);
});

test('evaluerStatutFacture requires manual verification when ERP entry is not found', () => {
  const result = evaluerStatutFacture(1500.00, null, false);
  assert.equal(result.statut, 'Vérification manuelle');
});

test('evaluerStatutFacture flags pending when extracted amount is 0 or null', () => {
  const result = evaluerStatutFacture(0, 1500.00, true);
  assert.equal(result.statut, 'En attente');
});

test('rapprocherAvecERP finds matching company by normalized TVA number', () => {
  const mockERP: BaseERPReference[] = [
    {
      Numero_TVA: 'FR 12 345 678 901',
      Fournisseur_Nom: 'TechCloud Solutions SAS',
      Numero_Bon_Commande: 'BC-2026-042',
      Montant_Autorise: 2400.00,
    },
    {
      Numero_TVA: 'FR98765432100',
      Fournisseur_Nom: 'Office Supplies Direct',
      Numero_Bon_Commande: 'BC-2026-088',
      Montant_Autorise: 845.50,
    },
  ];

  const found = rapprocherAvecERP('fr12345678901', mockERP);
  assert.ok(found);
  assert.equal(found?.Fournisseur_Nom, 'TechCloud Solutions SAS');
  assert.equal(found?.Numero_Bon_Commande, 'BC-2026-042');

  const notFound = rapprocherAvecERP('FR00000000000', mockERP);
  assert.equal(notFound, undefined);
});

test('calculerEcart calculates delta and percentage accurately', () => {
  const ecart1 = calculerEcart(1100, 1000);
  assert.equal(ecart1.difference, 100);
  assert.equal(ecart1.pourcentage, 10);
  assert.equal(ecart1.estEgal, false);
  assert.equal(ecart1.estDepassement, true);

  const ecart2 = calculerEcart(500, 500);
  assert.equal(ecart2.difference, 0);
  assert.equal(ecart2.estEgal, true);
});
