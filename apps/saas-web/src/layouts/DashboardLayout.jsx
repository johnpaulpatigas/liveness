import {
  BarChart3,
  Book,
  ChevronDown,
  ChevronRight,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(() => api.auth.getCurrentUser());

  // Listen for auth updates
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(api.auth.getCurrentUser());
    };
    window.addEventListener("auth:login", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth:login", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Handle Escape key to close modal and Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && searchModalOpen) {
        setSearchModalOpen(false);
        setSearchQuery("");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchModalOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await api.auth.logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/logs", icon: BarChart3, label: "Logs" },
    { path: "/api-keys", icon: Key, label: "API Keys" },
    { path: "/docs", icon: Book, label: "Documentation" },
  ];

  // Optimal 4 core items for mobile bottom navigation bar (iOS/Android HIG standard)
  const mobileBottomNavItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/logs", icon: BarChart3, label: "Logs" },
    { path: "/api-keys", icon: Key, label: "API Keys" },
  ];

  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
      "AD"
    : "AD";

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Administrator";

  const currentPageLabel =
    navItems.find((n) => n.path === location.pathname)?.label ||
    (location.pathname === "/settings" ? "Settings" : "Dashboard");

  return (
    <div className="relative flex h-screen min-h-screen w-full overflow-hidden bg-slate-50/40 font-sans text-slate-900">
      {/* Standalone Sidebar Component */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setSearchModalOpen={setSearchModalOpen}
        fullName={fullName}
        initials={initials}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main id="main-content" className="relative z-10 min-w-0 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md sm:px-6 md:h-20 md:px-8">
          {/* Left: Mobile Brand Logo & Desktop Breadcrumbs */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Mobile Brand Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <Link to="/dashboard" className="flex items-center gap-1.5">
                <ShieldCheck className="h-6 w-6 shrink-0 text-blue-600" />
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Liveness
                  <span className="ml-0.5 font-light text-blue-600">Cloud</span>
                </span>
              </Link>
            </div>

            {/* Desktop Breadcrumb Hierarchy */}
            <div className="hidden min-w-0 items-center gap-2 text-sm font-semibold text-slate-500 md:flex">
              <span className="text-slate-400">Dashboard</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              <h2 className="truncate text-lg font-extrabold text-slate-900">
                {currentPageLabel}
              </h2>
            </div>
          </div>

          {/* Right Controls: Profile Dropdown (Desktop Only), Mobile Search & Mobile Hamburger Button */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Mobile Search Button (Beside Hamburger Button) */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition-colors hover:bg-slate-100 hover:text-slate-800 md:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Profile Dropdown - Hidden on Mobile to avoid redundancy with Mobile Drawer */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white p-1.5 pr-3 shadow-xs transition-all hover:border-slate-300"
                aria-label="Profile menu"
                aria-expanded={profileDropdownOpen}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs leading-tight font-bold text-slate-900">
                    {fullName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {user?.email || "admin@liveness.cloud"}
                  </span>
                </div>
                <ChevronDown
                  className={`ml-0.5 h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    profileDropdownOpen
                      ? "rotate-180 text-blue-600"
                      : "group-hover:text-slate-600"
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl duration-150">
                  <div className="mb-1 border-b border-slate-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-900">
                      {fullName}
                    </p>
                    <p className="truncate text-[11px] font-medium text-slate-400">
                      {user?.email || "admin@liveness.cloud"}
                    </p>
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <SettingsIcon className="h-4 w-4 text-slate-400" />
                    Account Settings
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs transition-colors hover:bg-slate-100 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 pb-20 sm:p-6 md:p-8 md:pb-8">
          {children}
        </div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav className="fixed right-0 bottom-0 left-0 z-30 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-lg md:hidden">
          {mobileBottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 transition-colors ${
                  isActive
                    ? "font-extrabold text-blue-600"
                    : "font-medium text-slate-500 hover:text-slate-800"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                <span className="mt-1 text-[10px] tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>

      {/* Global Real-Time Search Pop-Up Modal (React Portal) */}
      {searchModalOpen &&
        createPortal(
          <div className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 px-4 pt-16 backdrop-blur-xs duration-150 sm:pt-24">
            <div
              className="fixed inset-0"
              onClick={() => {
                setSearchModalOpen(false);
                setSearchQuery("");
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Quick search"
              className="animate-in zoom-in-95 relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl duration-150"
            >
              {/* Modal Search Header Input */}
              <div className="flex items-center border-b border-slate-100 px-4 py-3.5">
                <Search className="mr-3 h-5 w-5 shrink-0 text-blue-600" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchModalOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, documentation, or users..."
                  aria-label="Search pages, documentation, or users"
                  className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSearchModalOpen(false);
                    setSearchQuery("");
                  }}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-500 hover:bg-slate-200"
                >
                  ESC
                </button>
              </div>

              {/* Modal Results List */}
              <div className="max-h-96 overflow-y-auto p-2">
                {(() => {
                  const q = searchQuery.trim().toLowerCase();

                  // 1. Pages Navigation
                  const pages = navItems.filter(
                    (i) =>
                      i.label.toLowerCase().includes(q) || i.path.includes(q),
                  );

                  // 2. Documentation Sections
                  const docSections = [
                    {
                      id: "introduction",
                      label: "Documentation: Introduction",
                      path: "/docs#introduction",
                      desc: "Overview and system architecture",
                    },
                    {
                      id: "sdk-usage",
                      label: "Documentation: Frontend SDK",
                      path: "/docs#sdk-usage",
                      desc: "JavaScript SDK setup, React hook, and camera management",
                    },
                    {
                      id: "cloud-usage",
                      label: "Documentation: Backend & Cloud API",
                      path: "/docs#cloud-usage",
                      desc: "Session tokens, enrollment, and verification routes",
                    },
                    {
                      id: "ai-skills",
                      label: "Documentation: AI Assistant Skills",
                      path: "/docs#ai-skills",
                      desc: "Agent rules, CLI setup, and integration prompts",
                    },
                    {
                      id: "methodology",
                      label: "Documentation: Methodology",
                      path: "/docs#methodology",
                      desc: "Blink EAR, 3D yaw/pitch pose, and ResNet-34 embeddings",
                    },
                    {
                      id: "troubleshooting",
                      label: "Documentation: Troubleshooting",
                      path: "/docs#troubleshooting",
                      desc: "Camera permissions, mobile Safari, CSP, and lighting",
                    },
                    {
                      id: "api-ref",
                      label: "Documentation: API Reference",
                      path: "/docs#api-ref",
                      desc: "Configuration options, event registry, and error codes",
                    },
                  ].filter(
                    (d) =>
                      d.label.toLowerCase().includes(q) ||
                      d.desc.toLowerCase().includes(q),
                  );

                  const hasResults = pages.length > 0 || docSections.length > 0;

                  return (
                    <div className="space-y-3 p-1">
                      {/* Documentation Sections */}
                      {docSections.length > 0 && (
                        <div className="space-y-1">
                          <div className="px-3 py-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Documentation & Guides
                          </div>
                          {docSections.map((doc) => (
                            <Link
                              key={doc.id}
                              to={doc.path}
                              onClick={() => {
                                setSearchModalOpen(false);
                                setSearchQuery("");
                              }}
                              className="group flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-blue-50/80"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                  <Book className="h-4 w-4" />
                                </div>
                                <div>
                                  <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-700">
                                    {doc.label}
                                  </span>
                                  <span className="block text-[10px] font-medium text-slate-400">
                                    {doc.desc}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-300 group-hover:text-blue-600">
                                View &rarr;
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Platform Navigation */}
                      {pages.length > 0 && (
                        <div className="space-y-1">
                          <div className="px-3 py-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Platform Navigation
                          </div>
                          {pages.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                  setSearchModalOpen(false);
                                  setSearchQuery("");
                                }}
                                className="group flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-blue-50/80"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-700">
                                      {item.label}
                                    </span>
                                    <span className="block text-[10px] font-medium text-slate-400">
                                      Jump to {item.path}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-slate-300 group-hover:text-blue-600">
                                  Go &rarr;
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {!hasResults && (
                        <div className="py-8 text-center text-xs font-bold text-slate-400">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
