import { Spinner } from '@/components/common/Spinner';
import { ITestimonial } from '@/types/Testimonial';
import { StarIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

export function Testimonial({
  testimonials,
}: {
  testimonials: ITestimonial[] | undefined;
}) {
  if (!testimonials || testimonials.length === 0) {
    return <Spinner />;
  }

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {testimonials.map((testimonial) => {
            return (
              <div
                key={testimonial.id}
                className="flex flex-col pb-10 sm:pb-16 lg:pb-0 lg:pr-8 xl:pr-20"
              >
                <p className="sr-only">{testimonial.rating} étoiles sur 5</p>
                <div className="flex gap-x-1 text-indigo-600">
                  {Array.from({ length: testimonial.rating }).map(
                    (_, index) => (
                      <StarIcon
                        key={index}
                        aria-hidden="true"
                        className="size-5 flex-none"
                      />
                    )
                  )}
                </div>
                <figure className="mt-10 flex flex-auto flex-col justify-between">
                  <blockquote className="text-lg/8 text-gray-900">
                    <p>{testimonial.description}</p>
                  </blockquote>
                  <figcaption className="mt-10 flex items-center gap-x-6">
                    <Image
                      alt=""
                      src="/users/erica.jpg"
                      className="size-14 rounded-full bg-gray-50"
                      width={20}
                      height={20}
                    />
                    <div className="text-base">
                      <div className="font-semibold text-gray-900">
                        {testimonial.owner.firstname}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
