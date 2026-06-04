"use client";
/**
 * GoogleSignInButton — Premium Google OAuth button
 * Stripe/Linear-level UI with loading states and error handling.
 */
import React, { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Props {
  redirectTo?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "filled";
  className?: string;
}

export function GoogleSignInButton({
  redirectTo = "/",
  label = "Continue with Google",
  size = "md",
  variant = "outline",
  className = "",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(() => {
      signIn("google", { callbackUrl: redirectTo }).catch(() => {
        setError("Could not connect to Google. Please try again.");
      });
    });
  };

  const sizes = {
    sm: "h-9 text-sm px-4 gap-2",
    md: "h-11 text-sm px-5 gap-3",
    lg: "h-13 text-base px-6 gap-3",
  };

  const variants = {
    outline: `
      bg-white dark:bg-card border border-border
      hover:border-foreground/30 hover:bg-muted/50
      text-foreground shadow-sm
    `,
    filled: `
      bg-white text-[#1f1f1f]
      hover:bg-gray-50 shadow-md hover:shadow-lg
      border border-gray-200
    `,
  };

  return (
    <div className="w-full">
      <motion.button
        onClick={handleClick}
        disabled={isPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          w-full flex items-center justify-center rounded-xl font-medium
          transition-all duration-200 cursor-pointer select-none
          disabled:opacity-60 disabled:cursor-not-allowed
          ${sizes[size]}
          ${variants[variant]}
          ${className}
        `}
        aria-label="Sign in with Google"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GoogleIcon size={size === "sm" ? 16 : 18} />
        )}
        <span>{isPending ? "Connecting..." : label}</span>
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-destructive text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Official Google G-logo SVG
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

// ─── One Tap wrapper (requires Google Identity script) ─────────
export function GoogleOneTap() {
  // One Tap is triggered via the Google Identity Services SDK
  // and handled by the NextAuth Google provider callback
  // Implementation: load the GIS SDK in layout, configure data-client_id
  return null;
}
