import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET || "elite_store_secret_key_change_in_prod";

export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "No token provided" });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
  if (!user || user.isSuspended) {
    res.status(401).json({ error: "Unauthorized", message: "User not found or suspended" });
    return;
  }

  req.user = { id: user.id, role: user.role };
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden", message: "Admin access required" });
      return;
    }
    next();
  });
}
