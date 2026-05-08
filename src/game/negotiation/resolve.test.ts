/* Couverture Vitest P1 ORDA-016 — negotiation/resolve.ts (était 0%).
   Pivot de résolution d'une négociation paritaire : produit un
   AgreementQuality + détecte les ruptures de ligne rouge sévères.
   Utilisé par l'atelier Matignon pour scorer les offres. */

import { describe, it, expect } from 'vitest';
import { resolveNegotiation } from './resolve';
import type { Mandate, NegotiationOffer, RedLine } from './types';

const baseMandate: Mandate = {
  objectives: [
    { id: 'salaires', label: 'Hausse salaires', priority: 5 }
  ],
  redLines: [
    { id: 'gel-salaires', label: 'Gel salaires', visibility: 'public', severity: 5 },
    { id: 'flexibilite-totale', label: 'Flexibilité totale', visibility: 'internal', severity: 4 },
    { id: 'derogation-mineure', label: 'Dérogation mineure', visibility: 'internal', severity: 2 }
  ] as RedLine[],
  acceptableConcessions: [
    { id: 'horaires-souples', label: 'Horaires souples', cost: 2 }
  ],
  baseTransparency: 50,
  internalSupport: 70
};

const baseOffer: NegotiationOffer = {
  from: 'salaries',
  claims: ['hausse-1', 'hausse-2', 'sante'],
  concessions: [],
  framing: 'cooperation'
};

describe('resolveNegotiation — accord majoritaire (sans ligne rouge)', () => {
  it('produit un agreementId quand aucune concession ne touche une ligne rouge', () => {
    const out = resolveNegotiation({ mandate: baseMandate, offer: baseOffer });
    expect(out.agreementId).toBe('draft-agreement');
    expect(out.ruptureReason).toBeNull();
    expect(out.learningSignals.length).toBeGreaterThan(0);
  });

  it('materialGain proportionnel au nombre de revendications (cap 100)', () => {
    const out = resolveNegotiation({ mandate: baseMandate, offer: baseOffer });
    expect(out.quality.materialGain).toBe(60); // 3 claims × 20

    const heavy: NegotiationOffer = {
      ...baseOffer,
      claims: Array.from({ length: 10 }, (_, i) => `c${i}`)
    };
    const outHeavy = resolveNegotiation({ mandate: baseMandate, offer: heavy });
    expect(outHeavy.quality.materialGain).toBe(100);
  });
});

describe('resolveNegotiation — rupture sur ligne rouge (severity ≥ 4)', () => {
  it('rompt sur une ligne rouge majeure et expose le motif', () => {
    const offer: NegotiationOffer = {
      ...baseOffer,
      concessions: ['gel-salaires'] // severity 5 → rupture
    };
    const out = resolveNegotiation({ mandate: baseMandate, offer });
    expect(out.agreementId).toBeNull();
    expect(out.ruptureReason).toMatch(/Ligne rouge/);
    expect(out.ruptureReason).toMatch(/Gel salaires/);
  });

  it('rompt aussi sur severity = 4 (seuil exact)', () => {
    const offer: NegotiationOffer = {
      ...baseOffer,
      concessions: ['flexibilite-totale']
    };
    const out = resolveNegotiation({ mandate: baseMandate, offer });
    expect(out.agreementId).toBeNull();
    expect(out.ruptureReason).toMatch(/Flexibilité totale/);
  });

  it('NE rompt PAS sur ligne rouge mineure (severity < 4) mais ampute internalAcceptability', () => {
    const offer: NegotiationOffer = {
      ...baseOffer,
      concessions: ['derogation-mineure'] // severity 2
    };
    const out = resolveNegotiation({ mandate: baseMandate, offer });
    expect(out.agreementId).toBe('draft-agreement');
    /* internalSupport (70) - 18 = 52 (1 hit) */
    expect(out.quality.internalAcceptability).toBe(52);
  });
});

describe('resolveNegotiation — framing affecte la qualité', () => {
  it('framing "legal" → legalStrength = 75', () => {
    const out = resolveNegotiation({
      mandate: baseMandate,
      offer: { ...baseOffer, framing: 'legal' }
    });
    expect(out.quality.legalStrength).toBe(75);
  });

  it('framing "public" → publicLegibility = 75', () => {
    const out = resolveNegotiation({
      mandate: baseMandate,
      offer: { ...baseOffer, framing: 'public' }
    });
    expect(out.quality.publicLegibility).toBe(75);
  });

  it('framing "technical" → durability = 70', () => {
    const out = resolveNegotiation({
      mandate: baseMandate,
      offer: { ...baseOffer, framing: 'technical' }
    });
    expect(out.quality.durability).toBe(70);
  });
});

describe('resolveNegotiation — idempotence sur l\'état d\'entrée', () => {
  it('ne mute ni le mandat ni l\'offre passés en argument', () => {
    const mandateSnap = JSON.stringify(baseMandate);
    const offer: NegotiationOffer = {
      ...baseOffer,
      concessions: ['gel-salaires']
    };
    const offerSnap = JSON.stringify(offer);
    resolveNegotiation({ mandate: baseMandate, offer });
    expect(JSON.stringify(baseMandate)).toBe(mandateSnap);
    expect(JSON.stringify(offer)).toBe(offerSnap);
  });
});
