// src/components/ui/switch.jsx

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const switchVariants = cva(
  "peer inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      checked: {
        true: "bg-primary",
        false: "bg-input",
      },
    },
    defaultVariants: {
      checked: false,
    },
  }
)

const thumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
  {
    variants: {
      checked: {
        true: "translate-x-5",
        false: "translate-x-0",
      },
    },
    defaultVariants: {
      checked: false,
    },
  }
)

const Switch = React.forwardRef(
  ({ className, checked, onChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        ref={ref}
        className={cn(switchVariants({ checked }), className)}
        {...props}
      >
        <span className={thumbVariants({ checked })} />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
