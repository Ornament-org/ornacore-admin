const required = (key, fallback) => {
  const value = import.meta.env[key] ?? fallback;
  if (!value) throw new Error(`Missing frontend environment variable: ${key}`);
  return value;
};

const trimTrailingSlashes = (value) => value.replace(/\/+$/, "");

const withApiPrefix = (baseUrl) => {
  const normalized = trimTrailingSlashes(baseUrl);
  return normalized.endsWith("/api/v1") ? normalized : `${normalized}/api/v1`;
};

const apiOrigin = required("VITE_API_BASE_URL", "http://localhost:4000");
const localHostnames = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

const isLocalUrl = (value) => {
  try {
    return localHostnames.has(new URL(value).hostname);
  } catch {
    return false;
  }
};

const inferHostedStorefrontUrl = () => {
  if (typeof window === "undefined") return "";
  const { protocol, hostname } = window.location;
  if (localHostnames.has(hostname)) return "";
  if (hostname.startsWith("tool.")) return `${protocol}//${hostname.slice(5)}`;
  return "";
};

const storefrontUrl = (() => {
  const configured = required("VITE_STOREFRONT_URL", "http://localhost:3000");
  const inferred = inferHostedStorefrontUrl();
  return inferred && isLocalUrl(configured) ? inferred : configured;
})();

export const env = Object.freeze({
  apiBaseUrl: withApiPrefix(apiOrigin),
  apiOrigin,
  appName: required("VITE_APP_NAME", "OrnaCore Admin Toolbox"),
  appEnvironment: required("VITE_APP_ENV", "development"),
  enableDemoData: String(import.meta.env.VITE_ENABLE_DEMO_DATA ?? "false") === "true",
  storefrontUrl,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
});
