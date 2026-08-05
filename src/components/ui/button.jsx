import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 overflow-hidden",
    "font-[family-name:var(--font-body)] text-[11px] tracking-[2.5px] uppercase",
    "select-none outline-none transition-colors duration-200",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ink)]",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--ink)] text-[var(--off-white)]",
          "hover:bg-[var(--gray-dark)]",
          "focus-visible:ring-offset-[var(--bg)]",
        ],
        outline: [
          "border border-[rgba(14,12,11,0.25)] bg-transparent text-[var(--ink)]",
          "hover:border-[var(--ink)] hover:text-[var(--ink)]",
          "focus-visible:ring-offset-[var(--bg)]",
        ],
        "outline-inverse": [
          "border border-[rgba(255,252,242,0.2)] bg-transparent text-[rgba(255,252,242,0.55)]",
          "hover:border-[rgba(255,252,242,0.5)] hover:text-[var(--off-white)]",
          "focus-visible:ring-[var(--off-white)] focus-visible:ring-offset-[var(--black)]",
        ],
      },
      size: {
        default: "px-8 py-[14px]",
        sm:      "px-5 py-3 text-[10px] tracking-[2px]",
        lg:      "px-10 py-[18px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const MotionWrapper = ({ children }) => (
  <motion.span
    className="inline-flex"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.18, ease: "easeOut" }}
  >
    {children}
  </motion.span>
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, animate = true, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const el = (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
    return animate ? <MotionWrapper>{el}</MotionWrapper> : el;
  }
);
Button.displayName = "Button";

/**
 * ButtonLink — Button rendered as a react-router Link or <a>.
 * Usage: <ButtonLink to="/work" variant="outline">View Work</ButtonLink>
 */
const ButtonLink = React.forwardRef(
  ({ className, variant, size, to, href, animate = true, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    const el = to ? (
      <Link ref={ref} to={to} className={classes} {...props}>
        {children}
      </Link>
    ) : (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...props}
      >
        {children}
      </a>
    );

    return animate ? <MotionWrapper>{el}</MotionWrapper> : el;
  }
);
ButtonLink.displayName = "ButtonLink";

export { Button, ButtonLink, buttonVariants };
