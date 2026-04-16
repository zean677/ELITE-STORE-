import React, { useState, useEffect, useMemo } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useGetProduct, useCreateOrder } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/Layout';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, Bookmark, BookmarkCheck, CheckCircle, ChevronLeft, Clock, Image as ImageIcon, Loader2, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Sparkles, Zap } from 'lucide-react';
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

function normalizeField(field: string) {
  const f = field.toLowerCase();
  if (f.includes('email') || f.includes('mail')) return { key: 'email', labelAr: 'البريد / الحساب', labelEn: 'Email / Account', placeholderAr: 'أدخل البريد أو الحساب', placeholderEn: 'Enter account email', type: 'email' };
  if (f.includes('zone')) return { key: 'zoneId', labelAr: 'Zone ID', labelEn: 'Zone ID', placeholderAr: 'أدخل Zone ID', placeholderEn: 'Enter Zone ID', type: 'text' };
  if (f.includes('server')) return { key: 'server', labelAr: 'السيرفر', labelEn: 'Server', placeholderAr: 'أدخل السيرفر', placeholderEn: 'Enter server', type: 'text' };
  return { key: 'playerId', labelAr: 'معرّف اللاعب', labelEn: 'Player ID', placeholderAr: 'أدخل معرّف اللاعب', placeholderEn: 'Enter Player ID', type: 'text' };
}

