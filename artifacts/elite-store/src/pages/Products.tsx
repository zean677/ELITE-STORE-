import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetProducts, useGetCategories } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/Layout';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/i18n';
import { Search, ShoppingBag, Filter } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { formatPrice } = useCurrency();
  const { t, lang } = useLanguage();

  const { data: categoriesData } = useGetCategories();
  const { data, isLoading } = useGetProducts({ search: search || undefined, category: category || undefined, page, limit: 24 });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">{t('products')}</h1>
          <p className="text-muted-foreground text-sm">{total} products available</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder={t('search')}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">All Categories</option>
              {(categoriesData ?? []).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {lang === 'ar' && cat.nameAr ? cat.nameAr : cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <motion.div initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} custom={i} whileHover={{ scale: 1.02, y: -4 }} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all">
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
                    <Link href={`/products/${product.id}`} className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                      {t('buyNow')}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {total > 24 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40 hover:border-primary/40 transition-colors">
              Prev
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 24 >= total} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40 hover:border-primary/40 transition-colors">
              Next
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
