import { ProfessionalLayout } from '@/components/layouts/ProfessionalLayout';
import { getEvents } from '@/data';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getEvents();

  return <ProfessionalLayout events={events}>{children}</ProfessionalLayout>;
}
