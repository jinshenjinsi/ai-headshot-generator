import * as Linking from "expo-linking";
import * as ReactNative from "react-native";

// Extract scheme from bundle ID (last segment timestamp, prefixed with "manus")
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const bundleId = "space.manus.ai.headshot.generator.t20260201232454";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  portal: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "",
  server: process.env.EXPO_PUBLIC_OAUTH_SERVER_URL ?? "",
  appId: process.env.EXPO_PUBLIC_APP_ID ?? "",
  ownerId: process.env.EXPO_PUBLIC_OWNER_OPEN_ID ?? "",
  ownerName: process.env.EXPO_PUBLIC_OWNER_NAME ?? "",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  deepLinkScheme: schemeFromBundleId,
};

console.log("[OAuth Config] API Base URL:", env.apiBaseUrl);

export const OAUTH_PORTAL_URL = env.portal;
export const OAUTH_SERVER_URL = env.server;
export const APP_ID = env.appId;
export const OWNER_OPEN_ID = env.ownerId;
export const OWNER_NAME = env.ownerName;
export const API_BASE_URL = env.apiBaseUrl;

/**
 * Get the API base URL, supporting dynamic port discovery.
 * 
 * IMPORTANT: On web platform, always use dynamic port discovery
 * to support openclaw's dynamic port allocation (3000-3010).
 * Ignore EXPO_PUBLIC_API_BASE_URL on web to avoid hardcoded IPs.
 */
export function getApiBaseUrl(): string {
  // On web, ALWAYS use dynamic port discovery (ignore hardcoded API_BASE_URL)
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    console.log("[getApiBaseUrl] Web platform detected, hostname:", hostname);
    
    // Extract base hostname (remove port prefix like "8081-")
    const baseHostname = hostname.replace(/^\d+-/, "");
    
    // Try ports 3000-3010 to find the actual backend
    const tryPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
    
    // Return the first port - if it fails, the client will retry other ports
    const firstPort = tryPorts[0];
    const url = `${protocol}//${firstPort}-${baseHostname}`;
    console.log("[getApiBaseUrl] Using dynamic port discovery URL:", url);
    return url;
  }

  // On native platforms, use EXPO_PUBLIC_API_BASE_URL if set
  if (API_BASE_URL) {
    const url = API_BASE_URL.replace(/\/$/, "");
    console.log("[getApiBaseUrl] Using API_BASE_URL (native platform):", url);
    return url;
  }

  // Fallback to empty (will use relative URL)
  console.warn("[getApiBaseUrl] WARNING: No API_BASE_URL configured and not on web platform. Using relative URL.");
  return "";
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";

const encodeState = (value: string) => {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  const BufferImpl = (globalThis as Record<string, any>).Buffer;
  if (BufferImpl) {
    return BufferImpl.from(value, "utf-8").toString("base64");
  }
  return value;
};

/**
 * Get the redirect URI for OAuth callback.
 * - Web: uses API server callback endpoint
 * - Native: uses deep link scheme
 */
export const getRedirectUri = () => {
  if (ReactNative.Platform.OS === "web") {
    return `${getApiBaseUrl()}/api/oauth/callback`;
  } else {
    return Linking.createURL("/oauth/callback", {
      scheme: env.deepLinkScheme,
    });
  }
};

export const getLoginUrl = () => {
  const redirectUri = getRedirectUri();
  const state = encodeState(redirectUri);

  const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

/**
 * Start OAuth login flow.
 *
 * On native platforms (iOS/Android), open the system browser directly so
 * the OAuth callback returns via deep link to the app.
 *
 * On web, this simply redirects to the login URL.
 *
 * @returns Always null, the callback is handled via deep link.
 */
export async function startOAuthLogin(): Promise<string | null> {
  const loginUrl = getLoginUrl();

  if (ReactNative.Platform.OS === "web") {
    // On web, just redirect
    if (typeof window !== "undefined") {
      window.location.href = loginUrl;
    }
    return null;
  }

  const supported = await Linking.canOpenURL(loginUrl);
  if (!supported) {
    console.warn("[OAuth] Cannot open login URL: URL scheme not supported");
    // 可考虑抛出错误或返回错误状态，让调用方处理
    return null;
  }

  try {
    await Linking.openURL(loginUrl);
  } catch (error) {
    console.error("[OAuth] Failed to open login URL:", error);
    // 可考虑抛出错误让调用方处理
  }

  // The OAuth callback will reopen the app via deep link.
  return null;
}
