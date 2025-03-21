'use client';
import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge/Badge';
import { Divider } from '@/components/common/Divider/Divider';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/common/Dropdown/Dropdown';
import { Heading } from '@/components/common/Heading/Heading';
import { Spinner } from '@/components/common/Spinner';
import { Text } from '@/components/common/Text';
import { EllipsisVerticalIcon, StarIcon } from '@heroicons/react/16/solid';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface Error {
  status: number;
  message: string;
  violations?: Violation[];
}

export interface Violation {
  property: string;
  message: string;
}

export interface Testimonial {
  id: number;
  description: string;
  rating: number;
  isActive: boolean;
  owner: {
    firstname: string;
  };
}

export default function TestimonialList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { data: session } = useSession();
  const [errors, setErrors] = useState<Error | null>(null);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [isErrorAlert, setIsErrorAlert] = useState(false);

  const handleTestimonials = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/testimonials`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      const data: Testimonial[] = await response.json();
      setTestimonials(data);
      return data;
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  async function activeTestimonial(id: number) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/testimonial/active/${id}`,
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
      handleTestimonials();
    }
  }

  useEffect(() => {
    if (session) {
      handleTestimonials();
    }
  }, [session]);

  if (!testimonials || testimonials.length === 0) {
    return <Spinner />;
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Liste des avis</Heading>
        </div>
      </div>
      <ul className="mt-10">
        {testimonials.map((testimonial, index) => (
          <li key={testimonial.id}>
            <Divider soft={index > 0} />
            <div className="flex items-center justify-between">
              <div key={testimonial.id} className="flex gap-6 py-6">
                <div className="space-y-1.5">
                  <div className="text-base/6 font-semibold">
                    <Text>{testimonial.owner.firstname}</Text>
                  </div>
                  <div className="text-xs/6 text-zinc-500">
                    <div className="flex items-center gap-1">
                      {(() => {
                        const stars = [];
                        for (let i = 0; i < testimonial.rating; i++) {
                          stars.push(
                            <StarIcon
                              key={i}
                              className="text-yellow-500 w-4 h-4"
                            />
                          );
                        }
                        return stars;
                      })()}
                    </div>
                    {testimonial.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  className="max-sm:hidden"
                  color={testimonial.isActive === true ? 'lime' : 'zinc'}
                >
                  {testimonial.isActive === true ? 'Actif' : 'Inactif'}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="Plus d'options">
                    <EllipsisVerticalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem
                      onClick={() => {
                        activeTestimonial(testimonial.id);
                      }}
                    >
                      {testimonial.isActive === true ? 'Désactiver' : 'Activer'}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
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
