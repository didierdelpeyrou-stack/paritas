/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NARRATIVE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Version stamp injecté par vite.config.ts au build (ISO UTC).
 *  Affichée dans Settings pour valider que la dernière version
 *  est bien servie au browser. */
declare const __BUILD_VERSION__: string;
