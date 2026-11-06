#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
#  Elite Store — One-Shot Installer
#  استخدام:
#    1. ارفع الأرشيف للسيرفر وفك ضغطه
#    2. cd elite-store
#    3. cp .env.example .env  &&  nano .env   (عدّل القيم)
#    4. bash setup.sh
# ════════════════════════════════════════════════════════════════════
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# 1. تحقق من ملف .env
[ -f .env ] || err "ملف .env مفقود. انسخ .env.example إلى .env وعدّل القيم أولاً."
set -a; source .env; set +a
[ -z "$DATABASE_URL" ] && err "DATABASE_URL غير مضبوط في .env"
[ -z "$SESSION_SECRET" ] && err "SESSION_SECRET غير مضبوط في .env"

# 2. تحقق من البرامج المطلوبة
log "فحص البرامج المطلوبة..."
command -v node >/dev/null || err "Node.js غير مثبّت. ثبّت Node 20+ أولاً."
command -v pnpm >/dev/null || { warn "pnpm غير موجود — يتم تثبيته..."; npm install -g pnpm@9; }
command -v psql >/dev/null || warn "psql غير موجود — تأكد من قدرة السيرفر على الوصول لـPostgreSQL"

NODE_VER=$(node -v | sed 's/v\([0-9]*\).*/\1/')
[ "$NODE_VER" -ge 20 ] || err "Node.js 20+ مطلوب (الحالي: $(node -v))"

# 3. تثبيت الحزم
log "تثبيت الحزم (قد يستغرق دقائق)..."
pnpm install --frozen-lockfile --prod=false

# 4. تطبيق مخطط قاعدة البيانات
log "تطبيق مخطط قاعدة البيانات..."
pnpm --filter @workspace/db run push

# 5. استيراد البيانات إذا متوفّر ملف backup
if [ -f data/initial_data.sql.gz ]; then
  log "استيراد البيانات الأولية..."
  gunzip -c data/initial_data.sql.gz | psql "$DATABASE_URL" > /dev/null 2>&1 || warn "تخطّي الاستيراد (موجود مسبقاً)"
fi

# 6. بناء الواجهة والسيرفر
log "بناء الواجهة الأمامية..."
pnpm --filter @workspace/elite-store run build

log "بناء السيرفر..."
pnpm --filter @workspace/api-server run build

# 7. تشغيل عبر PM2 (لو مثبّت) أو رسالة
if command -v pm2 >/dev/null; then
  log "تشغيل السيرفر عبر PM2..."
  pm2 delete elite-store 2>/dev/null || true
  pm2 start "pnpm --filter @workspace/api-server run start" --name elite-store --time
  pm2 save
  log "السيرفر شغّال على البورت ${PORT:-8080}"
  log "للمراقبة: pm2 logs elite-store"
  log "للتشغيل التلقائي بعد إعادة الإقلاع: شغّل  pm2 startup  واتبع التعليمات"
else
  warn "PM2 غير مثبّت. ثبّته بـ: npm install -g pm2"
  warn "ثم شغّل:  pm2 start \"pnpm --filter @workspace/api-server run start\" --name elite-store"
fi

# 8. تذكير webhook التلغرام
echo ""
log "═════════════════════════════════════════════════════"
log "التثبيت اكتمل! 🎉"
log "═════════════════════════════════════════════════════"
echo ""
warn "لا تنسَ تحديث webhook التلغرام للدومين الجديد:"
echo "  curl \"https://api.telegram.org/bot\$TELEGRAM_BOT_TOKEN/setWebhook?url=\$PUBLIC_URL/api/telegram/webhook\""
echo ""
warn "وإعداد Nginx + SSL — راجع DEPLOYMENT.md"
