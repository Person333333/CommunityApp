// Extend the global Env interface to include Neon database URL
declare global {
  interface Env {
    NEON_DATABASE_URL: string;
  }
}

export {};
