import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-10 py-4 backdrop-blur-[10px]">
      <div className="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>

        <a href="#top" className="no-underline">
          <span className="font-[DM_Sans] text-[1rem] font-bold tracking-[0.02em] text-white">
            Liveness Cloud
          </span>
        </a>
      </div>

      <div className="hidden items-center gap-8 md:flex">
        {[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="font-[DM_Sans] text-[0.9rem] text-white no-underline transition-colors hover:text-[#EDEADE]"
          >
            {label}
          </a>
        ))}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <Link
          to="/login"
          className="font-[DM_Sans] text-[0.875rem] text-white no-underline transition-colors hover:text-white"
        >
          Log in
        </Link>

        <Link
          to="/signup"
          className="rounded-md bg-[#2563eb] px-[1.1rem] py-2 font-[DM_Sans] text-[0.875rem] font-semibold text-white no-underline transition-all hover:bg-[#1d4ed8]"
        >
          Get Started
        </Link>
      </div>

      <button
        onClick={() => setMenuOpen((p) => !p)}
        className="text-xl text-white md:hidden"
      >
        ☰
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 flex w-full flex-col gap-4 bg-black/10 px-6 py-4 md:hidden">
          <a href="#features" className="text-white no-underline">
            Features
          </a>
          <a href="#pricing" className="text-white no-underline">
            Pricing
          </a>

          <Link to="/login" className="text-white no-underline">
            Log in
          </Link>

          <Link
            to="/signup"
            className="rounded-md bg-[#2563eb] py-2 text-center text-white"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
