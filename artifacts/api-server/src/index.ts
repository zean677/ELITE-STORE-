import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedAdminUser() {
  try {
    const adminUsername = "ZEAN.23";
    const adminEmail = "zean23@elitestore.admin";
    const adminPassword = "ZEAN333ZEAN#";

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, adminUsername));

    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await db.insert(usersTable).values({
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        role: "admin",
        balance: "0",
        isSuspended: false,
      });
      logger.info({ username: adminUsername }, "Admin user created");
    } else if (existing.role !== "admin") {
      await db
        .update(usersTable)
        .set({ role: "admin" })
        .where(eq(usersTable.username, adminUsername));
      logger.info({ username: adminUsername }, "Admin role restored");
    }
  } catch (err) {
    logger.warn({ err }, "Could not seed admin user");
  }
}

seedAdminUser().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
});
