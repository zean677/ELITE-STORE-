import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetProducts, useSyncProducts } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { Layers, Search, ShoppingBag, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading } = useGetProducts({ page, limit: 25, search: search || undefined });
  const syncProducts = useSyncProducts();
  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const handleSync = async () => {
    try {
      await syncProducts.mutateAsync();
      toast({ title: 'Products synced', description: 'Products have been synced from providers' });
    } catch {
      toast({ title: 'Sync failed', description: 'Could not sync products', variant: 'destructive' });
    }
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
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="search" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
              <button onClick={handleSync} disabled={syncProducts.isPending} className="flex items-center gap-2 px-4 py-2.5 bg-secondary/15 text-secondary border border-secondary/30 rounded-xl text-sm font-semibold hover:bg-secondary/25 transition-colors">
                {syncProducts.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Sync
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
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(product => (
                      <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                              <ShoppingBag size={12} className="text-primary" />
                            </div>
                            <span className="text-sm font-medium truncate max-w-40">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{product.category?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{product.provider}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">${parseFloat(product.priceUsd?.toString() ?? '0').toFixed(2)}</td>
                        <td className="px-4 py-3"><StatusBadge status={product.isActive ? 'active' : 'inactive'} size="sm" /></td>
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
