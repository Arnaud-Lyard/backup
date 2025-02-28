'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col space-y-3 justify-center items-center h-screen">
      <h2>Il y a eu un problème !</h2>
      <button onClick={() => reset()}>Réessayer</button>
    </div>
  );
}
