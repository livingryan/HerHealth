/// <reference types="vite/client" />

export const APP_NAME = "HerHealth AI";
export const BRAND_LINE = "Your health, understood.";
export const SUPPORTING_MESSAGE =
  "A gentler way to understand your health, notice patterns and take informed next steps.";

// Relative path: Vite dev server proxies /api to http://localhost:8000.
// No third-party backend URL is embedded in frontend code.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";