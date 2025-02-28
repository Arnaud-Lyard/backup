'use client';
import { Divider } from '@/components/common/Divider';
import { Heading, Subheading } from '@/components/common/Heading';
import { Text } from '@/components/common/Text';
import { Textarea } from '@/components/common/Textarea';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';

export interface Error {
  status: number;
  message: string;
  violations?: Violation[];
}

export interface Violation {
  property: string;
  message: string;
}

export default function Testimonial() {
  const [errors, setErrors] = useState<Error | null>(null);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [isErrorAlert, setIsErrorAlert] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      const payload = {
        description: formData.get('description'),
        rating: formData.get('rating'),
      };

      setErrors(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/professional/testimonial/post`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(payload),
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
    }
  };
  return (
    <>
      <form method="post" onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <Heading>Déposer un avis</Heading>
        <Divider className="my-10 mt-6" />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Notation</Subheading>
            <Text>Donner une note sur 5</Text>
          </div>
          <div>
            <div className="stars">
              <input type="radio" required name="rating" value="1" />
              <input type="radio" required name="rating" value="2" />
              <input type="radio" required name="rating" value="3" />
              <input type="radio" required name="rating" value="4" />
              <input type="radio" required name="rating" value="5" />
              <i></i>
            </div>
          </div>
        </section>

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Avis</Subheading>
            <Text>Votre avis sera affiché après validation.</Text>
          </div>
          <div>
            <Textarea
              aria-label="Votre avis"
              name="description"
              placeholder="Votre avis"
              required={true}
              rows={5}
            />
          </div>
        </section>

        <Divider className="my-10" soft />

        <div className="flex justify-end gap-4">
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
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
                Votre avis a été soumis et sera affiché après validation.
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
