'use client';
import { IApiAddresses } from '@/types/Api';
import {
  Button,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/20/solid';
import { Fragment, useEffect, useState } from 'react';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Search() {
  const today = startOfToday();
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<
    { id: string; name: string }[] | undefined
  >([]);
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));

  const fetchAddresses = async (searchTerm: string) => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ADDRESS_API_ENDPOINT}/search/?q=${searchTerm}&limit=2`
      );
      const data: IApiAddresses = await response.json();
      const results = data.features?.map((feature) => ({
        id: feature.properties.id,
        name: feature.properties.label,
      }));
      setAddresses(results);
    } catch (error) {
      console.error('Erreur lors de la récupération des adresses', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de recherche
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 3) {
        fetchAddresses(query);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  return (
    <>
      <div className="flex justify-center py-8 px-2 sm:px-0">
        {/* Conteneur avec bordure et légère ombre */}
        <div className="border border-slate-200 rounded-full flex">
          {/* Partie Desktop */}
          <PopoverGroup className={'flex'}>
            <Popover>
              {({ open }) => (
                <>
                  <PopoverButton
                    className={`transition duration-300 hover:bg-slate-100 p-3 rounded-full text-gray-600 ${
                      open
                        ? 'bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-opacity-75'
                        : 'focus:outline-none'
                    }`}
                  >
                    Lieu de l&apos;intervention
                  </PopoverButton>
                  <PopoverPanel
                    anchor="bottom start"
                    className="flex flex-col w-[465px] bg-white mt-5 px-2 sm:px-0"
                  >
                    <Combobox
                      value={selectedAddress}
                      onChange={(address) => {
                        setSelectedAddress(address);
                      }}
                    >
                      <ComboboxInput
                        name="address"
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-hidden  focus:border-slate-400
                        hover:border-slate-300 shadow-sm focus:shadow-sm"
                        displayValue={(address: any) => address?.name || ''}
                        onChange={(event) => setQuery(event.target.value)}
                        required={true}
                        placeholder="Entrer une adresse"
                        autoComplete="off"
                      />
                      <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </ComboboxButton>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                      >
                        <ComboboxOptions
                          anchor="bottom"
                          className="absolute mt-1 max-h-60 w-[465px] overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-gray-300 focus:outline-hidden sm:text-sm"
                        >
                          {loading ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                              Chargement...
                            </div>
                          ) : addresses?.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                              Aucune adresse trouvée.
                            </div>
                          ) : (
                            addresses?.map((address) => (
                              <ComboboxOption
                                key={address.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-900'
                                  }`
                                }
                                value={address}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {address.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active
                                            ? 'text-white'
                                            : 'text-blue-600'
                                        }`}
                                      >
                                        <CheckIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </ComboboxOption>
                            ))
                          )}
                        </ComboboxOptions>
                      </Transition>
                    </Combobox>
                  </PopoverPanel>
                </>
              )}
            </Popover>

            <Popover>
              {({ open }) => (
                <>
                  <PopoverButton
                    className={`hover:bg-slate-100 p-3 rounded-full text-gray-600 ${
                      open
                        ? 'bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-opacity-75'
                        : 'focus:outline-none'
                    }`}
                  >
                    Date souhaitée
                  </PopoverButton>
                  <PopoverPanel
                    anchor={{ to: 'bottom start', offset: '-180px' }}
                    className="flex flex-col w-[465px] bg-white mt-5 px-2 sm:px-0 max-[465px]:w-full"
                  >
                    <div className="">
                      <div className="mt-2 text-center p-2 border border-slate-200 rounded-md">
                        <div className="flex items-center text-gray-900">
                          <button
                            type="button"
                            onClick={previousMonth}
                            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Mois précédent</span>
                            <ChevronLeftIcon
                              className="size-5"
                              aria-hidden="true"
                            />
                          </button>
                          <div className="flex-auto text-sm font-semibold">
                            {format(firstDayCurrentMonth, 'MMMM yyyy', {
                              locale: fr,
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={nextMonth}
                            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Mois suivant</span>
                            <ChevronRightIcon
                              className="size-5"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
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
                          {days.map((day, dayIdx) => (
                            <div
                              key={day.toString()}
                              className={classNames(
                                dayIdx === 0 && colStartClasses[getDay(day)],
                                'py-1.5'
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                className={classNames(
                                  isEqual(day, selectedDay) && 'text-white',
                                  !isEqual(day, selectedDay) &&
                                    isToday(day) &&
                                    'text-red-500',
                                  !isEqual(day, selectedDay) &&
                                    !isToday(day) &&
                                    isSameMonth(day, firstDayCurrentMonth) &&
                                    'text-gray-900',
                                  !isEqual(day, selectedDay) &&
                                    !isToday(day) &&
                                    !isSameMonth(day, firstDayCurrentMonth) &&
                                    'text-gray-400',
                                  isEqual(day, selectedDay) &&
                                    isToday(day) &&
                                    'bg-red-500',
                                  isEqual(day, selectedDay) &&
                                    !isToday(day) &&
                                    'bg-gray-900',
                                  !isEqual(day, selectedDay) &&
                                    'hover:bg-gray-200',
                                  (isEqual(day, selectedDay) || isToday(day)) &&
                                    'font-semibold',
                                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                                )}
                              >
                                <time dateTime={format(day, 'yyyy-MM-dd')}>
                                  {format(day, 'd')}
                                </time>
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="mt-8 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Choisir
                        </button>
                      </div>
                    </div>
                  </PopoverPanel>
                </>
              )}
            </Popover>
          </PopoverGroup>

          <Button className="w-36 rounded-full bg-blue-600 text-white p-3">
            Rechercher
          </Button>
        </div>
      </div>
    </>
  );
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
