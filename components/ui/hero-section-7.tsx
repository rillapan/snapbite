import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names
import Image from 'next/image';
import Link from 'next/link';
import { CameraIcon } from '@/components/icons';

/**
 * @typedef FloatingImageProps
 * @property {string} src - The source URL for the image.
 * @property {string} alt - The alt text for the image for accessibility.
 * @property {string} className - Tailwind CSS classes for positioning, sizing, and animation.
 */
interface FloatingImageProps {
  src: string;
  alt: string;
  className: string;
}

/**
 * @typedef FloatingFoodHeroProps
 * @property {string} title - The main heading text.
 * @property {string} description - The paragraph text below the heading.
 * @property {FloatingImageProps[]} images - An array of image objects to be displayed.
 * @property {string} [className] - Optional additional classes for the section container.
 */
export interface FloatingFoodHeroProps {
  title: React.ReactNode;
  description: string;
  images: FloatingImageProps[];
  className?: string;
}

/**
 * A decorative SVG component for the background swirl lines.
 */
const Swirls = () => (
  <>
    <svg
      className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 text-[#FF4D00]/10 dark:text-[#FF4D00]/10"
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M515.266 181.33C377.943 51.564 128.537 136.256 50.8123 293.565C-26.9127 450.874 125.728 600 125.728 600"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    <svg
      className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 text-[#FF4D00]/10 dark:text-[#FF4D00]/10"
      width="700"
      height="700"
      viewBox="0 0 700 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26.8838 528.274C193.934 689.816 480.051 637.218 594.397 451.983C708.742 266.748 543.953 2.22235 543.953 2.22235"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </>
);

/**
 * A responsive and animated hero section component.
 */
export function FloatingFoodHero({
  title,
  description,
  images,
  className,
}: FloatingFoodHeroProps) {
  return (
    <section
      className={cn(
        'relative w-full min-h-[60vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden bg-background py-20 md:py-32',
        className
      )}
    >
      <div className="absolute inset-0 z-0 bg-[#fff8f6]">
        <Swirls />
      </div>
      
      {/* Render floating images */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn('absolute animate-float', image.className)}
            style={{ animationDelay: `${index * 300}ms` }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={400}
              height={400}
              className="w-full h-auto object-contain drop-shadow-2xl"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Text Content */}
      <div className="relative z-20 container mx-auto px-4 text-center max-w-3xl flex flex-col items-center">
        <div className="text-[11px] font-bold tracking-[3px] uppercase text-[#FF4D00] mb-6 bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-sm border border-[#FF4D00]/20 inline-block shadow-sm">
          AI × Kuliner Nusantara
        </div>
        <h1 className="text-4xl font-sans font-black tracking-tight text-[#0D0D0D] sm:text-5xl md:text-[80px] leading-[0.95] mb-8" style={{ letterSpacing: '-3px' }}>
          {title}
        </h1>
        <p className="mt-2 text-[16px] leading-8 text-[#555] max-w-xl mx-auto mb-10 bg-white/60 p-4 rounded-xl backdrop-blur-sm shadow-sm border border-white">
          {description}
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-[#0D0D0D] text-white px-8 py-4 text-[13px] font-bold tracking-[1px] uppercase w-fit hover:bg-[#FF4D00] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
        >
          <CameraIcon className="w-4 h-4" /> Scan Sekarang
        </Link>
      </div>
    </section>
  );
}
