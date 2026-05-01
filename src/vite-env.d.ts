/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NARRATIVE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
