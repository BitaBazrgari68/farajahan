'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const BEAN_IMAGE = '/images/about/bean-4.png';

const beans = [
  {
    id: 'bean-a',
    position: 'left-[6%] top-[16%] h-14 w-14 md:h-24 md:w-24',
    floatDuration: 6,
    spinDuration: 11,
    delay: 0,
    distance: 16,
    rotate: 18,
    opacity: 'opacity-70',
    tilt: 0,
    flip: 1,
  },
  {
    id: 'bean-b',
    position: 'right-[10%] top-[10%] h-12 w-12 md:h-20 md:w-20',
    floatDuration: 8,
    spinDuration: 14,
    delay: 1.2,
    distance: 20,
    rotate: -22,
    opacity: 'opacity-60',
    tilt: 70,
    flip: -1,
  },
  {
    id: 'bean-c',
    position: 'right-[22%] bottom-[14%] h-16 w-16 md:h-28 md:w-28',
    floatDuration: 7,
    spinDuration: 12,
    delay: 0.6,
    distance: 14,
    rotate: 14,
    opacity: 'opacity-70',
    tilt: 140,
    flip: 1,
  },
];

export default function FloatingBeans() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {beans.map((bean) => (
        <motion.div
          key={bean.id}
          className={`absolute ${bean.position} ${bean.opacity}`}
          style={{ willChange: 'transform' }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -bean.distance],
                  rotate: [0, bean.rotate],
                }
          }
          transition={{
            y: {
              duration: bean.floatDuration,
              delay: bean.delay,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
            rotate: {
              duration: bean.spinDuration,
              delay: bean.delay,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: `rotate(${bean.tilt}deg) scaleX(${bean.flip})`,
            }}
          >
            <Image
              src={BEAN_IMAGE}
              alt=""
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}