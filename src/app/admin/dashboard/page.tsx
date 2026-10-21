import { getAdminDashboardSnapshot } from '@/lib/admin-analytics';
import AdminDashboardLive from './AdminDashboardLive';

// Always read fresh data: the numbers here are live, and the client component
// keeps them current after first paint.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Server-render the first snapshot so there's no loading flash; the client
  // takes over polling from here.
  const initial = await getAdminDashboardSnapshot();
  return <AdminDashboardLive initial={initial} />;
}
