import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProducts, useSyncProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { Layers, Search, ShoppingBag, RefreshCw, Loader2, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { value: 'mobile_games', label: 'Mobile Games' },
  { value: 'pc_games', label: 'PC Games' },
  { value: 'gift_cards', label: 'Gift Cards' },
  { value: 'services', label: 'Services' },
  { value: 'general', label: 'General' },
];

const emptyForm = {
  name: '',
  nameAr: '',
  description: '',
  image: '',
  priceUsd: '',
  category: 'general',
  provider: 'manual',
  providerProductId: '',
  status: 'active' as 'active' | 'inactive',
  profitMargin: '10',
};

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<null | { id: string }>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<null | { id: string; name: string }>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ name: '', priceUsd: '', profitMargin: '', status: 'active' });

  const { data, isLoading, refetch } = useGetProducts({ page, limit: 25, search: search || undefined });
  const syncProducts = useSyncProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const handleSync = async () => {
    try {
      await syncProducts.mutateAsync();
      toast({ title: 'تمت المزامنة', description: 'تم جلب المنتجات من shams4store بنجاح' });
      refetch();
    } catch {
      toast({ title: 'فشلت المزامنة', description: 'تعذر جلب المنتجات', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.priceUsd) {
      toast({ title: 'حقول مطلوبة', description: 'الاسم والسعر مطلوبان', variant: 'destructive' });
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: form.name,
        nameAr: form.nameAr || undefined,
        description: form.description || undefined,
        image: form.image || undefined,
        priceUsd: parseFloat(form.priceUsd),
        category: form.category,
        provider: form.provider || 'manual',
        providerProductId: form.providerProductId || undefined,
        status: form.status,
        profitMargin: parseFloat(form.profitMargin) || 10,
      });
      toast({ title: 'تمت الإضافة', description: `تم إضافة ${form.name}` });
      setShowAddModal(false);
      setForm(emptyForm);
      refetch();
    } catch {
      toast({ title: 'خطأ', description: 'تعذر إضافة المنتج', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        data: {
          name: editForm.name || undefined,
          priceUsd: editForm.priceUsd ? parseFloat(editForm.priceUsd) : undefined,
          profitMargin: editForm.profitMargin ? parseFloat(editForm.profitMargin) : undefined,
          status: editForm.status as 'active' | 'inactive',
        },
      });
      toast({ title: 'تم التعديل' });
      setEditingProduct(null);
      refetch();
    } catch {
      toast({ title: 'خطأ', description: 'تعذر تعديل المنتج', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProduct.mutateAsync({ id: deleteConfirm.id });
      toast({ title: 'تم الحذف', description: `تم حذف ${deleteConfirm.name}` });
      setDeleteConfirm(null);
      refetch();
    } catch {
      toast({ title: 'خطأ', description: 'تعذر حذف المنتج', variant: 'destructive' });
    }
  };

  const openEdit = (p: typeof products[0]) => {
    setEditingProduct({ id: p.id });
    setEditForm({
      name: p.name,
      priceUsd: String(parseFloat(p.priceUsd?.toString() ?? '0')),
      profitMargin: String(parseFloat(p.profitMargin?.toString() ?? '10')),
      status: p.status ?? 'active',
    });
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Products</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} products</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} /> Add Product
              </button>
              <button
                onClick={handleSync}
                disabled={syncProducts.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary/15 text-secondary border border-secondary/30 rounded-xl text-sm font-semibold hover:bg-secondary/25 transition-colors"
              >
                {syncProducts.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Sync from shams4store
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center">
                <Layers size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No products found</p>
                <div className="flex gap-3 justify-center mt-4">
                  <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                    <Plus size={14} /> Add Manually
                  </button>
                  <button onClick={handleSync} disabled={syncProducts.isPending} className="flex items-center gap-2 px-4 py-2 bg-secondary/15 text-secondary border border-secondary/30 rounded-xl text-sm font-semibold hover:bg-secondary/25 transition-colors">
                    {syncProducts.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    Sync from shams4store
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Product</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Category</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Provider</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Price (USD)</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Margin %</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(product => (
                      <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {product.image ? (
                              <img src={product.image} alt="" className="w-7 h-7 rounded-lg object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                                <ShoppingBag size={12} className="text-primary" />
                              </div>
                            )}
                            <span className="text-sm font-medium truncate max-w-40">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{product.category?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{product.provider}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">${parseFloat(product.priceUsd?.toString() ?? '0').toFixed(3)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{parseFloat(product.profitMargin?.toString() ?? '10').toFixed(0)}%</td>
                        <td className="px-4 py-3"><StatusBadge status={product.status === 'active' ? 'active' : 'inactive'} size="sm" /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => setDeleteConfirm({ id: product.id, name: product.name })} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {total > 25 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">Prev</button>
              <span className="px-4 py-2 text-sm text-muted-foreground">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 25 >= total} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-lg font-bold">Add New Product</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Arabic Name</label>
                      <input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="اسم المنتج" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" dir="rtl" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Price (USD) *</label>
                      <input type="number" step="0.001" value={form.priceUsd} onChange={e => setForm(f => ({ ...f, priceUsd: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Profit Margin (%)</label>
                      <input type="number" step="1" value={form.profitMargin} onChange={e => setForm(f => ({ ...f, profitMargin: e.target.value }))} placeholder="10" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50">
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Provider</label>
                      <input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="manual" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                      <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleCreate} disabled={createProduct.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    {createProduct.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Add Product
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Product Modal */}
        <AnimatePresence>
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setEditingProduct(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-lg font-bold">Edit Product</h2>
                  <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Price (USD)</label>
                      <input type="number" step="0.001" value={editForm.priceUsd} onChange={e => setEditForm(f => ({ ...f, priceUsd: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Profit Margin (%)</label>
                      <input type="number" step="1" value={editForm.profitMargin} onChange={e => setEditForm(f => ({ ...f, profitMargin: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setEditingProduct(null)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleUpdate} disabled={updateProduct.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    {updateProduct.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={20} className="text-destructive" />
                </div>
                <h2 className="font-heading text-lg font-bold mb-2">Delete Product?</h2>
                <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleDelete} disabled={deleteProduct.isPending} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2">
                    {deleteProduct.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
