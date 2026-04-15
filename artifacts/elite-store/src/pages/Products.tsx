import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProducts, useGetCategories } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/Layout';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/i18n';
import { Search, ChevronRight, Zap } from 'lucide-react';

// Per-category styling
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

// Smart color per product based on name keywords
function getProductStyle(name: string, category: string) {
  const n = name.toLowerCase();
  if (n.includes('pubg') || n.includes('ببجي')) return { grad: 'from-yellow-600/40 to-orange-600/20', dot: '#f59e0b' };
  if (n.includes('free fire') || n.includes('فري فاير')) return { grad: 'from-orange-500/40 to-red-600/20', dot: '#f97316' };
  if (n.includes('clash') || n.includes('كلاش')) return { grad: 'from-blue-500/40 to-indigo-600/20', dot: '#3b82f6' };
  if (n.includes('steam')) return { grad: 'from-slate-500/40 to-blue-800/20', dot: '#64748b' };
  if (n.includes('google') || n.includes('play')) return { grad: 'from-green-500/40 to-emerald-600/20', dot: '#22c55e' };
  if (n.includes('itunes') || n.includes('apple')) return { grad: 'from-gray-400/40 to-slate-600/20', dot: '#9ca3af' };
  if (n.includes('mobile legend') || n.includes('ml')) return { grad: 'from-red-600/40 to-rose-800/20', dot: '#dc2626' };
  if (n.includes('valorant')) return { grad: 'from-red-500/40 to-pink-600/20', dot: '#ef4444' };
  if (n.includes('league') || n.includes('lol')) return { grad: 'from-blue-600/40 to-cyan-600/20', dot: '#2563eb' };
  if (n.includes('fortnite')) return { grad: 'from-cyan-500/40 to-blue-700/20', dot: '#06b6d4' };
  if (n.includes('minecraft')) return { grad: 'from-green-600/40 to-lime-700/20', dot: '#16a34a' };
  if (n.includes('roblox')) return { grad: 'from-red-400/40 to-red-700/20', dot: '#f87171' };
  if (n.includes('cod') || n.includes('call of duty')) return { grad: 'from-zinc-500/40 to-neutral-700/20', dot: '#71717a' };
  if (n.includes('uc') || n.includes('يو سي')) return { grad: 'from-yellow-500/40 to-amber-700/20', dot: '#eab308' };
  const styles = CATEGORY_STYLES[category];
  if (category === 'mobile_games') return { grad: 'from-violet-600/30 to-purple-800/20', dot: '#7c3aed' };
  if (category === 'gift_cards') return { grad: 'from-amber-500/30 to-orange-700/20', dot: '#d97706' };
  if (category === 'pc_games') return { grad: 'from-blue-600/30 to-cyan-800/20', dot: '#2563eb' };
  if (category === 'services') return { grad: 'from-emerald-500/30 to-teal-700/20', dot: '#059669' };
  return { grad: 'from-primary/20 to-secondary/10', dot: '#6c5ce7' };
}

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
      {/* Glow overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ boxShadow: `inset 0 0 30px ${style.dot}22` }} />

      {/* Card top */}
      <div className={`relative h-28 bg-gradient-to-br ${style.grad} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.06),transparent_60%)]" />
        {product.image ? (
          <img src={product.image} alt={name} className="h-16 w-auto object-contain drop-shadow-2xl z-10" />
        ) : (
          <div className="z-10 flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${style.dot}22`, border: `1px solid ${style.dot}44` }}>
              {CATEGORY_ICONS[product.category ?? 'general']}
            </div>
          </div>
        )}
        {/* Live badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: `${style.dot}22`, border: `1px solid ${style.dot}44`, color: style.dot }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: style.dot }} />
          متاح
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{name}</h3>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xs text-muted-foreground block">
              {product.productType === 'amount' ? 'ابتداءً من' : 'السعر'}
            </span>
            <span className="font-black text-sm" style={{ color: style.dot }}>
              {parseFloat(product.priceUsd ?? '0') === 0
                ? <span className="text-muted-foreground text-xs">يُحدَّد عند الطلب</span>
                : formatPrice(product.priceUsd)}
            </span>
          </div>
          <Link
            href={`/products/${product.id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${style.dot}, ${style.dot}cc)`, boxShadow: `0 4px 12px ${style.dot}44` }}
          >
            <Zap size={10} />
            شحن
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

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
      style={active ? { background: `linear-gradient(135deg, ${CATEGORY_STYLES[cat.id]?.glow?.replace('shadow-', '') || '#6c5ce7'}33, ${CATEGORY_STYLES[cat.id]?.glow?.replace('shadow-', '') || '#00cec9'}11)` } : {}}
    >
      <span className="text-base">{CATEGORY_ICONS[cat.id] ?? '🛒'}</span>
      <span>{name}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${style.badge}`}>
        {cat.productCount}
      </span>
      {active && (
        <motion.div layoutId="activeCat" className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
      )}
    </motion.button>
  );
}

export default function Products() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [page, setPage] = useState(1);
  const { t, lang } = useLanguage();

  const { data: categoriesData } = useGetCategories();
  const { data, isLoading } = useGetProducts({
    search: search || undefined,
    category: activeCategory || undefined,
    page,
    limit: 24,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const handleCategory = (id: string) => {
    setActiveCategory(id === activeCategory ? '' : id);
    setPage(1);
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-black mb-1">
            {lang === 'ar' ? 'المتجر' : 'Store'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {lang === 'ar' ? `${total} منتج متاح` : `${total} products available`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Search products...'}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        {categoriesData && categoriesData.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveCategory(''); setPage(1); }}
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

        {/* Products Grid */}
        {isLoading ? (
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
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            >
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {total > 24 && (
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
