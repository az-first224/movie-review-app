import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createAuthToken,
  safeEqual
} from "../auth-token.js";

function setNoStore(response) {
  response.setHeader("Cache-Control", "no-store");
}

function clearSession(response) {
  response.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  );
}

export default function handler(request, response) {
  setNoStore(response);

  if (request.method === "DELETE") {
    clearSession(response);
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, DELETE");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return response.status(503).json({
      error: "SITE_PASSWORD is not configured."
    });
  }

  let body = request.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      return response.status(400).json({ error: "Invalid JSON." });
    }
  }

  if (!safeEqual(body?.password || "", sitePassword)) {
    return response.status(401).json({ error: "パスワードが違います。" });
  }

  response.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=${createAuthToken(sitePassword)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${AUTH_COOKIE_MAX_AGE}`
  );

  return response.status(204).end();
}
