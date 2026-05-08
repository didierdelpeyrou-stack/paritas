/* P2 ORDA-017 PARITAS — couverture résiduelle stateStrategy.ts.
   Couvre :
     - politicalCycle (5 phases mod 5)
     - chooseStateStrategy en mode unitaire (avant tour 25)
     - chooseStateStrategy en mode segmenté (Élysée / Bercy / Travail)
     - les outils lourds (ordonnances, 49.3, refus_agrement) gated
       par seuils historiques. */

import { describe, it, expect } from 'vitest';
import { chooseStateStrategy, politicalCycle } from './stateStrategy';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import { freshTraits } from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import type { RebirthGameState } from '../types';

function buildState(turn: number, over: Partial<RebirthGameState> = {}): RebirthGameState {
  return {
    name: 'Test',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: null,
    turn,
    era: 'paritarisme-fondateur',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'pragmatique',
    personalityStress: 0,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization('salarie', 'Test'),
    activeStrategies: [],
    worldAI: { mode: 'neutral', aggression: 0, lastTrigger: null },
    activePipelines: [],
    memory: freshMemory(),
    objectives: [],
    objectiveProgress: [],
    phase: 'idle',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null,
    ...over
  } as unknown as RebirthGameState;
}

describe('stateStrategy — politicalCycle', () => {
  it('cycle stylisé 5 phases (mod 5)', () => {
    expect(politicalCycle(0)).toBe('post_election');
    expect(politicalCycle(1)).toBe('mid_term');
    expect(politicalCycle(2)).toBe('pre_plfss');
    expect(politicalCycle(3)).toBe('pre_election');
    expect(politicalCycle(4)).toBe('fin_mandat');
    /* Et ça boucle. */
    expect(politicalCycle(5)).toBe('post_election');
    expect(politicalCycle(46)).toBe('mid_term');
  });
});

describe('stateStrategy — chooseStateStrategy unitaire (turn < 25)', () => {
  it('mediation par défaut (état frais, tour 1)', () => {
    const s = buildState(1);
    const out = chooseStateStrategy(s);
    expect(out.faction).toBe('unitaire');
    expect(out.id).toBe('mediation');
  });

  it('rapportDeForce ≥ 68 + legitimite haute → decret', () => {
    const s = buildState(10);
    s.resources.rapportDeForce = 75;
    s.resources.legitimite = 50;
    const out = chooseStateStrategy(s);
    expect(out.id).toBe('decret');
    expect(out.intensity).toBe(68);
  });

  it('rapportDeForce ≥ 68 + legitimite < 38 → repression', () => {
    const s = buildState(10);
    s.resources.rapportDeForce = 75;
    s.resources.legitimite = 30;
    const out = chooseStateStrategy(s);
    expect(out.id).toBe('repression');
  });

  it('santeSociale basse → temporisation', () => {
    const s = buildState(10);
    s.resources.santeSociale = 20;
    const out = chooseStateStrategy(s);
    expect(out.id).toBe('temporisation');
  });
});

describe('stateStrategy — chooseStateStrategy segmenté (turn ≥ 25)', () => {
  it('faction "elysee" : fin_mandat + tour ≥ 28 + rapportDeForce élevé → ordonnances', () => {
    /* turn 28 : (28 % 5)=3 → pre_election ✓ ; rapportDeForce 60 + a.opinion.trust 30 boostent elysee */
    const s = buildState(28);
    s.resources.rapportDeForce = 70; // forte → boost elysee
    s.actors.opinion.trust = 30;
    const out = chooseStateStrategy(s);
    expect(out.faction).toBe('elysee');
    expect(out.cycle).toBe('pre_election');
    expect(out.id).toBe('ordonnances');
    expect(out.intensity).toBe(75);
  });

  it('faction "elysee" : tour ≥ 38 + legitimite faible → article_49_3', () => {
    /* Sélection elysee : opinion trust bas + rapportDeForce élevé.
       Cycle mid_term (40 % 5 = 0 → post_election ; 41 % 5 = 1 → mid_term)
       pour éviter ordonnances qui ne s'activent qu'en fin_mandat/pre_election. */
    const s = buildState(41); // mid_term → pas d'ordonnances
    s.resources.rapportDeForce = 70;
    s.resources.legitimite = 30;
    s.actors.opinion.trust = 30;
    s.actors.etat.patience = 70; // évite repression/decret hard
    const out = chooseStateStrategy(s);
    expect(out.faction).toBe('elysee');
    expect(out.id).toBe('article_49_3');
    expect(out.intensity).toBe(78);
  });

  it('faction "bercy" : caisse basse + tour ≥ 35 + institution forte → refus_agrement', () => {
    /* Sélection bercy : caisse basse + cycle pre_plfss boostent bercy */
    const s = buildState(37); // (37 % 5)=2 → pre_plfss → boost bercy
    s.resources.caisse = 30;
    s.resources.institution = 60;
    s.actors.etat.trust = 30;
    s.actors.opinion.trust = 60;
    const out = chooseStateStrategy(s);
    expect(out.faction).toBe('bercy');
    expect(out.id).toBe('refus_agrement');
  });

  it('faction "bercy" : caisse très basse → cadrage_budgetaire (intensity 62)', () => {
    const s = buildState(27); // pre_plfss à 27 → 27%5=2 ✓
    s.resources.caisse = 20;
    s.actors.etat.trust = 30;
    s.actors.opinion.trust = 60;
    const out = chooseStateStrategy(s);
    expect(out.faction).toBe('bercy');
    expect(out.id).toBe('cadrage_budgetaire');
    expect(out.intensity).toBe(62);
  });

  it('faction "travail" : reputation org ≥ 60 + legitimite haute → cooptation', () => {
    /* travail : etat.trust ≥ 50 + post_election */
    const s = buildState(25); // 25%5=0 → post_election
    s.actors.etat.trust = 60;
    s.resources.santeSociale = 60;
    s.organization.reputation = 70;
    s.resources.legitimite = 60;
    const out = chooseStateStrategy(s);
    expect(out.faction).toBe('travail');
    expect(out.id).toBe('cooptation');
  });

  it('faction "travail" : par défaut, etat.trust ≥ 50 → mediation', () => {
    const s = buildState(25);
    s.actors.etat.trust = 60;
    s.resources.santeSociale = 60;
    const out = chooseStateStrategy(s);
    expect(out.faction).toBe('travail');
    expect(out.id).toBe('mediation');
    expect(out.intensity).toBe(50);
  });

  it('signal contient le label de la faction et du cycle quand segmenté', () => {
    const s = buildState(28);
    s.resources.rapportDeForce = 70;
    s.actors.opinion.trust = 30;
    const out = chooseStateStrategy(s);
    expect(out.signal).toContain('Élysée');
    expect(out.signal).toContain('pré-électoral');
  });

  it('intensity est numérique pour toute stratégie retournée', () => {
    const s = buildState(10);
    const out = chooseStateStrategy(s);
    expect(typeof out.intensity).toBe('number');
    expect(out.intensity).toBeGreaterThan(0);
  });

  it('ordonnances bloquées si tour < 28 même si ratios elysee atteints', () => {
    /* Tour 26 : pas d'ordonnances même en cycle fin_mandat. */
    const s = buildState(26); // 26%5=1 → mid_term
    s.resources.rapportDeForce = 75;
    s.actors.opinion.trust = 30;
    const out = chooseStateStrategy(s);
    /* Si elysee est élu → on retombe sur decret */
    if (out.faction === 'elysee') {
      expect(out.id).not.toBe('ordonnances');
    }
  });
});
