'use client';
import { signIn } from 'next-auth/react';
import { Button } from '../common/Button';
export default function OnBoardingLogin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={() =>
        signIn('keycloak', {
          callbackUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/onboarding`,
        })
      }
    >
      {children}
    </Button>
  );
}
