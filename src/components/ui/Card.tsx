"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, glow, glass, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-dark-700/50 bg-dark-900/80 p-6",
          hover && "transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1",
          glow && "animate-glow",
          glass && "glass-card backdrop-blur-xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
