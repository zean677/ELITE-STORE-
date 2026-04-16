import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicLayout } from '@/components/Layout';
import { useLanguage } from '@/i18n';
import { useQuery } from '@tanstack/react-query';
import { Search, Zap, Shield, Clock, ChevronLeft, Star } from 'lucide-react';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

const WA_GROUP = 'https://chat.whatsapp.com/DmATlEZYLFgHbWuo4HOVay?mode=gi_t';
const WA_SUPPORT = 'https://wa.me/963992718483';

const CATEGORY_ROUTE_OVERRIDES: Record<string, string> = {
  games: '/products?category=mobile_games',
  mobile_games: '/products?category=mobile_games',
  pc_games: '/products?category=pc_games',
  apps: '/products?category=services&q=apps',
  social: '/products?category=services&q=social',
  telecom: '/products?category=general&q=telecom',
  gift_cards: '/products?category=gift_cards',
  crypto: '/products?category=general&q=crypto',
  ai: '/products?category=services&q=ai',
  subscriptions: '/products?category=services&q=premium',
  design: '/products?category=services&q=design',
  accounts: '/products?category=general&q=numbers',
  wholesale: '/products?category=general&q=accounts',
  services: '/products?category=services',
  general: '/products?category=general',
};

function normalizeCategoryHref(cat: { id?: string | number; href?: string }) {
  const id = String(cat.id ?? '');
  if (CATEGORY_ROUTE_OVERRIDES[id]) return CATEGORY_ROUTE_OVERRIDES[id];
  const href = cat.href ?? '';
  if (href.includes('/products?category=services/products') || href.includes('q=telecomq=') || href.includes('q=cryptoq=') || href.includes('q=numbersq=') || href.includes('q=accountsq=')) {
    return CATEGORY_ROUTE_OVERRIDES.general;
  }
  return href || '/products';
}

