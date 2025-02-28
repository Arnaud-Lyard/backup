import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function useGetApi<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.accessToken}`,
              },
              credentials: 'include',
            }
          );
          if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.json();
          setData(result);
        } catch (err: any) {
          setError(err.message || 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [url, session?.accessToken]);

  return { data, error, loading };
}

export default useGetApi;
