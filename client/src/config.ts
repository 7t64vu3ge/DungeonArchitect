const SERVER_URL = import.meta.env.VITE_SERVER_URL || "";

export const CONFIG = {
  SERVER_URL,
  API_BASE: `${SERVER_URL}/api`,
  ASSETS_BASE: `${SERVER_URL}/assets`,
};
