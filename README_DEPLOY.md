# 🚀 Elite Store — تنصيب بأمر واحد

## خطوات الرفع (3 خطوات فقط)

### 1️⃣ ارفع الأرشيف على السيرفر وفك الضغط
```bash
scp elite-store-deploy.tar.gz user@your-server:/var/www/
ssh user@your-server
cd /var/www
tar -xzf elite-store-deploy.tar.gz
cd elite-store
```

### 2️⃣ انسخ ملف الإعدادات وعدّل القيم
```bash
cp .env.example .env
nano .env   # املأ DATABASE_URL, SESSION_SECRET, TELEGRAM_BOT_TOKEN... إلخ
```

### 3️⃣ شغّل سكربت التنصيب
```bash
bash setup.sh
```

السكربت بيعمل كل شي تلقائياً:
- يفحص البرامج المطلوبة (Node, pnpm, PostgreSQL)
- يثبّت الحزم
- يطبّق مخطط قاعدة البيانات
- يستورد البيانات الأولية (المنتجات، الفئات، البانرات)
- يبني الواجهة والسيرفر
- يشغّل السيرفر عبر PM2

---

## ما يحتويه الأرشيف

```
elite-store/
├── setup.sh                     ← سكربت التنصيب الأوتوماتيكي
├── .env.example                 ← قالب متغيّرات البيئة
├── DEPLOYMENT.md                ← الدليل المفصّل (Nginx, SSL, تشخيص)
├── README_DEPLOY.md             ← هذا الملف
├── data/
│   └── initial_data.sql.gz      ← بيانات أولية (منتجات + بانرات + إعدادات)
├── artifacts/
│   ├── api-server/              ← السيرفر (Express + TypeScript)
│   ├── elite-store/             ← الواجهة (React + Vite)
│   └── mockup-sandbox/
├── lib/
│   └── db/                      ← مخطط قاعدة البيانات (Drizzle)
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

---

## بعد التنصيب — خطوات إضافية

### 🌐 إعداد Nginx + SSL (إلزامي للإنتاج)
راجع `DEPLOYMENT.md` قسم 7 — كل التفاصيل موجودة هناك.

### 🤖 تحديث webhook التلغرام
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook"
```

### 🔐 غيّر كلمة مرور المشرف
- ادخل بالحساب الافتراضي: `Zean.23` / `Zean333zean#`
- من اللوحة: غيّر كلمة المرور فوراً

---

## للمساعدة الكاملة
كل التفاصيل (تشخيص أخطاء، نسخ احتياطي، نقل بيانات، إلخ) موجودة في **DEPLOYMENT.md**
