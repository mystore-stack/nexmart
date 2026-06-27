"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  action?: string;
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function ReCaptcha({ onVerify, action = "submit" }: ReCaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    const loadReCaptcha = () => {
      if (window.grecaptcha) {
        setIsLoaded(true);
      }
    };

    window.grecaptcha?.ready(loadReCaptcha);
  }, [siteKey]);

  const executeRecaptcha = async () => {
    if (!siteKey || !isLoaded || isExecuting) return;

    setIsExecuting(true);
    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      onVerify(token);
    } catch (error) {
      console.error("reCAPTCHA execution error:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!siteKey) return null;

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      <button
        type="button"
        onClick={executeRecaptcha}
        disabled={isExecuting}
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
}

export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return {
      success: false,
      error: "reCAPTCHA secret key not configured",
    };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    return {
      success: data.success,
      score: data.score,
      error: data["error-codes"]?.join(", "),
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      error: "Failed to verify reCAPTCHA",
    };
  }
}

export function useRecaptcha(action: string = "submit") {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    const loadReCaptcha = () => {
      if (window.grecaptcha) {
        setIsLoaded(true);
      }
    };

    window.grecaptcha?.ready(loadReCaptcha);
  }, [siteKey]);

  const execute = async () => {
    if (!siteKey || !isLoaded) return null;

    try {
      const result = await window.grecaptcha.execute(siteKey, { action });
      setToken(result);
      return result;
    } catch (error) {
      console.error("reCAPTCHA execution error:", error);
      return null;
    }
  };

  return { token, execute, isLoaded };
}
