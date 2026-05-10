/**
 * Tests du bridge BlockBlast cotisations.
 */
import { describe, it, expect } from 'vitest';
import {
  applyBlockBlastResult,
  configFromShared,
  estimateAverageScore,
  type BlockBlastResult
} from './blockblast_bridge';

describe('applyBlockBlastResult', () => {
  it('overflow → crise Sécu : tout en négatif + tension ↑', () => {
    const d = applyBlockBlastResult({ linesCleared: 3, tetrisCount: 0, overflow: true });
    expect(d.povAchat!).toBeLessThan(0);
    expect(d.droits!).toBeLessThan(0);
    expect(d.legitimite!).toBeLessThan(0);
    expect(d.tension!).toBeGreaterThan(0);
  });

  it('< 5 lignes → déficit : tout le monde paie', () => {
    const d = applyBlockBlastResult({ linesCleared: 3, tetrisCount: 0, overflow: false });
    expect(d.povAchat!).toBeLessThan(0);
    expect(d.marge!).toBeLessThan(0);
  });

  it('5-14 lignes → équilibre fragile (povAchat ↑ légère, tension ↓)', () => {
    const d = applyBlockBlastResult({ linesCleared: 10, tetrisCount: 1, overflow: false });
    expect(d.povAchat!).toBeGreaterThan(0);
    expect(d.tension!).toBeLessThan(0);
    /* Modéré : pas de gros gain. */
    expect(d.povAchat!).toBeLessThan(5);
  });

  it('15+ lignes → Sécu solide : povAchat ↑↑, droits ↑↑, légit ↑↑', () => {
    const d = applyBlockBlastResult({ linesCleared: 20, tetrisCount: 3, overflow: false });
    expect(d.povAchat!).toBeGreaterThanOrEqual(4);
    expect(d.droits!).toBeGreaterThanOrEqual(5);
    expect(d.legitimite!).toBeGreaterThan(6);  // bonus tetris
    expect(d.tension!).toBeLessThan(0);
  });

  it('tetris bonus : à lignes égales, plus de tetris = plus de légitimité', () => {
    const sansTetris = applyBlockBlastResult({ linesCleared: 20, tetrisCount: 0, overflow: false });
    const avecTetris = applyBlockBlastResult({ linesCleared: 20, tetrisCount: 5, overflow: false });
    expect(avecTetris.legitimite!).toBeGreaterThan(sansTetris.legitimite!);
  });
});

describe('configFromShared', () => {
  it('tension basse (10) → durée longue, difficulté facile', () => {
    const cfg = configFromShared({ tension: 10 });
    expect(cfg.durationSec).toBeGreaterThan(100);
    expect(cfg.difficulty).toBe(0);
    expect(cfg.targetLines).toBe(8);
  });

  it('tension moyenne (50) → durée moyenne, difficulté normal', () => {
    const cfg = configFromShared({ tension: 50 });
    expect(cfg.durationSec).toBeLessThan(100);
    expect(cfg.durationSec).toBeGreaterThan(80);
    expect(cfg.difficulty).toBe(1);
    expect(cfg.targetLines).toBe(12);
  });

  it('tension haute (90) → durée courte, difficulté élevée', () => {
    const cfg = configFromShared({ tension: 90 });
    expect(cfg.durationSec).toBeLessThan(80);
    expect(cfg.difficulty).toBe(2);
    expect(cfg.targetLines).toBe(16);
  });

  it('clamp tension hors borne', () => {
    const cfgUnder = configFromShared({ tension: -10 });
    const cfgOver = configFromShared({ tension: 200 });
    expect(cfgUnder.durationSec).toBeLessThanOrEqual(120);
    expect(cfgOver.durationSec).toBeGreaterThanOrEqual(60);
  });
});

describe('estimateAverageScore', () => {
  it('facile + 120s → score raisonnable (~36 lignes)', () => {
    const r = estimateAverageScore({ durationSec: 120, difficulty: 0, targetLines: 8 });
    expect(r.linesCleared).toBeGreaterThan(20);
    expect(r.linesCleared).toBeLessThan(50);
    expect(r.overflow).toBe(false);
  });

  it('difficile + 60s → score bas (~6 lignes)', () => {
    const r = estimateAverageScore({ durationSec: 60, difficulty: 2, targetLines: 16 });
    expect(r.linesCleared).toBeLessThan(10);
  });

  it('tetris ≈ lignes / 8', () => {
    const r = estimateAverageScore({ durationSec: 120, difficulty: 0, targetLines: 8 });
    expect(r.tetrisCount).toBe(Math.floor(r.linesCleared / 8));
  });
});
