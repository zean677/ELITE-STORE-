import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { RegisterBody, LoginBody, GetMeResponse } from "@workspace/api-zod";
import { signToken, requireAuth, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

const UpdateProfileBody = z.object({
  username: z.string().min(3).max(40).optional(),
  email: z.string().email().optional(),
});

const ChangePasswordBody = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const ForgotPasswordBody = z.object({
  email: z.string().email(),
});

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

router.patch("/auth/profile", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const updateData: { username?: string; email?: string } = {};
  if (parsed.data.username) updateData.username = parsed.data.username;
  if (parsed.data.email) updateData.email = parsed.data.email;

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ error: "No changes provided" });
    return;
  }

  if (updateData.email) {
    const [existingEmail] = await db.select().from(usersTable).where(eq(usersTable.email, updateData.email));
    if (existingEmail && existingEmail.id !== req.user!.id) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }
  }

  if (updateData.username) {
    const [existingUsername] = await db.select().from(usersTable).where(eq(usersTable.username, updateData.username));
    if (existingUsername && existingUsername.id !== req.user!.id) {
      res.status(400).json({ error: "Username already in use" });
      return;
    }
  }

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, req.user!.id)).returning();
  res.json(GetMeResponse.parse({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    balance: parseFloat(user.balance ?? "0"),
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
  }));
});

router.post("/auth/change-password", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Invalid password", message: "Current password is incorrect" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, req.user!.id));
  res.json({ success: true });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  res.json({
    success: true,
    message: "If this email exists, the store owner will help reset the password from the admin panel.",
  });
});

export default router;
