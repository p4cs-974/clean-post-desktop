import * as React from 'react'
import { cn } from '@/lib/utils'

const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(
  ({ className, value, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/10 dark:bg-primary/20', className)}
      {...props}
    >
      {/* Animated gradient fill */}
      <div
        className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[gradient-x_3s_ease_infinite]"
        style={{ width: `${value || 0}%` }}
      />
      {/* Shimmer overlay */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:50%_100%] animate-[shimmer_2s_linear_infinite]"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
