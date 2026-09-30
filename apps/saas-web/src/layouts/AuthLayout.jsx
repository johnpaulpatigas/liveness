import { ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AuthLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const openModal = (path) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 font-sans text-slate-900">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md sm:px-6 md:h-20 md:px-12">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 shrink-0 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Liveness Cloud
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("/login")}
            className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            Log in
          </button>
          <button
            onClick={() => openModal("/signup")}
            className="cursor-pointer rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            Sign up
          </button>
        </div>
      </header>

      <main
        id="main-content"
        className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8"
      >
        {children}
      </main>

      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs font-medium text-slate-600">
        &copy; {new Date().getFullYear()} Liveness Cloud. All rights reserved.
      </footer>
    </div>
  );
}
