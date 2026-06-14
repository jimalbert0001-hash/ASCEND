import { createClient } from "@supabase/supabase-js";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import type { RequestHandler, Express } from "express";
import { logger } from "./logger.js";

// Provide WebSocket for Node.js < 22 where native WebSocket is unavailable
import ws from "ws";
if (!globalThis.WebSocket) {
  (globalThis as any).WebSocket = ws;
}

const SUPABASE_URL = process.env.SUPABASE_DB_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "SUPABASE_DB_URL and SUPABASE_SERVICE_KEY are required for auth. Set them in environment variables.",
  );
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;

    const u = data.user;
    const name =
      (u.user_metadata?.first_name && u.user_metadata?.last_name)
        ? `${u.user_metadata.first_name} ${u.user_metadata.last_name}`.trim()
        : (u.user_metadata?.name ?? u.user_metadata?.full_name ?? undefined);

    return {
      id: u.id,
      email: u.email ?? `${u.id}@supabase.user`,
      name,
      avatarUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? undefined,
    };
  } catch (err) {
    logger.error({ err }, "getUserFromToken failed");
    return null;
  }
}

async function upsertUser(user: AuthUser) {
  try {
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    logger.error({ err, userId: user.id }, "upsertUser failed");
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  await upsertUser(user);
  (req as any).user = user;
  (req as any).supabaseToken = token;
  next();
};

export const optionalAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (token) {
    const user = await getUserFromToken(token);
    if (user) {
      await upsertUser(user);
      (req as any).user = user;
      (req as any).supabaseToken = token;
    }
  }
  next();
};

export async function setupAuth(app: Express) {
  app.get("/api/auth/user", isAuthenticated, (req: any, res) => {
    const user: AuthUser = req.user;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profileImageUrl: user.avatarUrl,
    });
  });
}
