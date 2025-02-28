'use client';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Divider } from '@/components/common/Divider/Divider';
import { Heading, Subheading } from '@/components/common/Heading/Heading';
import { Input } from '@/components/common/Input/Input';
import { Text } from '@/components/common/Text/Text';
import { Textarea } from '@/components/common/Textarea/Textarea';
import { HeaderLayout } from '@/components/layouts/HeaderLayout';
import { IApiAddresses } from '@/types/Api';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from '@headlessui/react';
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronUpDownIcon,
  PhotoIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
import { useState, Fragment, useEffect } from 'react';

export interface Company {
  id: string;
  name: string;
  description: string;
  address: string;
}

export interface Error {
  status: number;
  message: string;
  violations: Violation[];
}

export interface Violation {
  property: string;
  message: string;
}
export default function OnBoarding() {
  const [errors, setErrors] = useState<Error | null>(null);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [isErrorAlert, setIsErrorAlert] = useState(false);
  const [addresses, setAddresses] = useState<
    { id: string; name: string }[] | undefined
  >([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null
  );
  const [query, setQuery] = useState('');

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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 3) {
        fetchAddresses(query);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setErrors(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/onboarding`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        const errorData: Error = await response.json();

        if (
          response.status === 400 ||
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
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <>
      <HeaderLayout></HeaderLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <form
          method="post"
          onSubmit={handleSubmit}
          className="mx-auto max-w-4xl"
          encType="multipart/form-data"
        >
          <Heading>Mon entreprise</Heading>
          <Divider className="my-10 mt-6" />

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Subheading>Nom de l&apos;entreprise</Subheading>
              <Text>
                Cette information sera affiché sur votre profil publique.
              </Text>
            </div>
            <div>
              <Input
                aria-label="Nom de l'entreprise"
                name="companyname"
                placeholder="Nom de l'entreprise"
                required={true}
              />
            </div>
          </section>

          <Divider className="my-10" soft />

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Subheading>Description</Subheading>
              <Text>
                Cette information sera affiché sur votre profil publique.
              </Text>
            </div>
            <div>
              <Textarea
                aria-label="Description"
                name="description"
                placeholder="Description"
                required={true}
              />
            </div>
          </section>

          <Divider className="my-10" soft />

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Subheading>Adresse e-mail</Subheading>
              <Text>
                L&apos;adresse à laquelle les clients peuvent vous contacter.
              </Text>
            </div>
            <div className="space-y-4">
              <Input
                type="email"
                aria-label="Adresse e-mail"
                name="email"
                placeholder="Votre adresse e-mail"
                disabled={true}
                defaultValue={session?.user?.email}
                required={true}
              />
            </div>
          </section>

          <Divider className="my-10" soft />

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Subheading>Adresse postale</Subheading>
              <Text>
                L&apos;adresse à laquelle votre entreprise est enregistrée.
              </Text>
            </div>
            <div>
              <Combobox value={selected} onChange={setSelected}>
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus-within:ring-2 focus-within:ring-blue-500 sm:text-sm border hover:border-zinc-300">
                    <ComboboxInput
                      name="address"
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-2 border border-zinc-950/10 data-[hover]:border-zinc-950/20 focus:ring-blue-500 focus:outline-none"
                      displayValue={(address: any) => address?.name || ''}
                      onChange={(event) => setQuery(event.target.value)}
                      required={true}
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
            </div>
          </section>

          <Divider className="my-12" soft />

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Subheading>Logo de l&apos;entreprise</Subheading>
              <Text>
                Cette information sera affiché sur votre profil publique.
              </Text>
            </div>
            <div>
              <div className="col-span-full">
                <div
                  className="mt-2 flex justify-center rounded-lg border border-zinc-950/10 px-6 py-10 transition duration-200 ease-in-out hover:border-zinc-950/20 hover:shadow-sm"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <PhotoIcon
                      aria-hidden="true"
                      className="mx-auto size-12 text-gray-300"
                    />
                    <div className="mt-4 flex text-sm/6 text-gray-600">
                      <label
                        htmlFor="logo"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                      >
                        <span>Télécharger un fichier</span>
                        <input
                          id="logo"
                          name="logo"
                          type="file"
                          className="sr-only"
                          required={true}
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">ou déposer ici.</p>
                    </div>
                    {fileName && (
                      <p className="mt-2 text-sm text-gray-700">
                        Fichier : {fileName}
                      </p>
                    )}
                    <p className="text-xs/5 text-gray-600">
                      Png, Jpg, Jpeg, Webp jusqu&apos;à 1 MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Divider className="my-12" soft />

          <div className="flex justify-end gap-4">
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
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
                Votre demande est en attente de validation.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
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
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
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
