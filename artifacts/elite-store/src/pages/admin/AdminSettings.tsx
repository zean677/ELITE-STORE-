import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Settings, Save, Loader2, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSyncProducts } from '@workspace/api-client-react';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

export default function AdminSettings() {
  const { toast } = useToast();
  const syncProducts = useSyncProducts();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [settings, setSettings] = useState({
    syp_rate: '13000',
    eur_rate: '0.92',
    default_profit_margin: '10',
  });

  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(r => r.json())
      .then(data => {
        setSettings(s => ({
          syp_rate: data.syp_rate ?? s.syp_rate,
          eur_rate: data.eur_rate ?? s.eur_rate,
          default_profit_margin: data.default_profit_margin ?? s.default_profit_margin,
        }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          syp_rate: parseFloat(settings.syp_rate),
          eur_rate: parseFloat(settings.eur_rate),
          default_profit_margin: parseFloat(settings.default_profit_margin),
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'تم الحفظ', description: 'تم تحديث الإعدادات بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'تعذر حفظ الإعدادات', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${BASE}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profit_margin: parseFloat(settings.default_profit_margin) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast({ title: 'تمت المزامنة', description: `تم جلب ${data.synced} منتج من Shams4Store بنسبة ربح ${settings.default_profit_margin}%` });
    } catch {
      toast({ title: 'فشلت المزامنة', description: 'تعذر الاتصال بـ Shams4Store', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const field = (label: string, key: keyof typeof settings, note?: string) => (
    <div>
      <label className="text-sm font-semibold block mb-1.5">{label}</label>
      {note && <p className="text-xs text-muted-foreground mb-2">{note}</p>}
      <input
        type="number"
        step="any"
        value={settings[key]}
        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:border-primary/50 transition-colors"
      />
    </div>
  );

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Settings size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">إعدادات المتجر</h1>
              <p className="text-muted-foreground text-sm mt-0.5">تحكم بأسعار الصرف ونسبة الربح</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Exchange Rates */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={16} className="text-secondary" />
                  <h2 className="font-bold">أسعار الصرف</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {field('سعر الدولار مقابل الليرة السورية (SYP)', 'syp_rate', '1 دولار = كم ليرة؟')}
                  {field('سعر اليورو مقابل الدولار (EUR)', 'eur_rate', '1 دولار = كم يورو؟')}
                </div>

                <div className="p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground space-y-1">
                  <p>💡 مثال: إذا وضعت سعر الليرة <strong>14000</strong>، فالمنتج بـ 1$ سيظهر بـ 14,000 ل.س</p>
                  <p>💡 سعر اليورو الحالي 0.92 يعني 1$ = 0.92€</p>
                </div>
              </motion.div>

              {/* Profit Margin */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-success" />
                  <h2 className="font-bold">نسبة الربح الافتراضية</h2>
                </div>

                <div className="max-w-xs">
                  {field('نسبة الربح (%)', 'default_profit_margin', 'تُضاف تلقائياً على أسعار Shams4Store عند المزامنة')}
                </div>

                <div className="p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground space-y-1">
                  <p>💡 مثال: المنتج بـ <strong>1$</strong> من المورد، مع ربح 10% سيظهر للزبون بـ <strong>1.10$</strong></p>
                  <p>💡 بعد تعديل النسبة، اضغط "مزامنة Shams4Store" لتحديث الأسعار</p>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  حفظ الإعدادات
                </button>

                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-secondary/15 text-secondary border border-secondary/30 rounded-xl font-semibold text-sm hover:bg-secondary/25 transition-colors disabled:opacity-60"
                >
                  {syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  مزامنة Shams4Store ({settings.default_profit_margin}% ربح)
                </button>
              </motion.div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
