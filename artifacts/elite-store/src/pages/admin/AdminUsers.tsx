import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetAdminUsers, useSuspendUser } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Users, Search, Shield, User, Ban, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

function authHeaders() {
  const token = localStorage.getItem('elite_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [balanceModal, setBalanceModal] = useState<{ id: number; username: string; balance: string } | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const { toast } = useToast();

  const { data, refetch, isLoading } = useGetAdminUsers({ page, limit: 25, search: search || undefined });
  const suspendUser = useSuspendUser();
  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const handleToggleStatus = async (id: number, suspended: boolean) => {
    try {
      await suspendUser.mutateAsync({ id, data: { suspended: !suspended } });
      toast({ title: !suspended ? '🚫 تم تعليق الحساب' : '✅ تم تفعيل الحساب' });
      refetch();
    } catch {
      toast({ title: 'خطأ', description: 'فشل في تحديث المستخدم', variant: 'destructive' });
    }
  };

  const handleUpdateBalance = async () => {
    if (!balanceModal) return;
    setUpdatingBalance(true);
    try {
      const res = await fetch(`${BASE}/api/admin/users/${balanceModal.id}/balance`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ balance: parseFloat(newBalance) }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: '✅ تم تحديث الرصيد' });
      setBalanceModal(null);
      setNewBalance('');
      refetch();
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingBalance(false);
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">إدارة المستخدمين</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} مستخدم مسجّل</p>
            </div>
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="search" placeholder="بحث عن مستخدم..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pr-9 pl-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" dir="rtl" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">لا يوجد مستخدمون</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">المستخدم</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">الرصيد</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">الدور</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">تاريخ التسجيل</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">الحالة</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user: any) => (
                      <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                              <span className="text-primary text-xs font-bold">{user.username[0].toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.username}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-green-400">${parseFloat(user.balance || '0').toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${user.role === 'admin' ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                            {user.role === 'admin' ? <><Shield size={10} /> مدير</> : <><User size={10} /> مستخدم</>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('ar-SY')}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.isSuspended ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-green-500/15 text-green-400 border border-green-500/20'}`}>
                            {user.isSuspended ? 'موقوف' : 'نشط'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setBalanceModal({ id: user.id, username: user.username, balance: user.balance }); setNewBalance(user.balance); }}
                              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="تعديل الرصيد">
                              <Edit3 size={12} />
                            </button>
                            {user.role !== 'admin' && (
                              <button onClick={() => handleToggleStatus(user.id, user.isSuspended)}
                                className={`p-1.5 rounded-lg transition-colors ${user.isSuspended ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                title={user.isSuspended ? 'رفع التعليق' : 'تعليق الحساب'}>
                                <Ban size={12} />
                              </button>
                            )}
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">السابق</button>
              <span className="px-4 py-2 text-sm text-muted-foreground">صفحة {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 25 >= total}
                className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">التالي</button>
            </div>
          )}
        </div>

        {/* Balance Modal */}
        {balanceModal && (
          <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setBalanceModal(null)}>
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()} dir="rtl">
              <h3 className="font-bold text-white mb-1">تعديل الرصيد</h3>
              <p className="text-sm text-gray-400 mb-4">المستخدم: {balanceModal.username}</p>
              <label className="text-xs text-gray-400 mb-1 block">الرصيد الجديد (USD)</label>
              <input type="number" step="0.01" value={newBalance} onChange={e => setNewBalance(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-white text-sm mb-4 focus:outline-none focus:border-primary/50" />
              <div className="flex gap-3">
                <button onClick={handleUpdateBalance} disabled={updatingBalance}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>
                  {updatingBalance ? 'جاري...' : 'حفظ'}
                </button>
                <button onClick={() => setBalanceModal(null)} className="px-5 py-2.5 rounded-xl text-sm text-gray-400 border border-border">إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
