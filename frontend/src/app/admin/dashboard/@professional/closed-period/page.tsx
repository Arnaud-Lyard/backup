'use client';

import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Dialog } from '@/components/common/Dialog/Dialog';
import { Input } from '@/components/common/Input';
import { Violation, Error } from '@/types/Error';
import { UnAvailibility } from '@/types/UnAvailability';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  parse,
  startOfToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

function classNames(...classes: (string | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

const colStartClasses: string[] = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

interface Day {
  date: Date;
  isToday: boolean;
}

interface Month {
  name: string;
  days: Day[];
}

export default function ClosedPeriod() {
  const today: Date = startOfToday();
  const [selectedRange, setSelectedRange] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>(
    format(today, 'MMM-yyyy')
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const [unAvailabilities, setUnavailabilities] = useState<UnAvailibility[]>(
    []
  );
  const [isErrorAlert, setIsErrorAlert] = useState(false);
  const [errors, setErrors] = useState<Violation[]>([]);
  const [successAlert, setSuccessAlert] = useState<{
    isSuccess: boolean;
    message: string;
  }>({
    isSuccess: false,
    message: '',
  });
  const [editingUnavailability, setEditingUnavailability] =
    useState<UnAvailibility | null>(null);

  const firstDayCurrentMonth: Date = parse(
    currentMonth,
    'MMM-yyyy',
    new Date()
  );
  const secondMonth: Date = add(firstDayCurrentMonth, { months: 1 });

  const months: Month[] = [firstDayCurrentMonth, secondMonth].map((month) => ({
    name: format(month, 'MMMM yyyy', { locale: fr }),
    days: eachDayOfInterval({ start: month, end: endOfMonth(month) }).map(
      (day) => ({
        date: day,
        isToday: isToday(day),
      })
    ),
  }));

  const selectDay = (date: Date): void => {
    if (selectedRange.length === 2) {
      setSelectedRange([date]);
    } else if (selectedRange.length === 1) {
      const sortedRange: Date[] = [selectedRange[0], date].sort(
        (a, b) => a.getTime() - b.getTime()
      );
      setSelectedRange(sortedRange);
    } else {
      setSelectedRange([date]);
    }
  };

  const previousMonth = (): void => {
    setCurrentMonth(
      format(add(firstDayCurrentMonth, { months: -1 }), 'MMM-yyyy')
    );
  };

  const nextMonth = (): void => {
    setCurrentMonth(
      format(add(firstDayCurrentMonth, { months: 1 }), 'MMM-yyyy')
    );
  };

  const handleClose = (): void => {
    setIsModalOpen(false);
    setSelectedRange([]);
  };

  const handleEdit = (unAvailability: UnAvailibility): void => {
    setSelectedRange([
      new Date(unAvailability.beginDate),
      new Date(unAvailability.endDate),
    ]);
    setEditingUnavailability(unAvailability);
    setIsModalOpen(true);
  };

  async function handleNewUnavailability() {
    const beginDateInput = document.getElementById(
      'beginDate'
    ) as HTMLInputElement | null;
    const endDateInput = document.getElementById(
      'endDate'
    ) as HTMLInputElement | null;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/unavailability/${
          editingUnavailability ? `edit/${editingUnavailability.id}` : 'new'
        }`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            beginDate: beginDateInput?.value
              ? format(new Date(beginDateInput.value), "yyyy-MM-dd'T'HH:mm:ss")
              : '',
            endDate: endDateInput?.value
              ? format(new Date(endDateInput.value), "yyyy-MM-dd'T'HH:mm:ss")
              : '',
          }),
        }
      );
      if (!response.ok) {
        const errorData: Error = await response.json();

        if (response.status === 422 && errorData.violations) {
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

      if (editingUnavailability) {
        setSuccessAlert({
          isSuccess: true,
          message:
            'Modification de la période de fermeture réalisée avec succès',
        });
      } else {
        setSuccessAlert({
          isSuccess: true,
          message: 'Ajout de la période de fermeture réalisée avec succès',
        });
      }
      handleUnavailabilites();
      handleClose();
    } catch (err) {
      console.error(err);
      setIsErrorAlert(true);
    } finally {
      setEditingUnavailability(null);
    }
  }

  async function handleUnavailabilites() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/unavailabilities/list`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      const data = await response.json();
      setUnavailabilities(data);
    } catch (err) {
      console.error(err);
    } finally {
    }
  }

  useEffect(() => {
    const beginDateInput = document.getElementById(
      'beginDate'
    ) as HTMLInputElement | null;
    const endDateInput = document.getElementById(
      'endDate'
    ) as HTMLInputElement | null;

    if (beginDateInput && endDateInput) {
      if (selectedRange.length === 2) {
        beginDateInput.value = format(selectedRange[0], 'yyyy-MM-dd');
        endDateInput.value = format(selectedRange[1], 'yyyy-MM-dd');
      } else if (selectedRange.length === 1) {
        beginDateInput.value = format(selectedRange[0], 'yyyy-MM-dd');
        endDateInput.value = '';
      }
    }
  }, [selectedRange]);

  useEffect(() => {
    if (session) {
      handleUnavailabilites();
    }
  }, [session]);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>
        Ajouter une période de fermeture
      </Button>
      <div className="-mx-4 mt-8 sm:-mx-0">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Périodes de fermeture
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Date de début
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Date de fin
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {unAvailabilities.map((unAvailability, index) => (
              <tr key={unAvailability.id}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                  {index + 1}
                  <dl className="font-normal lg:hidden">
                    <dt className="sr-only">Title</dt>
                    <dd className="mt-1 truncate text-gray-700">
                      {format(unAvailability.beginDate, 'dd/MM/yyyy')}
                    </dd>
                    <dt className="sr-only sm:hidden">Email</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">
                      {format(unAvailability.endDate, 'dd/MM/yyyy')}
                    </dd>
                  </dl>
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                  {format(unAvailability.beginDate, 'dd/MM/yyyy')}
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                  {format(unAvailability.endDate, 'dd/MM/yyyy')}
                </td>
                <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                  <Button onClick={() => handleEdit(unAvailability)}>
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog size="4xl" open={isModalOpen} onClose={handleClose}>
        <div className="">
          <div className="flex justify-end">
            <Button onClick={handleClose} className="" aria-label="Fermer">
              <XMarkIcon fill="#fff" className="size-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="relative grid grid-cols-1 gap-x-14 md:grid-cols-2 mt-4">
            <button
              onClick={previousMonth}
              className="absolute -left-1.5 -top-1 p-1.5 text-gray-400 hover:text-gray-500"
            >
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>
            <button
              onClick={nextMonth}
              className="absolute -right-1.5 -top-1 p-1.5 text-gray-400 hover:text-gray-500"
            >
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
            {months.map((month, monthIdx) => (
              <section
                key={monthIdx}
                className={classNames(
                  monthIdx === 1 && 'hidden md:block',
                  'text-center'
                )}
              >
                <h2 className="text-sm font-semibold text-gray-900">
                  {month.name}
                </h2>
                <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500">
                  <div>L</div>
                  <div>M</div>
                  <div>M</div>
                  <div>J</div>
                  <div>V</div>
                  <div>S</div>
                  <div>D</div>
                </div>
                <div className="grid grid-cols-7 mt-2 text-sm">
                  {month.days.map((day, dayIdx) => {
                    const isSelected = selectedRange.some(
                      (d) => d.getTime() === day.date.getTime()
                    );
                    const isInRange =
                      selectedRange.length === 2 &&
                      day.date > selectedRange[0] &&
                      day.date < selectedRange[1];

                    return (
                      <div
                        key={day.date.toString()}
                        className={classNames(
                          dayIdx === 0 && colStartClasses[getDay(day.date)],
                          'py-1.5'
                        )}
                      >
                        <button
                          onClick={() => selectDay(day.date)}
                          className={classNames(
                            isSelected && 'bg-black text-white',
                            isInRange && 'bg-gray-200',
                            !isSelected && isToday(day.date) && 'text-red-500',
                            'mx-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-300 text-gray-900'
                          )}
                        >
                          <time dateTime={format(day.date, 'yyyy-MM-dd')}>
                            {format(day.date, 'd')}
                          </time>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <form className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
            <div className="text-gray-600">
              <label htmlFor="beginDate">Date de début</label>
              <Input id="beginDate" type="date" readOnly />
            </div>
            <div className="text-gray-600">
              <label htmlFor="endDate">Date de fin</label>
              <Input id="endDate" type="date" readOnly required />
            </div>
            <div className="flex justify-center items-end">
              <Button onClick={() => handleNewUnavailability()}>Valider</Button>
            </div>
          </form>
        </div>
      </Dialog>
      <Alert
        size="md"
        open={successAlert.isSuccess}
        onClose={() =>
          setSuccessAlert({
            isSuccess: false,
            message: '',
          })
        }
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
                {successAlert.message}
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
                    onClick={() =>
                      setSuccessAlert({
                        isSuccess: false,
                        message: '',
                      })
                    }
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
    </div>
  );
}
