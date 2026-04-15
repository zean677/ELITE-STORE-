import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody, GetMeResponse } from "@workspace/api-zod";
import { signToken, requireAuth, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { username, email, password } = parsed.data;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existing) {
    res.status(400).json({ error: "Email already in use", message: "This email is already registered" });
    return;
  }

  const [existingUsername] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existingUsername) {
    res.status(400).json({ error: "Username taken", message: "This username is already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ username, email, passwordHash, role: "user", balance: "0", isSuspended: false })
    .returning();

  const token = signToken(user.id, user.role);
  const userOut = GetMeResponse.parse({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    balance: parseFloat(user.balance ?? "0"),
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
  });

  res.status(201).json({ token, user: userOut });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [byEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  const [byUsername] = !byEmail
    ? await db.select().from(usersTable).where(eq(usersTable.username, email))
    : [undefined];
  const user = byEmail ?? byUsername;

  if (!user) {
    res.status(401).json({ error: "Invalid credentials", message: "Email or password incorrect" });
    return;
  }

  if (user.isSuspended) {
    res.status(401).json({ error: "Account suspended", message: "Your account has been suspended" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials", message: "Email or password incorrect" });
    return;
  }

  const token = signToken(user.id, user.role);
  const userOut = GetMeResponse.parse({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    balance: parseFloat(user.balance ?? "0"),
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
  });

  res.json({ token, user: userOut });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const userOut = GetMeResponse.parse({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    balance: parseFloat(user.balance ?? "0"),
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
  });

  res.json(userOut);
});

export default router;
