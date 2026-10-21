"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { CupSoda, Eye, EyeOff, Info } from "lucide-react";

type LoginErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const foundErrors = validateLogin(email, password);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    // Demo only: nothing is checked or saved. Real login comes from the backend later.
    router.push("/");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
          <CupSoda className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-neutral-900">
            Iced Tea House
          </p>
          <p className="text-xs text-neutral-500">Management System</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-neutral-900">Sign in</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Welcome back. Enter your details to continue.
      </p>

      <div
        role="note"
        className="mt-5 flex gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-800"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-semibold">Demo only.</span> This is not real
          authentication. Any valid-looking email and a password of 6 or more
          characters will open the dashboard. Do not enter a real password.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="loginEmail"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Email
          </label>
          <input
            id="loginEmail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "loginEmail-error" : undefined}
            className={inputClass}
          />
          {errors.email && (
            <p
              id="loginEmail-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="loginPassword"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="loginPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "loginPassword-error" : undefined
              }
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 transition-colors hover:text-neutral-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              id="loginPassword-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}