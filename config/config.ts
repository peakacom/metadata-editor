export const TEST_PARTNER_API_BASE_URL =
  "https://partner-test.peaka.host/api/v1";
export const PROD_PARTNER_API_BASE_URL = "https://partner.peaka.studio/api/v1";
export const EU_PARTNER_API_BASE_URL = "https://partner.eu.peaka.studio/api/v1";
export const API_KEY_LOCAL_STORAGE_KEY = "apiKeys";
export const SELECTED_API_KEY_LOCAL_STORAGE_KEY = "selectedApiKey";
export const ID_SEPARATOR_CHAR = "#";

export function getBaseUrl() {
  if (global?.localStorage) {
    if (window.location.href.includes("localhost")) {
      return TEST_PARTNER_API_BASE_URL;
    }
    if (window.location.href.includes("test")) {
      return TEST_PARTNER_API_BASE_URL;
    }
    if (window.location.href.includes("eu")) {
      return EU_PARTNER_API_BASE_URL;
    }
    if (window.location.href.includes(".studio")) {
      return PROD_PARTNER_API_BASE_URL;
    }
  }
  return PROD_PARTNER_API_BASE_URL;
}
