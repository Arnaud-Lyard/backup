'use client';

import { useState, Fragment, useEffect } from 'react';
import { DialogTitle } from '@/components/common/Dialog/Dialog';
import { Dialog } from '@/components/common/Dialog/Dialog';
import { Button } from '@/components/common/Button';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
import { Error, Violation } from '@/types/Error';
import { Alert } from '@/components/common/Alert';
import {
  ClosedDays,
  Availability as AvailabilityType,
} from '@/types/Availability';

export default function Availability() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [availabilities, setAvailabilities] = useState<AvailabilityType>();
  const [selectedDay, setSelectedDay] = useState<string>('Lundi');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [errors, setErrors] = useState<Violation[]>([]);
  const [isErrorAlert, setIsErrorAlert] = useState(false);
  const [isSuccessAlert, setIsSuccessAlert] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [dayToClose, setDayToClose] = useState<string | null>(null);
  const [dayToOpen, setDayToOpen] = useState<string | null>(null);
  const [isConfirmClose, setIsConfirmClose] = useState(false);
  const [isConfirmRemove, setIsConfirmRemove] = useState(false);
  const [availabilityIdToRemove, setAvailabilityIdToRemove] = useState<
    number | null
  >();

  const { data: session } = useSession();

  const days: string[] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  async function handleNewAvailability(
    day: string,
    start: string,
    end: string
  ) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/availability/new`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ day, startTime: start, endTime: end }),
        }
      );
      if (!response.ok) {
        const errorData: Error = await response.json();

        if (
          (response.status === 422 && errorData.violations) ||
          (response.status === 400 && errorData.violations)
        ) {
          const fieldErrors = errorData.violations.map(
            (violation: Violation) => ({
              property: violation.property,
              message: violation.message,
            })
          );
          setErrors(fieldErrors);
          setIsErrorAlert(true);
        }
        return;
      }

      handleAvailabilites();
      setIsOpen(false);
      setIsSuccessAlert(true);
    } catch (err) {
      console.error(err);
      setIsErrorAlert(true);
    } finally {
    }
  }

  async function handleAvailabilites() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/availabilities/list`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data: AvailabilityType = await response.json();
      setAvailabilities(data);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }

  const confirmCloseDay = async () => {
    if (!dayToClose) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/availability/close`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ day: dayToClose }),
        }
      );
      handleAvailabilites();
    } catch (err) {
      console.error('Erreur fermeture jour:', err);
    } finally {
      setIsConfirmClose(false);
      setDayToClose(null);
    }
  };

  const confirmOpenDay = async () => {
    if (!dayToOpen) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/availability/open`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ day: dayToOpen }),
        }
      );
      handleAvailabilites();
    } catch (err) {
      console.error('Erreur ouverture jour:', err);
    } finally {
      setIsConfirmOpen(false);
      setDayToOpen(null);
    }
  };

  const toggleClosed = (day: string, isClosed: boolean) => {
    if (isClosed) {
      setIsConfirmOpen(true);
      setDayToOpen(day);
      return;
    }
    setDayToClose(day);
    setIsConfirmClose(true);
  };

  const removeAvailability = (id: number) => {
    setAvailabilityIdToRemove(id);
    setIsConfirmRemove(true);
  };

  const confirmRemoveAvailability = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/availability/delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: availabilityIdToRemove }),
        }
      );
      handleAvailabilites();
    } catch (err) {
      console.error('Erreur suppression jour:', err);
    } finally {
      setIsConfirmRemove(false);
      setAvailabilityIdToRemove(null);
    }
  };

  useEffect(() => {
    if (session) {
      handleAvailabilites();
    }
  }, [session]);

  return (
    <>
      <div className="flex h-full flex-col">
        <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
          <h1 className="text-base font-semibold text-gray-900">
            Mes horaires d'ouverture
          </h1>
        </header>

        <div className="p-4">
          {days.map((day) => {
            const isClosed =
              availabilities?.[day]?.some((slot) => slot.closed) || false;
            return (
              <div key={day} className="mb-4 border-b pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{day}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={isClosed}
                      onChange={() => toggleClosed(day, isClosed)}
                    />
                    Fermé
                  </label>
                </div>
                {!isClosed &&
                  availabilities &&
                  availabilities[day].map((availability, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mt-2"
                    >
                      <span>
                        {availability.start} - {availability.end}
                      </span>
                      <button
                        className="text-red-500 text-sm"
                        onClick={() => removeAvailability(availability.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                {!isClosed && (
                  <button
                    className="text-blue-600 text-sm mt-2"
                    onClick={() => {
                      setSelectedDay(day);
                      setIsOpen(true);
                    }}
                  >
                    + Nouvelle plage horaire
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALE */}
      <Dialog size="xl" open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex justify-end">
          <Button
            onClick={() => setIsOpen(false)}
            className=""
            aria-label="Fermer"
          >
            <XMarkIcon fill="#fff" className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <DialogTitle className="text-lg font-semibold">
          Ajouter un horaire pour {selectedDay}
        </DialogTitle>
        <div className="mt-4">
          <label className="block text-sm font-medium">Heure de début</label>
          <input
            type="time"
            className="w-full mt-1 p-2 border rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Heure de fin</label>
          <input
            type="time"
            className="w-full mt-1 p-2 border rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            className="mr-2 px-4 py-2 text-sm text-gray-700 border rounded"
            onClick={() => setIsOpen(false)}
          >
            Annuler
          </Button>
          <Button
            color="blue"
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded"
            onClick={async () => {
              await handleNewAvailability(selectedDay, startTime, endTime);
            }}
          >
            Ajouter
          </Button>
        </div>
      </Dialog>
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
                Le créneau horaire a bien été ajouté.
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
                Il y a eu {errors.length} erreur{errors.length > 1 ? 's' : ''}{' '}
                lors de l&apos;envoi du formulaire
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  {errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
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
      {/* MODALE */}
      <Dialog
        size="md"
        open={isConfirmClose}
        onClose={() => setIsConfirmClose(false)}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold">Confirmer la fermeture</h2>
          <p className="mt-2 text-sm text-gray-600">
            Êtes-vous sûr de vouloir fermer <strong>{dayToClose}</strong> ?
            Toutes les disponibilités de cette journée seront supprimées.
          </p>
          <div className="mt-4 flex justify-end">
            <Button
              className="mr-2 px-4 py-2 text-sm text-gray-700 border rounded"
              onClick={() => setIsConfirmClose(false)}
            >
              Annuler
            </Button>
            <Button
              color="red"
              className="px-4 py-2 text-sm text-white bg-red-600 rounded"
              onClick={confirmCloseDay}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Dialog>
      <Dialog
        size="md"
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold">Confirmer l'ouverture</h2>
          <p className="mt-2 text-sm text-gray-600">
            Êtes-vous sûr de vouloir ouvrir <strong>{dayToClose}</strong> ?
          </p>
          <div className="mt-4 flex justify-end">
            <Button
              className="mr-2 px-4 py-2 text-sm text-gray-700 border rounded"
              onClick={() => setIsConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              color="red"
              className="px-4 py-2 text-sm text-white bg-green-600 rounded"
              onClick={confirmOpenDay}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Dialog>
      <Dialog
        size="md"
        open={isConfirmRemove}
        onClose={() => setIsConfirmRemove(false)}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold">Confirmer l'ouverture</h2>
          <p className="mt-2 text-sm text-gray-600">
            Êtes-vous sûr de vouloir supprimer cette plage horaire ?
          </p>
          <div className="mt-4 flex justify-end">
            <Button
              className="mr-2 px-4 py-2 text-sm text-gray-700 border rounded"
              onClick={() => setIsConfirmRemove(false)}
            >
              Annuler
            </Button>
            <Button
              color="red"
              className="px-4 py-2 text-sm text-white bg-green-600 rounded"
              onClick={() => confirmRemoveAvailability()}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
