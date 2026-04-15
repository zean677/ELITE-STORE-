import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetFeaturedProducts, useGetCategories } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/Layout';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/i18n';
import { ShoppingBag, Zap, Shield, Clock, ChevronRight } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } }
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

function ProductCard({ product }: { product: any }) {
  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();

  return (
    <motion.div variants={fadeUp} whileHover={{ scale: 1.02, y: -4 }} className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="h-36 bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <ShoppingBag size={28} className="text-primary" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-tight truncate">
          {lang === 'ar' && product.nameAr ? product.nameAr : product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{product.category?.replace('_', ' ')}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-primary font-bold text-sm">{formatPrice(product.priceUsd)}</span>
          <Link href={`/products/${product.id}`} className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 relative z-10">
            Buy
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCard({ category }: { category: any }) {
  const { lang } = useLanguage();
  const iconMap: Record<string, string> = {
    mobile_games: '📱', pc_games: '🖥️', gift_cards: '🎁', services: '⚡', general: '🛍️'
  };

  return (
    <motion.div variants={fadeUp} whileHover={{ scale: 1.04, y: -3 }}>
      <Link href={`/products?category=${category.id}`} className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all group">
        <div className="text-3xl mb-3">{iconMap[category.id] ?? '🛒'}</div>
        <h3 className="font-semibold text-sm">{lang === 'ar' && category.nameAr ? category.nameAr : category.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{category.productCount} products</p>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { data: featured } = useGetFeaturedProducts();
  const { data: categories } = useGetCategories();
  const { t } = useLanguage();

  const features = [
    { icon: Zap, title: 'Instant Delivery', titleAr: 'تسليم فوري', desc: 'Get your digital products instantly after payment', descAr: 'استلم منتجاتك الرقمية فوراً بعد الدفع' },
    { icon: Shield, title: 'Secure Payments', titleAr: 'دفع آمن', desc: 'All transactions are secured and verified', descAr: 'جميع المعاملات محمية ومؤمنة' },
    { icon: Clock, title: '24/7 Support', titleAr: 'دعم 24/7', desc: 'Our team is always available to help you', descAr: 'فريقنا متاح دائماً لمساعدتك' },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 bg-primary/15 border border-primary/30 text-primary text-xs font-semibold rounded-full mb-6 tracking-wider">
              #1 DIGITAL STORE IN MENA
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl font-black leading-tight bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-transparent mb-6">
              Your Gateway to
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Digital Power
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Game top-ups, gift cards, and digital services — delivered instantly. The fastest and most trusted digital marketplace in Syria and MENA.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5">
                <ShoppingBag size={18} />
                Browse Products
                <ChevronRight size={16} />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-background transition-all hover:-translate-y-0.5">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-heading text-2xl font-bold mb-8">{t('products')}</motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            <div className="flex items-center justify-between mb-8">
              <motion.h2 variants={fadeUp} className="font-heading text-2xl font-bold">Featured Products</motion.h2>
              <motion.div variants={fadeUp}>
                <Link href="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={fadeUp} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
