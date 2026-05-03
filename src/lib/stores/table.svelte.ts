/* ============================================================
   Paritas — Store réactif Table des Négociations
   ============================================================
   Svelte 5 runes. Initialisé dans la fenêtre popup avec un
   scenarioId + un seed. Avance automatiquement les bots, gère
   le tour humain via actions exposées.
   ============================================================ */

import type { ActorId, NegotiationState, TableScenarioId } from '../table/types';
import { makeScenario } from '../table/scenarios';
import {
  advanceTurn, botVote, castVote, computeOutcome,
  isAccordValidated, offerConcession, tallyVotes
} from '../table/engine';
import { botDecideTurn } from '../table/bots';
import type { OfferConcessionInput } from '../table/engine';

class TableStore {
  state = $state<NegotiationState | null>(null);
  /** Journal narratif des speeches et actions, affiché dans la table. */
  log = $state<Array<{ id: number; turn: number; speaker: string; text: string }>>([]);
  /** Animation : timer pour avancer les tours bots. */
  private botTimer: ReturnType<typeof setTimeout> | null = null;

  init(scenarioId: TableScenarioId, opts: { playerActorId?: string; seed: string }) {
    this.state = makeScenario(scenarioId, opts);
    this.log = [];
    this.queueNextStep();
  }

  /** Si c'est au tour d'un bot, déclenche son action après un délai. */
  private queueNextStep() {
    if (this.botTimer) clearTimeout(this.botTimer);
    if (!this.state) return;
    const s = this.state;

    if (s.phase === 'outcome') return;

    if (s.phase === 'vote') {
      /* Tous les bots votent automatiquement, le joueur doit cliquer. */
      this.botsVote();
      return;
    }

    /* Phase opening / concessions : si current speaker = bot, animer. */
    const speaker = s.actors.find(a => a.persona.id === s.currentSpeaker);
    if (!speaker || !speaker.isBot) return;

    this.botTimer = setTimeout(() => {
      this.runBotTurn(speaker.persona.id);
    }, 1100);
  }

  private runBotTurn(actorId: ActorId) {
    if (!this.state) return;
    const s = this.state;
    const bot = s.actors.find(a => a.persona.id === actorId);
    if (!bot) return;

    const decision = botDecideTurn(bot, s);
    this.log.push({
      id: this.log.length + 1,
      turn: s.turn,
      speaker: bot.persona.name,
      text: decision.speech
    });

    let next = s;
    if (decision.action) {
      next = offerConcession(s, decision.action);
    }
    next = advanceTurn(next);
    this.state = next;
    this.queueNextStep();
  }

  private botsVote() {
    if (!this.state) return;
    let s = this.state;
    for (const actor of s.actors) {
      if (actor.isBot && actor.vote === null) {
        const v = botVote(actor, s);
        s = castVote(s, actor.persona.id, v);
        this.log.push({
          id: this.log.length + 1,
          turn: s.turn,
          speaker: actor.persona.name,
          text: v === 'oui' ? 'Vote pour. Je signe.' :
                v === 'non' ? 'Vote contre. Pas dans ces termes.' :
                'Abstention. Je ne signerai pas, mais je ne fais pas obstacle.'
        });
      }
    }
    this.state = s;
  }

  /* ====== Actions joueur ====== */

  playerSpeak(text: string) {
    if (!this.state) return;
    const s = this.state;
    const me = s.actors.find(a => a.isPlayer);
    if (!me || s.currentSpeaker !== me.persona.id) return;
    this.log.push({
      id: this.log.length + 1,
      turn: s.turn,
      speaker: me.persona.name,
      text
    });
  }

  playerAction(input: OfferConcessionInput) {
    if (!this.state) return;
    const s = this.state;
    const me = s.actors.find(a => a.isPlayer);
    if (!me || s.currentSpeaker !== me.persona.id) return;
    const next = offerConcession(s, input);
    this.state = next;
  }

  /** Le joueur termine son tour (parle ou agit puis cède la parole). */
  playerEndTurn() {
    if (!this.state) return;
    const s = this.state;
    const me = s.actors.find(a => a.isPlayer);
    if (!me || s.currentSpeaker !== me.persona.id) return;
    this.state = advanceTurn(s);
    this.queueNextStep();
  }

  playerVote(vote: 'oui' | 'non' | 'abstention') {
    if (!this.state || this.state.phase !== 'vote') return;
    const s = this.state;
    const me = s.actors.find(a => a.isPlayer);
    if (!me || me.vote !== null) return;
    let next = castVote(s, me.persona.id, vote);
    this.log.push({
      id: this.log.length + 1,
      turn: s.turn,
      speaker: me.persona.name,
      text: vote === 'oui' ? 'Je signe.' :
            vote === 'non' ? 'Je refuse.' : 'Je m\'abstiens.'
    });
    /* Si tout le monde a voté, calculer le outcome */
    if (next.actors.every(a => a.vote !== null)) {
      next = { ...next, phase: 'outcome', outcome: computeOutcome(next) };
    }
    this.state = next;
  }

  reset() {
    this.state = null;
    this.log = [];
    if (this.botTimer) clearTimeout(this.botTimer);
  }
}

export const table = new TableStore();
