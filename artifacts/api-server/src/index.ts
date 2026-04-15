import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable, productsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
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

async function seedDemoUser() {
  try {
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, "user@elitestore.com"));
    if (!existing) {
      const passwordHash = await bcrypt.hash("user123", 10);
      await db.insert(usersTable).values({
        username: "demo_user",
        email: "user@elitestore.com",
        passwordHash,
        role: "user",
        balance: "0",
        isSuspended: false,
      });
      logger.info("Demo user created");
    }
  } catch (err) {
    logger.warn({ err }, "Could not seed demo user");
  }
}

async function seedDemoProducts() {
  try {
    const [{ total }] = await db.select({ total: count() }).from(productsTable);
    if (total > 0) return;

    const products = [
      // PUBG Mobile
      { id: "pubg_60uc", name: "PUBG Mobile 60 UC", nameAr: "ببجي موبايل 60 UC", category: "mobile_games", price: "0.92", image: null, params: ["playerId"], desc: "60 UC لحساب PUBG Mobile" },
      { id: "pubg_325uc", name: "PUBG Mobile 325 UC", nameAr: "ببجي موبايل 325 UC", category: "mobile_games", price: "4.54", image: null, params: ["playerId"], desc: "325 UC لحساب PUBG Mobile" },
      { id: "pubg_660uc", name: "PUBG Mobile 660 UC", nameAr: "ببجي موبايل 660 UC", category: "mobile_games", price: "9.09", image: null, params: ["playerId"], desc: "660 UC لحساب PUBG Mobile" },
      { id: "pubg_1800uc", name: "PUBG Mobile 1800 UC", nameAr: "ببجي موبايل 1800 UC", category: "mobile_games", price: "24.99", image: null, params: ["playerId"], desc: "1800 UC لحساب PUBG Mobile" },
      { id: "pubg_3850uc", name: "PUBG Mobile 3850 UC", nameAr: "ببجي موبايل 3850 UC", category: "mobile_games", price: "49.99", image: null, params: ["playerId"], desc: "3850 UC لحساب PUBG Mobile" },

      // Free Fire
      { id: "ff_100d", name: "Free Fire 100 Diamonds", nameAr: "فري فاير 100 ألماسة", category: "mobile_games", price: "0.99", image: null, params: ["playerId"], desc: "100 ألماسة لحساب Free Fire" },
      { id: "ff_310d", name: "Free Fire 310 Diamonds", nameAr: "فري فاير 310 ألماسة", category: "mobile_games", price: "2.99", image: null, params: ["playerId"], desc: "310 ألماسة لحساب Free Fire" },
      { id: "ff_520d", name: "Free Fire 520 Diamonds", nameAr: "فري فاير 520 ألماسة", category: "mobile_games", price: "4.99", image: null, params: ["playerId"], desc: "520 ألماسة لحساب Free Fire" },
      { id: "ff_1060d", name: "Free Fire 1060 Diamonds", nameAr: "فري فاير 1060 ألماسة", category: "mobile_games", price: "9.99", image: null, params: ["playerId"], desc: "1060 ألماسة لحساب Free Fire" },
      { id: "ff_2180d", name: "Free Fire 2180 Diamonds", nameAr: "فري فاير 2180 ألماسة", category: "mobile_games", price: "19.99", image: null, params: ["playerId"], desc: "2180 ألماسة لحساب Free Fire" },

      // Mobile Legends
      { id: "ml_86", name: "Mobile Legends 86 Diamonds", nameAr: "موبايل ليجندز 86 ماسة", category: "mobile_games", price: "0.99", image: null, params: ["playerId", "zoneId"], desc: "86 ماسة لحساب Mobile Legends" },
      { id: "ml_172", name: "Mobile Legends 172 Diamonds", nameAr: "موبايل ليجندز 172 ماسة", category: "mobile_games", price: "1.99", image: null, params: ["playerId", "zoneId"], desc: "172 ماسة لحساب Mobile Legends" },
      { id: "ml_344", name: "Mobile Legends 344 Diamonds", nameAr: "موبايل ليجندز 344 ماسة", category: "mobile_games", price: "3.99", image: null, params: ["playerId", "zoneId"], desc: "344 ماسة لحساب Mobile Legends" },
      { id: "ml_706", name: "Mobile Legends 706 Diamonds", nameAr: "موبايل ليجندز 706 ماسة", category: "mobile_games", price: "7.99", image: null, params: ["playerId", "zoneId"], desc: "706 ماسة لحساب Mobile Legends" },

      // Clash of Clans
      { id: "coc_80gems", name: "Clash of Clans 80 Gems", nameAr: "كلاش أوف كلانس 80 جوهرة", category: "mobile_games", price: "0.99", image: null, params: ["playerId"], desc: "80 جوهرة لحساب Clash of Clans" },
      { id: "coc_500gems", name: "Clash of Clans 500 Gems", nameAr: "كلاش أوف كلانس 500 جوهرة", category: "mobile_games", price: "4.99", image: null, params: ["playerId"], desc: "500 جوهرة لحساب Clash of Clans" },
      { id: "coc_1200gems", name: "Clash of Clans 1200 Gems", nameAr: "كلاش أوف كلانس 1200 جوهرة", category: "mobile_games", price: "9.99", image: null, params: ["playerId"], desc: "1200 جوهرة لحساب Clash of Clans" },

      // Spotify
      { id: "spotify_1m", name: "Spotify Premium 1 Month", nameAr: "سبوتيفاي بريميوم شهر", category: "services", price: "2.99", image: null, params: ["email"], desc: "اشتراك Spotify Premium لمدة شهر" },
      { id: "spotify_3m", name: "Spotify Premium 3 Months", nameAr: "سبوتيفاي بريميوم 3 أشهر", category: "services", price: "7.99", image: null, params: ["email"], desc: "اشتراك Spotify Premium لمدة 3 أشهر" },
      { id: "spotify_12m", name: "Spotify Premium 12 Months", nameAr: "سبوتيفاي بريميوم سنة", category: "services", price: "24.99", image: null, params: ["email"], desc: "اشتراك Spotify Premium لمدة سنة كاملة" },

      // Netflix
      { id: "netflix_1m", name: "Netflix 1 Month", nameAr: "نتفليكس شهر", category: "services", price: "4.99", image: null, params: ["email"], desc: "اشتراك Netflix لمدة شهر" },
      { id: "netflix_3m", name: "Netflix 3 Months", nameAr: "نتفليكس 3 أشهر", category: "services", price: "13.99", image: null, params: ["email"], desc: "اشتراك Netflix لمدة 3 أشهر" },
      { id: "netflix_12m", name: "Netflix 12 Months", nameAr: "نتفليكس سنة", category: "services", price: "49.99", image: null, params: ["email"], desc: "اشتراك Netflix لمدة سنة كاملة" },

      // YouTube Premium
      { id: "yt_1m", name: "YouTube Premium 1 Month", nameAr: "يوتيوب بريميوم شهر", category: "services", price: "2.49", image: null, params: ["email"], desc: "اشتراك YouTube Premium لمدة شهر" },
      { id: "yt_3m", name: "YouTube Premium 3 Months", nameAr: "يوتيوب بريميوم 3 أشهر", category: "services", price: "6.99", image: null, params: ["email"], desc: "اشتراك YouTube Premium لمدة 3 أشهر" },

      // Google Play
      { id: "gplay_5", name: "Google Play $5", nameAr: "جوجل بلاي 5 دولار", category: "gift_cards", price: "5.50", image: null, params: ["email"], desc: "بطاقة Google Play بقيمة 5$" },
      { id: "gplay_10", name: "Google Play $10", nameAr: "جوجل بلاي 10 دولار", category: "gift_cards", price: "10.99", image: null, params: ["email"], desc: "بطاقة Google Play بقيمة 10$" },
      { id: "gplay_25", name: "Google Play $25", nameAr: "جوجل بلاي 25 دولار", category: "gift_cards", price: "26.99", image: null, params: ["email"], desc: "بطاقة Google Play بقيمة 25$" },
      { id: "gplay_50", name: "Google Play $50", nameAr: "جوجل بلاي 50 دولار", category: "gift_cards", price: "53.99", image: null, params: ["email"], desc: "بطاقة Google Play بقيمة 50$" },

      // iTunes / App Store
      { id: "itunes_5", name: "App Store & iTunes $5", nameAr: "ابل ستور 5 دولار", category: "gift_cards", price: "5.50", image: null, params: ["email"], desc: "بطاقة Apple App Store بقيمة 5$" },
      { id: "itunes_10", name: "App Store & iTunes $10", nameAr: "ابل ستور 10 دولار", category: "gift_cards", price: "10.99", image: null, params: ["email"], desc: "بطاقة Apple App Store بقيمة 10$" },
      { id: "itunes_25", name: "App Store & iTunes $25", nameAr: "ابل ستور 25 دولار", category: "gift_cards", price: "26.99", image: null, params: ["email"], desc: "بطاقة Apple App Store بقيمة 25$" },
      { id: "itunes_50", name: "App Store & iTunes $50", nameAr: "ابل ستور 50 دولار", category: "gift_cards", price: "53.99", image: null, params: ["email"], desc: "بطاقة Apple App Store بقيمة 50$" },

      // Steam
      { id: "steam_5", name: "Steam Wallet $5", nameAr: "ستيم 5 دولار", category: "pc_games", price: "5.50", image: null, params: ["email"], desc: "رصيد Steam بقيمة 5$" },
      { id: "steam_10", name: "Steam Wallet $10", nameAr: "ستيم 10 دولار", category: "pc_games", price: "10.99", image: null, params: ["email"], desc: "رصيد Steam بقيمة 10$" },
      { id: "steam_20", name: "Steam Wallet $20", nameAr: "ستيم 20 دولار", category: "pc_games", price: "21.99", image: null, params: ["email"], desc: "رصيد Steam بقيمة 20$" },
      { id: "steam_50", name: "Steam Wallet $50", nameAr: "ستيم 50 دولار", category: "pc_games", price: "53.99", image: null, params: ["email"], desc: "رصيد Steam بقيمة 50$" },

      // ChatGPT / OpenAI
      { id: "chatgpt_plus_1m", name: "ChatGPT Plus 1 Month", nameAr: "شات جي بي تي بلس شهر", category: "services", price: "21.99", image: null, params: ["email"], desc: "اشتراك ChatGPT Plus لمدة شهر كامل" },

      // Valorant
      { id: "valorant_475vp", name: "Valorant 475 VP", nameAr: "فالورانت 475 VP", category: "pc_games", price: "4.99", image: null, params: ["playerId"], desc: "475 Valorant Points" },
      { id: "valorant_1000vp", name: "Valorant 1000 VP", nameAr: "فالورانت 1000 VP", category: "pc_games", price: "9.99", image: null, params: ["playerId"], desc: "1000 Valorant Points" },
      { id: "valorant_2050vp", name: "Valorant 2050 VP", nameAr: "فالورانت 2050 VP", category: "pc_games", price: "19.99", image: null, params: ["playerId"], desc: "2050 Valorant Points" },
      { id: "valorant_4000vp", name: "Valorant 4000 VP", nameAr: "فالورانت 4000 VP", category: "pc_games", price: "35.99", image: null, params: ["playerId"], desc: "4000 Valorant Points" },

      // Fortnite
      { id: "fortnite_1000", name: "Fortnite 1000 V-Bucks", nameAr: "فورتنايت 1000 V-Bucks", category: "pc_games", price: "7.99", image: null, params: ["playerId"], desc: "1000 V-Bucks لحساب Fortnite" },
      { id: "fortnite_2800", name: "Fortnite 2800 V-Bucks", nameAr: "فورتنايت 2800 V-Bucks", category: "pc_games", price: "19.99", image: null, params: ["playerId"], desc: "2800 V-Bucks لحساب Fortnite" },

      // Canva Pro
      { id: "canva_1m", name: "Canva Pro 1 Month", nameAr: "كانفا برو شهر", category: "services", price: "5.99", image: null, params: ["email"], desc: "اشتراك Canva Pro لمدة شهر" },
      { id: "canva_12m", name: "Canva Pro 12 Months", nameAr: "كانفا برو سنة", category: "services", price: "59.99", image: null, params: ["email"], desc: "اشتراك Canva Pro لمدة سنة كاملة" },
    ];

    for (const p of products) {
      await db.insert(productsTable).values({
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        description: p.desc,
        image: p.image ?? null,
        category: p.category,
        provider: "manual",
        providerProductId: p.id,
        priceUsd: p.price,
        unitPriceUsd: p.price,
        requiredFields: p.params,
        status: "active",
        profitMargin: "10",
        productType: "package",
        qtyMin: null,
        qtyMax: null,
      }).onConflictDoNothing();
    }

    logger.info({ count: products.length }, "Demo products seeded");
  } catch (err) {
    logger.warn({ err }, "Could not seed demo products");
  }
}

seedAdminUser()
  .then(() => seedDemoUser())
  .then(() => seedDemoProducts())
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  });
