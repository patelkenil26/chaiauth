"use client";

import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "@/config/env";

interface CaptchaProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
}

export function Captcha({ onSuccess, onError }: CaptchaProps) {
  return (
    <div className="w-full">
      <Turnstile
        siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        onSuccess={onSuccess}
        onError={onError}
        options={{
          size: "invisible",
        }}
      />
    </div>
  );
}
