'use client';
import federatedLogout from '@/utils/federatedLogout';
import { signIn, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  useEffect(() => {
    if (!session) {
      return;
    }
    const sessionStart = session?.sessionStart ?? 0;
    const now = Math.floor(Date.now() / 1000);
    const sessionDuration = now - sessionStart;
    console.log('sessionDuration', sessionDuration);
    if (sessionDuration > 86400) {
      federatedLogout();
    }

    if (session?.error === 'RefreshAccessTokenError') {
      signIn('keycloak');
    }
  }, [session]);

  return <>{children}</>;
}
