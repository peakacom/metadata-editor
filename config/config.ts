console.log("Hasan" + process.env.NEXT_PUBLIC_PARTNER_BASE_URL);
export const PARTNER_API_BASE_URL = process.env.NEXT_PUBLIC_PARTNER_BASE_URL
  ? process.env.NEXT_PUBLIC_PARTNER_BASE_URL
  : "https://partner.peaka.studio/api/v1";
export const API_KEY_LOCAL_STORAGE_KEY = "apiKeys";
export const SELECTED_API_KEY_LOCAL_STORAGE_KEY = "selectedApiKey";
export const ID_SEPARATOR_CHAR = "#";
