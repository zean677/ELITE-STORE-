import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProducts, useGetCategories } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/Layout';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/i18n';
import { Search, ChevronRight, Zap, ArrowRight, Package } from 'lucide-react';

const CATEGORY_STYLES: Record<string, { gradient: string; glow: string; badge: string }> = {
  mobile_games: {
    gradient: 'from-violet-600/30 via-purple-500/20 to-fuchsia-500/10',
    glow: 'shadow-violet-500/20',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  pc_games: {
    gradient: 'from-blue-600/30 via-cyan-500/20 to-sky-500/10',
    glow: 'shadow-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  gift_cards: {
    gradient: 'from-amber-500/30 via-orange-400/20 to-yellow-400/10',
    glow: 'shadow-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  services: {
    gradient: 'from-emerald-500/30 via-teal-400/20 to-green-400/10',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  general: {
    gradient: 'from-rose-500/30 via-pink-400/20 to-red-400/10',
    glow: 'shadow-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  mobile_games: '🎮',
  pc_games: '🖥️',
  gift_cards: '🎁',
  services: '⚡',
  general: '🛒',
};

type GameInfo = {
  nameEn: string;
  nameAr: string;
  grad: string;
  dot: string;
  icon: string;
};

const KNOWN_GAMES: { keywords: string[]; info: GameInfo }[] = [
  {
    keywords: ['pubg', 'ببجي', 'battlegrounds'],
    info: { nameEn: 'PUBG Mobile', nameAr: 'ببجي موبايل', grad: 'from-yellow-600/50 to-orange-700/30', dot: '#f59e0b', icon: '🟡' },
  },
  {
    keywords: ['free fire', 'فري فاير', 'freefire'],
    info: { nameEn: 'Free Fire', nameAr: 'فري فاير', grad: 'from-orange-500/50 to-red-700/30', dot: '#f97316', icon: '🔥' },
  },
  {
    keywords: ['clash of clan', 'كلاش اوف كلان', 'clash royale', 'كلاش رويال'],
    info: { nameEn: 'Clash', nameAr: 'كلاش', grad: 'from-blue-500/50 to-indigo-700/30', dot: '#3b82f6', icon: '⚔️' },
  },
  {
    keywords: ['mobile legend', 'موبايل ليجند', 'mlbb'],
    info: { nameEn: 'Mobile Legends', nameAr: 'موبايل ليجند', grad: 'from-red-600/50 to-rose-800/30', dot: '#dc2626', icon: '🏆' },
  },
  {
    keywords: ['valorant', 'فالورانت'],
    info: { nameEn: 'Valorant', nameAr: 'فالورانت', grad: 'from-red-500/50 to-pink-700/30', dot: '#ef4444', icon: '🎯' },
  },
  {
    keywords: ['league of legend', 'لول', 'lol', 'wild rift'],
    info: { nameEn: 'League of Legends', nameAr: 'ليج أوف ليجندز', grad: 'from-blue-600/50 to-cyan-700/30', dot: '#2563eb', icon: '⚡' },
  },
  {
    keywords: ['fortnite', 'فورتنايت'],
    info: { nameEn: 'Fortnite', nameAr: 'فورتنايت', grad: 'from-cyan-500/50 to-blue-800/30', dot: '#06b6d4', icon: '🌀' },
  },
  {
    keywords: ['minecraft', 'ماين كرافت'],
    info: { nameEn: 'Minecraft', nameAr: 'ماينكرافت', grad: 'from-green-600/50 to-lime-800/30', dot: '#16a34a', icon: '🟩' },
  },
  {
    keywords: ['roblox', 'روبلوكس'],
    info: { nameEn: 'Roblox', nameAr: 'روبلوكس', grad: 'from-red-400/50 to-red-700/30', dot: '#f87171', icon: '🎲' },
  },
  {
    keywords: ['call of duty', 'cod', 'كول اوف ديوتي'],
    info: { nameEn: 'Call of Duty', nameAr: 'كول أوف ديوتي', grad: 'from-zinc-500/50 to-neutral-800/30', dot: '#71717a', icon: '🎖️' },
  },
  {
    keywords: ['steam', 'ستيم'],
    info: { nameEn: 'Steam', nameAr: 'ستيم', grad: 'from-slate-500/50 to-blue-900/30', dot: '#64748b', icon: '🎮' },
  },
  {
    keywords: ['google play', 'جوجل بلاي'],
    info: { nameEn: 'Google Play', nameAr: 'جوجل بلاي', grad: 'from-green-500/50 to-emerald-700/30', dot: '#22c55e', icon: '▶️' },
  },
  {
    keywords: ['itunes', 'apple', 'app store', 'ابل'],
    info: { nameEn: 'Apple / iTunes', nameAr: 'أبل / آيتيونز', grad: 'from-gray-400/50 to-slate-700/30', dot: '#9ca3af', icon: '🍎' },
  },
  {
    keywords: ['amazon', 'امازون'],
    info: { nameEn: 'Amazon', nameAr: 'أمازون', grad: 'from-orange-400/50 to-yellow-700/30', dot: '#fb923c', icon: '📦' },
  },
  {
    keywords: ['netflix', 'نتفليكس'],
    info: { nameEn: 'Netflix', nameAr: 'نتفليكس', grad: 'from-red-600/50 to-red-900/30', dot: '#dc2626', icon: '🎬' },
  },
  {
    keywords: ['playstation', 'psn', 'بلايستيشن'],
    info: { nameEn: 'PlayStation', nameAr: 'بلايستيشن', grad: 'from-blue-700/50 to-indigo-900/30', dot: '#1d4ed8', icon: '🎮' },
  },
  {
    keywords: ['xbox', 'اكس بوكس'],
    info: { nameEn: 'Xbox', nameAr: 'إكس بوكس', grad: 'from-green-600/50 to-green-900/30', dot: '#15803d', icon: '🎯' },
  },
  {
    keywords: ['honor of king', 'honor of kings'],
    info: { nameEn: 'Honor of Kings', nameAr: 'أونر أوف كينجز', grad: 'from-purple-600/50 to-violet-900/30', dot: '#9333ea', icon: '👑' },
  },
  {
    keywords: ['brawl star', 'براول ستارز'],
    info: { nameEn: 'Brawl Stars', nameAr: 'براول ستارز', grad: 'from-yellow-500/50 to-amber-800/30', dot: '#eab308', icon: '💥' },
  },
  {
    keywords: ['hay day', 'هاي داي'],
    info: { nameEn: 'Hay Day', nameAr: 'هاي داي', grad: 'from-lime-500/50 to-green-800/30', dot: '#84cc16', icon: '🌻' },
  },
  {
    keywords: ['telegram', 'تيليجرام', 'تلغرام', 'تيليغرام', 'whatsapp', 'واتساب', 'facebook', 'فيسبوك', 'instagram', 'انستغرام', 'tiktok', 'تيك توك', 'social'],
    info: { nameEn: 'Social Media', nameAr: 'السوشيال ميديا', grad: 'from-sky-500/50 to-blue-800/30', dot: '#0ea5e9', icon: '📱' },
  },
  {
    keywords: ['netflix', 'spotify', 'youtube premium', 'شاهد', 'osn', 'subscription', 'premium', 'اشتراك', 'اشتراكات'],
    info: { nameEn: 'Subscriptions', nameAr: 'الاشتراكات', grad: 'from-fuchsia-500/50 to-purple-900/30', dot: '#d946ef', icon: '💎' },
  },
  {
    keywords: ['chatgpt', 'openai', 'midjourney', 'gemini', 'claude', 'ذكاء', 'ai', 'artificial'],
    info: { nameEn: 'AI Tools', nameAr: 'الذكاء الاصطناعي', grad: 'from-violet-500/50 to-indigo-900/30', dot: '#8b5cf6', icon: '🤖' },
  },
  {
    keywords: ['canva', 'adobe', 'photoshop', 'figma', 'capcut', 'design', 'تصميم'],
    info: { nameEn: 'Design Tools', nameAr: 'برامج التصميم', grad: 'from-pink-500/50 to-rose-900/30', dot: '#ec4899', icon: '🎨' },
  },
  {
    keywords: ['syriatel', 'سيريتل', 'mtn', 'رصيد', 'اتصالات', 'telecom', 'وحدات'],
    info: { nameEn: 'Telecom', nameAr: 'الرصيد والاتصالات', grad: 'from-red-500/50 to-orange-900/30', dot: '#ef4444', icon: '📶' },
  },
  {
    keywords: ['usdt', 'tether', 'binance', 'payeer', 'perfect money', 'crypto', 'عملة', 'عملات'],
    info: { nameEn: 'Crypto', nameAr: 'العملات الرقمية', grad: 'from-yellow-500/50 to-amber-900/30', dot: '#eab308', icon: '₮' },
  },
  {
    keywords: ['number', 'numbers', 'رقم', 'ارقام', 'أرقام', 'sms', 'activation', 'تفعيل'],
    info: { nameEn: 'Numbers', nameAr: 'الأرقام', grad: 'from-emerald-500/50 to-green-900/30', dot: '#10b981', icon: '#' },
  },
  {
    keywords: ['account', 'accounts', 'حساب', 'حسابات', 'جاهز', 'جامعة'],
    info: { nameEn: 'Ready Accounts', nameAr: 'الحسابات الجاهزة', grad: 'from-orange-500/50 to-amber-900/30', dot: '#f97316', icon: '👥' },
  },
];

const FALLBACK_GROUPS: { category: string; info: GameInfo & { key: string } }[] = [
  { category: 'mobile_games', info: { nameEn: 'Mobile Games', nameAr: 'ألعاب الموبايل', grad: 'from-violet-600/50 to-purple-900/30', dot: '#7c3aed', icon: '🎮', key: 'mobile_games' } },
  { category: 'pc_games', info: { nameEn: 'PC Games', nameAr: 'ألعاب الكمبيوتر', grad: 'from-blue-600/50 to-cyan-900/30', dot: '#2563eb', icon: '🖥️', key: 'pc_games' } },
  { category: 'services', info: { nameEn: 'Social Media', nameAr: 'السوشيال ميديا', grad: 'from-sky-500/50 to-blue-800/30', dot: '#0ea5e9', icon: '📱', key: 'Social Media' } },
  { category: 'services', info: { nameEn: 'Subscriptions', nameAr: 'الاشتراكات', grad: 'from-fuchsia-500/50 to-purple-900/30', dot: '#d946ef', icon: '💎', key: 'Subscriptions' } },
  { category: 'services', info: { nameEn: 'AI Tools', nameAr: 'الذكاء الاصطناعي', grad: 'from-violet-500/50 to-indigo-900/30', dot: '#8b5cf6', icon: '🤖', key: 'AI Tools' } },
  { category: 'services', info: { nameEn: 'Design Tools', nameAr: 'برامج التصميم', grad: 'from-pink-500/50 to-rose-900/30', dot: '#ec4899', icon: '🎨', key: 'Design Tools' } },
  { category: 'general', info: { nameEn: 'Telecom', nameAr: 'الرصيد والاتصالات', grad: 'from-red-500/50 to-orange-900/30', dot: '#ef4444', icon: '📶', key: 'Telecom' } },
  { category: 'gift_cards', info: { nameEn: 'Gift Cards', nameAr: 'البطاقات', grad: 'from-amber-500/50 to-orange-700/30', dot: '#d97706', icon: '🎁', key: 'gift_cards' } },
  { category: 'general', info: { nameEn: 'Crypto', nameAr: 'العملات الرقمية', grad: 'from-yellow-500/50 to-amber-900/30', dot: '#eab308', icon: '₮', key: 'Crypto' } },
  { category: 'general', info: { nameEn: 'Numbers', nameAr: 'الأرقام', grad: 'from-emerald-500/50 to-green-900/30', dot: '#10b981', icon: '#', key: 'Numbers' } },
  { category: 'general', info: { nameEn: 'Ready Accounts', nameAr: 'الحسابات الجاهزة', grad: 'from-orange-500/50 to-amber-900/30', dot: '#f97316', icon: '👥', key: 'Ready Accounts' } },
];

function getGameInfo(productName: string, category: string): GameInfo & { key: string } {
  const n = productName.toLowerCase();
  for (const game of KNOWN_GAMES) {
    if (game.keywords.some(k => n.includes(k))) {
      return { ...game.info, key: game.info.nameEn };
    }
  }
  if (category === 'mobile_games') return { nameEn: 'Mobile Games', nameAr: 'ألعاب الموبايل', grad: 'from-violet-600/50 to-purple-900/30', dot: '#7c3aed', icon: '🎮', key: 'mobile_games' };
  if (category === 'pc_games') return { nameEn: 'PC Games', nameAr: 'ألعاب الكمبيوتر', grad: 'from-blue-600/50 to-cyan-900/30', dot: '#2563eb', icon: '🖥️', key: 'pc_games' };
  if (category === 'gift_cards') return { nameEn: 'Gift Cards', nameAr: 'بطاقات هدايا', grad: 'from-amber-500/50 to-orange-700/30', dot: '#d97706', icon: '🎁', key: 'gift_cards' };
  if (category === 'services') return { nameEn: 'Services', nameAr: 'خدمات', grad: 'from-emerald-500/50 to-teal-700/30', dot: '#059669', icon: '⚡', key: 'services' };
  if (category === 'general') return { nameEn: 'General Services', nameAr: 'خدمات متنوعة', grad: 'from-rose-500/50 to-pink-800/30', dot: '#f43f5e', icon: '🛒', key: 'general' };
  return { nameEn: productName, nameAr: productName, grad: 'from-primary/30 to-secondary/10', dot: '#6c5ce7', icon: '🎮', key: productName };
}

function getProductStyle(name: string, category: string) {
  const info = getGameInfo(name, category);
  return { grad: info.grad, dot: info.dot };
}

// ─── Game Card ───────────────────────────────────────────────────────────────
function GameCard({ game, count, onClick, image }: {
  game: GameInfo;
  count: number;
  onClick: () => void;
  image?: string;
}) {
  const { lang } = useLanguage();
  const name = lang === 'ar' ? game.nameAr : game.nameEn;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-white/15 transition-all duration-300"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ boxShadow: `inset 0 0 40px ${game.dot}22` }} />

      {/* Top visual */}
      <div className={`relative h-32 bg-gradient-to-br ${game.grad} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_130%,rgba(255,255,255,0.07),transparent_60%)]" />
        {/* Decorative circles */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20"
          style={{ background: game.dot }} />
        <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full opacity-10"
          style={{ background: game.dot }} />
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-16 w-auto object-contain drop-shadow-2xl z-10"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
              const fallback = el.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="z-10 w-16 h-16 rounded-2xl items-center justify-center text-3xl"
          style={{ background: `${game.dot}22`, border: `1.5px solid ${game.dot}44`, display: image ? 'none' : 'flex' }}>
          {game.icon}
        </div>
        {/* Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
          style={{ background: `${game.dot}22`, border: `1px solid ${game.dot}44`, color: game.dot }}>
          <Package size={9} />
          {count > 0 ? `${count} ${lang === 'ar' ? 'باقة' : 'pkg'}` : (lang === 'ar' ? 'قسم' : 'section')}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-3 flex items-center justify-between">
        <span className="font-bold text-sm leading-tight">{name}</span>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
          style={{ background: `${game.dot}20`, color: game.dot }}>
          <ChevronRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();
  const style = getProductStyle(product.name, product.category ?? 'general');
  const name = lang === 'ar' && product.nameAr ? product.nameAr : product.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ boxShadow: `inset 0 0 30px ${style.dot}22` }} />

      <div className={`relative h-28 bg-gradient-to-br ${style.grad} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.06),transparent_60%)]" />
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            className="h-16 w-auto object-contain drop-shadow-2xl z-10"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
              const fallback = el.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="z-10 flex-col items-center gap-1"
          style={{ display: product.image ? 'none' : 'flex' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: `${style.dot}22`, border: `1px solid ${style.dot}44` }}>
            {CATEGORY_ICONS[product.category ?? 'general']}
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: `${style.dot}22`, border: `1px solid ${style.dot}44`, color: style.dot }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: style.dot }} />
          متاح
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{name}</h3>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xs text-muted-foreground block">
              {product.productType === 'amount' ? (lang === 'ar' ? 'ابتداءً من' : 'From') : (lang === 'ar' ? 'السعر' : 'Price')}
            </span>
            <span className="font-black text-sm" style={{ color: style.dot }}>
              {parseFloat(product.priceUsd ?? '0') === 0
                ? <span className="text-muted-foreground text-xs">{lang === 'ar' ? 'يُحدَّد عند الطلب' : 'Custom'}</span>
                : formatPrice(product.priceUsd)}
            </span>
          </div>
          <Link
            href={`/products/${product.id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${style.dot}, ${style.dot}cc)`, boxShadow: `0 4px 12px ${style.dot}44` }}
          >
            <Zap size={10} />
            {lang === 'ar' ? 'شحن' : 'Buy'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Category Tab ─────────────────────────────────────────────────────────────
function CategoryTab({ cat, active, onClick }: { cat: any; active: boolean; onClick: () => void }) {
  const { lang } = useLanguage();
  const style = CATEGORY_STYLES[cat.id] ?? CATEGORY_STYLES.general;
  const name = lang === 'ar' && cat.nameAr ? cat.nameAr : cat.name;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
        active
          ? 'border-white/20 text-white'
          : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-white/10'
      }`}
      style={active ? { background: `linear-gradient(135deg, ${style.badge?.replace('bg-', '').split('/')[0] || '#6c5ce7'}22, transparent)` } : {}}
    >
      <span className="text-base">{CATEGORY_ICONS[cat.id] ?? '🛒'}</span>
      <span>{name}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${style.badge}`}>
        {cat.productCount}
      </span>
      {active && <motion.div layoutId="activeCat" className="absolute inset-0 rounded-xl ring-1 ring-white/20" />}
    </motion.button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Products() {
  const searchStr = useSearch();
  const urlParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  const [search, setSearch] = useState(() => urlParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(() => urlParams.get('category') || '');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { lang } = useLanguage();

  // Sync URL params when they change (e.g. navigating from home page)
  useEffect(() => {
    const cat = urlParams.get('category') || '';
    const q = urlParams.get('q') || '';
    setActiveCategory(cat);
    setSearch(q);
    setSelectedGame(null);
    setPage(1);
  }, [searchStr]);

  const { data: categoriesData } = useGetCategories();

  // Fetch all products for game grouping (when no game selected)
  const { data: allData, isLoading: allLoading } = useGetProducts({
    category: activeCategory || undefined,
    page: 1,
    limit: 500,
  });

  // Fetch products for selected game (via search keyword)
  const { data: gameData, isLoading: gameLoading } = useGetProducts({
    search: selectedGame ? selectedGame : (search || undefined),
    category: activeCategory || undefined,
    page,
    limit: 24,
  });

  const isSearching = search.length > 0;
  const showingGames = !isSearching && selectedGame === null;

  // Group all products by game
  const games = useMemo(() => {
    const fallback = FALLBACK_GROUPS
      .filter(g => !activeCategory || g.category === activeCategory)
      .map(g => ({ info: g.info, count: 0, image: undefined }));
    if (!allData?.products || allData.products.length === 0) return fallback;
    const map = new Map<string, { info: GameInfo; count: number; image?: string }>();
    for (const p of allData.products) {
      const info = getGameInfo(p.name, p.category ?? 'general');
      const existing = map.get(info.key);
      if (existing) {
        existing.count++;
        if (!existing.image && p.image) existing.image = p.image;
      } else {
        map.set(info.key, { info, count: 1, image: p.image ?? undefined });
      }
    }
    const priority = ['Mobile Games', 'PC Games', 'Social Media', 'Subscriptions', 'AI Tools', 'Design Tools', 'Telecom', 'Gift Cards', 'Crypto', 'Numbers', 'Ready Accounts', 'Services', 'General Services'];
    const grouped = Array.from(map.values()).sort((a, b) => {
      const ai = priority.indexOf(a.info.nameEn);
      const bi = priority.indexOf(b.info.nameEn);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return b.count - a.count;
    });
    return grouped.length > 0 ? grouped : fallback;
  }, [allData?.products, activeCategory]);

  const products = gameData?.products ?? [];
  const total = gameData?.total ?? 0;

  const handleCategory = (id: string) => {
    setActiveCategory(id === activeCategory ? '' : id);
    setSelectedGame(null);
    setPage(1);
  };

  const handleGameSelect = (gameKey: string) => {
    const game = KNOWN_GAMES.find(g => g.info.nameEn === gameKey);
    if (game) {
      setSelectedGame(game.keywords[0]);
    } else {
      setSelectedGame(gameKey);
    }
    setPage(1);
  };

  const handleBack = () => {
    setSelectedGame(null);
    setPage(1);
  };

  const selectedGameInfo = useMemo(() => {
    if (!selectedGame) return null;
    const found = KNOWN_GAMES.find(g => g.keywords.includes(selectedGame) || g.info.nameEn === selectedGame);
    if (found?.info) return found.info;
    const grouped = games.find(g => g.info.key === selectedGame || g.info.nameEn === selectedGame);
    return grouped?.info ?? getGameInfo(selectedGame, activeCategory || 'general');
  }, [selectedGame, games, activeCategory]);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb / Back */}
        <AnimatePresence>
          {selectedGame && selectedGameInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-5 text-sm text-muted-foreground"
            >
              <button onClick={handleBack} className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium">
                <ArrowRight size={14} className={lang === 'ar' ? '' : 'rotate-180'} />
                {lang === 'ar' ? 'الألعاب' : 'Games'}
              </button>
              <ChevronRight size={13} className={lang === 'ar' ? 'rotate-180' : ''} />
              <span className="text-foreground font-semibold">
                {lang === 'ar' ? selectedGameInfo.nameAr : selectedGameInfo.nameEn}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-6 rounded-3xl p-5 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.16), rgba(0,206,201,0.08), rgba(17,24,39,0.72))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative">
          <h1 className="font-heading text-3xl font-black mb-1">
            {selectedGame && selectedGameInfo
              ? (lang === 'ar' ? selectedGameInfo.nameAr : selectedGameInfo.nameEn)
              : (lang === 'ar' ? 'المتجر' : 'Store')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {showingGames
              ? (lang === 'ar' ? `${games.length} قسم مرتب للمنتجات` : `${games.length} organized product groups`)
              : (lang === 'ar' ? `${total} منتج متاح` : `${total} products available`)}
          </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={lang === 'ar' ? 'ابحث عن منتج أو لعبة...' : 'Search games or products...'}
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedGame(null); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        {categoriesData && categoriesData.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveCategory(''); setSelectedGame(null); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === ''
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              🌟 {lang === 'ar' ? 'الكل' : 'All'}
            </motion.button>
            {categoriesData.map(cat => (
              <CategoryTab
                key={cat.id}
                cat={cat}
                active={activeCategory === cat.id}
                onClick={() => handleCategory(cat.id)}
              />
            ))}
          </div>
        )}

        {/* ── GAMES LOBBY ─────────────────────────────────────────────────── */}
        {showingGames ? (
          allLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-32 bg-muted" />
                  <div className="p-3 flex items-center justify-between">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="w-7 h-7 bg-muted rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-muted-foreground text-lg font-medium">
                {lang === 'ar' ? 'لا توجد ألعاب متاحة' : 'No games available'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {games.map(({ info, count, image }) => (
                  <GameCard
                    key={info.key}
                    game={info}
                    count={count}
                    image={image}
                    onClick={() => handleGameSelect(info.key)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )

        ) : (
          // ── PRODUCTS VIEW ────────────────────────────────────────────────
          gameLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-28 bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-3.5 bg-muted rounded w-4/5" />
                    <div className="h-3 bg-muted rounded w-2/5" />
                    <div className="flex justify-between mt-3">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-7 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-muted-foreground text-lg font-medium">
                {lang === 'ar' ? 'لا توجد منتجات' : 'No products found'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-3 text-primary text-sm hover:underline">
                  {lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                </button>
              )}
              {selectedGame && (
                <button onClick={handleBack} className="mt-3 block mx-auto text-primary text-sm hover:underline">
                  {lang === 'ar' ? 'رجوع للألعاب' : 'Back to games'}
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          )
        )}

        {/* Pagination (only in products view) */}
        {!showingGames && total > 24 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-medium disabled:opacity-40 hover:border-primary/40 transition-colors flex items-center gap-1"
            >
              <ChevronRight size={14} className="rotate-180" />
              {lang === 'ar' ? 'السابق' : 'Prev'}
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground bg-card border border-border rounded-xl">
              {page} / {Math.ceil(total / 24)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 24 >= total}
              className="px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-medium disabled:opacity-40 hover:border-primary/40 transition-colors flex items-center gap-1"
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
