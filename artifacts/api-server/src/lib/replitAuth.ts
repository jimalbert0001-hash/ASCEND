import * as client from "openid-client";
import passport from "passport";
import { Strategy } from "openid-client/passport";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";

// Simple memoized OIDC config (1 hour TTL)
let _oidcConfig: client.Configuration | null = null;
let _oidcConfigExpiry = 0;

async function getOidcConfig(): Promise<client.Configuration> {
  const now = Date.now();
  if (_oidcConfig && now < _oidcConfigExpiry) return _oidcConfig;
  _oidcConfig = await client.discovery(
    new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
    process.env.REPL_ID!
  );
  _oidcConfigExpiry = now + 3600 * 1000;
  return _oidcConfig;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await db
    .insert(users)
    .values({
      id: claims["sub"],
      email: claims["email"] ?? `${claims["sub"]}@replit.user`,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: claims["email"] ?? `${claims["sub"]}@replit.user`,
        updatedAt: new Date(),
      },
    });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();
  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const name = `replitauth:${domain}`;
    if (!registeredStrategies.has(name)) {
      const strategy = new Strategy(
        {
          name,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        async (
          tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
          verified: (err: any, user?: any) => void
        ) => {
          const user = {};
          updateUserSession(user, tokens);
          await upsertUser(tokens.claims());
          verified(null, user);
        }
      );
      passport.use(strategy);
      registeredStrategies.add(name);
    }
  };

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client
          .buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          })
          .href
      );
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req: any, res) => {
    const claims = req.user?.claims ?? {};
    res.json({
      id: claims.sub,
      email: claims.email,
      name: claims.first_name
        ? `${claims.first_name} ${claims.last_name ?? ""}`.trim()
        : (claims.name ?? claims.sub),
      profileImageUrl: claims.profile_image_url,
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
