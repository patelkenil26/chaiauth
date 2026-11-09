"use client";

import { ShieldCheck, Smartphone, Loader2, KeyRound } from "lucide-react";
import Image from "next/image";
import { useMfa } from "../hooks/useMfa";

export function MfaSettingsCard({ user }: { user: any }) {
  const {
    setupData,
    setSetupData,
    verificationCode,
    setVerificationCode,
    generateMfa,
    verifyMfa,
    disableMfa,
  } = useMfa();

  return (
    <section className="ca-glass rounded-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-primary">
          <Smartphone className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            Authenticator App (TOTP)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Use an app like Google Authenticator or Authy to generate one-time codes.
          </p>
        </div>
      </div>

      {user.mfaEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-good">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium text-sm">2FA is currently enabled</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Your account is protected. To disable 2FA, please enter a code from your authenticator app.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="ca-input max-w-[150px] text-center tracking-widest font-mono"
            />
            <button
              onClick={() => disableMfa.mutate({ code: verificationCode })}
              disabled={verificationCode.length !== 6 || disableMfa.isPending}
              className="ca-btn bg-destructive hover:bg-destructive/90 text-white"
            >
              {disableMfa.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Disable 2FA
            </button>
          </div>
        </div>
      ) : setupData ? (
        <div className="space-y-5">
          <p className="text-sm text-text-soft leading-relaxed">
            Scan the QR code with your authenticator app, then enter the 6-digit code to verify.
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <Image
                src={setupData.qrCodeUrl}
                alt="MFA QR Code"
                width={180}
                height={180}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Secret Key */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Manual Entry Key
            </p>
            <code className="block w-full bg-accent/60 border border-border/50 text-primary px-3 py-2 rounded-md font-mono text-xs break-all text-center">
              {setupData.secret}
            </code>
          </div>

          {/* OTP Input */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Enter 6-digit verification code
            </p>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={verificationCode[i] || ""}
                  autoFocus={i === 0}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const chars = verificationCode.split("");
                    chars[i] = val;
                    const next = chars.join("").slice(0, 6);
                    setVerificationCode(next);
                    if (val && i < 5) {
                      document.getElementById(`otp-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !verificationCode[i] && i > 0) {
                      document.getElementById(`otp-${i - 1}`)?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(pasted);
                    const nextIdx = Math.min(pasted.length, 5);
                    document.getElementById(`otp-${nextIdx}`)?.focus();
                  }}
                  className="w-10 h-12 text-center text-lg font-mono font-semibold rounded-md border border-border/60 bg-accent/40 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                />
              ))}
            </div>
          </div>

          {/* Backup Codes */}
          {setupData.backupCodes && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <p className="text-sm font-semibold text-yellow-600 mb-2">Save these Backup Codes</p>
              <p className="text-xs text-muted-foreground mb-3">
                If you lose access to your device, you can use these 8-character codes to log in. Each code can only be used once. Keep them safe.
              </p>
              <div className="grid grid-cols-2 gap-2 text-center">
                {setupData.backupCodes.map((code: string) => (
                  <code key={code} className="bg-background px-2 py-1 rounded text-xs font-mono text-foreground border border-border">
                    {code}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => verifyMfa.mutate({ code: verificationCode })}
              disabled={verificationCode.length !== 6 || verifyMfa.isPending}
              className="ca-btn ca-btn-primary w-full"
            >
              {verifyMfa.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verify & Enable 2FA
            </button>
            <button
              onClick={() => { setSetupData(null); setVerificationCode(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              ← Cancel setup
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => generateMfa.mutate()}
          disabled={generateMfa.isPending}
          className="ca-btn ca-btn-primary w-full sm:w-auto mt-2"
        >
          {generateMfa.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <KeyRound className="w-4 h-4 mr-2" />
          )}
          Set up Authenticator
        </button>
      )}
    </section>
  );
}
