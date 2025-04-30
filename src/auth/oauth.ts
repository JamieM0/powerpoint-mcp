import * as msal from "@azure/msal-node";

// TODO: Replace with actual configuration values (e.g., from environment variables)
const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";
const tenantId = "YOUR_TENANT_ID"; // Or "common", "organizations"

const config: msal.Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret: clientSecret,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel: msal.LogLevel, message: string, containsPii: boolean) {
        // You can filter log levels and messages here
        // Example: if (loglevel <= msal.LogLevel.Warning) {
        console.log(message); // Replace with a proper logger instance
        // }
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Info,
    }
  }
};

const pca = new msal.ConfidentialClientApplication(config);

// TODO: Define appropriate scopes
const scopes = ["User.Read"]; // Example scope

/**
 * Builds an authorization URL for the user to grant consent.
 * @returns {Promise<string>} The authorization URL.
 */
export async function getAuthUrl(): Promise<string> {
  const authCodeUrlParameters: msal.AuthorizationUrlRequest = {
    scopes: scopes,
    redirectUri: "YOUR_REDIRECT_URI", // TODO: Replace with your redirect URI
  };

  return pca.getAuthCodeUrl(authCodeUrlParameters);
}

/**
 * Exchanges the authorization code for an access token.
 * @param {string} code The authorization code received from the redirect.
 * @returns {Promise<string>} The access token.
 */
export async function acquireTokenByCode(code: string): Promise<string> {
  const tokenRequest: msal.AuthorizationCodeRequest = {
    code: code,
    scopes: scopes,
    redirectUri: "YOUR_REDIRECT_URI", // TODO: Replace with your redirect URI
  };

  const response = await pca.acquireTokenByCode(tokenRequest);
  // TODO: Store refresh token securely if needed for offline access
  // response.refreshToken
  if (!response || !response.accessToken) {
    throw new Error("Failed to acquire token by code.");
  }
  return response.accessToken;
}

/**
 * Acquires a new access token using a refresh token.
 * @param {string} refreshToken The refresh token.
 * @returns {Promise<string>} The new access token.
 */
export async function refreshToken(refreshToken: string): Promise<string> {
  const refreshTokenRequest: msal.RefreshTokenRequest = {
    refreshToken: refreshToken,
    scopes: scopes,
  };

  const response = await pca.acquireTokenByRefreshToken(refreshTokenRequest);
  if (!response || !response.accessToken) {
    throw new Error("Failed to refresh token.");
  }
  return response.accessToken;
}