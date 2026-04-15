import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useGetProduct, useCreateOrder } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/Layout';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { ShoppingBag, Minus, Plus, Loader2, ChevronLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function getSavedId(productId: string): string {
  try { return (JSON.parse(localStorage.getItem('elite_saved_ids') ?? '{}'))[productId] ?? ''; } catch { return ''; }
}
function persistId(productId: string, uid: string) {
  try {
    const all = JSON.parse(localStorage.getItem('elite_saved_ids') ?? '{}');
    all[productId] = uid;
    localStorage.setItem('elite_saved_ids', JSON.stringify(all));
  } catch {}
}

export default function ProductDetail() {
  const [, params] = useRoute('/products/:id');
  const id = params?.id ?? '';
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id } });
  const { formatPrice, currency } = useCurrency();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [qty, setQty] = useState(1);
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [idSaved, setIdSaved] = useState(false);

  useEffect(() => {
    if (id) {
      const saved = getSavedId(id);
      if (saved) { setPlayerId(saved); setIdSaved(true); }
    }
  }, [id]);

  const handleSaveId = () => {
    if (!playerId) return;
    persistId(id, playerId);
    setIdSaved(true);
    toast({ title: '✅ تم حفظ المعرّف', description: 'سيُملأ تلقائياً في المرة القادمة' });
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await createOrder.mutateAsync({
        productId: id,
        qty,
        playerId: playerId || undefined,
        currency: currency as any,
      });
      toast({ title: 'Order placed!', description: `Your order for ${product?.name} has been placed successfully.` });
      navigate('/orders');
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? 'Failed to place order';
      toast({ title: 'Order failed', description: msg, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </PublicLayout>
    );
  }

  const hasPlayerId = product.requiredFields?.includes('playerId');
  const hasZoneId = product.requiredFields?.includes('zoneId');
  const hasEmail = product.requiredFields?.includes('email');

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft size={16} />
          Back to Products
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-2xl overflow-hidden h-64 md:h-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={40} className="text-primary" />
              </div>
              <p className="text-xs text-muted-foreground capitalize">{product.provider}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/15 text-primary text-xs font-semibold rounded-full mb-3 capitalize">
                {product.category?.replace('_', ' ')}
              </span>
              <h1 className="font-heading text-2xl font-bold">
                {lang === 'ar' && product.nameAr ? product.nameAr : product.name}
              </h1>
              {product.description && (
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{product.description}</p>
              )}
            </div>

            <div className="bg-background rounded-2xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Price per unit</p>
              <p className="text-3xl font-black text-primary">{formatPrice(product.priceUsd)}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">{t('quantity')}</span>
                <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {hasPlayerId && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">{t('playerId')} <span className="text-destructive">*</span></label>
                    <button
                      type="button"
                      onClick={handleSaveId}
                      disabled={!playerId}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${idSaved && getSavedId(id) === playerId ? 'text-success bg-success/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'} disabled:opacity-40`}
                    >
                      {idSaved && getSavedId(id) === playerId ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                      {idSaved && getSavedId(id) === playerId ? (lang === 'ar' ? 'محفوظ' : 'Saved') : (lang === 'ar' ? 'حفظ المعرّف' : 'Save ID')}
                    </button>
                  </div>
                  <input type="text" value={playerId} onChange={e => { setPlayerId(e.target.value); setIdSaved(false); }} placeholder={lang === 'ar' ? 'أدخل معرّف اللاعب' : 'Enter your Player ID'} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                  {idSaved && getSavedId(id) === playerId && (
                    <p className="text-xs text-success mt-1.5">✓ {lang === 'ar' ? 'معرّفك محفوظ وسيُملأ تلقائياً في المرة القادمة' : 'Your ID is saved for next time'}</p>
                  )}
                </div>
              )}

              {hasZoneId && (
                <div>
                  <label className="block text-sm font-medium mb-2">Zone ID <span className="text-destructive">*</span></label>
                  <input type="text" value={zoneId} onChange={e => setZoneId(e.target.value)} placeholder="Enter your Zone ID" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              )}

              {hasEmail && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t('email')} <span className="text-destructive">*</span></label>
                  <input type="email" value={playerId} onChange={e => setPlayerId(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-black text-primary">{formatPrice(product.priceUsd * qty)}</p>
              </div>
              <button onClick={handleBuy} disabled={createOrder.isPending || (hasPlayerId && !playerId)} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {createOrder.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
                {t('buyNow')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
