"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type SlidePosition = "previous" | "active" | "next";
type SlideDirection = "previous" | "next";

const AUTO_SLIDE_INTERVAL = 5000;

const slides = [
  { src: "/slider/slider1.png", alt: "Banner Rotary 1" },
  { src: "/slider/slider2.png", alt: "Banner Rotary 2" },
  { src: "/slider/slider3.png", alt: "Banner Rotary 3" },
  { src: "/slider/slider4.png", alt: "Banner Rotary 4" },
];

const arrowButtonClass =
  "items-center justify-center rounded-full border border-[#b9c7dc] bg-white text-[#17458f] shadow-[0_8px_20px_rgba(23,69,143,0.24),0_1px_2px_rgba(15,23,42,0.12)] transition-colors hover:border-[#f7a81b] hover:bg-[#f7a81b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-2";

const slideBaseClass =
  "group absolute aspect-[8/3] overflow-hidden rounded-lg bg-[#f4f6f8] text-left transition-[opacity,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17458f] focus-visible:ring-offset-4";

function getVisibleSlides(activeIndex: number) {
  const lastIndex = slides.length - 1;
  const previousIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
  const nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;

  return [
    { ...slides[previousIndex], index: previousIndex, position: "previous" as const },
    { ...slides[activeIndex], index: activeIndex, position: "active" as const },
    { ...slides[nextIndex], index: nextIndex, position: "next" as const },
  ];
}

function getSlideStyle(position: SlidePosition): CSSProperties {
  const sharedStyle: CSSProperties = {
    top: "50%",
    transform: "translate(-50%, -50%)",
  };

  if (position === "previous") {
    return {
      ...sharedStyle,
      left: 24,
      width: "min(520px, 34vw)",
      zIndex: 10,
    };
  }

  if (position === "next") {
    return {
      ...sharedStyle,
      left: "calc(100% - 24px)",
      width: "min(520px, 34vw)",
      zIndex: 10,
    };
  }

  return {
    ...sharedStyle,
    left: "50%",
    width: "min(760px, 52vw)",
    zIndex: 20,
  };
}

function ArrowIcon({ direction, size = 18 }: { direction: SlideDirection; size?: number }) {
  const isPrevious = direction === "previous";

  return (
    <Icon
      icon={isPrevious ? "lucide:chevron-left" : "lucide:chevron-right"}
      width={size}
      height={size}
      aria-hidden="true"
      className={isPrevious ? "-ml-0.5" : "ml-0.5"}
    />
  );
}

export default function HomeBannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>("next");
  const visibleSlides = useMemo(() => getVisibleSlides(activeIndex), [activeIndex]);

  const goToSlide = useCallback(
    (index: number, nextDirection?: SlideDirection) => {
      setDirection(nextDirection ?? (index > activeIndex ? "next" : "previous"));
      setActiveIndex(index);
    },
    [activeIndex]
  );

  const goToPrevious = () => {
    goToSlide((activeIndex - 1 + slides.length) % slides.length, "previous");
  };

  const goToNext = useCallback(() => {
    goToSlide((activeIndex + 1) % slides.length, "next");
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    const interval = window.setInterval(goToNext, AUTO_SLIDE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [goToNext]);

  return (
    <section className="bg-white pt-8 pb-5 md:pb-6" aria-label="Promosi Rotary">
      <div className="relative mx-auto max-w-[1728px] overflow-hidden px-8 lg:px-40">
        <div className="relative hidden h-[330px] overflow-hidden md:block">
          {visibleSlides.map((slide) => {
            const isActive = slide.position === "active";

            return (
              <button
                key={`${activeIndex}-${slide.position}-${slide.src}`}
                type="button"
                onClick={() => goToSlide(slide.index)}
                className={`${slideBaseClass} ${
                  direction === "next" ? "banner-slide-next" : "banner-slide-previous"
                } ${
                  isActive
                    ? "opacity-100 shadow-[0_14px_30px_rgba(15,23,42,0.14)]"
                    : "opacity-95 shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:opacity-100"
                }`}
                style={getSlideStyle(slide.position)}
                aria-label={`Tampilkan banner ${slide.index + 1}`}
                aria-current={isActive}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={isActive}
                  sizes={
                    isActive
                      ? "(min-width: 1280px) 760px, 44vw"
                      : "(min-width: 1280px) 520px, 34vw"
                  }
                  className="object-contain"
                />
                {!isActive && (
                  <span className="pointer-events-none absolute inset-0 bg-white/12 backdrop-blur-[1.5px]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="md:hidden">
          <div className="relative aspect-[8/3] overflow-hidden rounded-lg bg-[#f4f6f8] shadow-[0_8px_22px_rgba(15,23,42,0.12)]">
            <Image
              src={slides[activeIndex].src}
              alt={slides[activeIndex].alt}
              fill
              priority
              sizes="calc(100vw - 32px)"
              className="object-contain"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={goToPrevious}
          className={`absolute top-1/2 z-30 hidden h-10 w-10 -translate-x-full -translate-y-1/2 md:flex ${arrowButtonClass}`}
          style={{ left: "calc(50% - min(400px, 27vw))" }}
          aria-label="Banner sebelumnya"
        >
          <ArrowIcon direction="previous" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className={`absolute top-1/2 z-30 hidden h-10 w-10 translate-x-full -translate-y-1/2 md:flex ${arrowButtonClass}`}
          style={{ right: "calc(50% - min(400px, 27vw))" }}
          aria-label="Banner berikutnya"
        >
          <ArrowIcon direction="next" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goToPrevious}
          className={`flex h-8 w-8 md:hidden ${arrowButtonClass}`}
          aria-label="Banner sebelumnya"
        >
          <ArrowIcon direction="previous" size={16} />
        </button>

        <div className="flex items-center gap-2" aria-label="Indikator banner">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? "w-8 bg-[#f7a81b]" : "w-2.5 bg-[#d6dbe4] hover:bg-[#aeb7c6]"
              }`}
              aria-label={`Tampilkan banner ${index + 1}`}
              aria-current={activeIndex === index}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goToNext}
          className={`flex h-8 w-8 md:hidden ${arrowButtonClass}`}
          aria-label="Banner berikutnya"
        >
          <ArrowIcon direction="next" size={16} />
        </button>
      </div>
    </section>
  );
}
