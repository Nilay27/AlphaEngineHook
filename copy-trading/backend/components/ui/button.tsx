'use client'

import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Here we define base styles plus optional "variant" changes.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium \
   ring-offset-background transition-colors focus-visible:outline-none \
   focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 \
   disabled:opacity-50 disabled:pointer-events-none \
   data-[state=open]:bg-accent data-[state=open]:text-accent-foreground \
   bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'bg-red-500 hover:bg-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

/**
 * ButtonProps extends the standard HTML button props plus variant definitions from cva.
 * "asChild" enables rendering this as another component (e.g., <Link>).
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * A Shadcn UI style Button component using variants.
 *
 * @param props.variant "default" or "destructive" styling
 * @param props.asChild If true, renders a Slot instead of a native button
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
