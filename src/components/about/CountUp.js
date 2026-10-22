'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export default function CountUp({
  to,
  from = 0,
  duration = 2000,
  suffix = '',
  locale = 'fa',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();

  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    if (reduceMotion) {
      setValue(to);
      return;
    }

    let frameId;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(from + (to - from) * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [isInView, reduceMotion, from, to, duration]);

  const formatted = new Intl.NumberFormat(
    locale === 'fa' ? 'fa-IR' : 'en-US',
    { useGrouping: false }
  ).format(Math.round(value));

  return (
    <span ref={ref} dir="ltr">
      {formatted}
      {suffix}
    </span>
  );
}