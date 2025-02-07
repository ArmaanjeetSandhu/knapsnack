// components/ui/label.jsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "../../lib/utils"

// The Label component uses Radix UI's label primitive for proper accessibility
// It ensures that screen readers can properly associate labels with their form controls
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }