import { getEvents } from '@/data';
import { ApplicationLayout } from './ApplicationLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export default async function Layout({
  children,
  admin,
  professional,
  user,
}: {
  admin: React.ReactNode;
  professional: React.ReactNode;
  user: React.ReactNode;
  children: React.ReactNode;
}) {
  const events = await getEvents();
  const session = await getServerSession(authOptions);
  const role = session?.roles?.includes('admin')
    ? 'admin'
    : session?.roles?.includes('professional')
    ? 'professional'
    : 'user';
  if (role === 'professional') {
    return professional;
  }
  if (role === 'admin') {
    return admin;
  }

  // return <ApplicationLayout events={events}>{children}</ApplicationLayout>;
}
