import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCreatePayment } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/i18n';
import { Loader2, Upload, CheckCircle, X, Image as ImageIcon, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Currency = 'USD' | 'SYP' | 'EUR';

interface MethodInfo {
  nameAr: string;
  nameEn: string;
  emoji: string;
  color: string;
  type: 'auto' | 'manual';
  details: { label: string; value: string }[];
  comingSoon?: boolean;
}

const METHODS: Record<string, MethodInfo> = {
  syriatel_cash_auto: {
    nameAr: 'سيريتل كاش أوتو',
    nameEn: 'Syriatel Cash Auto',
    emoji: '📱',
    color: '#ef4444',
    type: 'auto',
    details: [{ label: 'الرقم', value: '14816688' }],
  },
  sham_cash_auto: {
    nameAr: 'شام كاش أوتو',
    nameEn: 'Sham Cash Auto',
    emoji: '💳',
    color: '#3b82f6',
    type: 'auto',
    details: [
      { label: 'اسم المحفظة', value: 'zean677' },
      { label: 'معرّف المحفظة', value: '5649dd63431812890980008b5b1c3d53' },
    ],
  },
  syriatel_cash_manual: {
    nameAr: 'سيريتل كاش يدوي',
    nameEn: 'Syriatel Cash Manual',
    emoji: '📞',
    color: '#ef4444',
    type: 'manual',
    details: [{ label: 'الرقم', value: '14816688' }],
  },
  sham_cash_dollar: {
    nameAr: 'شام كاش دولار',
    nameEn: 'Sham Cash Dollar',
    emoji: '💲',
    color: '#3b82f6',
    type: 'manual',
    details: [{ label: 'اسم المحفظة', value: 'zean677' }],
  },
  sham_cash_syp: {
    nameAr: 'شام كاش سوري',
    nameEn: 'Sham Cash Syrian',
    emoji: '🇸🇾',
    color: '#8b5cf6',
    type: 'manual',
    details: [{ label: 'اسم المحفظة', value: 'zean677' }],
  },
  usdt_bep20: {
    nameAr: 'USDT BEP-20',
    nameEn: 'USDT BEP-20',
    emoji: '💚',
    color: '#22c55e',
    type: 'manual',
    details: [{ label: 'الشبكة', value: 'BEP-20 (BSC)' }],
    comingSoon: true,
  },
  binance_id: {
    nameAr: 'Binance Pay',
    nameEn: 'Binance Pay',
    emoji: '🟡',
    color: '#f59e0b',
    type: 'manual',
    details: [],
    comingSoon: true,
  },
};

export default function Deposit() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const createPayment = useCreatePayment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [method, setMethod] = useState('syriatel_cash_auto');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('SYP');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'الملف كبير جداً', description: 'يجب أن يكون الملف أقل من 5MB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshotFile(ev.target?.result as string);
      setScreenshotName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: lang === 'ar' ? 'مبلغ غير صحيح' : 'Invalid amount', description: lang === 'ar' ? 'أدخل مبلغاً صحيحاً' : 'Enter a valid amount', variant: 'destructive' });
      return;
    }
    if (!transactionRef.trim()) {
      toast({ title: lang === 'ar' ? 'رقم العملية مطلوب' : 'Transaction ref required', description: lang === 'ar' ? 'أدخل رقم العملية' : 'Enter the transaction reference', variant: 'destructive' });
      return;
    }
    if (!screenshotFile) {
      toast({ title: lang === 'ar' ? 'الصورة مطلوبة' : 'Screenshot required', description: lang === 'ar' ? 'ارفع صورة إثبات التحويل' : 'Upload a screenshot', variant: 'destructive' });
      return;
    }
    try {
      await createPayment.mutateAsync({
        data: {
          amount: parseFloat(amount),
          currency,
          method,
          screenshotUrl: screenshotFile,
          transactionRef: transactionRef.trim(),
        } as any,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.data?.message ?? (lang === 'ar' ? 'فشل إرسال الطلب' : 'Failed to submit');
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: msg, variant: 'destructive' });
    }
  };

  if (submitted) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm" dir="rtl">
              <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-green-400" />
              </div>
              <h2 className="font-heading text-xl font-bold mb-2">{lang === 'ar' ? 'تم إرسال الطلب' : 'Request Submitted'}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {lang === 'ar'
                  ? 'تم إرسال طلب شحن رصيدك بنجاح. سيتم مراجعته من قبل الإدارة وإضافة الرصيد خلال فترة قصيرة.'
                  : 'Your deposit request has been submitted. Our team will verify it and add the balance shortly.'}
              </p>
              <button onClick={() => { setSubmitted(false); setStep(1); setAmount(''); setTransactionRef(''); setScreenshotFile(null); setScreenshotName(''); }}
                className="mt-6 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                {lang === 'ar' ? 'شحن مرة أخرى' : 'New Deposit'}
              </button>
            </motion.div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const selectedMethod = METHODS[method];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-xl mx-auto space-y-6" dir="rtl">
          <div>
            <h1 className="font-heading text-2xl font-bold">{lang === 'ar' ? 'شحن رصيد' : 'Top Up'}</h1>
            <p className="text-muted-foreground text-sm mt-1">{lang === 'ar' ? 'اختر طريقة الدفع وأدخل تفاصيل التحويل' : 'Choose payment method and enter transfer details'}</p>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2 p-1 bg-card border border-border rounded-xl">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-colors ${step >= s ? 'bg-primary text-white' : 'text-muted-foreground'}`}>
                {lang === 'ar' ? `خطوة ${s}` : `Step ${s}`}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Choose Payment Method */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="text-center">
                  <h2 className="font-heading font-bold text-lg">{lang === 'ar' ? 'اختر طريقة الشحن' : 'Select Payment Method'}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'إدخال كود الشحن' : 'Enter charge code'}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(METHODS).map(([key, info], idx) => {
                    const selected = method === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => !info.comingSoon && setMethod(key)}
                        disabled={info.comingSoon}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileTap={!info.comingSoon ? { scale: 0.95 } : {}}
                        className="relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all overflow-hidden"
                        style={{
                          background: info.comingSoon
                            ? 'linear-gradient(145deg, #111, #0d0d1a)'
                            : selected
                            ? `linear-gradient(145deg, ${info.color}33, ${info.color}18)`
                            : 'linear-gradient(145deg, #1a1a2e, #16213e)',
                          border: info.comingSoon ? '2px dashed #2a2a40' : selected ? `2px solid ${info.color}` : '2px solid #2a2a40',
                          boxShadow: selected && !info.comingSoon ? `0 0 20px ${info.color}30` : '0 4px 12px rgba(0,0,0,0.4)',
                          opacity: info.comingSoon ? 0.55 : 1,
                          cursor: info.comingSoon ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {/* Stars decoration */}
                        {!info.comingSoon && <>
                          <div className="absolute top-1 left-1"><span className="text-yellow-400/60 text-[8px]">★</span></div>
                          <div className="absolute top-1 right-1"><span className="text-yellow-400/60 text-[8px]">★</span></div>
                        </>}

                        {/* Coming soon badge */}
                        {info.comingSoon && (
                          <div className="absolute top-1 right-1 bg-amber-500/20 border border-amber-500/40 rounded-md px-1 py-0.5">
                            <span className="text-amber-400 text-[7px] font-bold">قريباً</span>
                          </div>
                        )}

                        {/* Selected check */}
                        {selected && !info.comingSoon && (
                          <div className="absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center z-10"
                            style={{ background: info.color }}>
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}

                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl relative"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${info.color}40, ${info.color}10)`,
                            border: `1px solid ${info.color}40`,
                          }}>
                          {info.emoji}
                        </div>

                        <span className="text-[10px] font-bold text-center leading-tight text-white/90">
                          {lang === 'ar' ? info.nameAr : info.nameEn}
                        </span>

                        {!info.comingSoon && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background: info.type === 'auto' ? '#22c55e20' : '#f59e0b20',
                              color: info.type === 'auto' ? '#22c55e' : '#f59e0b',
                              border: `1px solid ${info.type === 'auto' ? '#22c55e40' : '#f59e0b40'}`,
                            }}>
                            {info.type === 'auto' ? (lang === 'ar' ? 'أوتوماتيك' : 'Auto') : (lang === 'ar' ? 'يدوي' : 'Manual')}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => setStep(2)}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-xl shadow-primary/30">
                  {lang === 'ar' ? 'التالي' : 'Continue'}
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment Details + Amount */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading font-bold">{lang === 'ar' ? 'تفاصيل التحويل' : 'Transfer Details'}</h2>

                <div className="bg-card border-2 rounded-2xl p-5 space-y-3" style={{ borderColor: selectedMethod.color }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{selectedMethod.emoji}</span>
                    <span className="font-bold">{lang === 'ar' ? selectedMethod.nameAr : selectedMethod.nameEn}</span>
                    <span className="mr-auto text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: selectedMethod.type === 'auto' ? '#22c55e22' : '#f59e0b22', color: selectedMethod.type === 'auto' ? '#22c55e' : '#f59e0b' }}>
                      {selectedMethod.type === 'auto' ? (lang === 'ar' ? 'اوتوماتيك' : 'Auto') : (lang === 'ar' ? 'يدوي' : 'Manual')}
                    </span>
                  </div>
                  {selectedMethod.details.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-background rounded-xl">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-mono font-bold text-white select-all">{d.value}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-1">
                    {lang === 'ar' ? '⚠️ تأكد من نسخ المعلومات بشكل صحيح قبل التحويل' : '⚠️ Copy the details carefully before transferring'}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required min="1"
                      placeholder="0.00"
                      className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}
                      className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors">
                      <option value="SYP">SYP ل.س</option>
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-card border border-border text-sm font-semibold rounded-xl hover:bg-background transition-colors">
                    {lang === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                  <button type="button" onClick={() => setStep(3)} disabled={!amount || parseFloat(amount) <= 0}
                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl shadow-primary/30">
                    {lang === 'ar' ? 'التالي' : 'Continue'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Transaction Proof */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading font-bold">{lang === 'ar' ? 'إثبات التحويل' : 'Transfer Proof'}</h2>
                <p className="text-muted-foreground text-sm">
                  {lang === 'ar' ? 'أدخل رقم العملية وارفع صورة إثبات التحويل لمراجعتها من الإدارة' : 'Enter the transaction number and upload a screenshot for admin review'}
                </p>

                {/* Transaction Reference */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Hash size={15} className="text-primary" />
                    {lang === 'ar' ? 'رقم العملية / Transaction ID' : 'Transaction Reference'}
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: TXN123456789' : 'e.g. TXN123456789'}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                    required
                  />
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon size={15} className="text-primary" />
                    {lang === 'ar' ? 'صورة إثبات التحويل' : 'Transfer Screenshot'}
                  </label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                  {screenshotFile ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-primary/40 bg-card">
                      <img src={screenshotFile} alt="screenshot" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setScreenshotFile(null); setScreenshotName(''); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X size={14} className="text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
                        <p className="text-white text-xs truncate">{screenshotName}</p>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Upload size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{lang === 'ar' ? 'اضغط لرفع الصورة' : 'Click to upload'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'JPG، PNG، حتى 5MB' : 'JPG, PNG, up to 5MB'}</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-card border border-border rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === 'ar' ? 'طريقة الدفع' : 'Method'}</span>
                    <span className="font-medium">{lang === 'ar' ? selectedMethod.nameAr : selectedMethod.nameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === 'ar' ? 'المبلغ' : 'Amount'}</span>
                    <span className="font-medium">{currency} {amount}</span>
                  </div>
                  {transactionRef && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{lang === 'ar' ? 'رقم العملية' : 'Ref'}</span>
                      <span className="font-mono text-xs text-primary">{transactionRef}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-card border border-border text-sm font-semibold rounded-xl hover:bg-background transition-colors">
                    {lang === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                  <button type="submit" disabled={createPayment.isPending || !transactionRef || !screenshotFile}
                    className="flex-1 py-3 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl shadow-primary/30">
                    {createPayment.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
                    {lang === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
