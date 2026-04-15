import { useQuery } from '@tanstack/react-query';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

interface SiteSettings {
  syp_rate: number;
  eur_rate: number;
  default_profit_margin: number;
  announcement: string;
  announcement_active: string;
  announcement_type: string;
  maintenance_mode: string;
}

async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${BASE}/api/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  const data = await res.json();
  return {
    syp_rate: parseFloat(data.syp_rate ?? '13000'),
    eur_rate: parseFloat(data.eur_rate ?? '0.92'),
    default_profit_margin: parseFloat(data.default_profit_margin ?? '10'),
    announcement: data.announcement ?? '',
    announcement_active: data.announcement_active ?? 'false',
    announcement_type: data.announcement_type ?? 'info',
    maintenance_mode: data.maintenance_mode ?? 'false',
  };
}

export function useSettings() {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    sypRate: data?.syp_rate ?? 13000,
    eurRate: data?.eur_rate ?? 0.92,
    profitMargin: data?.default_profit_margin ?? 10,
    announcement: data?.announcement ?? '',
    announcementActive: data?.announcement_active === 'true',
    announcementType: data?.announcement_type ?? 'info',
    maintenanceMode: data?.maintenance_mode === 'true',
  };
}
