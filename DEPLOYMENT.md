# دليل نشر Elite Store على استضافة خارجية

دليل شامل ومفصّل لنقل وتشغيل المتجر على سيرفرك الخاص بدون أي نقص في المميزات.

---

## 📋 قائمة المحتويات

1. [نظرة عامة على الموقع](#1-نظرة-عامة-على-الموقع)
2. [متطلبات السيرفر](#2-متطلبات-السيرفر)
3. [قبل البدء — تجهيزات إلزامية](#3-قبل-البدء--تجهيزات-إلزامية)
4. [متغيّرات البيئة الكاملة](#4-متغيّرات-البيئة-الكاملة)
5. [خطوات التثبيت والنشر](#5-خطوات-التثبيت-والنشر)
6. [إعداد قاعدة البيانات](#6-إعداد-قاعدة-البيانات)
7. [إعداد Nginx والدومين والـSSL](#7-إعداد-nginx-والدومين-والـssl)
8. [تشغيل دائم باستخدام PM2](#8-تشغيل-دائم-باستخدام-pm2)
9. [نقل البيانات من Replit للسيرفر الجديد](#9-نقل-البيانات-من-replit-للسيرفر-الجديد)
10. [إعادة ضبط بوت التلغرام](#10-إعادة-ضبط-بوت-التلغرام)
11. [النسخ الاحتياطي التلقائي](#11-النسخ-الاحتياطي-التلقائي)
12. [الميزات الخلفية التلقائية](#12-الميزات-الخلفية-التلقائية)
13. [حل المشاكل الشائعة](#13-حل-المشاكل-الشائعة)
14. [قائمة فحص نهائية قبل الإطلاق](#14-قائمة-فحص-نهائية-قبل-الإطلاق)

---

## 1. نظرة عامة على الموقع

**Elite Store** متجر منتجات رقمية بواجهة عربية (RTL) متكامل مع:
- 🎮 تكامل مع مزوّدين خارجيين: **Ahminix** و **Shams4Store**
- 🤖 بوت **تلغرام** للإدارة والإشعارات
- 👑 نظام **VIP** ونقاط ولاء
- 💰 محفظة إلكترونية وخصومات وكاش باك
- 📱 تطبيق PWA (يعمل كتطبيق على الموبايل)
- 🔄 إعادة محاولة تلقائية للطلبات الفاشلة (كل 5 دقائق)

**التقنيات المستخدمة:**
- Backend: Node.js 20 + Express 5 + TypeScript
- Frontend: React 19 + Vite + Tailwind CSS v4
- Database: PostgreSQL 14+ مع Drizzle ORM
- Package Manager: pnpm (workspace)

---

## 2. متطلبات السيرفر

### الحد الأدنى
- **نظام التشغيل**: Ubuntu 22.04 LTS أو أحدث (أو أي توزيعة Linux حديثة)
- **المعالج**: 2 vCPU
- **الذاكرة**: 2 GB RAM
- **القرص**: 20 GB SSD
- **الشبكة**: IP عام ثابت

### الموصى به
- **المعالج**: 4 vCPU
- **الذاكرة**: 4 GB RAM
- **القرص**: 50 GB SSD
- مزوّد سحابي: DigitalOcean, Hetzner, Contabo, AWS Lightsail

### البرامج المطلوبة
```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
npm install -g pnpm@9

# PostgreSQL 14+
sudo apt-get install -y postgresql postgresql-contrib

# Nginx
sudo apt-get install -y nginx

# Certbot للـSSL
sudo apt-get install -y certbot python3-certbot-nginx

# Git
sudo apt-get install -y git

# PM2 لإدارة العمليات
npm install -g pm2
```

---

## 3. قبل البدء — تجهيزات إلزامية

### ⚠️ تحذيرات أمنية مهمة جداً

1. **جدّد كل المفاتيح المسرّبة** قبل النشر:
   - `TELEGRAM_BOT_TOKEN` — احذف البوت الحالي وأنشئ واحد جديد من @BotFather
   - `AHMINIX_API_KEY` — اطلب مفتاح جديد من لوحة Ahminix
   - `SHAMS4STORE_API_TOKEN` — اطلب توكن جديد من لوحة Shams4Store

2. **`SESSION_SECRET` لازم يكون ثابت**:
   - ولّد سلسلة عشوائية 64+ حرف **مرة واحدة** واحفظها بمكان آمن
   - **أي تغيير لها يفصل كل المستخدمين فوراً** (تنتهي جلساتهم)
   - أمر التوليد:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

3. **خذ نسخة احتياطية كاملة** من قاعدة البيانات الحالية على Replit قبل النقل (راجع قسم 9).

---

## 4. متغيّرات البيئة الكاملة

أنشئ ملف `.env` في جذر المشروع. **كل المتغيّرات إلزامية إلا ما هو مكتوب "اختياري"**:

```bash
# ─── الأساسيات ─────────────────────────────────────────────
NODE_ENV=production
PORT=8080

# ─── قاعدة البيانات ────────────────────────────────────────
DATABASE_URL=postgres://elite_user:strong_password@localhost:5432/elite_store

# ─── الجلسات والمصادقة ─────────────────────────────────────
# سلسلة 64+ حرف عشوائية — ثابتة، لا تتغيّر أبداً
SESSION_SECRET=ضع_هنا_السلسلة_العشوائية_الطويلة_64_حرف

# ─── بوت التلغرام ──────────────────────────────────────────
TELEGRAM_BOT_TOKEN=123456789:AAAA...
TELEGRAM_ADMIN_CHAT_ID=-100123456789
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook

# ─── مزوّد Ahminix ─────────────────────────────────────────
AHMINIX_API_KEY=مفتاح_API_من_Ahminix
AHMINIX_API_URL=https://api.ahminix.com

# ─── مزوّد Shams4Store ─────────────────────────────────────
SHAMS4STORE_API_TOKEN=توكن_Shams4Store
SHAMS4STORE_API_URL=https://api.shams4store.com

# ─── الدومين (للروابط الخارجية في الإيميلات والإشعارات) ────
PUBLIC_URL=https://yourdomain.com
```

### كيف توضع المتغيّرات على السيرفر؟

**الطريقة 1 — ملف `.env` (الأبسط):**
```bash
cd /var/www/elite-store
nano .env
# انسخ المتغيّرات وعدّل القيم
chmod 600 .env  # حماية الملف
```

**الطريقة 2 — متغيّرات systemd (الأكثر أماناً):**
ضعهم في `/etc/systemd/system/elite-store.service` تحت قسم `[Service]`:
```ini
Environment="DATABASE_URL=postgres://..."
Environment="SESSION_SECRET=..."
```

---

## 5. خطوات التثبيت والنشر

### الخطوة 1: تحضير المجلد
```bash
sudo mkdir -p /var/www/elite-store
sudo chown -R $USER:$USER /var/www/elite-store
cd /var/www/elite-store
```

### الخطوة 2: نسخ الكود
```bash
# الخيار أ — من Git
git clone <رابط_المستودع> .

# الخيار ب — رفع مباشر (zip من Replit)
# ارفع الملف، ثم:
unzip elite-store.zip
```

### الخطوة 3: تثبيت الحزم
```bash
pnpm install --frozen-lockfile
```

### الخطوة 4: إعداد ملف `.env`
```bash
nano .env
# الصق المتغيّرات من القسم 4 وعدّل القيم
```

### الخطوة 5: تطبيق مخطط قاعدة البيانات
```bash
pnpm --filter @workspace/db run push
```

### الخطوة 6: بناء الواجهة الأمامية
```bash
pnpm --filter @workspace/elite-store run build
```

### الخطوة 7: بناء وتشغيل السيرفر
```bash
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

السيرفر الآن يعمل على `http://localhost:8080`. للتحقق:
```bash
curl http://localhost:8080/api/health
```

---

## 6. إعداد قاعدة البيانات

### إنشاء المستخدم وقاعدة البيانات
```bash
sudo -u postgres psql

CREATE USER elite_user WITH PASSWORD 'كلمة_مرور_قوية_جداً';
CREATE DATABASE elite_store OWNER elite_user;
GRANT ALL PRIVILEGES ON DATABASE elite_store TO elite_user;
\q
```

### السماح بالاتصال المحلي فقط (آمن)
عدّل `/etc/postgresql/14/main/pg_hba.conf`:
```
local   all   elite_user                md5
host    all   elite_user   127.0.0.1/32 md5
```

ثم أعد تشغيل PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### تطبيق المخطط
المشروع يستخدم **Drizzle ORM** ويطبّق المخطط تلقائياً:
```bash
cd /var/www/elite-store
pnpm --filter @workspace/db run push
```

> ⚠️ لا تكتب SQL migrations يدوياً — استخدم دائماً الأمر أعلاه.

---

## 7. إعداد Nginx والدومين والـSSL

### الخطوة 1: وجّه الدومين
في لوحة DNS عند مزوّد الدومين:
- نوع السجل: **A**
- الاسم: `@` (أو `www`)
- القيمة: IP السيرفر

انتظر 10-30 دقيقة حتى تنتشر التحديثات.

### الخطوة 2: إعداد Nginx
أنشئ `/etc/nginx/sites-available/elite-store`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # حد أقصى لحجم الرفع (للصور والمرفقات)
    client_max_body_size 20M;

    # WebSocket support (للإشعارات اللحظية)
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }
}
```

فعّل الموقع:
```bash
sudo ln -s /etc/nginx/sites-available/elite-store /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### الخطوة 3: تركيب SSL مجاني من Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

اتبع التعليمات. سيُحدّث Certbot ملف Nginx تلقائياً ويضيف التشفير. التجديد التلقائي يشتغل لوحدو كل 90 يوم.

---

## 8. تشغيل دائم باستخدام PM2

PM2 يضمن أن السيرفر يبقى شغّال حتى لو أعدت تشغيل الجهاز.

### تشغيل السيرفر
```bash
cd /var/www/elite-store
pm2 start "pnpm --filter @workspace/api-server run start" --name elite-store
```

### حفظ التشغيل التلقائي بعد إعادة الإقلاع
```bash
pm2 save
pm2 startup
# اتبع الأمر اللي يظهر لك (يبدأ بـ sudo env...)
```

### أوامر مفيدة
```bash
pm2 status              # حالة كل العمليات
pm2 logs elite-store    # عرض السجلات اللحظية
pm2 restart elite-store # إعادة تشغيل
pm2 stop elite-store    # إيقاف
pm2 monit               # شاشة مراقبة كاملة
```

---

## 9. نقل البيانات من Replit للسيرفر الجديد

### تصدير البيانات من Replit
في Shell على Replit نفّذ:
```bash
# تصدير قاعدة البيانات كاملة
pg_dump $DATABASE_URL > elite_store_backup.sql

# تصدير الملفات المرفوعة
tar -czf attached_assets.tar.gz attached_assets/
```

نزّل الملفين للجهاز المحلي (من خلال مدير الملفات في Replit).

### استيراد البيانات للسيرفر الجديد
```bash
# ارفع الملفات للسيرفر
scp elite_store_backup.sql user@server:/tmp/
scp attached_assets.tar.gz user@server:/tmp/

# على السيرفر:
psql $DATABASE_URL < /tmp/elite_store_backup.sql

# الملفات المرفوعة:
cd /var/www/elite-store
tar -xzf /tmp/attached_assets.tar.gz
```

### تأكيد نجاح النقل
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM orders;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM home_banners;"
```

---

## 10. إعادة ضبط بوت التلغرام

بعد ما الموقع يشتغل على الدومين الجديد، لازم تخبر تلغرام بالعنوان الجديد للويب هوك:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook"
```

تأكد من النجاح:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

ابعث رسالة تجريبية للبوت من حسابك للتأكد من الردود.

---

## 11. النسخ الاحتياطي التلقائي

النظام يحفظ نسخة احتياطية يومية الساعة 3 صباحاً بتوقيت دمشق في:
```
/var/www/elite-store/artifacts/api-server/backups/
```

ويحتفظ بآخر **14 يوم** فقط.

### ⚠️ مهم — انسخ النسخ الاحتياطية لمكان منفصل
المجلد المحلي ممكن يضيع لو حصل عطل بالقرص. ينصح بـ:

**الخيار 1 — مهمّة cron ترفع للـ S3:**
```bash
sudo nano /etc/cron.daily/backup-elite-store
```
```bash
#!/bin/bash
LATEST=$(ls -t /var/www/elite-store/artifacts/api-server/backups/*.sql.gz | head -1)
aws s3 cp "$LATEST" s3://your-bucket/elite-store-backups/
```
```bash
sudo chmod +x /etc/cron.daily/backup-elite-store
```

**الخيار 2 — استخدم rclone مع Google Drive / Dropbox:**
```bash
sudo apt install -y rclone
rclone config  # اتبع الإعدادات
# ثم في cron:
rclone copy /var/www/elite-store/artifacts/api-server/backups/ remote:elite-backups/
```

### استعادة نسخة احتياطية
```bash
gunzip -c backup_20260422.sql.gz | psql $DATABASE_URL
```

---

## 12. الميزات الخلفية التلقائية

كل هاي تشتغل تلقائياً بمجرد تشغيل السيرفر — ما تحتاج أي إعداد إضافي:

| الميزة | التوقيت | الوصف |
|--------|--------|-------|
| ✅ مزامنة المنتجات من المزوّدين | كل ساعة | يجلب المنتجات الجديدة من Ahminix و Shams4Store |
| ✅ متابعة حالة الطلبات | كل دقيقة | يفحص الطلبات قيد المعالجة عند المزوّد |
| ✅ **إعادة محاولة الطلبات الفاشلة** | كل دقيقة | يعيد محاولة الطلبات اللي فشلت بسبب مؤقت (5xx، انقطاع شبكة) — حتى 3 محاولات بفاصل 5 دقائق |
| ✅ مراقبة رصيد المزوّدين | كل ساعة | تنبيه تلغرام لو الرصيد قارب على النفاد |
| ✅ نسخ احتياطي يومي | 3 صباحاً (دمشق) | يحفظ آخر 14 نسخة |
| ✅ تقرير يومي عبر تلغرام | 8 صباحاً (دمشق) | ملخص الطلبات والإيرادات |

---

## 13. حل المشاكل الشائعة

### ❌ السيرفر لا يبدأ
```bash
pm2 logs elite-store --lines 50
```
- تأكد أن `DATABASE_URL` صحيح
- تأكد أن `PORT` غير مستخدم: `sudo lsof -i :8080`

### ❌ المستخدمون يُفصلون فجأة
- `SESSION_SECRET` تغيّر — أرجعه للقيمة القديمة في `.env`

### ❌ الإشعارات ما تشتغل لحظياً
- مشكلة WebSocket — تأكد من قسم `/ws` في إعدادات Nginx

### ❌ البوت ما يرد
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```
- تأكد أن `url` يشير للدومين الجديد
- تأكد أن SSL يعمل (تلغرام يرفض HTTP)

### ❌ الطلبات تفشل عند المزوّد دائماً
- تحقق من صلاحية `AHMINIX_API_KEY` و `SHAMS4STORE_API_TOKEN`
- افحص رصيدك عند المزوّد
- راجع لوحة الإدارة → سجلات الطلبات لرؤية رسالة الخطأ بالضبط

### ❌ الصور المرفوعة لا تظهر
- تأكد أن مجلد `attached_assets/` تم نقله
- تأكد من الصلاحيات: `chmod -R 755 attached_assets/`

---

## 14. قائمة فحص نهائية قبل الإطلاق

استخدم هاي القائمة بالترتيب:

### 🔧 إعداد البنية التحتية
- [ ] السيرفر مُعدّ بكل البرامج المطلوبة (Node 20, pnpm, PostgreSQL, Nginx)
- [ ] الدومين يشير لـIP السيرفر
- [ ] شهادة SSL مفعّلة (HTTPS يعمل)
- [ ] Nginx يحوّل للبورت 8080 ويدعم WebSocket

### 🔐 الأمان والمفاتيح
- [ ] `TELEGRAM_BOT_TOKEN` جديد (تم تجديده)
- [ ] `AHMINIX_API_KEY` جديد (تم تجديده)
- [ ] `SHAMS4STORE_API_TOKEN` جديد (تم تجديده)
- [ ] `SESSION_SECRET` ثابت ومُولّد عشوائياً (64+ حرف)
- [ ] ملف `.env` صلاحياته `600` (يقرأه المالك فقط)
- [ ] كلمة مرور PostgreSQL قوية ومختلفة

### 📦 الكود والبيانات
- [ ] الكود مرفوع كاملاً على السيرفر
- [ ] `pnpm install` نجح بدون أخطاء
- [ ] مخطط قاعدة البيانات مُطبّق (`db push`)
- [ ] الواجهة الأمامية مبنية (`elite-store build`)
- [ ] السيرفر مبني (`api-server build`)
- [ ] قاعدة البيانات منقولة من Replit (المستخدمون، المنتجات، الطلبات، البانرات)
- [ ] مجلد `attached_assets/` منقول

### 🚀 التشغيل
- [ ] PM2 يدير السيرفر
- [ ] `pm2 save` و `pm2 startup` تم تنفيذهم
- [ ] السيرفر يعمل بعد إعادة تشغيل تجريبية للجهاز
- [ ] webhook التلغرام مُحدّث للدومين الجديد
- [ ] البوت يرد على الرسائل التجريبية
- [ ] صفحة المتجر تفتح على الدومين
- [ ] تسجيل الدخول للمشرف يعمل
- [ ] طلب تجريبي صغير يُنفّذ ويصل للمستخدم

### 📊 المراقبة والنسخ الاحتياطي
- [ ] النسخ الاحتياطي اليومي يعمل (تحقق بعد يوم)
- [ ] النسخ الاحتياطي يُرفع لمكان خارجي (S3 / Drive)
- [ ] `pm2 monit` يعرض الموارد بشكل صحي
- [ ] التقرير اليومي يصل عبر تلغرام الساعة 8 صباحاً

### 🎨 المحتوى
- [ ] البانرات الـ3 الافتراضية تظهر على الصفحة الرئيسية
- [ ] المنتجات والفئات تظهر بشكل صحيح
- [ ] الصور تحمّل بسرعة
- [ ] الموقع يعمل على الموبايل (PWA)
- [ ] أزرار الدعم تفتح تلغرام بشكل صحيح

---

## 📞 معلومات تقنية إضافية

### بيانات المشرف الافتراضية
- **اسم المستخدم**: `Zean.23`
- **البريد**: `zean23@elitestore.admin`
- **كلمة المرور**: `Zean333zean#`
- ⚠️ **غيّر كلمة المرور فور أول تسجيل دخول على الموقع المنشور**

### روابط الدعم الحالية
- **قناة تلغرام**: `https://t.me/elitestore_sy`
- **دعم تلغرام**: `https://t.me/+963931670388`

### مدة صلاحية جلسات المستخدمين
- **JWT TTL**: 7 أيام (تتجدد تلقائياً مع الاستخدام)

### إحصائيات الموقع الحالية
- 47 بانر إجمالاً (3 نشطين + 44 موقّفين جاهزين للتفعيل)
- 5 بانرات جديدة تمت إضافتها مؤخراً (خصم ترحيبي، نقاط مضاعفة، كاش باك، عرض الأسبوع، نظام إحالة)

---

## 🎯 خلاصة سريعة

**أقصر طريق للنشر الناجح:**

```bash
# 1. على السيرفر الجديد
sudo apt update && sudo apt install -y nodejs npm postgresql nginx certbot python3-certbot-nginx git
npm install -g pnpm@9 pm2

# 2. PostgreSQL
sudo -u postgres createuser -P elite_user
sudo -u postgres createdb -O elite_user elite_store

# 3. الكود
cd /var/www && sudo git clone <repo> elite-store && sudo chown -R $USER elite-store
cd elite-store && pnpm install
nano .env  # الصق المتغيّرات

# 4. بناء وتطبيق
pnpm --filter @workspace/db run push
pnpm --filter @workspace/elite-store run build
pnpm --filter @workspace/api-server run build

# 5. تشغيل
pm2 start "pnpm --filter @workspace/api-server run start" --name elite-store
pm2 save && pm2 startup

# 6. Nginx + SSL
sudo nano /etc/nginx/sites-available/elite-store  # الصق الإعدادات
sudo ln -s /etc/nginx/sites-available/elite-store /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com

# 7. تلغرام webhook
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook"

# 8. نقل البيانات (من Replit)
psql $DATABASE_URL < elite_store_backup.sql
tar -xzf attached_assets.tar.gz
```

**خلصت! الموقع جاهز شغّال 100% على دومينك.**
