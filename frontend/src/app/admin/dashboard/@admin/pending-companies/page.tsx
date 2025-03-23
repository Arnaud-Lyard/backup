'use client';
import { Alert } from '@/components/common/Alert';
import { Subheading } from '@/components/common/Heading';
import { Spinner } from '@/components/common/Spinner';
import { Switch } from '@/components/common/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/Table';
import { IPendingCompanies } from '@/types/Company';
import { Error } from '@/types/Error';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function PendingCompanies() {
  const [pendingCompanies, setPendingCompanies] = useState<IPendingCompanies[]>(
    []
  );
  const { data: session } = useSession();
  const [errors, setErrors] = useState<Error | null>(null);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [isErrorAlert, setIsErrorAlert] = useState(false);

  const handlePendingCompanies = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/pending-companies`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      const data: IPendingCompanies[] = await response.json();
      setPendingCompanies(data);
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  async function activePendingCompany(id: number) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/pending-company/active/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!response.ok) {
        const errorData: Error = await response.json();

        if (
          response.status === 409 ||
          (response.status === 422 && errorData.violations)
        ) {
          setErrors(errorData);
          setIsErrorAlert(true);
        }

        return;
      }
      setIsSuccessAlert(true);
    } catch (err) {
      console.error(err);
      setIsErrorAlert(true);
    } finally {
      handlePendingCompanies();
    }
  }

  useEffect(() => {
    if (session) {
      handlePendingCompanies();
    }
  }, [session]);

  if (!pendingCompanies || pendingCompanies.length === 0) {
    return <Spinner />;
  }
  return (
    <>
      <Subheading className="mt-12">Entreprises en attente</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Nom de l&apos;entreprise</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Adresse</TableHeader>
            <TableHeader>Courriel</TableHeader>
            <TableHeader>Logo</TableHeader>
            <TableHeader className="text-right">Actif</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingCompanies.map((pendingCompany) => (
            <TableRow
              key={pendingCompany.id}
              title={`Entreprise #${pendingCompany.name}`}
            >
              <TableCell>{pendingCompany.name}</TableCell>
              <TableCell>{pendingCompany.description}</TableCell>
              <TableCell>{pendingCompany.address}</TableCell>
              <TableCell>{pendingCompany.owner.email}</TableCell>
              <TableCell>
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/logos/${pendingCompany.logo}`}
                  alt={''}
                  width={20}
                  height={20}
                />
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  onClick={() => {
                    activePendingCompany(pendingCompany.id);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Alert
        size="md"
        open={isSuccessAlert}
        onClose={() => setIsSuccessAlert(false)}
      >
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <CheckCircleIcon
                aria-hidden="true"
                className="size-5 text-green-400"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Le statut de l&apos;avis a été modifié.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-hidden focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                >
                  <span className="sr-only">Fermer</span>
                  <XMarkIcon
                    aria-hidden="true"
                    className="size-5"
                    onClick={() => setIsSuccessAlert(false)}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Alert>
      <Alert
        size="md"
        open={isErrorAlert}
        onClose={() => setIsErrorAlert(false)}
      >
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <XCircleIcon aria-hidden="true" className="size-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors?.violations && errors?.violations?.length > 0
                  ? `${errors.violations.length} erreur(s) lors de l'envoi du formulaire`
                  : errors?.message || 'Une erreur est survenue.'}
              </h3>
              {errors?.violations && (
                <div className="mt-2 text-sm text-red-700">
                  <ul role="list" className="list-disc space-y-1 pl-5">
                    {errors.violations.map((violation, index) => (
                      <li key={index}>{violation.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  <span className="sr-only">Fermer</span>
                  <XMarkIcon
                    aria-hidden="true"
                    className="size-5"
                    onClick={() => setIsErrorAlert(false)}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Alert>
    </>
  );
}
