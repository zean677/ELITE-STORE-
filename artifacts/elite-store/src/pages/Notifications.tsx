import React from 'react';
import { motion } from 'framer-motion';
import { useGetNotifications, useMarkNotificationRead } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/i18n';
import { Bell, CheckCircle, Package, Wallet, AlertCircle } from 'lucide-react';

const typeConfig: Record<string, { icon: any; color: string }> = {
  order_completed: { icon: Package, color: 'text-success' },
  payment_approved: { icon: Wallet, color: 'text-secondary' },
  balance_updated: { icon: Wallet, color: 'text-primary' },
  order_failed: { icon: AlertCircle, color: 'text-destructive' },
};

export default function Notifications() {
  const { t } = useLanguage();
  const { data: notifications, refetch } = useGetNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    refetch();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-bold">{t('notifications')}</h1>
            <p className="text-muted-foreground text-sm mt-1">{(notifications ?? []).filter(n => !n.isRead).length} unread</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {!notifications || notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(n => {
                  const cfg = typeConfig[n.type] ?? { icon: Bell, color: 'text-muted-foreground' };
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-start gap-4 p-4 hover:bg-background transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!n.isRead ? 'bg-primary/15 border border-primary/20' : 'bg-card border border-border'}`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => handleMarkRead(n.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-primary" title="Mark as read">
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
