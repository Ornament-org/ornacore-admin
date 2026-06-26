const required = (key, fallback) => {
  const value = import.meta.env[key] ?? fallback;
  if (!value) throw new Error(`Missing frontend environment variable: ${key}`);
  return value;
};

export const env = Object.freeze({
  apiBaseUrl: required("VITE_API_BASE_URL", "http://localhost:4000/api/v1"),
  appName: required("VITE_APP_NAME", "OrnaCore Admin Toolbox"),
  appEnvironment: required("VITE_APP_ENV", "development"),
  enableDemoData: String(import.meta.env.VITE_ENABLE_DEMO_DATA ?? "false") === "true",
});
