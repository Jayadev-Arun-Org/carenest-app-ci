export const msalConfig = {
  auth: {
    clientId: "d6a3586b-b487-41cd-9af7-11df73b26a79",
    authority: "https://login.microsoftonline.com/d8537334-bc24-4daf-95a8-bf4c9fb14394",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    allowRedirectInIframe: false,
  }
}

export const loginRequest = {
  scopes: ["openid", "profile", "email"]
}

// MSAL only works on HTTPS or localhost
// On plain HTTP it throws crypto_nonexistent error
// This flag is used to conditionally enable MSAL
export const isMsalAvailable =
  window.location.protocol === "https:" ||
  window.location.hostname === "localhost"
