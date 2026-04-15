import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetAdminUsers, useSuspendUser } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Search, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, refetch, isLoading } = useGetAdminUsers({ page, limit: 25, search: search || undefined });
  const suspendUser = useSuspendUser();
  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const handleToggleStatus = async (id: number, suspended: boolean) => {
    try {
      await suspendUser.mutateAsync({ id, data: { suspended: !suspended } });
      toast({ title: 'User updated' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Users</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} registered users</p>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="search" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
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
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">User</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Email</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Balance</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Role</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Joined</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map(user => (
                      <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                              {user.role === 'admin' ? <Shield size={12} className="text-primary" /> : <User size={12} className="text-primary" />}
                            </div>
                            <span className="text-sm font-medium">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">${parseFloat(user.balance?.toString() ?? '0').toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={user.suspended ? 'inactive' : 'active'} size="sm" /></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {user.role !== 'admin' && (
                            <button onClick={() => handleToggleStatus(user.id, !!user.suspended)} className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${!user.suspended ? 'bg-destructive/15 text-destructive hover:bg-destructive/25' : 'bg-success/15 text-success hover:bg-success/25'}`}>
                              {!user.suspended ? 'Suspend' : 'Activate'}
                            </button>
                          )}
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
