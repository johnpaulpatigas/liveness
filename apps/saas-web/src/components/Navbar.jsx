import { ChevronRight, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = (path) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  const isDocsPage = location.pathname === "/docs";

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMobileNav = (id) => (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "px-4 pt-3 sm:px-6 md:px-12" : "px-0 pt-0"
      }`}
    >
      <nav
        className={`mx-auto flex items-center justify-between transition-all duration-300 ${
          isScrolled
            ? "h-16 max-w-6xl rounded-2xl border border-white/60 bg-white/80 px-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl"
            : `h-16 max-w-7xl border-b border-slate-200/60 px-4 backdrop-blur-md sm:px-6 md:h-20 md:px-12 ${
                isDocsPage ? "bg-slate-50/80" : "bg-white/80"
              }`
        }`}
      >
        <Link to="/" className="group flex cursor-pointer items-center gap-2">
          <ShieldCheck className="h-7 w-7 shrink-0 text-blue-600" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Liveness
            <span className="ml-0.5 font-light text-blue-600">Cloud</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          <a
            href="#features"
            onClick={scrollTo("features")}
            className="cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={scrollTo("how-it-works")}
            className="cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            How it works
          </a>
          <a
            href="#faq"
            onClick={scrollTo("faq")}
            className="cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            FAQ
          </a>
          <Link
            to="/docs"
            className={`text-sm font-medium transition-colors ${
              isDocsPage
                ? "font-extrabold text-blue-600"
                : "text-slate-600 hover:text-blue-600"
            }`}
          >
            Docs
          </Link>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center space-x-3 md:flex">
          <button
            onClick={() => openModal("/login")}
            className="cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
          >
            Log in
          </button>
          <button
            onClick={() => openModal("/signup")}
            className="cursor-pointer rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Dropdown Menu (Clean & Simple with Chevrons) */}
        {mobileMenuOpen && (
          <div
            className={`flex flex-col space-y-4 bg-white p-6 shadow-xl transition-all duration-300 md:hidden ${
              isScrolled
                ? "absolute top-full right-0 left-0 mt-2 rounded-2xl border border-slate-200"
                : "absolute top-full right-0 left-0 border-b border-slate-200"
            }`}
          >
            <a
              href="#features"
              onClick={handleMobileNav("features")}
              className="flex cursor-pointer items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
            >
              <span>Features</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="#how-it-works"
              onClick={handleMobileNav("how-it-works")}
              className="flex cursor-pointer items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
            >
              <span>How it works</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="#faq"
              onClick={handleMobileNav("faq")}
              className="flex cursor-pointer items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
            >
              <span>FAQ</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </a>

            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
            >
              <span>Docs</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <div className="border-t border-slate-100 pt-2" />

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal("/login");
              }}
              className="cursor-pointer text-center text-base font-semibold text-slate-700 hover:text-blue-600"
            >
              Log in
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal("/signup");
              }}
              className="cursor-pointer rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