export default function ProductDetail() {
  const [, params] = useRoute('/products/:id');
  const id = params?.id ?? '';
  const { data: productRaw, isLoading, isError, refetch } = useGetProduct(id, { query: { enabled: !!id, retry: 1 } });
  const product: any = productRaw;
  const { formatPrice, currency } = useCurrency();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [qty, setQty] = useState(1);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [idSaved, setIdSaved] = useState(false);

  const name = product ? (lang === 'ar' && product.nameAr ? product.nameAr : product.name) : 'Elite Store';
  const requiredFields = useMemo(() => {
    const fields = product?.requiredFields?.length ? product.requiredFields : ['playerId'];
    const seen = new Set<string>();
    return fields.map(normalizeField).filter(field => {
      if (seen.has(field.key)) return false;
      seen.add(field.key);
      return true;
    });
  }, [product?.requiredFields]);
  const minQty = product?.qtyMin ? Number(product.qtyMin) : 1;
  const maxQty = product?.qtyMax ? Number(product.qtyMax) : 999999;
  const images = useMemo(() => [product?.image].filter(Boolean), [product?.image]);
  const relatedProducts = product?.relatedProducts ?? [];

  useEffect(() => {
    if (id) {
      const saved = getSavedId(id);
      if (saved) {
        setFormValues(values => ({ ...values, playerId: saved }));
        setIdSaved(true);
      }
    }
  }, [id]);

  useEffect(() => {
    if (!product) return;
    document.title = `${name} | Elite Store`;
    const description = product.description || 'اشحن الألعاب والبطاقات والخدمات الرقمية بسرعة وأمان من Elite Store';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
    let og = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (!og) {
      og = document.createElement('meta');
      og.setAttribute('property', 'og:title');
      document.head.appendChild(og);
    }
    og.content = `${name} | Elite Store`;
  }, [product, name]);

  useEffect(() => {
    if (product && qty < minQty) setQty(minQty);
  }, [product, minQty, qty]);

  const updateField = (key: string, value: string) => {
    setFormValues(values => ({ ...values, [key]: value }));
    if (key === 'playerId') setIdSaved(false);
  };

  const handleSaveId = () => {
    const playerId = formValues.playerId?.trim();
    if (!playerId) return;
    persistId(id, playerId);
    setIdSaved(true);
    toast({ title: 'تم حفظ المعرّف', description: 'سيُملأ تلقائياً في المرة القادمة' });
  };

  const composePlayerId = () => {
    const main = formValues.playerId || formValues.email || '';
    const extras = Object.entries(formValues)
      .filter(([key, value]) => value.trim() && key !== 'playerId' && key !== 'email')
      .map(([key, value]) => `${key}:${value.trim()}`);
    return [main.trim(), ...extras].filter(Boolean).join(' | ');
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const missing = requiredFields.find(field => !formValues[field.key]?.trim());
    if (missing) {
      toast({ title: 'بيانات ناقصة', description: `يرجى إدخال ${lang === 'ar' ? missing.labelAr : missing.labelEn}`, variant: 'destructive' });
      return;
    }

    try {
      const order: any = await createOrder.mutateAsync({
        data: {
          productId: id,
          qty,
          playerId: composePlayerId() || undefined,
          currency: currency as any,
        },
      });
      toast({ title: 'تم إنشاء الطلب', description: 'تم خصم الرصيد وإرسال الطلب للمزود' });
      navigate(`/orders/${order.id}/success`);
    } catch (err: any) {
      const serverMsg = err?.data?.message ?? err?.message ?? '';
      const isInsufficientBalance = serverMsg.toLowerCase().includes('insufficient') || serverMsg.toLowerCase().includes('balance');
      const msg = isInsufficientBalance ? 'رصيدك غير كافٍ. يرجى شحن المحفظة أولاً.' : serverMsg || 'حدث خطأ أثناء تقديم الطلب';
      toast({ title: 'فشل الطلب', description: msg, variant: 'destructive' });
      navigate(`/orders/${id}/failed?reason=${encodeURIComponent(msg)}`);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
            <div className="h-96 rounded-3xl bg-card border border-border" />
            <div className="space-y-4">
              <div className="h-8 bg-card rounded-xl w-3/4" />
              <div className="h-20 bg-card rounded-2xl" />
              <div className="h-16 bg-card rounded-2xl" />
              <div className="h-44 bg-card rounded-2xl" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !product) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-destructive" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">تعذر تحميل المنتج</h1>
          <p className="text-muted-foreground text-sm mb-5">المنتج غير موجود أو توقف مؤقتاً.</p>
          <button onClick={() => refetch()} className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold">إعادة المحاولة</button>
        </div>
      </PublicLayout>
    );
  }

  const total = Number(product.priceUsd ?? 0) * qty;

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          {lang === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
        </button>

        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative min-h-[380px] rounded-3xl overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top,#6C5CE733,transparent_45%),linear-gradient(145deg,#111827,#0f172a)] flex items-center justify-center">
              {images.length > 0 ? (
                <img src={images[galleryIndex]} alt={name} loading="lazy" className="max-h-64 max-w-[80%] object-contain drop-shadow-2xl" />
              ) : (
                <div className="text-center">
                  <div className="w-28 h-28 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={46} className="text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm">{product.provider}</p>
                </div>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-success/15 text-success border border-success/25 rounded-full text-xs font-bold">
                <CheckCircle size={13} />
                {product.status === 'active' ? 'متوفر الآن' : 'متوقف'}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {(images.length ? images : [null]).map((img, index) => (
                <button key={index} onClick={() => setGalleryIndex(index)} className={`h-20 rounded-2xl border flex items-center justify-center bg-card ${galleryIndex === index ? 'border-primary' : 'border-border'}`}>
                  {img ? <img src={img} alt={name} loading="lazy" className="h-12 object-contain" /> : <ImageIcon size={22} className="text-muted-foreground" />}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="glass-card rounded-2xl p-4">
                <ShieldCheck className="text-success mb-2" size={20} />
                <p className="font-bold text-sm">حماية الرصيد</p>
                <p className="text-xs text-muted-foreground mt-1">استرجاع تلقائي عند فشل الطلب</p>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <Zap className="text-secondary mb-2" size={20} />
                <p className="font-bold text-sm">ربط مباشر</p>
                <p className="text-xs text-muted-foreground mt-1">إرسال فوري إلى مزود الخدمة</p>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <Clock className="text-warning mb-2" size={20} />
                <p className="font-bold text-sm">متابعة مباشرة</p>
                <p className="text-xs text-muted-foreground mt-1">تتبع حالة الطلب من حسابك</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-bold rounded-full border border-primary/20">{product.category?.replace('_', ' ')}</span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full border border-secondary/20">{product.provider}</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-black leading-tight">{name}</h1>
              {product.description && <p className="text-muted-foreground text-sm mt-3 leading-7">{product.description}</p>}
            </div>

            <div className="rounded-3xl p-5 border border-primary/20 bg-primary/10">
              <p className="text-sm text-muted-foreground mb-1">{product.productType === 'amount' ? 'السعر الابتدائي' : 'السعر'}</p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-4xl font-black text-primary">{formatPrice(product.priceUsd)}</p>
                <div className="text-xs text-muted-foreground text-left">
                  <p>Type: {product.productType ?? 'package'}</p>
                  {product.unitPriceUsd ? <p>Unit: ${Number(product.unitPriceUsd).toFixed(6)}</p> : null}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  متطلبات الطلب
                </h2>
                <span className="text-xs text-muted-foreground">مطلوبة قبل الشراء</span>
              </div>

              {requiredFields.map(field => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">{lang === 'ar' ? field.labelAr : field.labelEn} <span className="text-destructive">*</span></label>
                    {field.key === 'playerId' && (
                      <button type="button" onClick={handleSaveId} disabled={!formValues.playerId} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${idSaved && getSavedId(id) === formValues.playerId ? 'text-success bg-success/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'} disabled:opacity-40`}>
                        {idSaved && getSavedId(id) === formValues.playerId ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                        {idSaved && getSavedId(id) === formValues.playerId ? 'محفوظ' : 'حفظ'}
                      </button>
                    )}
                  </div>
                  <input type={field.type} value={formValues[field.key] ?? ''} onChange={e => updateField(field.key, e.target.value)} placeholder={lang === 'ar' ? field.placeholderAr : field.placeholderEn} className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              ))}

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium min-w-24">{t('quantity')}</span>
                <div className="flex items-center gap-3 bg-background border border-border rounded-2xl p-1">
                  <button onClick={() => setQty(q => Math.max(minQty, q - 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-card transition-colors"><Minus size={14} /></button>
                  <input value={qty} onChange={e => setQty(Math.max(minQty, Math.min(maxQty, Number(e.target.value) || minQty)))} className="w-14 text-center bg-transparent font-bold outline-none" />
                  <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-card transition-colors"><Plus size={14} /></button>
                </div>
              </div>

              {(product.qtyMin || product.qtyMax) && (
                <p className="text-xs text-muted-foreground">الكمية المسموحة: {minQty}{product.qtyMax ? ` - ${maxQty}` : '+'}</p>
              )}
            </div>

            <div className="sticky bottom-3 bg-background/85 backdrop-blur-xl border border-border rounded-3xl p-4 flex items-center justify-between gap-4 shadow-2xl">
              <div>
                <p className="text-xs text-muted-foreground">الإجمالي</p>
                <p className="text-2xl font-black text-primary">{formatPrice(total)}</p>
              </div>
              <button onClick={handleBuy} disabled={createOrder.isPending || product.status !== 'active'} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {createOrder.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
                {t('buyNow')}
              </button>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold mb-4">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((item: any) => (
                <Link key={item.id} href={`/products/${item.id}`} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors">
                  <div className="h-20 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    {item.image ? <img src={item.image} alt={item.name} loading="lazy" className="h-12 object-contain" /> : <PackageCheck className="text-primary" />}
                  </div>
                  <p className="text-sm font-bold line-clamp-2">{lang === 'ar' && item.nameAr ? item.nameAr : item.name}</p>
                  <p className="text-primary text-sm font-black mt-2">{formatPrice(item.priceUsd)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}