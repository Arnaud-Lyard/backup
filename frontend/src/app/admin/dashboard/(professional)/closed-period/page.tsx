'use client';

import { Button } from '@/components/common/Button';
import { Dialog } from '@/components/common/Dialog/Dialog';
import { Input } from '@/components/common/Input';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
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

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>
        Ajouter une période de fermeture
      </Button>
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
              <Input id="endDate" type="date" readOnly />
            </div>
            <div className="flex justify-center items-end">
              <Button onClick={() => setIsModalOpen(false)}>Valider</Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
