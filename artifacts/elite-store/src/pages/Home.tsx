import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicLayout } from '@/components/Layout';
import { useLanguage } from '@/i18n';
import { X, ChevronLeft, Search, Zap, Shield, Clock } from 'lucide-react';

const WA_GROUP = 'https://chat.whatsapp.com/DmATlEZYLFgHbWuo4HOVay?mode=gi_t';

// ─── Category definitions ─────────────────────────────────────
const SECTIONS = [
  {
    id: 'mobile_games',
    nameAr: 'الألعاب',
    nameEn: 'Games',
    href: '/products?category=mobile_games',
    theme: 'from-[#1a0a2e] to-[#2d1b4e]',
    border: 'border-[#7c3aed]/40',
    glow: '#7c3aed',
    logos: [
      { label: 'PUBG', bg: '#f59e0b', emoji: '🟡', img: '' },
      { label: 'FF',   bg: '#f97316', emoji: '🔥', img: '' },
      { label: 'ML',   bg: '#dc2626', emoji: '🏆', img: '' },
      { label: 'CoC',  bg: '#3b82f6', emoji: '⚔️', img: '' },
    ],
  },
  {
    id: 'pc_games',
    nameAr: 'ألعاب الكمبيوتر',
    nameEn: 'PC Games',
    href: '/products?category=pc_games',
    theme: 'from-[#0a1a2e] to-[#0f2a4e]',
    border: 'border-[#2563eb]/40',
    glow: '#2563eb',
    logos: [
      { label: 'Steam',    bg: '#1b2838', emoji: '🎮', img: 'https://www.google.com/s2/favicons?domain=store.steampowered.com&sz=64' },
      { label: 'Valorant', bg: '#ef4444', emoji: '🎯', img: 'https://www.google.com/s2/favicons?domain=playvalorant.com&sz=64' },
      { label: 'LoL',      bg: '#c89b3c', emoji: '⚡', img: 'https://www.google.com/s2/favicons?domain=leagueoflegends.com&sz=64' },
      { label: 'Xbox',     bg: '#107c10', emoji: '🕹️', img: 'https://www.google.com/s2/favicons?domain=xbox.com&sz=64' },
    ],
  },
  {
    id: 'services',
    nameAr: 'التطبيقات',
    nameEn: 'Applications',
    href: '/products?category=services',
    theme: 'from-[#0a2e1a] to-[#0f4e2a]',
    border: 'border-[#059669]/40',
    glow: '#059669',
    logos: [
      { label: 'Netflix', bg: '#e50914', img: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64' },
      { label: 'Spotify', bg: '#1db954', img: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64' },
      { label: 'YouTube', bg: '#ff0000', img: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
      { label: 'ChatGPT', bg: '#10a37f', img: 'https://www.google.com/s2/favicons?domain=chat.openai.com&sz=64' },
    ],
  },
  {
    id: 'gift_cards',
    nameAr: 'بطاقات الهدية',
    nameEn: 'Gift Cards',
    href: '/products?category=gift_cards',
    theme: 'from-[#2e1a00] to-[#4e2e00]',
    border: 'border-[#d97706]/40',
    glow: '#d97706',
    logos: [
      { label: 'Google',  bg: '#4285f4', img: 'https://www.google.com/s2/favicons?domain=play.google.com&sz=64' },
      { label: 'iTunes',  bg: '#fc3158', img: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64' },
      { label: 'Amazon',  bg: '#ff9900', img: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=64' },
      { label: 'PSN',     bg: '#00439c', img: 'https://www.google.com/s2/favicons?domain=playstation.com&sz=64' },
    ],
  },
  {
    id: 'social',
    nameAr: 'السوشيال',
    nameEn: 'Social',
    href: '/products?category=general&q=social',
    theme: 'from-[#001a2e] to-[#002e4e]',
    border: 'border-[#0ea5e9]/40',
    glow: '#0ea5e9',
    logos: [
      { label: 'TG',   bg: '#2aabee', img: 'https://www.google.com/s2/favicons?domain=telegram.org&sz=64' },
      { label: 'FB',   bg: '#1877f2', img: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64' },
      { label: 'TT',   bg: '#000000', img: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64' },
      { label: 'IG',   bg: '#e1306c', img: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' },
    ],
  },
  {
    id: 'currencies',
    nameAr: 'العملات الرقمية',
    nameEn: 'Crypto',
    href: '/products?category=general&q=crypto',
    theme: 'from-[#1a1200] to-[#2e2000]',
    border: 'border-[#f59e0b]/40',
    glow: '#f59e0b',
    logos: [
      { label: 'USDT',    bg: '#26a17b', img: 'https://www.google.com/s2/favicons?domain=tether.to&sz=64' },
      { label: 'BNB',     bg: '#f3ba2f', img: 'https://www.google.com/s2/favicons?domain=binance.com&sz=64' },
      { label: 'Payeer',  bg: '#1e88e5', img: 'https://www.google.com/s2/favicons?domain=payeer.com&sz=64' },
      { label: 'Perfect', bg: '#c62828', img: 'https://www.google.com/s2/favicons?domain=perfectmoney.com&sz=64' },
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
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Banner */}
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
                <p className="text-white font-black text-lg">انضم لمجتمع الواتساب الآن!</p>
                <p className="text-white/80 text-sm">أخبار الموقع وعروض مميزة</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 text-center" dir="rtl">
              <div className="flex items-center gap-2 justify-center mb-1">
                <span className="text-red-400 text-lg">🔴</span>
                <h3 className="font-black text-white text-lg">ملاحظة مهمة !!</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                يرجى الانضمام الى{' '}
                <a href={WA_GROUP} target="_blank" rel="noopener noreferrer" className="text-green-400 font-bold underline">
                  مجتمع الواتساب
                </a>
              </p>
              <p className="text-gray-400 text-sm mb-4">لمتابعة أخبار وتحديثات الموقع :</p>
              <a
                href={WA_GROUP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-white text-base mb-3 transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
              >
                ➡️ اضغط هنا للانضمام ⬅️
              </a>
              <button
                onClick={dismiss}
                className="w-full py-3 rounded-2xl font-bold text-gray-800 text-base transition-all hover:opacity-90"
                style={{ background: '#fbbf24' }}
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Section Card ─────────────────────────────────────────────
function SectionCard({ section }: { section: typeof SECTIONS[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <Link href={section.href}
        className={`relative flex flex-col items-center gap-0 rounded-2xl overflow-hidden border ${section.border} block`}
        style={{
          background: `linear-gradient(135deg, ${section.theme.replace('from-', '').split(' ')[0].replace('[', '').replace(']', '')}, #111827)`,
          boxShadow: `0 4px 24px ${section.glow}22`,
        }}
      >
        {/* Golden star badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="text-yellow-400 text-sm">⭐</span>
        </div>

        {/* Logo grid */}
        <div className="w-full p-3 pb-1">
          <div className="grid grid-cols-2 gap-1.5">
            {section.logos.map((logo, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: `${logo.bg}22`, border: `1px solid ${logo.bg}33` }}
              >
                {logo.img ? (
                  <img
                    src={logo.img}
                    alt={logo.label}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = 'none';
                      const span = document.createElement('span');
                      span.textContent = (logo as any).emoji || logo.label.slice(0, 2);
                      span.style.cssText = 'font-size:22px;';
                      t.parentElement!.appendChild(span);
                    }}
                  />
                ) : (
                  <span className="text-2xl select-none">{(logo as any).emoji || logo.label.slice(0, 2)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Category label strip */}
        <div
          className="w-full text-center py-2 px-3 mt-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${section.glow}22, transparent)`,
            borderTop: `1px solid ${section.glow}33`,
          }}
        >
          <span className="text-xs font-black text-white/90">{section.nameAr}</span>
          <span className="text-[10px] text-gray-500 mx-1">|</span>
          <span className="text-[10px] text-gray-400">{section.nameEn}</span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────
function HeroBanner() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-6"
      style={{
        height: 180,
        background: 'linear-gradient(135deg, #1a0533 0%, #2d0a5e 40%, #0f172a 100%)',
        border: '1px solid rgba(124,58,237,0.3)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #00cec9, transparent)' }} />

      {/* Game character silhouettes (CSS art) */}
      <div className="absolute right-4 bottom-0 flex items-end gap-1 opacity-30">
        {[40, 55, 50, 45].map((h, i) => (
          <div key={i} className="w-6 rounded-t-full"
            style={{ height: h, background: 'linear-gradient(to top, #7c3aed, #c4b5fd)' }} />
        ))}
      </div>

      {/* Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold text-white"
        style={{ background: 'rgba(124,58,237,0.6)', border: '1px solid rgba(196,181,253,0.4)' }}>
        ✨ شمس ستورا
      </div>

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-center pr-6" dir="rtl">
        <p className="text-white font-black text-2xl leading-tight mb-1">
          شحن جميع الألعاب فوراً
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-white/70">
            <Shield size={12} className="text-green-400" /> ضمان
          </span>
          <span className="flex items-center gap-1 text-xs text-white/70">
            <Zap size={12} className="text-yellow-400" /> خدمة سريعة
          </span>
          <span className="flex items-center gap-1 text-xs text-white/70">
            <Clock size={12} className="text-blue-400" /> سعر ممتاز
          </span>
        </div>
        <p className="text-white/50 text-xs mt-2 leading-relaxed max-w-[240px]">
          نقدم لكم أفضل الأسعار والخدمات داخل وخارج سوريا
        </p>
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────
function SearchBar() {
  const [q, setQ] = useState('');
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && q && (window.location.href = `/products?q=${encodeURIComponent(q)}`)}
        placeholder="بحث..."
        dir="rtl"
        className="w-full py-3 pr-10 pl-4 rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:ring-2 ring-purple-500/40"
        style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)' }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function Home() {
  const { lang } = useLanguage();

  return (
    <PublicLayout>
      <WhatsAppPopup />

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-20">
        {/* Hero */}
        <HeroBanner />

        {/* Search */}
        <SearchBar />

        {/* Section label */}
        <div className="flex items-center justify-between mb-4" dir="rtl">
          <h2 className="text-white font-black text-base">تصفح الأقسام</h2>
          <Link href="/products" className="flex items-center gap-1 text-purple-400 text-xs font-bold hover:underline">
            عرض الكل <ChevronLeft size={14} />
          </Link>
        </div>

        {/* 3×2 Category Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {SECTIONS.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* Quick links row */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/products"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 4px 20px #6C5CE744' }}>
            <Zap size={16} /> تصفح جميع المنتجات
          </Link>
          <a href={`https://wa.me/963992718483`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', boxShadow: '0 4px 20px #25d36644' }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            تواصل معنا
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
