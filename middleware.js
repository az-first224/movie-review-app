import { next } from "@vercel/functions";
import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  parseCookie,
  safeEqual
} from "./auth-token.js";

export const config = {
  matcher: "/((?!login\\.html|api/auth).*)",
  runtime: "nodejs"
};

export default function middleware(request) {
  const password = process.env.SITE_PASSWORD;

  if (!password) {
    return new Response("SITE_PASSWORD is not configured.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }

  const token = parseCookie(request.headers.get("cookie"), AUTH_COOKIE_NAME);
  if (safeEqual(token, createAuthToken(password))) {
    return next();
  }

  const loginUrl = new URL("/login.html", request.url);
  const requestedUrl = new URL(request.url);
  loginUrl.searchParams.set("next", `${requestedUrl.pathname}${requestedUrl.search}`);

  return Response.redirect(loginUrl, 302);
}
