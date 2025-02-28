'use client';
import federatedLogout from '@/utils/federatedLogout';

export default function Logout() {
  return (
    <button
      className="text-sm/6 font-semibold text-gray-900"
      onClick={() => federatedLogout()}
    >
      Déconnexion<span aria-hidden="true">&rarr;</span>
    </button>
  );
}
