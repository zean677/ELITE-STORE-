import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetFeaturedProducts, useGetCategories } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/Layout';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/i18n';
import { Zap, Shield, Clock, ChevronRight, ShoppingBag } from 'lucide-react';

const CATEGORY_STYLES: Record<string, { gradient: string; border: string; text: string; bg: string }> = {
  mobile_games: { gradient: 'from-violet-600 to-purple-700', border: 'border-violet-500/30', text: 'text-violet-300', bg: 'bg-violet-500/10' },
  pc_games:     { gradient: 'from-blue-600 to-cyan-700',    border: 'border-blue-500/30',   text: 'text-blue-300',   bg: 'bg-blue-500/10' },
  gift_cards:   { gradient: 'from-amber-500 to-orange-600', border: 'border-amber-500/30',  text: 'text-amber-300',  bg: 'bg-amber-500/10' },
  services:     { gradient: 'from-emerald-500 to-teal-600', border: 'border-emerald-500/30',text: 'text-emerald-300',bg: 'bg-emerald-500/10' },
  general:      { gradient: 'from-rose-500 to-pink-600',    border: 'border-rose-500/30',   text: 'text-rose-300',   bg: 'bg-rose-500/10' },
};

const CATEGORY_ICONS: Record<string, string> = {
  mobile_games: '🎮', pc_games: '🖥️', gift_cards: '🎁', services: '⚡', general: '🛒',
};

function getProductDot(name: string, category: string): string {
  const n = name.toLowerCase();
  if (n.includes('pubg')) return '#f59e0b';
  if (n.includes('free fire')) return '#f97316';
  if (n.includes('steam')) return '#64748b';
  if (n.includes('google')) return '#22c55e';
  if (n.includes('valorant')) return '#ef4444';
  if (n.includes('fortnite')) return '#06b6d4';
  if (n.includes('roblox')) return '#f87171';
  if (category === 'mobile_games') return '#7c3aed';
  if (category === 'gift_cards') return '#d97706';
  if (category === 'pc_games') return '#2563eb';
  if (category === 'services') return '#059669';
  return '#6c5ce7';
}

function getProductGrad(name: string, category: string): string {
  const n = name.toLowerCase();
  if (n.includes('pubg')) return 'from-yellow-600/30 to-orange-600/20';
  if (n.includes('free fire')) return 'from-orange-500/30 to-red-600/20';
  if (n.includes('steam')) return 'from-slate-500/30 to-blue-800/20';
  if (n.includes('google')) return 'from-green-500/30 to-emerald-600/20';
  if (n.includes('valorant')) return 'from-red-500/30 to-pink-600/20';
  if (n.includes('fortnite')) return 'from-cyan-500/30 to-blue-700/20';
  if (n.includes('roblox')) return 'from-red-400/30 to-red-700/20';
  if (category === 'mobile_games') return 'from-violet-600/30 to-purple-800/20';
  if (category === 'gift_cards') return 'from-amber-500/30 to-orange-700/20';
  if (category === 'pc_games') return 'from-blue-600/30 to-cyan-800/20';
  if (category === 'services') return 'from-emerald-500/30 to-teal-700/20';
  return 'from-primary/20 to-secondary/10';
}

function ProductCard({ product }: { product: any }) {
  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();
  const dot = getProductDot(product.name, product.category ?? 'general');
  const grad = getProductGrad(product.name, product.category ?? 'general');
  const name = lang === 'ar' && product.nameAr ? product.nameAr : product.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      <div className={`relative h-28 bg-gradient-to-br ${grad} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.06),transparent_60%)]" />
        {product.image ? (
          <img src={product.image} alt={name} className="h-16 w-auto object-contain drop-shadow-2xl z-10" />
        ) : (
          <div className="z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: `${dot}22`, border: `1px solid ${dot}44` }}>
            {CATEGORY_ICONS[product.category ?? 'general']}
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: `${dot}22`, border: `1px solid ${dot}44`, color: dot }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: dot }} />
          متاح
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{name}</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-black text-sm" style={{ color: dot }}>{formatPrice(product.priceUsd)}</span>
          <Link
            href={`/products/${product.id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${dot}, ${dot}cc)`, boxShadow: `0 4px 12px ${dot}44` }}
          >
            <Zap size={10} /> شحن
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCard({ category }: { category: any }) {
  const { lang } = useLanguage();
  const s = CATEGORY_STYLES[category.id] ?? CATEGORY_STYLES.general;
  const name = lang === 'ar' && category.nameAr ? category.nameAr : category.name;

  return (
    <motion.div whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
      <Link href={`/products?category=${category.id}`} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${s.border} ${s.bg} hover:opacity-90 transition-all group text-center block`}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl shadow-lg`}>
          {CATEGORY_ICONS[category.id] ?? '🛒'}
        </div>
        <span className={`text-xs font-bold ${s.text}`}>{name}</span>
        <span className="text-[10px] text-muted-foreground">{category.productCount} منتج</span>
      </Link>
    </motion.div>
  );
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function Home() {
  const { data: featured } = useGetFeaturedProducts();
  const { data: categories } = useGetCategories();
  const { lang } = useLanguage();

  const features = [
    { icon: Zap,    titleAr: 'تسليم فوري',   title: 'Instant Delivery',  descAr: 'استلم منتجاتك فوراً بعد الدفع',         desc: 'Get your products instantly after payment' },
    { icon: Shield, titleAr: 'دفع آمن',       title: 'Secure Payments',   descAr: 'جميع المعاملات محمية ومؤمنة بالكامل',   desc: 'All transactions are fully secured' },
    { icon: Clock,  titleAr: 'دعم 24/7',      title: '24/7 Support',      descAr: 'فريقنا متاح دائماً لمساعدتك في أي وقت', desc: 'Our team is always here to help you' },
  ];

  return (
    <PublicLayout>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent/3 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 bg-primary/15 border border-primary/30 text-primary text-xs font-bold rounded-full mb-6 tracking-widest uppercase">
              ⚡ Elite Store — الشحن الأسرع
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl font-black leading-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent mb-6">
              {lang === 'ar' ? (
                <>بوابتك لعالم<br /><span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">الألعاب الرقمية</span></>
              ) : (
                <>Your Gateway to<br /><span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Digital Power</span></>
              )}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              {lang === 'ar'
                ? 'شحن ألعاب، بطاقات هدية، وخدمات رقمية — تسليم فوري وآمن 24/7 في سوريا والوطن العربي.'
                : 'Game top-ups, gift cards, and digital services — delivered instantly and securely 24/7.'}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/products" className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 hover:-translate-y-0.5">
                <ShoppingBag size={18} />
                {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                <ChevronRight size={16} />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 px-7 py-3.5 bg-card border border-border font-bold rounded-xl hover:bg-background transition-all hover:-translate-y-0.5">
                {lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold">{lang === 'ar' ? '🗂️ الفئات' : '🗂️ Categories'}</h2>
            <Link href="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              {lang === 'ar' ? 'الكل' : 'View All'} <ChevronRight size={14} />
            </Link>
          </div>
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {categories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
          </motion.div>
        </section>
      )}

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold">{lang === 'ar' ? '🔥 الأكثر طلباً' : '🔥 Featured Products'}</h2>
            <Link href="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              {lang === 'ar' ? 'عرض الكل' : 'View All'} <ChevronRight size={14} />
            </Link>
          </div>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            {featured.map(product => <ProductCard key={product.id} product={product} />)}
          </motion.div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-10">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-8">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-base mb-2">{lang === 'ar' ? f.titleAr : f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{lang === 'ar' ? f.descAr : f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
