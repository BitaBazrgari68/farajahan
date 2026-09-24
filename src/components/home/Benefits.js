'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useInView } from 'motion/react';
import { useRef } from 'react';

const benefits = [
  {
    id: 'quality',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-12 w-12"
        aria-hidden="true"
      >
        <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'freshRoast',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-12 w-12"
        aria-hidden="true"
      >
        <path d="M12 21c4.5-2.2 7-5.7 7-10.5C19 7 16.5 4 12 3c-4.5 1-7 4-7 7.5C5 15.3 7.5 18.8 12 21z" />
        <path d="M12 7v10" />
        <path d="M8.5 10.5c1.2.8 2.4 1.2 3.5 1.2s2.3-.4 3.5-1.2" />
      </svg>
    ),
  },
  {
    id: 'shipping',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-12 w-12"
        aria-hidden="true"
      >
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
      </svg>
    ),
  },
];

export default function Benefits() {
  const locale = useLocale();
  const t = useTranslations('benefits');
  const isRTL = locale === 'fa' || locale === 'ar';

  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.45,
  });

  return (
    <section
      ref={sectionRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className=" px-4 py-10 md:px-6 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="hidden md:flex absolute left-0 right-0 top-1/3 -translate-y-1/2 border-t-2 border-dashed border-gold" />


        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">

          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`group flex flex-col items-center text-center transition-all duration-700 ease-out ${isInView
                ? 'translate-y-0 opacity-100'
                : 'translate-y-5 opacity-0'
                }`}
              style={{
                transitionDelay: `${index * 150}ms`,
              }}
            >
              <div
                className={`p-3 shrink-0 rounded-full bg-white ${index === 1
                    ? 'border-t-2 border-dashed border-gold'
                    : 'border-b-2 border-dashed border-gold'
                  }`}
              >
                {/* Circle */}
                <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full  text-gold shadow-[-6px_10px_15px_0_#0000001a] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_14px_35px_rgba(0,0,0,0.11)]">
                  <div className="flex items-center justify-center text-gold transition-transform duration-300 group-hover:scale-110">
                    {benefit.icon}
                  </div>
                </div>
              </div>
              {/* Text */}
              <div className="mt-5 max-w-[330px] px-2">
                <h3 className="text-base font-bold text-coffee-dark md:text-[17px]">
                  {t(`${benefit.id}.title`)}
                </h3>

                <p className="mt-3 text-sm leading-7 text-text-muted md:text-[14px]">
                  {t(`${benefit.id}.description`)}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}