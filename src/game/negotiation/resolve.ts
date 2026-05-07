import type {
  AgreementQuality,
  Mandate,
  NegotiationOffer,
  NegotiationOutcome
} from './types';

export function resolveNegotiation(input: {
  mandate: Mandate;
  offer: NegotiationOffer;
}): NegotiationOutcome {
  const redLineHits = input.mandate.redLines.filter(line =>
    input.offer.concessions.includes(line.id)
  );
  const rupture = redLineHits.find(line => line.severity >= 4);
  const quality: AgreementQuality = {
    materialGain: Math.min(100, input.offer.claims.length * 20),
    legalStrength: input.offer.framing === 'legal' ? 75 : 45,
    internalAcceptability: Math.max(0, input.mandate.internalSupport - redLineHits.length * 18),
    publicLegibility: input.offer.framing === 'public' ? 75 : 50,
    durability: input.offer.framing === 'technical' ? 70 : 45
  };

  if (rupture) {
    return {
      agreementId: null,
      ruptureReason: `Ligne rouge violee: ${rupture.label}`,
      quality,
      learningSignals: [
        'Une concession sur une ligne rouge peut detruire le mandat.'
      ]
    };
  }

  return {
    agreementId: 'draft-agreement',
    ruptureReason: null,
    quality,
    learningSignals: [
      'Un accord doit etre juge sur sa solidite, pas seulement sa signature.'
    ]
  };
}

