import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCreatePayment } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/i18n';
import { useCurrency } from '@/hooks/use-currency';
import { Loader2, Upload, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'syriatel_cash' | 'sham_cash';
type Currency = 'USD' | 'SYP' | 'EUR';

const methodInfo = {
  syriatel_cash: {
    name: 'Syriatel Cash',
    nameAr: 'سيريتل كاش',
    icon: Phone,
    details: [{ label: 'Number', value: '14816688' }],
    color: 'secondary',
  },
  sham_cash: {
    name: 'Sham Cash',
    nameAr: 'شام كاش',
    icon: CreditCard,
    details: [
      { label: 'Wallet Name', value: 'zean677' },
      { label: 'Wallet ID', value: '5649dd63...' },
    ],
    color: 'accent',
  },
};

export default function Deposit() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const createPayment = useCreatePayment();

  const [method, setMethod] = useState<PaymentMethod>('syriatel_cash');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    try {
      await createPayment.mutateAsync({
        amount: parseFloat(amount),
        currency,
        method,
        screenshotUrl: screenshotUrl || 'pending_upload',
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to submit payment';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  if (submitted) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-success" />
              </div>
              <h2 className="font-heading text-xl font-bold mb-2">Payment Submitted</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">Your deposit request has been submitted. Our team will verify it within 24 hours and add the balance to your wallet.</p>
              <button onClick={() => { setSubmitted(false); setStep(1); setAmount(''); setScreenshotUrl(''); }} className="mt-6 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                New Deposit
              </button>
            </motion.div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-xl mx-auto space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-bold">{t('deposit')}</h1>
            <p className="text-muted-foreground text-sm mt-1">Add funds to your wallet</p>
          </div>

          <div className="flex gap-2 p-1 bg-card border border-border rounded-xl">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-colors ${step >= s ? 'bg-primary text-white' : 'text-muted-foreground'}`}>
                Step {s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading font-bold">Select Payment Method</h2>
                <div className="grid gap-3">
                  {(Object.entries(methodInfo) as [PaymentMethod, typeof methodInfo.syriatel_cash][]).map(([key, info]) => {
                    const Icon = info.icon;
                    return (
                      <button key={key} type="button" onClick={() => setMethod(key)} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${method === key ? 'border-primary/50 bg-primary/10' : 'border-border bg-card hover:border-border/80'}`}>
                        <div className={`w-10 h-10 rounded-xl bg-${info.color}/15 flex items-center justify-center`}>
                          <Icon size={18} className={`text-${info.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{lang === 'ar' ? info.nameAr : info.name}</p>
                          <p className="text-xs text-muted-foreground">{info.details[0].label}: {info.details[0].value}</p>
                        </div>
                        <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === key ? 'border-primary' : 'border-border'}`}>
                          {method === key && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-xl shadow-primary/30">
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading font-bold">Transfer Details</h2>
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                  <h3 className="font-semibold text-sm">{lang === 'ar' ? methodInfo[method].nameAr : methodInfo[method].name}</h3>
                  {methodInfo[method].details.map(d => (
                    <div key={d.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-mono font-bold">{d.value}</span>
                    </div>
                  ))}
                  {method === 'sham_cash' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Full Wallet ID</span>
                      <span className="font-mono text-xs text-secondary">5649dd63431812890980008b5b1c3d53</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('amount')}</label>
                  <div className="flex gap-2">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" placeholder="0.00" className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                    <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors">
                      <option value="USD">USD $</option>
                      <option value="SYP">SYP ل.س</option>
                      <option value="EUR">EUR €</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-card border border-border text-sm font-semibold rounded-xl hover:bg-background transition-colors">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} disabled={!amount || parseFloat(amount) <= 0} className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl shadow-primary/30">
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading font-bold">Upload Screenshot</h2>
                <p className="text-muted-foreground text-sm">Upload a screenshot of your transfer confirmation</p>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors">
                  <Upload size={32} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Upload your transfer screenshot</p>
                  <input type="text" value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)} placeholder="Or paste screenshot URL here" className="mt-3 w-full px-3 py-2 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-primary/50 transition-colors text-center" />
                </div>

                <div className="bg-card border border-border rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{methodInfo[method].name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{currency} {amount}</span></div>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 bg-card border border-border text-sm font-semibold rounded-xl hover:bg-background transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={createPayment.isPending} className="flex-1 py-3 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl shadow-primary/30">
                    {createPayment.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
                    {t('submit')}
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
