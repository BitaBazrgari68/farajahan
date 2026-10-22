'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryCarousel({
  images,
  rtl = false,
  previousLabel,
  nextLabel,
}) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const total = images.length;
  const dir = rtl ? -1 : 1;

  const goTo = (index) => setCurrent(((index % total) + total) % total);
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const diff = event.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(diff) < 45) return;

    const forward = rtl ? diff > 0 : diff < 0;

    if (forward) {
      next();
    } else {
      prev();
    }
  };

  const NextIcon = rtl ? ChevronLeft : ChevronRight;
  const PrevIcon = rtl ? ChevronRight : ChevronLeft;

  const buttonBase =
    'absolute top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-coffee-deep/70 text-gold-light backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-gold hover:text-coffee-deep';

  return (
    <div
      dir="ltr"
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative mx-auto flex h-[260px] w-full items-center justify-center overflow-hidden sm:h-[420px]">
        {images.map((image, index) => {
          const offset = (index - current + total) % total;

          let transform = 'translateX(0) scale(0.6)';
          let opacity = 0;
          let zIndex = 0;
          let isCenter = false;

          if (offset === 0) {
            transform = 'translateX(0) scale(1)';
            opacity = 1;
            zIndex = 30;
            isCenter = true;
          } else if (offset === 1) {
            transform = `translateX(${dir * 78}%) scale(0.8)`;
            opacity = 0.55;
            zIndex = 20;
          } else if (offset === total - 1) {
            transform = `translateX(${-dir * 78}%) scale(0.8)`;
            opacity = 0.55;
            zIndex = 20;
          }

          return (
            <button
              key={image.src}
              type="button"
              tabIndex={isCenter ? -1 : opacity > 0 ? 0 : -1}
              aria-label={image.alt}
              onClick={() => {
                if (!isCenter) goTo(index);
              }}
              className={`absolute h-full w-[72%] overflow-hidden rounded-3xl border bg-coffee-dark sm:w-[54%] ${
                isCenter
                  ? 'cursor-default border-gold/70 shadow-[0_25px_60px_rgba(197,147,76,0.25)]'
                  : 'cursor-pointer border-white/10'
              }`}
              style={{
                transform,
                opacity,
                zIndex,
                pointerEvents: opacity === 0 ? 'none' : 'auto',
                transition: 'all 800ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 54vw, 72vw"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={next}
        aria-label={nextLabel}
        className={`${buttonBase} ${
          rtl ? 'left-1 md:left-6' : 'right-1 md:right-6'
        }`}
      >
        <NextIcon size={20} />
      </button>

      <button
        type="button"
        onClick={prev}
        aria-label={previousLabel}
        className={`${buttonBase} ${
          rtl ? 'right-1 md:right-6' : 'left-1 md:left-6'
        }`}
      >
        <PrevIcon size={20} />
      </button>

      <div className="mt-6 flex items-center justify-center gap-2">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current
                ? 'w-8 bg-gold'
                : 'w-2 bg-white/25 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}