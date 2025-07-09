"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: "default" | "sparkly-gold"
}

function Progress({
  className,
  value,
  variant = "default",
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all",
          variant === "sparkly-gold" 
            ? "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 relative overflow-hidden" 
            : "bg-primary"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {variant === "sparkly-gold" && (
          <>
            {/* Sparkle overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            
            {/* Glitter particles */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0s' }} />
              <div className="absolute top-3/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/3 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }} />
              <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '2s' }} />
            </div>
            
            {/* Golden shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent animate-glow" />
          </>
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
