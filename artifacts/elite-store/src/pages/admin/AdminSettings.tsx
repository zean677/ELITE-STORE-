import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Settings, Save, Loader2, DollarSign, TrendingUp, RefreshCw, Key, Megaphone, Shield, Eye, EyeOff, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

function SectionCard({ icon: Icon, title, sub, color, delay = 0, children }: { icon: any; title: string; sub?: string; color?: string; delay?: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className={`w-9 h-9 rounded-xl bg-${color ?? 'primary'}/15 border border-${color ?? 'primary'}/20 flex items-center justify-center`}>
          <Icon size={16} className={`text-${color ?? 'primary'}`} />
        </div>
        <div>
          <h2 className="font-bold text-sm">{title}</h2>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingShams, setSyncingShams] = useState(false);
  const [syncingAhminix, setSyncingAhminix] = useState(false);
  const [showShamsToken, setShowShamsToken] = useState(false);
  const [showAhminixKey, setShowAhminixKey] = useState(false);

  const [settings, setSettings] = useState({
    syp_rate: '13000',
    eur_rate: '0.92',
    default_profit_margin: '10',
    announcement: '',
    announcement_active: 'false',
    announcement_type: 'info',
    maintenance_mode: 'false',
    ahminix_api_key: '',
    shams4store_api_token: '',
  });

  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(r => r.json())
      .then(data => {
        setSettings(s => ({
          syp_rate: data.syp_rate ?? s.syp_rate,
          eur_rate: data.eur_rate ?? s.eur_rate,
          default_profit_margin: data.default_profit_margin ?? s.default_profit_margin,
          announcement: data.announcement ?? '',
          announcement_active: data.announcement_active ?? 'false',
          announcement_type: data.announcement_type ?? 'info',
          maintenance_mode: data.maintenance_mode ?? 'false',
          ahminix_api_key: data.ahminix_api_key ?? '',
          shams4store_api_token: data.shams4store_api_token ?? '',
        }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: keyof typeof settings, value: string) => setSettings(s => ({ ...s, [key]: value }));

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
          announcement: settings.announcement,
          announcement_active: settings.announcement_active,
          announcement_type: settings.announcement_type,
          maintenance_mode: settings.maintenance_mode,
          ahminix_api_key: settings.ahminix_api_key,
          shams4store_api_token: settings.shams4store_api_token,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: '✅ تم الحفظ', description: 'تم تحديث جميع الإعدادات بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'تعذر حفظ الإعدادات', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncShams = async () => {
    setSyncingShams(true);
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${BASE}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profit_margin: parseFloat(settings.default_profit_margin) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed');
      toast({ title: '✅ مزامنة Shams4Store', description: `تم جلب ${data.synced} منتج بنسبة ربح ${settings.default_profit_margin}%` });
    } catch (e: any) {
      toast({ title: 'فشلت المزامنة', description: e?.message ?? 'تعذر الاتصال بـ Shams4Store', variant: 'destructive' });
    } finally {
      setSyncingShams(false);
    }
  };

  const handleSyncAhminix = async () => {
    setSyncingAhminix(true);
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${BASE}/api/admin/sync/ahminix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profit_margin: parseFloat(settings.default_profit_margin) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed');
      toast({ title: '✅ مزامنة AHMINIX', description: `تم جلب ${data.synced} منتج بنسبة ربح ${settings.default_profit_margin}%` });
    } catch (e: any) {
      toast({ title: 'فشلت المزامنة', description: e?.message ?? 'تعذر الاتصال بـ AHMINIX', variant: 'destructive' });
    } finally {
      setSyncingAhminix(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors";

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
              <p className="text-muted-foreground text-sm mt-0.5">تحكم بجميع إعدادات Elite Store</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Exchange Rates */}
              <SectionCard icon={DollarSign} title="أسعار الصرف" sub="تؤثر على عرض الأسعار للمستخدمين" color="secondary" delay={0}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">سعر الدولار / الليرة (SYP)</label>
                    <input type="number" step="any" value={settings.syp_rate} onChange={e => set('syp_rate', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">سعر اليورو / الدولار (EUR)</label>
                    <input type="number" step="any" value={settings.eur_rate} onChange={e => set('eur_rate', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground">
                  <p>💡 الليرة: 1$ = <strong>{Number(settings.syp_rate).toLocaleString()}</strong> ل.س — اليورو: 1$ = <strong>{settings.eur_rate}€</strong></p>
                </div>
              </SectionCard>

              {/* Profit Margin */}
              <SectionCard icon={TrendingUp} title="نسبة الربح" sub="تُضاف على أسعار المورّدين تلقائياً" color="success" delay={0.04}>
                <div className="max-w-xs">
                  <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">نسبة الربح الافتراضية (%)</label>
                  <input type="number" step="any" value={settings.default_profit_margin} onChange={e => set('default_profit_margin', e.target.value)} className={inputCls} />
                </div>
                <div className="p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground">
                  <p>💡 منتج بـ <strong>1$</strong> من المورد + ربح {settings.default_profit_margin}% = يُعرض للزبون بـ <strong>${(1 * (1 + parseFloat(settings.default_profit_margin || '0') / 100)).toFixed(2)}</strong></p>
                </div>
              </SectionCard>

              {/* API Providers */}
              <SectionCard icon={Key} title="مفاتيح API المورّدين" sub="مطلوبة لمزامنة المنتجات وإرسال الطلبات" color="accent" delay={0.08}>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">Shams4Store API Token</label>
                    <div className="relative">
                      <input
                        type={showShamsToken ? 'text' : 'password'}
                        value={settings.shams4store_api_token}
                        onChange={e => set('shams4store_api_token', e.target.value)}
                        placeholder="أدخل API token الخاص بـ Shams4Store"
                        className={`${inputCls} pr-10 font-mono text-xs`}
                      />
                      <button type="button" onClick={() => setShowShamsToken(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showShamsToken ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">AHMINIX API Key</label>
                    <div className="relative">
                      <input
                        type={showAhminixKey ? 'text' : 'password'}
                        value={settings.ahminix_api_key}
                        onChange={e => set('ahminix_api_key', e.target.value)}
                        placeholder="أدخل API key الخاص بـ AHMINIX"
                        className={`${inputCls} pr-10 font-mono text-xs`}
                      />
                      <button type="button" onClick={() => setShowAhminixKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showAhminixKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground">
                    <p>🔐 تُحفظ المفاتيح في قاعدة البيانات بشكل آمن. لن تظهر للمستخدمين.</p>
                  </div>
                </div>
              </SectionCard>

              {/* Announcement Banner */}
              <SectionCard icon={Megaphone} title="بانر الإعلانات" sub="رسالة تظهر لجميع زوار المتجر" color="warning" delay={0.12}>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">نص الإعلان</label>
                    <textarea
                      value={settings.announcement}
                      onChange={e => set('announcement', e.target.value)}
                      placeholder="مثال: 🎉 عرض خاص! خصم 20% على جميع شحن PUBG اليوم فقط"
                      rows={3}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">نوع الإعلان</label>
                      <select value={settings.announcement_type} onChange={e => set('announcement_type', e.target.value)} className={inputCls}>
                        <option value="info">ℹ️ معلومات</option>
                        <option value="success">✅ نجاح</option>
                        <option value="warning">⚠️ تحذير</option>
                        <option value="error">🚨 تنبيه</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1.5 text-muted-foreground">حالة الإعلان</label>
                      <button
                        onClick={() => set('announcement_active', settings.announcement_active === 'true' ? 'false' : 'true')}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${settings.announcement_active === 'true' ? 'bg-success/20 text-success border-success/30' : 'bg-background text-muted-foreground border-border'}`}
                      >
                        {settings.announcement_active === 'true' ? '🟢 مفعّل' : '⚫ معطّل'}
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Maintenance Mode */}
              <SectionCard icon={Shield} title="وضع الصيانة" sub="يعطّل المتجر ويُظهر رسالة الصيانة للزوار" color="destructive" delay={0.16}>
                <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                  <div>
                    <p className="font-semibold text-sm">وضع الصيانة</p>
                    <p className="text-xs text-muted-foreground mt-0.5">عند التفعيل، يرى الزوار صفحة صيانة فقط</p>
                  </div>
                  <button
                    onClick={() => set('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${settings.maintenance_mode === 'true' ? 'bg-destructive/20 text-destructive border-destructive/30' : 'bg-background text-muted-foreground border-border'}`}
                  >
                    {settings.maintenance_mode === 'true' ? '🔴 مفعّل' : '⚫ معطّل'}
                  </button>
                </div>
                {settings.maintenance_mode === 'true' && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                    ⚠️ تحذير: المتجر معطّل حالياً. لن يتمكن الزوار من تصفح المنتجات أو الشراء.
                  </div>
                )}
              </SectionCard>

              {/* Save Button */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  حفظ جميع الإعدادات
                </button>
              </motion.div>

              {/* Sync Providers */}
              <SectionCard icon={Zap} title="مزامنة المنتجات من المورّدين" sub="جلب أحدث المنتجات وتحديث الأسعار" color="primary" delay={0.24}>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleSyncShams}
                    disabled={syncingShams}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary/15 text-secondary border border-secondary/30 rounded-xl font-semibold text-sm hover:bg-secondary/25 transition-colors disabled:opacity-60"
                  >
                    {syncingShams ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    مزامنة Shams4Store
                  </button>
                  <button
                    onClick={handleSyncAhminix}
                    disabled={syncingAhminix}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-accent/15 text-accent border border-accent/30 rounded-xl font-semibold text-sm hover:bg-accent/25 transition-colors disabled:opacity-60"
                  >
                    {syncingAhminix ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    مزامنة AHMINIX
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">نسبة الربح المطبّقة: <strong className="text-foreground">{settings.default_profit_margin}%</strong></p>
              </SectionCard>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
