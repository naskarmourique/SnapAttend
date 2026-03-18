import { motion } from "framer-motion";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "gradient-accent text-primary-foreground neon-border",
  ghost: "glass-card text-foreground hover:bg-muted/50",
  danger: "bg-destructive text-destructive-foreground",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function GlassButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: GlassButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-2xl font-display font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
