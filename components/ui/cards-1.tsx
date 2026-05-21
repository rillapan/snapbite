"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FoodCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc: string;
  title: string;
  description?: string;
}

const FoodCard = React.forwardRef<HTMLDivElement, FoodCardProps>(
  ({ className, imageSrc, title, description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative block overflow-hidden rounded-xl border border-[#E5E5E5] bg-white transition-all duration-300 ease-in-out hover:shadow-lg",
          className
        )}
        {...props}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            draggable={false}
          />
        </div>

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            className="font-black text-white leading-tight truncate"
            style={{ fontSize: "clamp(14px, 3.5vw, 17px)", letterSpacing: "-0.3px" }}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-[12px] text-white/75 leading-[1.5] line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FoodCard.displayName = "FoodCard";

export { FoodCard };
