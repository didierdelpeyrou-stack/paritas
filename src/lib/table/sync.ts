/* ============================================================
   Paritas — Sync entre fenêtres pour La Table des Négociations
   ============================================================
   Wrapper minimal autour de BroadcastChannel pour communiquer
   entre la fenêtre principale du jeu et la fenêtre popup de la
   Table. Channel par sessionId — permet plusieurs sessions
   parallèles si besoin.

   Fallback : si BroadcastChannel n'est pas disponible (vieux
   navigateurs), on utilise localStorage + 'storage' event.
   ============================================================ */

import type { TableMessage } from './types';

export interface TableSync {
  send(msg: TableMessage): void;
  onMessage(cb: (msg: TableMessage) => void): () => void;
  close(): void;
}

class BroadcastSync implements TableSync {
  private bc: BroadcastChannel;
  private listeners: Array<(msg: TableMessage) => void> = [];

  constructor(channelName: string) {
    this.bc = new BroadcastChannel(channelName);
    this.bc.onmessage = (e) => {
      for (const cb of this.listeners) cb(e.data as TableMessage);
    };
  }

  send(msg: TableMessage) {
    this.bc.postMessage(msg);
  }

  onMessage(cb: (msg: TableMessage) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(c => c !== cb);
    };
  }

  close() {
    this.bc.close();
    this.listeners = [];
  }
}

class LocalStorageSync implements TableSync {
  private key: string;
  private listeners: Array<(msg: TableMessage) => void> = [];
  private handler: (e: StorageEvent) => void;

  constructor(channelName: string) {
    this.key = `paritas-table-sync:${channelName}`;
    this.handler = (e) => {
      if (e.key !== this.key || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue) as TableMessage;
        for (const cb of this.listeners) cb(data);
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', this.handler);
  }

  send(msg: TableMessage) {
    try {
      /* Force un changement même si même payload */
      localStorage.setItem(this.key, JSON.stringify({ ...msg, _ts: Date.now() }));
    } catch { /* ignore */ }
  }

  onMessage(cb: (msg: TableMessage) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(c => c !== cb);
    };
  }

  close() {
    window.removeEventListener('storage', this.handler);
    this.listeners = [];
  }
}

/** Construit le canal de sync pour un sessionId donné. Choisit
 *  BroadcastChannel si dispo, fallback localStorage sinon. */
export function makeTableSync(sessionId: string): TableSync {
  const channelName = `paritas-table-${sessionId}`;
  if (typeof BroadcastChannel !== 'undefined') {
    return new BroadcastSync(channelName);
  }
  return new LocalStorageSync(channelName);
}

/** Génère un sessionId unique court. */
export function makeSessionId(): string {
  return Math.random().toString(36).slice(2, 10);
}
