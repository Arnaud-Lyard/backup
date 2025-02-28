'use client';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/common/Dropdown';
import { IApiAddresses } from '@/types/Api';
import {
  Button,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { MagnifyingGlassCircleIcon } from '@heroicons/react/20/solid';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/20/solid';
import { Fragment, useEffect, useState } from 'react';

export function Search() {
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

  // Fonction de gestion du changement de l'adresse (requête API à intégrer ici)
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

  return (
    <>
      <div className="flex justify-center py-8">
        {/* Conteneur avec bordure et légère ombre */}
        <div className="border border-gray-300 rounded-full flex">
          {/* Partie Desktop */}
          <PopoverGroup className={'flex'}>
            <Popover>
              {({ open }) => (
                <>
                  <PopoverButton
                    className={`hover:bg-slate-100 p-3 rounded-full text-gray-600 ${
                      open ? 'bg-slate-100' : ''
                    }`}
                  >
                    Lieu de l&apos;intervention
                  </PopoverButton>
                  <PopoverPanel
                    anchor="bottom start"
                    className="flex flex-col w-[465px] bg-white border-gray-300 shadow-md mt-5"
                  >
                    <Combobox
                      value={selectedAddress}
                      onChange={(address) => {
                        setSelectedAddress(address);
                      }}
                    >
                      <ComboboxInput
                        name="address"
                        className="w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-2 border border-zinc-950/10 data-[hover]:border-zinc-950/20 focus:outline-none"
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
                          className="absolute mt-1 max-h-60 w-[375px] overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-gray-300 focus:outline-none sm:text-sm"
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
                      open ? 'bg-slate-100' : ''
                    }`}
                  >
                    Date souhaitée
                  </PopoverButton>
                  <PopoverPanel
                    anchor={{ to: 'bottom start', offset: '-180px' }}
                    className="flex flex-col w-[465px] bg-white border-gray-300 shadow-md mt-5"
                  >
                    <a href="/analytics">Analytics</a>
                    <a href="/engagement">Engagement</a>
                    <a href="/security">Security</a>
                    <a href="/integrations">Integrations</a>
                  </PopoverPanel>
                </>
              )}
            </Popover>
          </PopoverGroup>

          <Button className="w-36 h-12 rounded-full bg-black text-white p-3">
            Rechercher
          </Button>

          {/* <Field>
              <Label>Adresse des travaux :</Label>
              <Combobox value={selected} onChange={setSelected}>
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus-within:ring-2 focus-within:ring-blue-500 sm:text-sm border hover:border-zinc-300">
                    <ComboboxInput
                      name="address"
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-2 border border-zinc-950/10 data-[hover]:border-zinc-950/20 focus:ring-blue-500 focus:outline-none"
                      displayValue={(address: any) => address?.name || ''}
                      onChange={(event) => setQuery(event.target.value)}
                      required={true}
                      placeholder="Lieu de l'intervention"
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </ComboboxButton>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                  >
                    <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-gray-300 focus:outline-none sm:text-sm">
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
                                      active ? 'text-white' : 'text-blue-600'
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
                </div>
              </Combobox>
            </Field> */}
          {/* Partie Mobile */}
        </div>
        {/* <DropdownSearch /> */}
      </div>
    </>
  );
}

// function DropdownSearch() {
//   return (
//     <div className="border border-gray-300 rounded-lg p-4 shadow-md mt-3">
//       {/* Partie Desktop */}

//       {/* Partie Mobile */}
//     </div>
//   );
// }
