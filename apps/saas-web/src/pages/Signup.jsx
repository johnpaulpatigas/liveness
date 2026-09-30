import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock as LockIcon,
  Mail,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../layouts/AuthLayout";
import { api } from "../services/api";

const BANNED_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "bastard",
  "damn",
  "cunt",
  "dick",
  "cock",
  "piss",
  "slut",
  "whore",
  "nigger",
  "faggot",
];
const containsBannedWord = (val) =>
  BANNED_WORDS.some((w) => val.toLowerCase().includes(w));

const nameRule = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be 50 characters or fewer")
  .regex(
    /^[a-zA-Z\s\-']+$/,
    "Only letters, spaces, hyphens, and apostrophes allowed",
  )
  .refine((val) => !containsBannedWord(val), {
    message: "Name contains inappropriate language",
  });

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or fewer")
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "Username may only contain letters, numbers, underscores, dots, or hyphens",
      )
      .refine((val) => !containsBannedWord(val), {
        message: "Username contains inappropriate language",
      }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(/[A-Z]/, "Password must have at least 1 upper case letter.")
      .regex(/[a-z]/, "Password must have at least 1 lower case letter.")
      .regex(/[0-9]/, "Password must have at least 1 number."),
    confirmPassword: z.string(),
    firstName: nameRule,
    lastName: nameRule,
    email: z.string().email("Invalid email address"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup({ modal = false }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = useCallback(() => {
    navigate(location.state?.backgroundLocation?.pathname || "/", {
      replace: true,
    });
  }, [navigate, location.state]);

  // Close modal on Escape key
  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal, handleClose]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0]] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setLoading(true);
    try {
      await api.auth.signup(
        formData.username,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.email,
      );
      await api.auth.login(formData.username, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldId) => {
    const base =
      "block w-full rounded-lg border py-2.5 pr-4 text-sm font-medium transition-all focus:outline-none";
    if (fieldErrors[fieldId]) {
      return `${base} border-red-500 bg-red-50/20 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10`;
    }
    return `${base} border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10`;
  };

  const hasFieldErrors = Object.keys(fieldErrors).some(
    (key) => fieldErrors[key],
  );

  const formContent = (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2
              id="signup-modal-title"
              className="text-xl font-extrabold tracking-tight text-slate-900"
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
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 shadow-2xs"
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
              className="mb-1 ml-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
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
              className="mb-1 ml-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
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
            className="mb-1 ml-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
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
            className="mb-1 ml-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="password"
              className="mb-1 ml-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
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
              className="mb-1 ml-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
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
          className="mt-2 flex w-full cursor-pointer justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
          By creating an account, you agree to our{" "}
          <Link
            to="/terms"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 underline underline-offset-2 transition-colors hover:text-blue-600"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 underline underline-offset-2 transition-colors hover:text-blue-600"
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
            className="font-bold text-blue-600 transition-colors hover:text-blue-700"
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
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-7">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  // Standalone full-page fallback
  return (
    <AuthLayout>
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200 sm:p-7">
        {formContent}
      </div>
    </AuthLayout>
  );
}
