import * as React from 'react'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }>(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      ref={ref}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5',
        'border-2 border-transparent shadow-sm transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'bg-primary shadow-primary/25 dark:shadow-primary/40'
          : 'bg-input hover:bg-input/80',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full shadow-md ring-0 transition-all duration-300',
          checked
            ? 'translate-x-5 bg-primary-foreground'
            : 'translate-x-0 bg-background'
        )}
      />
    </button>
  )
})
Switch.displayName = 'Switch'

export { Switch }
