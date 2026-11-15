import {
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  Lock as LockIcon,
  Mail,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";
import AuthLayout from "../layouts/AuthLayout";
import { getMaxBirthDateString } from "../utils/validation";

export default function Signup({ modal = false }) {
  const {
    formData,
    error,
    fieldErrors,
    loading,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    handleClose,
    handleChange,
    handleSubmit,
    getInputClass,
    hasFieldErrors,
    location,
  } = useSignup({ modal });

  const maxBirthDate = useMemo(() => getMaxBirthDateString(), []);

  const formContent = (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2f5bf5] shadow-xs">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2
              id="signup-modal-title"
              className="font-heading text-xl font-bold tracking-tight text-slate-900"
            >
              Create an Account
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Get started with your free 1,000 checks
            </p>
          </div>
        </div>
        {modal && (
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form className="space-y-3.5" onSubmit={handleSubmit}>
        {/* Top Error Banner */}
        {!hasFieldErrors && error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50/80 p-3 text-xs text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="mb-0.5 font-bold text-red-800">
                Registration Error
              </p>
              <p className="leading-normal font-medium text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1 ml-0.5 block font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              First Name
            </label>
            <div className="relative">
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={
                  fieldErrors.firstName ? "firstName-error" : undefined
                }
                className={`${getInputClass("firstName")} pl-3.5`}
                placeholder="Jane"
              />
              {fieldErrors.firstName && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {fieldErrors.firstName && (
              <p
                id="firstName-error"
                role="alert"
                className="mt-1 ml-1 text-xs font-medium text-red-600"
              >
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-1 ml-0.5 block font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Last Name
            </label>
            <div className="relative">
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={
                  fieldErrors.lastName ? "lastName-error" : undefined
                }
                className={`${getInputClass("lastName")} pl-3.5`}
                placeholder="Doe"
              />
              {fieldErrors.lastName && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {fieldErrors.lastName && (
              <p
                id="lastName-error"
                role="alert"
                className="mt-1 ml-1 text-xs font-medium text-red-600"
              >
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="username"
            className="mb-1 ml-0.5 block font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase"
          >
            Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <User
                className={`h-4 w-4 ${
                  fieldErrors.username ? "text-red-500" : "text-slate-400"
                }`}
              />
            </div>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={
                fieldErrors.username ? "username-error" : undefined
              }
              className={`${getInputClass("username")} pl-9`}
              placeholder="janedoe"
            />
            {fieldErrors.username && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          {fieldErrors.username && (
            <p
              id="username-error"
              role="alert"
              className="mt-1 ml-1 text-xs font-medium text-red-600"
            >
              {fieldErrors.username}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 ml-0.5 block font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail
                className={`h-4 w-4 ${
                  fieldErrors.email ? "text-red-500" : "text-slate-400"
                }`}
              />
            </div>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={`${getInputClass("email")} pl-9`}
              placeholder="jane@example.com"
            />
            {fieldErrors.email && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          {fieldErrors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 ml-1 text-xs font-medium text-red-600"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="mb-1 ml-0.5 block font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase"
          >
            Date of Birth
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Calendar
                className={`h-4 w-4 ${
                  fieldErrors.dateOfBirth ? "text-red-500" : "text-slate-400"
                }`}
              />
            </div>
            <input
              id="dateOfBirth"
              type="date"
              required
              max={maxBirthDate}
              value={formData.dateOfBirth}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.dateOfBirth)}
              aria-describedby={
                fieldErrors.dateOfBirth ? "dateOfBirth-error" : undefined
              }
              className={`${getInputClass("dateOfBirth")} pl-9`}
            />
            {fieldErrors.dateOfBirth && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          {fieldErrors.dateOfBirth && (
            <p
              id="dateOfBirth-error"
              role="alert"
              className="mt-1 ml-1 text-xs font-medium text-red-600"
            >
              {fieldErrors.dateOfBirth}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="password"
              className="mb-1 ml-0.5 block font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <LockIcon
                  className={`h-4 w-4 ${
                    fieldErrors.password ? "text-red-500" : "text-slate-400"
                  }`}
                />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
                className={`${getInputClass("password")} pl-9`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p
                id="password-error"
                role="alert"
                className="mt-1 ml-1 text-xs font-medium text-red-600"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 ml-0.5 block font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Confirm
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <LockIcon
                  className={`h-4 w-4 ${
                    fieldErrors.confirmPassword
                      ? "text-red-500"
                      : "text-slate-400"
                  }`}
                />
              </div>
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={
                  fieldErrors.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
                className={`${getInputClass("confirmPassword")} pl-9`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p
                id="confirmPassword-error"
                role="alert"
                className="mt-1 ml-1 text-xs font-medium text-red-600"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full cursor-pointer justify-center rounded-md bg-[#2f5bf5] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#204be8] focus:ring-2 focus:ring-[#2f5bf5]/20 focus:outline-none disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
          By creating an account, you agree to our{" "}
          <Link
            to="/terms"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 underline underline-offset-2 transition-colors hover:text-[#2f5bf5]"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 underline underline-offset-2 transition-colors hover:text-[#2f5bf5]"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs font-medium text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            state={modal ? location.state : undefined}
            className="font-semibold text-[#2f5bf5] transition-colors hover:text-[#204be8]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  if (modal) {
    return (
      <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={handleClose}
        />
        {/* Modal Card */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
          className="animate-in zoom-in-95 relative w-full max-w-lg duration-200"
        >
          <div className="rounded-[10px] border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-7">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  // Standalone full-page fallback
  return (
    <AuthLayout>
      <div className="w-full max-w-lg rounded-[10px] border border-slate-200/80 bg-white p-6 shadow-xs sm:p-7">
        {formContent}
      </div>
    </AuthLayout>
  );
}
