'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SteamMotion from '@/components/hero/SteamMotion';
/* ============================================================
   HERO ASSETS
============================================================ */

const journeySteps = [
  {
    id: 'arrival',
    image: '/images/hero/steps/coffee-arrival.webp',
    number: '01',
  },
  {
    id: 'roasting',
    image: '/images/hero/steps/coffee-roasting.webp',
    number: '02',
  },
  {
    id: 'packaging',
    image: '/images/hero/steps/coffee-packaging.webp',
    number: '03',
  },
  {
    id: 'shopping',
    image: '/images/hero/steps/online-shopping.webp',
    number: '04',
  },
  {
    id: 'shipping',
    image: '/images/hero/steps/shipping.webp',
    number: '05',
  },
];
const dots = [
  { deg: 18, color: '#a77b43' },
  { deg: 72, color: '#d4af37' },
  { deg: 130, color: '#8b5e34' },
  { deg: 205, color: '#e0c084' },
  { deg: 300, color: '#6b4423' },
];

/* ============================================================
   JOURNEY LABELS
============================================================ */

const journeyLabels = {
  fa: {
    arrival: 'ورود',
    roasting: 'رُست',
    packaging: 'بسته‌بندی',
    shopping: 'خرید',
    shipping: 'ارسال',
  },

  en: {
    arrival: 'Arrival',
    roasting: 'Roasting',
    packaging: 'Packaging',
    shopping: 'Shopping',
    shipping: 'Shipping',
  },

  ar: {
    arrival: 'الوصول',
    roasting: 'التحميص',
    packaging: 'التغليف',
    shopping: 'الشراء',
    shipping: 'الشحن',
  },
};

/* ============================================================
   JOURNEY POSITIONS
============================================================ */

const journeyPositions = [
  {
    ...journeySteps[0],
    position: 'left-1/2 top-[12%] -translate-x-1/2',
  },

  {
    ...journeySteps[1],
    position: 'right-[4%] top-[32%]',
  },

  {
    ...journeySteps[2],
    position: 'right-[16%] bottom-[12%]',
  },

  {
    ...journeySteps[3],
    position: 'left-[16%] bottom-[12%]',
  },

  {
    ...journeySteps[4],
    position: 'left-[4%] top-[32%]',
  },
];

/* ============================================================
   IMAGE REVEAL
============================================================ */

const imageVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 15,
  },

  visible: (index) => ({
    opacity: 1,
    scale: 1,
    y: 0,

    transition: {
      delay: 0.45 + index * 0.16,
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ============================================================
   CENTER IMAGE
============================================================ */

const centerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.88,
    y: 20,
  },

  visible: {
    opacity: 1,
    scale: 1,
    y: 0,

    transition: {
      duration: 1.2,
      delay: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ============================================================
   HERO
============================================================ */

export default function Hero() {
  const locale = useLocale();
  const t = useTranslations('hero');

  const isRTL = locale === 'fa' || locale === 'ar';

  const labels = journeyLabels[locale] || journeyLabels.en;

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="
        relative
        isolate
        overflow-hidden

        h-[calc(100svh-76px)]

        bg-[#f5ecdc]
      "
    >
      {/* =====================================================
          HERO BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden
        "
      >
        <Image
          src="/images/hero/bg-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            h-full
            w-full
            object-fill
          "
        />
      </div>

      {/* =====================================================
          BACKGROUND EFFECTS
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
        "
      >
        {/* Soft light */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_65%_48%,rgba(255,255,255,0.38),transparent_42%)]
          "
        />

        {/* Subtle warm glow */}

        <div
          className="
            absolute
            right-[-15%]
            top-[-20%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#c59a5a]/10
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            bottom-[-20%]
            left-[-15%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-[#6b4930]/5
            blur-[100px]
          "
        />
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          w-full
          max-w-[1600px]
          items-center
          px-5
          py-10
          sm:px-8
          md:px-10
          lg:px-12
          xl:px-16
        "
      >
        <div
          className="
            grid
            w-full
            items-center
            gap-8
            lg:grid-cols-[0.85fr_1.15fr]
            lg:gap-4
            xl:grid-cols-[0.82fr_1.18fr]
            xl:gap-8
          "
        >
          {/* =================================================
              LEFT — TEXT
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: isRTL ? 40 : -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`
              relative
              z-30
              w-full
              max-w-[570px]

              ${isRTL
                ? 'lg:justify-self-start lg:text-right'
                : 'lg:justify-self-end lg:text-left'
              }

              
            `}
          >
            {/* Eyebrow */}

            <motion.span
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.8,
              }}
              className="
                mb-4
                block
                text-sm
                font-medium
                tracking-[0.18em]
                text-[#9f7238]
                md:text-base
              "
            >
              {t('eyebrow')}
            </motion.span>

            {/* Title */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                text-4xl
                font-semibold
                leading-[1.35]
                text-[#432817]
${isRTL ? 'text-right' : 'text-left'}
                sm:text-5xl

                lg:text-[3.7rem]
                lg:leading-[1.3]

                xl:text-[4.1rem]
              "
            >
              {t('titleLine1')}
              <br />
              {t('titleLine2')}
            </motion.h1>

            {/* Description */}

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.45,
                duration: 0.9,
              }}
              className="
                mx-auto
                mt-6
                max-w-[500px]

                text-base
                leading-8
                text-[#6b5845]

                md:text-lg

                lg:mx-0
              "
            >
              {t('description')}
            </motion.p>

            {/* CTA */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.58,
                duration: 0.9,
              }}
              className="
                mt-8
                flex
                flex-wrap
                justify-center
                gap-3

                lg:justify-start
              "
            >
              {/* Products */}

              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Link
                  href={`/${locale}/products`}
                  className="
                    inline-flex
                    min-h-[52px]
                    items-center
                    justify-center
                    rounded-full

                    bg-[#633515]
                    px-7

                    text-sm
                    font-bold
                    text-white

                    shadow-[0_10px_30px_rgba(99,53,21,0.18)]

                    transition-all
                    duration-300

                    hover:bg-[#4d2812]
                    hover:shadow-[0_15px_35px_rgba(99,53,21,0.25)]
                  "
                >
                  {t('productsButton')}

                  <span
                    className="
                      mx-3
                      text-lg
                      leading-none
                    "
                  >
                    
                   {isRTL ? '←' : '→'}
                  </span>
                </Link>
              </motion.div>

              {/* About */}

              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Link
                  href={`/${locale}/about`}
                  className="
                    inline-flex
                    min-h-[52px]
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-[#694a31]

                    bg-white/20

                    px-7

                    text-sm
                    font-bold
                    text-[#51351f]

                    backdrop-blur-sm

                    transition-all
                    duration-300

                    hover:bg-white/50
                  "
                >
                  {t('aboutButton')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* =================================================
              RIGHT — COFFEE JOURNEY
              فقط دسکتاپ
          ================================================== */}

          <div
            className="
              relative
              mx-auto
              hidden
              w-full
              max-w-[760px]
              lg:block
              lg:min-h-[620px]
              xl:min-h-[680px]
            "
          >
            {/* =================================================
                JOURNEY CANVAS
            ================================================== */}

            <div
              className="
                relative
                mx-auto
                aspect-square
                w-full
                max-w-[700px]
              "
            >
              {/* =================================================
                  SUBTLE ORBIT
              ================================================== */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[73%]
                  w-[73%]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  border
                  border-dashed
                  border-[#a77b43]/45
                "
              />

              {/* =================================================
                  ORBIT SOFT GLOW
              ================================================== */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute

                  left-1/2
                  top-1/2

                  h-[62%]
                  w-[62%]

                  -translate-x-1/2
                  -translate-y-1/2

                  rounded-full

                  bg-[#9F7238]/30

                  blur-2xl
                "
              />

              {/* =================================================
                  MOVING DOT
              ================================================== */}



              <motion.div
                aria-hidden="true"
                className="
    pointer-events-none
    absolute
    left-1/2
    top-1/2
    z-[5]
    h-[74%]
    w-[74%]
    -translate-x-1/2
    -translate-y-1/2
    rounded-full
  "
                animate={{ rotate: 360 }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
              >
                {dots.map((dot, i) => (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{ transform: `rotate(${dot.deg}deg)` }}
                  >
                    <span
                      className="
          absolute
          left-1/2
          top-0
          h-2
          w-2
          -translate-x-1/2
          rounded-full
        "
                      style={{
                        backgroundColor: dot.color,
                        boxShadow: `0 0 12px ${dot.color}73`, // همون رنگ با شفافیت
                      }}
                    />
                  </div>
                ))}
              </motion.div>

              {/* =================================================
                  CENTER COFFEE IMAGE
              ================================================== */}

              <motion.div
                variants={centerVariants}
                initial="hidden"
                animate="visible"
                className="
                  absolute

                  left-1/2
                  top-1/2

                  z-20

                  w-[58%]

                  -translate-x-1/2
                  -translate-y-1/2
                "
              >
                <div
                  className="
                    relative
                    aspect-square
                    w-full
                  "
                >
                  <Image
                    src="/images/hero/coffee-center.webp"
                    alt="فنجان قهوه فراجهان"
                    fill
                    priority
                    sizes="(min-width: 1536px) 430px, (min-width: 1280px) 390px, (min-width: 1024px) 350px, 70vw"
                    className="
                      object-contain

                      drop-shadow-[0_25px_35px_rgba(65,39,22,0.20)]
                    "
                  />

                </div>
                {/* <div
                  className="
    relative
    aspect-square
    w-full
    overflow-visible
  "
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    
                    className="
      h-full
      w-full
      object-contain
      drop-shadow-[0_25px_35px_rgba(65,39,22,0.20)]
    "
                    aria-label="فنجان قهوه با بخار متحرک"
                  >
                    <source
                      src="/videos/hero/coffee-center.webm"
                      type="video/webm"
                    />

                    <source
                      src="/images/videos/hero/coffee-center.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div> */}
              </motion.div>

              {/* =================================================
                  JOURNEY ITEMS
              ================================================== */}

              {journeyPositions.map((item, index) => (
                <JourneyCard
                  key={item.id}
                  step={item}
                  label={labels[item.id]}
                  index={index}
                  position={item.position}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   JOURNEY CARD
============================================================ */

function JourneyCard({
  step,
  label,
  index,
  position,
}) {
  return (
    <motion.div
      custom={index}
      variants={imageVariants}
      initial="hidden"
      animate="visible"
      className={`
        absolute
        z-30

        flex
        items-center
        gap-2

        sm:gap-3

        ${position}
      `}
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div
        className="
          relative
          h-[88px]
          w-[88px]
          rounded-full
          p-1
          shadow-[0_12px_30px_rgba(70,45,28,0.18)]
          sm:h-[108px]
          sm:w-[108px]
          md:h-[130px]
          md:w-[130px]
        "
      >
        <div
          className="
            relative
            h-full
            w-full
            overflow-hidden
            rounded-full
          "
        >
          <Image
            src={step.image}
            alt={label}
            fill
            quality={95}
            sizes="(min-width: 768px) 240px, 200px"
            className="
    object-cover
    transition-transform
    duration-700
    hover:scale-110
  "
          />
        </div>

        {/* Number */}

        <span
          className="
            absolute
            right-2
            top-2
            flex
            h-5
            w-5
            pt-1
            justify-center
            items-center
            rounded-full
            bg-[#b58745]
            border
            border-white
            text-[10px]
            font-bold
            text-white
            shadow-md
            
          "
        >
          {step.number}
        </span>
      </div>

      {/* =====================================================
          LABEL
      ====================================================== */}

      <span
        className="
          hidden

          whitespace-nowrap

          text-sm
          font-bold
          text-[#503622]

          md:block
        "
      >
        {label}
      </span>
    </motion.div>
  );
}