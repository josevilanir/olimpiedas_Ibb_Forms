import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    // Mapping internal variants to the project's CSS classes
    const variantClass = {
      primary: "btn btn-primary",
      secondary: "btn btn-secondary",
      ghost: "btn-ghost", // We'll define this in a bit if needed, or use inline
      icon: "btn-icon",
    }[variant]

    return (
      <button
        className={cn(
          variantClass,
          size === "icon" && "btn-icon-size", // Add custom sizes if needed
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
