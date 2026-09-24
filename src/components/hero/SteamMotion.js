'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
export default function SteamMotion() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-20
      "
      aria-hidden="true"
    >
      <motion.div
        className="
          absolute
          left-72
          top-[20%]
          h-[38%]
          w-[30%]
          -translate-x-1/2
        "
        animate={{
          x: ['-50%', '-47%', '-53%', '-48%', '-50%'],
          y: [0, -4, -9, -14, -18],
          scale: [1, 1.02, 0.98, 1.03, 1.05],
          rotate: [0, 1.5, -1.5, 1, 0],
          opacity: [0.35, 0.55, 0.48, 0.58, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Image
          src="/images/hero/steam/steam-1.png"
          alt=""
          fill
          sizes="160px"
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}