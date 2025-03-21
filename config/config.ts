export const TEST_PARTNER_API_BASE_URL =
  "https://partner-test.peaka.host/api/v1";
export const PROD_PARTNER_API_BASE_URL = "https://partner.peaka.studio/api/v1";
export const EU_PARTNER_API_BASE_URL = "https://partner.eu.peaka.studio/api/v1";
export const API_KEY_LOCAL_STORAGE_KEY = "apiKeys";
export const SELECTED_API_KEY_LOCAL_STORAGE_KEY = "selectedApiKey";
export const ID_SEPARATOR_CHAR = "#";
export const ZIPY_KEY = "22c4bd1a";

export function getBaseUrl() {
  const environment = getEnvironment();
  switch (environment) {
    case Environment.TEST: {
      return TEST_PARTNER_API_BASE_URL;
    }
    case Environment.EU: {
      return EU_PARTNER_API_BASE_URL;
    }
    case Environment.US: {
      return PROD_PARTNER_API_BASE_URL;
    }
    default: {
      return PROD_PARTNER_API_BASE_URL;
    }
  }
}

export function getEnvironment() {
  if (global?.localStorage) {
    if (window.location.href.includes("localhost")) {
      return Environment.TEST;
    }
    if (window.location.href.includes("test")) {
      return Environment.TEST;
    }
    if (window.location.href.includes("eu")) {
      return Environment.EU;
    }
    if (window.location.href.includes(".studio")) {
      return Environment.US;
    }
  }

  return Environment.US;
}

export enum Environment {
  TEST,
  EU,
  US,
}
