"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FunBerryLogo } from "../../components/FunBerryLogo";
import {
  signUp,
  verifyEmailOtp,
  resendSignupConfirmation,
  signOut,
} from "@funberry/supabase";

type Step = "form" | "code" | "success";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendOk, setResendOk] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name, pin);
      setStep("code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    setVerifying(true);
    try {
      await verifyEmailOtp(email, code);
      // Confirmed. Sign out so the parent explicitly logs in on the next screen.
      try {
        await signOut();
      } catch {
        // Non-fatal: proceed to login regardless.
      }
      // Halt on a clear success screen instead of jumping straight to login.
      setStep("success");
    } catch (err: unknown) {
      if (err instanceof Error && /expired|invalid|token/i.test(err.message)) {
        setError("That code is wrong or expired. Check the latest email or resend a new code.");
      } else {
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setResendOk(false);
    setError("");
    setResendBusy(true);
    try {
      await resendSignupConfirmation(email);
      setResendOk(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend the code");
    } finally {
      setResendBusy(false);
    }
  }

  if (step === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50/90 via-white to-sky-50/50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full max-w-md text-center"
        >
          <div className="glass-card rounded-kid p-10">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-6xl"
            >
              ✅
            </motion.div>
            <h2 className="font-display mb-3 text-3xl font-bold text-emerald-900">
              Code matched! 🎉
            </h2>
            <p className="mb-1 text-lg font-semibold text-gray-700">
              Your email is verified and your account is ready.
            </p>
            <p className="mb-8 break-all text-base font-bold text-emerald-700">{email}</p>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/login?verified=1")}
              className="kid-glass-btn kid-glass-leaf w-full rounded-kid py-4 text-lg"
            >
              Continue to Login →
            </motion.button>
            <p className="mt-4 text-sm text-gray-500">
              Sign in with the email and password you just chose.
            </p>
          </div>
        </motion.div>
      </main>
    );
  }

  if (step === "code") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100/90 via-white to-emerald-50/40 p-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-md text-center"
          >
            <div className="glass-card rounded-kid p-10">
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, -8, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="mb-6 text-7xl"
              >
                📬
              </motion.div>
              <h2 className="font-display mb-3 text-3xl font-bold text-sky-900">
                Enter your code 🔐
              </h2>
              <p className="mb-1 text-lg text-gray-600">
                We emailed a 6-digit verification code to
              </p>
              <p className="mb-6 break-all text-xl font-bold text-sky-700">{email}</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-center font-mono text-3xl tracking-[0.6em] outline-none transition focus:border-sky-400"
                  placeholder="••••••"
                  autoFocus
                  required
                />
                <motion.button
                  type="submit"
                  disabled={verifying}
                  whileHover={!verifying ? { scale: 1.03, y: -2 } : {}}
                  whileTap={!verifying ? { scale: 0.97 } : {}}
                  className="kid-glass-btn kid-glass-leaf w-full rounded-kid py-4 text-lg disabled:pointer-events-none disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "✅ Verify & Continue"}
                </motion.button>
              </form>

              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-500">Didn&apos;t get it? Check your spam folder.</p>
                <motion.button
                  type="button"
                  disabled={resendBusy}
                  whileHover={!resendBusy ? { scale: 1.02 } : {}}
                  whileTap={!resendBusy ? { scale: 0.98 } : {}}
                  onClick={handleResend}
                  className="w-full rounded-kid border-2 border-sky-200 bg-white py-3 text-sm font-bold text-sky-800 shadow-sm disabled:opacity-50"
                >
                  {resendBusy ? "Sending…" : "Resend code"}
                </motion.button>
                {resendOk && (
                  <p className="text-center text-xs font-semibold text-emerald-600">
                    A new code is on its way — check your inbox in a minute.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setCode("");
                    setError("");
                  }}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600"
                >
                  ← Use a different email
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100/90 via-white to-emerald-50/40 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mx-auto flex justify-center drop-shadow-[0_8px_24px_rgba(24,176,90,0.2)]"
          >
            <FunBerryLogo size="xl" />
          </motion.div>
          <h1 className="font-display mt-2 text-2xl font-bold text-sky-900 sm:text-3xl">
            Create your account
          </h1>
          <p className="text-gray-500 mt-1">
            Create a free account to start your child&apos;s learning adventure
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="glass-card space-y-5 rounded-kid p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg"
              placeholder="Parent Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg"
              placeholder="parent@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">4-Digit Parent PIN</label>
            <p className="text-xs text-gray-400 mb-2">Used to unlock the app after timer expires</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg text-center tracking-[0.5em] font-mono"
              placeholder="• • • •"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.03, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            className="kid-glass-btn kid-glass-leaf w-full rounded-kid py-4 text-lg transition disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Creating account..." : "🎉 Create Free Account"}
          </motion.button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-sky-600 font-bold hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </main>
  );
}
