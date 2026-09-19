export type FirebasePublicConfig = {
  projectId: string;
  apiKey: string;
};

let configPromise: Promise<FirebasePublicConfig> | null = null;

function buildTimeFallback(): FirebasePublicConfig | null {
  const projectId = import.meta.env["VITE_FIREBASE_PROJECT_ID"]?.trim();
  const apiKey = import.meta.env["VITE_FIREBASE_API_KEY"]?.trim();
  return projectId && apiKey ? { projectId, apiKey } : null;
}

async function loadRuntimeConfig(): Promise<FirebasePublicConfig> {
  if (typeof window === "undefined") {
    const fallback = buildTimeFallback();
    if (fallback) return fallback;
    throw new Error("Firebase runtime configuration is only loaded in the browser.");
  }

  try {
    const response = await fetch("/api/runtime-config", {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      credentials: "same-origin",
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        firebase?: { projectId?: unknown; apiKey?: unknown };
      };
      const projectId =
        typeof payload.firebase?.projectId === "string"
          ? payload.firebase.projectId.trim()
          : "";
      const apiKey =
        typeof payload.firebase?.apiKey === "string"
          ? payload.firebase.apiKey.trim()
          : "";

      if (projectId && apiKey) return { projectId, apiKey };
    }
  } catch {
    // Local Vite development can still use the build-time .env.local fallback.
  }

  const fallback = buildTimeFallback();
  if (fallback) return fallback;

  throw new Error(
    "Firebase is not configured in this deployment. Check the Cloudflare Worker runtime variables.",
  );
}

export function getFirebasePublicConfig() {
  configPromise ??= loadRuntimeConfig().catch((error) => {
    configPromise = null;
    throw error;
  });
  return configPromise;
}
