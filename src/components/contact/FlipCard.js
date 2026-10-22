'use client';

import { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';

export default function FlipCard({
  title,
  subtitle,
  person,
  phone,
}) {
  const [flipped, setFlipped] = useState(false);

  // روی دستگاه‌های لمسی ماوس وجود ندارد، پس با لمس کارت می‌چرخد
  const handleClick = () => {
    if (window.matchMedia('(hover: none)').matches) {
      setFlipped((current) => !current);
    }
  };

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={title}
      onClick={handleClick}
      className="group relative h-44 cursor-pointer outline-none [perspective:1000px]"
    >
      <div
        className={`
          relative h-full w-full
          transition-transform duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          motion-reduce:transition-none
          [transform-style:preserve-3d]
          group-hover:[transform:rotateY(180deg)]
          group-has-[:focus-visible]:[transform:rotateY(180deg)]
          ${flipped ? '[transform:rotateY(180deg)]' : ''}
        `}
      >
        {/* روی کارت */}
        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center gap-3
            rounded-3xl
            border border-white/10
            bg-gradient-to-br from-white/[0.12] to-white/[0.03]
            p-5 text-center
            shadow-[0_20px_50px_rgba(0,0,0,0.45)]
            backdrop-blur-md
            transition-shadow duration-500
            group-hover:shadow-[0_25px_60px_rgba(197,147,76,0.2)]
            [backface-visibility:hidden]
          "
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <MapPin size={20} strokeWidth={1.8} />
          </div>

          <h3 className="text-base font-bold leading-7 text-white">
            {title}
          </h3>

          {subtitle && (
            <p className="-mt-2 text-xs text-cream/60">
              {subtitle}
            </p>
          )}

          <span className="h-px w-10 bg-gold/60" />
        </div>

        {/* پشت کارت */}
        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center gap-3
            rounded-3xl
            border border-gold/40
            bg-gradient-to-br from-gold/25 to-white/[0.04]
            p-5 text-center
            shadow-[0_25px_60px_rgba(197,147,76,0.2)]
            backdrop-blur-md
            [backface-visibility:hidden]
            [transform:rotateY(180deg)]
          "
        >
          <h3 className="text-base font-bold leading-7 text-white">
            {person}
          </h3>

          <a
            href={`tel:${phone}`}
            dir="ltr"
            aria-label={`${person} ${phone}`}
            onClick={(event) => event.stopPropagation()}
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-gold/50
              bg-coffee-deep/60
              px-5 py-2.5
              text-base font-bold tracking-wide text-gold-light
              transition-colors duration-200
              hover:bg-gold hover:text-coffee-deep
            "
          >
            <Phone size={16} strokeWidth={2} />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}