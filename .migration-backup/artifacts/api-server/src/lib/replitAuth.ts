import passport from "passport";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { logger } from "./logger.js";

// ── OIDC discovery cache (simple TTL, no memoizee needed) ────────────────────
let _oidcConfig: Record<string, string> | null = null;
let _oidcConfigExpiry = 0;

async function getOidcConfig(): Promise<Record<string, string>> {
  const now = Date.now();
  if (_oidcConfig && now < _oidcConfigExpiry) return _oidcConfig;
  const issuer = process.env.ISSUER_URL ?? "https://replit.com/oidc";
  const res = await fetch(`${issuer}/.well-known/openid-configuration`);
  if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status}`);
  _oidcConfig = await res.json() as Record<string, string>;
  _oidcConfigExpiry = now + 3600 * 1000;
  return _oidcConfig;
}

// ── Token exchange helpers ────────────────────────────────────────────────────
async function exchangeCode(code: string, redirectUri: string) {
  const cfg = await getOidcConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.REPL_ID!,
  });
  const res = await fetch(cfg["token_endpoint"], {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json() as Promise<{ access_token: string; refresh_token?: string; id_token?: string; expires_in?: number }>;
}

async function refreshAccessToken(refreshToken: string) {
  const cfg = await getOidcConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.REPL_ID!,
  });
  const res = await fetch(cfg["token_endpoint"], {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  return res.json() as Promise<{ access_token: string; refresh_token?: string; expires_in?: number }>;
}

async function getUserInfo(accessToken: string) {
  const cfg = await getOidcConfig();
  const res = await fetch(cfg["userinfo_endpoint"], {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Userinfo failed: ${res.status}`);
  return res.json() as Promise<{ sub: string; email?: string; first_name?: string; last_name?: string; profile_image_url?: string }>;
}

// ── Session / passport setup ──────────────────────────────────────────────────
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: true, maxAge: sessionTtl },
  });
}

async function upsertUser(info: { sub: string; email?: string; first_name?: string; last_name?: string; profile_image_url?: string }) {
  try {
    await db.insert(users).values({
      id: info.sub,
      email: info.email ?? `${info.sub}@replit.user`,
    }).onConflictDoUpdate({
      target: users.id,
      set: { email: info.email ?? `${info.sub}@replit.user`, updatedAt: new Date() },
    });
  } catch (err) {
    logger.error({ err }, "upsertUser failed");
  }
}

export interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // ── Login: redirect to Replit OIDC ─────────────────────────────────────────
  app.get("/api/login", async (req, res) => {
    try {
      const cfg = await getOidcConfig();
      const redirectUri = `https://${req.hostname}/api/callback`;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.REPL_ID!,
        redirect_uri: redirectUri,
        scope: "openid email profile offline_access",
        prompt: "login consent",
      });
      res.redirect(`${cfg["authorization_endpoint"]}?${params}`);
    } catch (err) {
      logger.error({ err }, "Login redirect failed");
      res.status(500).send("Auth error");
    }
  });

  // ── Callback: exchange code → tokens ───────────────────────────────────────
  app.get("/api/callback", async (req, res) => {
    const { code } = req.query as { code?: string };
    if (!code) return res.redirect("/api/login");
    try {
      const redirectUri = `https://${req.hostname}/api/callback`;
      const tokens = await exchangeCode(code, redirectUri);
      const info = await getUserInfo(tokens.access_token);
      await upsertUser(info);

      const user: AuthUser = {
        id: info.sub,
        email: info.email,
        firstName: info.first_name,
        lastName: info.last_name,
        profileImageUrl: info.profile_image_url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      };
      req.logIn(user, (err) => {
        if (err) {
          logger.error({ err }, "logIn failed");
          return res.redirect("/api/login");
        }
        res.redirect("/");
      });
    } catch (err) {
      logger.error({ err }, "Callback failed");
      res.redirect("/api/login");
    }
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  app.get("/api/logout", async (req, res) => {
    const hostname = req.hostname;
    req.logout(() => {
      res.redirect(`https://replit.com/logout?post_logout_redirect_uri=${encodeURIComponent(`https://${hostname}`)}`);
    });
  });

  // ── Current user endpoint ──────────────────────────────────────────────────
  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const user = req.user as AuthUser;
    res.json({
      id: user.id,
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
      profileImageUrl: user.profileImageUrl,
    });
  });
}

// ── isAuthenticated middleware ─────────────────────────────────────────────────
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user as AuthUser;
  if (!user?.expiresAt) return res.status(401).json({ message: "Unauthorized" });

  if (Date.now() < user.expiresAt) return next();

  // Try refresh
  if (!user.refreshToken) return res.status(401).json({ message: "Unauthorized" });
  try {
    const tokens = await refreshAccessToken(user.refreshToken);
    user.accessToken = tokens.access_token;
    if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
    user.expiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// ── optionalAuth middleware ────────────────────────────────────────────────────
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as AuthUser;
    if (user?.expiresAt && Date.now() >= user.expiresAt && user.refreshToken) {
      try {
        const tokens = await refreshAccessToken(user.refreshToken);
        user.accessToken = tokens.access_token;
        if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
        user.expiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000;
      } catch {
        // silently continue unauthenticated
      }
    }
  }
  next();
};
