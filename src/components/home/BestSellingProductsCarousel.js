'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingCart,
  Check,
  LoaderCircle,
} from 'lucide-react';

export default function BestSellingProductsCarousel({
  products = [],
  locale = 'fa',
  translations,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);

  const touchStartX = useRef(0);

  const total = products.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setAddedProductId(null);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setAddedProductId(null);
  }, [total]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setAddedProductId(null);
  };

  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const interval = setInterval(nextSlide, 5000);

    return () => clearInterval(interval);
  }, [nextSlide, isHovered, total]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const diff =
      event.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(diff) > 45) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const handleAddToCart = async (product) => {
    if (!product?.id || addingProductId) return;

    setAddingProductId(product.id);
    setAddedProductId(null);

    try {
      const response = await fetch(
        '/api/cart/add',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add product to cart');
      }

      setAddedProductId(product.id);

      setTimeout(() => {
        setAddedProductId(null);
      }, 2500);
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingProductId(null);
    }
  };

  if (!products.length) return null;

  return (
    <div
      className="relative mb-8 flex w-full flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Coverflow */}
      <div
        className="relative mb-8 flex h-[520px] w-full items-center justify-center"
        style={{ perspective: '1400px' }}
      >
        {products.map((product, index) => {
          const offset = (index - currentIndex + total) % total;

          let transform =
            'translateX(0px) scale(0.4) rotateY(0deg)';
          let opacity = 0;
          let zIndex = 0;
          let filter = 'brightness(0.88) blur(2px)';
          let isCenter = false;

          if (offset === 0) {
            isCenter = true;
            transform = 'translateX(0px) scale(1) rotateY(0deg)';
            opacity = 1;
            zIndex = 30;
            filter = 'brightness(1)';
          } else if (offset === 1) {
            transform =
              'translateX(285px) scale(0.84) rotateY(-24deg)';
            opacity = 0.72;
            zIndex = 20;
            filter = 'brightness(0.92)';
          } else if (offset === 2) {
            transform =
              'translateX(510px) scale(0.68) rotateY(-38deg)';
            opacity = 0.4;
            zIndex = 10;
            filter = 'brightness(0.88) blur(1px)';
          } else if (offset === total - 1) {
            transform =
              'translateX(-285px) scale(0.84) rotateY(24deg)';
            opacity = 0.72;
            zIndex = 20;
            filter = 'brightness(0.92)';
          } else if (offset === total - 2) {
            transform =
              'translateX(-510px) scale(0.68) rotateY(38deg)';
            opacity = 0.4;
            zIndex = 10;
            filter = 'brightness(0.88) blur(1px)';
          }

          const image = product.images?.[0];

          const isAdding = addingProductId === product.id;
          const isAdded = addedProductId === product.id;

          return (
            <div
              key={product.id}
              onClick={() => {
                if (!isCenter) {
                  goToSlide(index);
                }
              }}
              className="absolute flex h-[450px] w-[330px] flex-col overflow-hidden rounded-[22px] border border-black/[0.08] bg-white"
              style={{
                transform,
                opacity,
                zIndex,
                filter,
                transformOrigin: 'center center',
                transition:
                  'all 800ms cubic-bezier(0.25, 1, 0.5, 1)',
                boxShadow: isCenter
                  ? '0 25px 60px rgba(60,45,30,0.20), 0 5px 20px rgba(60,45,30,0.10)'
                  : '0 15px 35px rgba(60,45,30,0.12)',
                cursor: isCenter ? 'default' : 'pointer',
              }}
            >
              {/* ناحیه‌ی تصویر */}
              <div className="relative w-full flex-1">
                {image && (
                  <Image
                    src={image.src}
                    alt={image.alt || product.name}
                    fill
                    quality={90}
                    sizes="350px"
                    className="object-contain p-2"
                  />
                )}
              </div>

              {/* ناحیه‌ی متن */}
              <div
                className="w-full px-5 pb-5 text-center"
                style={{
                  opacity: isCenter ? 1 : 0,
                  transform: isCenter
                    ? 'translateY(0)'
                    : 'translateY(16px)',
                  transition:
                    'opacity 500ms ease, transform 500ms ease',
                  pointerEvents: isCenter ? 'auto' : 'none',
                }}
              >
                <h3 className="line-clamp-2 text-[1.35rem] font-bold leading-tight text-[#573B2A]">
                  {product.name}
                </h3>

                <div className="mx-auto my-3 h-0.5 w-9 rounded-full bg-[#b18a57]" />

                {product.prices?.price && (
                  <div className="mb-4 text-base font-bold text-[#8b6b42]">
                    {Number(
                      product.prices.price
                    ).toLocaleString(locale)}

                    <span className="mr-1 text-xs font-normal text-[#777]">
                      {product.prices.currency_symbol}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2">
                  {product.is_purchasable && (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding || isAdded}
                      className="inline-flex min-w-[145px] items-center justify-center gap-2 rounded-full bg-[#9F7238] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#1c2d43] hover:shadow-lg disabled:cursor-default disabled:opacity-90"
                    >
                      {isAdding ? (
                        <>
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                          <span>{translations.adding}</span>
                        </>
                      ) : isAdded ? (
                        <>
                          <Check size={15} />
                          <span>{translations.added}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={15} />
                          <span>{translations.addToCart}</span>
                        </>
                      )}
                    </button>
                  )}

                  <Link
                    href={`/${locale}/product/${product.slug}`}
                    onClick={(event) => event.stopPropagation()}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C5934C] bg-white text-[#9F7238] transition-colors hover:bg-[#f5f1e9]"
                    aria-label={translations.viewProduct}
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Previous */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label={translations.previous}
          className="absolute left-1 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#243954]/10 bg-white/90 text-[#243954] shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white md:left-8"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label={translations.next}
          className="absolute right-1 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#243954]/10 bg-white/90 text-[#243954] shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white md:right-8"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        {products.map((product, index) => (
          <button
            key={product.id}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-[#a48256]'
                : 'w-2 bg-[#243954]/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}