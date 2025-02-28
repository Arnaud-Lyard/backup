import { getEvents } from '@/data';
import { ApplicationLayout } from './ApplicationLayout';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getEvents();
  return <ApplicationLayout events={events}>{children}</ApplicationLayout>;
}
