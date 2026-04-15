import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { Layers, Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, X, Check } from 'lucide-react';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

function authHeaders() {
  const token = localStorage.getItem('elite_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

type Category = {
  id: number;
  nameAr: string;
  nameEn: string;
  href: string;
  color: string;
  bgGradient: string;
  icon1: string; icon2: string; icon3: string; icon4: string;
  iconLabel1: string; iconLabel2: string; iconLabel3: string; iconLabel4: string;
  sortOrder: number;
  isActive: boolean;
};

const empty: Omit<Category, 'id'> = {
  nameAr: '', nameEn: '', href: '/products', color: '#6C5CE7',
  bgGradient: 'linear-gradient(145deg, #1a0040, #2d0080)',
  icon1: '', icon2: '', icon3: '', icon4: '',
  iconLabel1: '', iconLabel2: '', iconLabel3: '', iconLabel4: '',
  sortOrder: 0, isActive: true,
};

function CategoryPreview({ cat }: { cat: Partial<Category> }) {
  const icons = [
    { img: cat.icon1, label: cat.iconLabel1 },
    { img: cat.icon2, label: cat.iconLabel2 },
    { img: cat.icon3, label: cat.iconLabel3 },
    { img: cat.icon4, label: cat.iconLabel4 },
  ];
  return (
    <div className="rounded-xl overflow-hidden w-32 shrink-0" style={{ background: cat.bgGradient || '#111', border: `1px solid ${cat.color}40` }}>
      <div className="p-2">
        <div className="grid grid-cols-2 gap-1">
          {icons.map((ic, i) => (
            <div key={i} className="aspect-square rounded-lg flex items-center justify-center overflow-hidden" style={{ background: `${cat.color}22` }}>
              {ic.img ? <img src={ic.img} alt={ic.label} className="w-6 h-6 object-contain" onError={e => (e.currentTarget.style.display = 'none')} /> : <span className="text-[10px] text-white/40">{ic.label?.slice(0, 2) || '?'}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="py-1.5 px-2 text-center" style={{ background: `linear-gradient(0deg, ${cat.color}33, transparent)`, borderTop: `1px solid ${cat.color}30` }}>
        <p className="text-[10px] font-black text-white truncate">{cat.nameAr || 'الفئة'}</p>
      </div>
    </div>
  );
}

function CategoryForm({ initial, onSave, onCancel, saving }: {
  initial: Omit<Category, 'id'>;
  onSave: (data: Omit<Category, 'id'>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4" dir="rtl">
      {/* Preview */}
      <div className="flex justify-center mb-4">
        <CategoryPreview cat={form} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">الاسم بالعربي *</label>
          <input value={form.nameAr} onChange={e => set('nameAr', e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-white focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">الاسم بالإنجليزي *</label>
          <input value={form.nameEn} onChange={e => set('nameEn', e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-white focus:outline-none focus:border-primary/50" />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">الرابط</label>
        <input value={form.href} onChange={e => set('href', e.target.value)} placeholder="/products?category=..." className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-white focus:outline-none focus:border-primary/50" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">اللون</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="w-10 h-9 rounded-lg border border-border cursor-pointer bg-transparent" />
            <input value={form.color} onChange={e => set('color', e.target.value)} className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-white focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">الترتيب</label>
          <input type="number" value={form.sortOrder} onChange={e => set('sortOrder', Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-white focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">تدرج الخلفية (CSS)</label>
        <input value={form.bgGradient} onChange={e => set('bgGradient', e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-white focus:outline-none" />
      </div>

      {/* Icons */}
      <div className="grid grid-cols-2 gap-3">
        {([1, 2, 3, 4] as const).map(n => (
          <div key={n}>
            <label className="text-xs text-gray-400 mb-1 block">أيقونة {n} (URL)</label>
            <input
              value={(form as any)[`icon${n}`]}
              onChange={e => set(`icon${n}` as any, e.target.value)}
              placeholder="https://www.google.com/s2/favicons?domain=..."
              className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-white focus:outline-none mb-1"
            />
            <input
              value={(form as any)[`iconLabel${n}`]}
              onChange={e => set(`iconLabel${n}` as any, e.target.value)}
              placeholder="اسم الأيقونة"
              className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} id="isActive" className="w-4 h-4 accent-purple-500" />
        <label htmlFor="isActive" className="text-sm text-gray-300">مفعّل (يظهر في الواجهة)</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.nameAr || !form.nameEn}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>
          {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></> : <><Check size={15} /> حفظ</>}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 border border-border hover:border-primary/40 transition-colors">
          إلغاء
        </button>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; cat?: Category } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/categories`, { headers: authHeaders() });
      if (res.ok) setCategories(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Omit<Category, 'id'>) => {
    setSaving(true);
    try {
      const isEdit = modal?.mode === 'edit' && modal.cat;
      const url = isEdit ? `${BASE}/api/admin/categories/${modal.cat!.id}` : `${BASE}/api/admin/categories`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: isEdit ? '✅ تم تحديث الفئة' : '✅ تمت إضافة الفئة' });
      setModal(null);
      load();
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل تريد حذف هذه الفئة؟')) return;
    setDeleting(id);
    try {
      await fetch(`${BASE}/api/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
      toast({ title: '🗑️ تم حذف الفئة' });
      load();
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (cat: Category) => {
    await fetch(`${BASE}/api/admin/categories/${cat.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...cat, isActive: !cat.isActive }),
    });
    load();
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">إدارة الفئات</h1>
              <p className="text-muted-foreground text-sm mt-1">{categories.length} فئة — تحكم بما يظهر في الصفحة الرئيسية</p>
            </div>
            <button
              onClick={() => setModal({ mode: 'create' })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 4px 15px rgba(108,92,231,0.3)' }}>
              <Plus size={16} /> فئة جديدة
            </button>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.2)' }}>
            <Layers size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-400">الفئات تظهر في الصفحة الرئيسية كبطاقات بشبكة 3×N. يمكنك إضافة، تعديل، إخفاء أو حذف أي فئة. استخدم روابط Google Favicons للأيقونات بشكل مثلاً: <code className="text-purple-300 text-xs">https://www.google.com/s2/favicons?domain=netflix.com&sz=64</code></p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center">
              <Layers size={48} className="mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground mb-4">لا توجد فئات بعد</p>
              <button onClick={() => setModal({ mode: 'create' })} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>أضف فئة</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((cat, i) => {
                const icons = [cat.icon1, cat.icon2, cat.icon3, cat.icon4];
                return (
                  <motion.div key={cat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="relative rounded-2xl overflow-hidden group"
                    style={{ background: cat.bgGradient, border: `1px solid ${cat.color}40`, opacity: cat.isActive ? 1 : 0.45 }}>
                    {/* Preview */}
                    <div className="p-2.5 pb-1">
                      <div className="grid grid-cols-2 gap-1">
                        {icons.map((icon, j) => (
                          <div key={j} className="aspect-square rounded-xl flex items-center justify-center overflow-hidden" style={{ background: `${cat.color}22` }}>
                            {icon ? <img src={icon} alt="" className="w-7 h-7 object-contain" onError={e => (e.currentTarget.style.display = 'none')} /> : <span className="text-[9px] text-white/30">-</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="py-1.5 px-2 text-center" style={{ background: `linear-gradient(0deg, ${cat.color}33, transparent)`, borderTop: `1px solid ${cat.color}30` }}>
                      <p className="text-[10px] font-black text-white leading-none">{cat.nameAr}</p>
                      <p className="text-[9px] text-white/40 mt-0.5">{cat.nameEn}</p>
                    </div>

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => setModal({ mode: 'edit', cat })} className="p-2 rounded-xl bg-white/10 hover:bg-purple-500/50 transition-colors"><Pencil size={14} className="text-white" /></button>
                      <button onClick={() => toggleActive(cat)} className="p-2 rounded-xl bg-white/10 hover:bg-yellow-500/50 transition-colors">
                        {cat.isActive ? <EyeOff size={14} className="text-white" /> : <Eye size={14} className="text-white" />}
                      </button>
                      <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} className="p-2 rounded-xl bg-white/10 hover:bg-red-500/50 transition-colors">
                        {deleting === cat.id ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : <Trash2 size={14} className="text-white" />}
                      </button>
                    </div>

                    {/* Sort order badge */}
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                      <span className="text-[9px] font-black text-white">{cat.sortOrder}</span>
                    </div>

                    {/* Inactive badge */}
                    {!cat.isActive && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-gray-800/80">
                        <span className="text-[8px] text-gray-400">مخفي</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {modal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
              onClick={() => setModal(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
                style={{ background: '#111827', border: '1px solid rgba(108,92,231,0.3)' }}>
                <div className="flex items-center justify-between p-5 border-b border-border" dir="rtl">
                  <h2 className="font-bold text-white">{modal.mode === 'create' ? '➕ إضافة فئة جديدة' : '✏️ تعديل الفئة'}</h2>
                  <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><X size={16} className="text-gray-400" /></button>
                </div>
                <div className="p-5">
                  <CategoryForm
                    initial={modal.cat ? { nameAr: modal.cat.nameAr, nameEn: modal.cat.nameEn, href: modal.cat.href, color: modal.cat.color, bgGradient: modal.cat.bgGradient, icon1: modal.cat.icon1 || '', icon2: modal.cat.icon2 || '', icon3: modal.cat.icon3 || '', icon4: modal.cat.icon4 || '', iconLabel1: modal.cat.iconLabel1 || '', iconLabel2: modal.cat.iconLabel2 || '', iconLabel3: modal.cat.iconLabel3 || '', iconLabel4: modal.cat.iconLabel4 || '', sortOrder: modal.cat.sortOrder, isActive: modal.cat.isActive } : { ...empty }}
                    onSave={handleSave}
                    onCancel={() => setModal(null)}
                    saving={saving}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
