import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { signupSchema } from "../utils/validation";

export function useSignup({ modal = false } = {}) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
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
        formData.dateOfBirth,
      );
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldId) => {
    const base =
      "block w-full rounded-[6px] border py-2 pr-4 text-sm font-medium transition-all focus:outline-none";
    if (fieldErrors[fieldId]) {
      return `${base} border-red-500 bg-red-50/20 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10`;
    }
    return `${base} border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-[#2f5bf5] focus:ring-2 focus:ring-[#2f5bf5]/10`;
  };

  const hasFieldErrors = Object.keys(fieldErrors).some(
    (key) => fieldErrors[key],
  );

  return {
    formData,
    setFormData,
    error,
    setError,
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
  };
}
