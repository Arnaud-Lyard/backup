'use client';
import { signIn } from 'next-auth/react';
export default function Login() {
  return (
    <button
      className="text-sm/6 font-semibold text-gray-900"
      onClick={() => signIn('keycloak')}
    >
      Connexion<span aria-hidden="true">&rarr;</span>
    </button>
  );
}
