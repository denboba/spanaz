import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type WorkerEnv = Record<string, unknown>;

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function readBinding(env: unknown, ...names: string[]) {
  const bindings =
    env != null && typeof env === "object" ? (env as WorkerEnv) : ({} as WorkerEnv);

  for (const name of names) {
    const value = bindings[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firebaseRuntimeConfig(env: unknown) {
  const projectId =
    readBinding(env, "VITE_FIREBASE_PROJECT_ID", "FIREBASE_PROJECT_ID") ||
    import.meta.env["VITE_FIREBASE_PROJECT_ID"]?.trim() ||
    "";
  const apiKey =
    readBinding(env, "VITE_FIREBASE_API_KEY", "FIREBASE_API_KEY") ||
    import.meta.env["VITE_FIREBASE_API_KEY"]?.trim() ||
    "";

  return { projectId, apiKey };
}

function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set("strict-transport-security", "max-age=15552000; includeSubDomains");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(payload: unknown, status = 200) {
  return withSecurityHeaders(
    new Response(JSON.stringify(payload), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    }),
  );
}

function runtimeEndpoint(request: Request, env: unknown) {
  const url = new URL(request.url);
  if (request.method !== "GET") return null;

  const config = firebaseRuntimeConfig(env);

  if (url.pathname === "/api/runtime-config") {
    if (!config.projectId || !config.apiKey) {
      return json(
        {
          error: "firebase_not_configured",
          firebase: { configured: false },
        },
        503,
      );
    }

    return json({
      firebase: {
        configured: true,
        projectId: config.projectId,
        apiKey: config.apiKey,
      },
    });
  }

  if (url.pathname === "/api/health") {
    return json(
      {
        status: config.projectId && config.apiKey ? "ok" : "degraded",
        firebaseConfigured: Boolean(config.projectId && config.apiKey),
        firebaseProjectId: config.projectId || null,
        timestamp: new Date().toISOString(),
      },
      config.projectId && config.apiKey ? 200 : 503,
    );
  }

  return null;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const runtimeResponse = runtimeEndpoint(request, env);
      if (runtimeResponse) return runtimeResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withSecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
