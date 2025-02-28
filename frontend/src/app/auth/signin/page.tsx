import { authOptions } from '@/utils/authOptions';
import Login from '@/components/authentication/Login';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const signinErrors: Record<string | 'default', string> = {
  default: 'Une erreur inconnue est survenue.',
  error: 'Erreur de connexion',
};

interface SignInPageProp {
  callbackUrl: string;
  error: string;
}

export default async function Signin({
  searchParams,
}: {
  searchParams: Promise<SignInPageProp>;
}) {
  const session = await getServerSession(authOptions);
  const { callbackUrl, error } = await searchParams;
  if (session) {
    redirect(callbackUrl || '/');
  }
  return (
    <div>
      {error && <div>{signinErrors[error.toLowerCase()]}</div>}
      <Login />
    </div>
  );
}