// ─── Static fallback categories (used if API fails) ──────────
const CATEGORIES_FALLBACK = [
  {
    id: 'games',
    nameAr: 'الألعاب',
    nameEn: 'Games',
    href: '/products?category=mobile_games',
    color: '#7c3aed',
    bg: 'linear-gradient(145deg, #1a0040, #2d0080)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=pubg.com&sz=64', label: 'PUBG', bg: '#f59e0b' },
      { img: 'https://www.google.com/s2/favicons?domain=garena.com&sz=64', label: 'FF', bg: '#f97316' },
      { img: 'https://www.google.com/s2/favicons?domain=mobilelegends.com&sz=64', label: 'ML', bg: '#dc2626' },
      { img: 'https://www.google.com/s2/favicons?domain=clash.com&sz=64', label: 'CoC', bg: '#3b82f6' },
    ],
  },
  {
    id: 'apps',
    nameAr: 'التطبيقات',
    nameEn: 'Apps',
    href: '/products?category=services',
    color: '#22c55e',
    bg: 'linear-gradient(145deg, #002010, #004020)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64', label: 'Netflix', bg: '#e50914' },
      { img: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64', label: 'Spotify', bg: '#1db954' },
      { img: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64', label: 'YouTube', bg: '#ff0000' },
      { img: 'https://www.google.com/s2/favicons?domain=chat.openai.com&sz=64', label: 'ChatGPT', bg: '#10a37f' },
    ],
  },
  {
    id: 'social',
    nameAr: 'السوشيال ميديا',
    nameEn: 'Social Media',
    href: '/products?category=services&q=social',
    color: '#3b82f6',
    bg: 'linear-gradient(145deg, #001030, #002060)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=telegram.org&sz=64', label: 'TG', bg: '#2aabee' },
      { img: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64', label: 'FB', bg: '#1877f2' },
      { img: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64', label: 'TT', bg: '#000000' },
      { img: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64', label: 'IG', bg: '#e1306c' },
    ],
  },
  {
    id: 'telecom',
    nameAr: 'الرصيد والاتصالات',
    nameEn: 'Telecom',
    href: '/products?category=services/products?category=general&q=telecomq=telecom',
    color: '#ef4444',
    bg: 'linear-gradient(145deg, #200010, #400020)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=syriatel.com.sy&sz=64', label: 'Syriatel', bg: '#dc2626' },
      { img: 'https://www.google.com/s2/favicons?domain=mtn.sy&sz=64', label: 'MTN', bg: '#f59e0b' },
      { img: 'https://www.google.com/s2/favicons?domain=zain.com&sz=64', label: 'Zain', bg: '#a855f7' },
      { img: 'https://www.google.com/s2/favicons?domain=vodafone.com&sz=64', label: 'VF', bg: '#ef4444' },
    ],
  },
  {
    id: 'gift_cards',
    nameAr: 'البطاقات',
    nameEn: 'Gift Cards',
    href: '/products?category=gift_cards',
    color: '#f59e0b',
    bg: 'linear-gradient(145deg, #201000, #402000)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=play.google.com&sz=64', label: 'Google', bg: '#4285f4' },
      { img: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64', label: 'iTunes', bg: '#fc3158' },
      { img: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=64', label: 'Amazon', bg: '#ff9900' },
      { img: 'https://www.google.com/s2/favicons?domain=playstation.com&sz=64', label: 'PSN', bg: '#00439c' },
    ],
  },
  {
    id: 'crypto',
    nameAr: 'العملات الرقمية',
    nameEn: 'Crypto',
    href: '/products?category=services/products?category=general&q=cryptoq=crypto',
    color: '#f59e0b',
    bg: 'linear-gradient(145deg, #201500, #403000)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=tether.to&sz=64', label: 'USDT', bg: '#26a17b' },
      { img: 'https://www.google.com/s2/favicons?domain=binance.com&sz=64', label: 'BNB', bg: '#f3ba2f' },
      { img: 'https://www.google.com/s2/favicons?domain=payeer.com&sz=64', label: 'Payeer', bg: '#1e88e5' },
      { img: 'https://www.google.com/s2/favicons?domain=perfectmoney.com&sz=64', label: 'PM', bg: '#c62828' },
    ],
  },
  {
    id: 'pc_games',
    nameAr: 'ألعاب الكمبيوتر',
    nameEn: 'PC Games',
    href: '/products?category=pc_games',
    color: '#06b6d4',
    bg: 'linear-gradient(145deg, #001520, #002d40)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=store.steampowered.com&sz=64', label: 'Steam', bg: '#1b2838' },
      { img: 'https://www.google.com/s2/favicons?domain=playvalorant.com&sz=64', label: 'Valorant', bg: '#ef4444' },
      { img: 'https://www.google.com/s2/favicons?domain=leagueoflegends.com&sz=64', label: 'LoL', bg: '#c89b3c' },
      { img: 'https://www.google.com/s2/favicons?domain=xbox.com&sz=64', label: 'Xbox', bg: '#107c10' },
    ],
  },
  {
    id: 'ai',
    nameAr: 'الذكاء الاصطناعي',
    nameEn: 'AI Tools',
    href: '/products?category=services&q=ai',
    color: '#a78bfa',
    bg: 'linear-gradient(145deg, #100020, #200040)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=chat.openai.com&sz=64', label: 'ChatGPT', bg: '#10a37f' },
      { img: 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=64', label: 'MJ', bg: '#000000' },
      { img: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64', label: 'Gemini', bg: '#4285f4' },
      { img: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64', label: 'Claude', bg: '#d97706' },
    ],
  },
  {
    id: 'subscriptions',
    nameAr: 'الاشتراكات',
    nameEn: 'Subscriptions',
    href: '/products?category=services&q=premium',
    color: '#8b5cf6',
    bg: 'linear-gradient(145deg, #0f0020, #1f0040)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64', label: 'Netflix', bg: '#e50914' },
      { img: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64', label: 'Spotify', bg: '#1db954' },
      { img: 'https://www.google.com/s2/favicons?domain=canva.com&sz=64', label: 'Canva', bg: '#00c4cc' },
      { img: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=64', label: 'Adobe', bg: '#ff0000' },
    ],
  },
  {
    id: 'design',
    nameAr: 'برامج التصميم',
    nameEn: 'Design Tools',
    href: '/products?category=services&q=design',
    color: '#f472b6',
    bg: 'linear-gradient(145deg, #200010, #3f0020)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=canva.com&sz=64', label: 'Canva', bg: '#00c4cc' },
      { img: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=64', label: 'Adobe', bg: '#ff0000' },
      { img: 'https://www.google.com/s2/favicons?domain=figma.com&sz=64', label: 'Figma', bg: '#f24e1e' },
      { img: 'https://www.google.com/s2/favicons?domain=capcut.com&sz=64', label: 'CapCut', bg: '#000000' },
    ],
  },
  {
    id: 'accounts',
    nameAr: 'الأرقام',
    nameEn: 'Numbers',
    href: '/products?category=services/products?category=general&q=numbersq=numbers',
    color: '#34d399',
    bg: 'linear-gradient(145deg, #001510, #003020)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64', label: 'WA', bg: '#25d366' },
      { img: 'https://www.google.com/s2/favicons?domain=telegram.org&sz=64', label: 'TG', bg: '#2aabee' },
      { img: 'https://www.google.com/s2/favicons?domain=snapchat.com&sz=64', label: 'SC', bg: '#fffc00' },
      { img: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=64', label: 'X', bg: '#000000' },
    ],
  },
  {
    id: 'wholesale',
    nameAr: 'الحسابات الجامعة',
    nameEn: 'Wholesale',
    href: '/products?category=services/products?category=general&q=accountsq=accounts',
    color: '#fb923c',
    bg: 'linear-gradient(145deg, #201005, #402010)',
    icons: [
      { img: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64', label: 'FB', bg: '#1877f2' },
      { img: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64', label: 'IG', bg: '#e1306c' },
      { img: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64', label: 'TT', bg: '#000000' },
      { img: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64', label: 'YT', bg: '#ff0000' },
    ],
  },
];

// ─── WhatsApp Popup ───────────────────────────────────────────
function WhatsAppPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('wa_popup_dismissed');
    if (!dismissed) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('wa_popup_dismissed', '1');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: '#111827', border: '1px solid rgba(108,92,231,0.3)', boxShadow: '0 0 60px rgba(108,92,231,0.2)' }}
          >
            <div className="relative h-44 flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%)' }}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
              <div className="text-center z-10 px-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.858L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.064-1.408l-.363-.215-3.761.98 1.006-3.653-.237-.375A9.818 9.818 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818 5.419 0 9.818 4.4 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/>
                  </svg>
                </div>
                <p className="text-white font-black text-lg">انضم لمجتمعنا الآن!</p>
                <p className="text-white/80 text-sm">أخبار وعروض حصرية</p>
              </div>
            </div>
            <div className="p-6 text-center" dir="rtl">
              <div className="flex items-center gap-2 justify-center mb-2">
                <span className="text-red-400 text-lg">🔴</span>
                <h3 className="font-black text-white text-lg">ملاحظة مهمة !!</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                يرجى الانضمام الى{' '}
                <a href={WA_GROUP} target="_blank" rel="noopener noreferrer" className="text-green-400 font-bold underline">مجتمع الواتساب</a>
              </p>
              <p className="text-gray-400 text-sm mb-4">لمتابعة أخبار وتحديثات الموقع</p>
              <a href={WA_GROUP} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-black text-white text-base mb-3 transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
                ➡️ اضغط هنا للانضمام ⬅️
              </a>
              <button onClick={dismiss}
                className="w-full py-3 rounded-2xl font-bold text-gray-800 text-base transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#fbbf24' }}>
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Category display type ─────────────────────────────────────
type CatDisplay = {
  id: string | number;
  nameAr: string;
  nameEn: string;
  href: string;
  color: string;
  bg: string;
  icons: { img: string; label: string; bg: string }[];
};

function apiToCat(c: any): CatDisplay {
  return {
    id: c.id,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    href: normalizeCategoryHref(c),
    color: c.color,
    bg: c.bgGradient,
    icons: [
      { img: c.icon1 || '', label: c.iconLabel1 || '', bg: c.color },
      { img: c.icon2 || '', label: c.iconLabel2 || '', bg: c.color },
      { img: c.icon3 || '', label: c.iconLabel3 || '', bg: c.color },
      { img: c.icon4 || '', label: c.iconLabel4 || '', bg: c.color },
    ],
  };
}

// ─── Category Card ─────────────────────────────────────────────
function CategoryCard({ cat, index }: { cat: CatDisplay; index: number }) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
    >
      <Link href={cat.href} className="block">
        <div
          className="relative rounded-2xl overflow-hidden shine-card"
          style={{
            background: cat.bg,
            border: `1px solid ${cat.color}40`,
            boxShadow: `0 4px 20px ${cat.color}18`,
            minHeight: 150,
          }}
        >
          {/* VIP Star badge */}
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,215,0,0.4)' }}>
              <Star size={8} className="text-yellow-400" fill="#facc15" />
              <span className="text-[9px] font-black text-yellow-400">VIP</span>
            </div>
          </div>

          {/* Icon grid 2×2 */}
          <div className="p-3 pb-1.5">
            <div className="grid grid-cols-2 gap-2">
              {cat.icons.map((icon, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: `${icon.bg}22`,
                    border: `1px solid ${icon.bg}33`,
                  }}
                >
                  {!imgErrors.has(i) ? (
                    <img
                      src={icon.img}
                      alt={icon.label}
                      className="w-9 h-9 object-contain"
                      onError={() => setImgErrors(s => new Set([...s, i]))}
                    />
                  ) : (
                    <span className="text-xs font-black text-white/60">{icon.label.slice(0, 2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Category name strip */}
          <div
            className="w-full text-center py-2.5 px-2"
            style={{
              background: `linear-gradient(0deg, ${cat.color}33 0%, transparent 100%)`,
              borderTop: `1px solid ${cat.color}30`,
            }}
          >
            <p className="text-[12px] font-black text-white leading-none">{cat.nameAr}</p>
            <p className="text-[9px] text-white/45 mt-1">{cat.nameEn}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────
function HeroBanner() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-5"
      style={{
        background: 'linear-gradient(135deg, #0d0025 0%, #1a0050 35%, #0f172a 100%)',
        border: '1px solid rgba(108,92,231,0.3)',
        boxShadow: '0 0 60px rgba(108,92,231,0.15)',
        minHeight: 160,
      }}
    >
      {/* Glow circles */}
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #6C5CE7, transparent)' }} />
      <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #00CEC9, transparent)' }} />

      {/* Animated particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: i % 2 === 0 ? '#6C5CE7' : '#00CEC9', top: `${15 + i * 10}%`, left: `${5 + i * 10}%` }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      {/* Elite badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(108,92,231,0.4)', border: '1px solid rgba(196,181,253,0.4)' }}>
        <Zap size={10} className="text-yellow-400" />
        <span className="text-[11px] font-black text-white">Elite Store</span>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center pr-5 pl-2" dir="rtl">
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white font-black text-2xl leading-tight mb-2"
          style={{ textShadow: '0 0 30px rgba(108,92,231,0.5)' }}
        >
          متوفرون معكم جميع<br />أيام الأسبوع 🕐
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 mb-2"
        >
          <span className="flex items-center gap-1 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-full border border-white/10">
            <Shield size={10} className="text-green-400" /> ضمان
          </span>
          <span className="flex items-center gap-1 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-full border border-white/10">
            <Zap size={10} className="text-yellow-400" /> خدمة سريعة
          </span>
          <span className="flex items-center gap-1 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-full border border-white/10">
            <Clock size={10} className="text-blue-400" /> سعر ممتاز
          </span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-white/40 text-xs leading-relaxed max-w-[220px]"
        >
          نقدم لكم أفضل الأسعار والخدمات داخل وخارج سوريا
        </motion.p>
      </div>

      {/* Right visual (vertical bars effect) */}
      <div className="absolute right-0 bottom-0 top-0 w-24 flex items-end justify-end pr-3 pb-3 gap-1">
        {[60, 80, 55, 90, 70].map((h, i) => (
          <motion.div
            key={i}
            className="w-3 rounded-t-md"
            style={{ height: `${h}%`, background: `linear-gradient(to top, #6C5CE7${90 - i * 10}, #a29bfe30)` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────
function SearchBar() {
  const [q, setQ] = useState('');

  const go = () => {
    if (q.trim()) window.location.href = `${BASE}/products?q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <div className="relative mb-5 flex items-center gap-2">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <Search size={15} className="text-gray-500" />
        </div>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder="ابحث عن منتج أو لعبة..."
          dir="rtl"
          className="w-full py-3 pr-9 pl-4 rounded-2xl text-sm text-white placeholder-gray-500 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }}
          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(108,92,231,0.5)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(108,92,231,0.1)'; }}
          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>
      <button
        onClick={go}
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 4px 15px rgba(108,92,231,0.4)' }}
      >
        <Search size={16} className="text-white" />
      </button>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { icon: '⚡', label: 'تسليم فوري', value: '24/7' },
    { icon: '🛡️', label: 'ضمان كامل', value: '100%' },
    { icon: '💎', label: 'منتج متاح', value: '500+' },
    { icon: '⭐', label: 'عميل راضٍ', value: '10K+' },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          className="flex flex-col items-center py-3 px-1 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-lg leading-none mb-1">{s.icon}</span>
          <span className="text-white font-black text-sm leading-none">{s.value}</span>
          <span className="text-gray-500 text-[9px] mt-0.5">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function NoticePanel() {
  return (
    <div className="mb-5 rounded-3xl p-4" dir="rtl" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(0,206,201,0.08))', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-black text-white text-sm">ملاحظة مهمة</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">تم ترتيب المنتجات ضمن أقسام واضحة لتصل للخدمة المطلوبة بسرعة.</p>
        </div>
        <a href={WA_GROUP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-black text-white transition-all hover:scale-[1.02] active:scale-95" style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
          الانضمام للمجتمع
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function Home() {
  const { lang } = useLanguage();

  const { data: apiCats } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/categories`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const displayCats: CatDisplay[] = apiCats && apiCats.length > 0
    ? apiCats.map(apiToCat)
    : CATEGORIES_FALLBACK as unknown as CatDisplay[];

  return (
    <PublicLayout>
      <WhatsAppPopup />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 pb-24">

        {/* Hero */}
        <HeroBanner />

        <NoticePanel />

        {/* Search */}
        <SearchBar />

        {/* Stats */}
        <StatsBar />

        {/* Categories header */}
        <div className="flex items-center justify-between mb-3" dir="rtl">
          <h2 className="text-white font-black text-base">تصفح الأقسام</h2>
          <Link href="/products" className="flex items-center gap-1 text-purple-400 text-xs font-bold hover:text-purple-300 transition-colors">
            عرض الكل <ChevronLeft size={13} />
          </Link>
        </div>

        {/* 3-column category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
          {displayCats.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/products"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 4px 20px #6C5CE750' }}>
            <Zap size={15} /> جميع المنتجات
          </Link>
          <a href={WA_SUPPORT} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', boxShadow: '0 4px 20px #25d36650' }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.858L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.064-1.408l-.363-.215-3.761.98 1.006-3.653-.237-.375A9.818 9.818 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818 5.419 0 9.818 4.4 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/>
            </svg>
            تواصل معنا
          </a>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {['🔒 دفع آمن', '⚡ تسليم فوري', '💬 دعم 24/7', '🔄 استرجاع مضمون', '💎 جودة عالية'].map((badge, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{
                background: 'rgba(108,92,231,0.1)',
                border: '1px solid rgba(108,92,231,0.25)',
                color: '#a29bfe',
              }}
            >
              {badge}
            </motion.span>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
