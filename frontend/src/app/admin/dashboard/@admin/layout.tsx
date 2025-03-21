import { AdminLayout } from '@/components/layouts/AdminLayout/AdminLayout';
import { getEvents } from '@/data';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getEvents();

  return <AdminLayout events={events}>{children}</AdminLayout>;
}
