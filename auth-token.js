import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE_NAME = "review_site_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function createAuthToken(password) {
  return createHmac("sha256", password)
    .update("movie-review-site-access-v1")
    .digest("base64url");
}

export function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  return leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer);
}

export function parseCookie(cookieHeader, name) {
  const cookies = String(cookieHeader || "").split(";");

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = cookie.slice(0, separatorIndex).trim();
    if (key !== name) continue;

    return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
  }

  return "";
}
