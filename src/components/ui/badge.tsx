import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-[oklch(0.95_0.03_25)] text-[oklch(0.55_0.20_25)] [a&]:hover:bg-[oklch(0.92_0.04_25)] dark:bg-[oklch(0.20_0.03_25)] dark:text-[oklch(0.65_0.16_25)]",
        success:
          "bg-[oklch(0.95_0.03_155)] text-[oklch(0.52_0.14_155)] [a&]:hover:bg-[oklch(0.92_0.04_155)] dark:bg-[oklch(0.20_0.03_155)] dark:text-[oklch(0.62_0.12_155)]",
        warning:
          "bg-[oklch(0.95_0.04_75)] text-[oklch(0.65_0.16_75)] [a&]:hover:bg-[oklch(0.92_0.05_75)] dark:bg-[oklch(0.20_0.03_75)] dark:text-[oklch(0.72_0.14_75)]",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
