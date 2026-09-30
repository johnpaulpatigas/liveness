import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Book,
  Key,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  setSearchModalOpen,
  fullName,
  initials,
  user,
  handleLogout,
}) {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/logs", icon: BarChart3, label: "Logs" },
    { path: "/api-keys", icon: Key, label: "API Keys" },
    { path: "/docs", icon: Book, label: "Documentation" },
  ];

  const renderNavContent = (isCollapsed = false) => (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* Scrollable Nav Area */}
      <div
        className={`flex-1 overflow-y-auto py-5 ${isCollapsed ? "px-2" : "px-4"}`}
      >
        {/* Mobile Header Brand & Close Button (Mobile Drawer Only) */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 md:hidden">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-2"
          >
            <ShieldCheck className="h-7 w-7 shrink-0 text-blue-600" />
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Liveness
              <span className="ml-0.5 font-light text-blue-600">Cloud</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile User Profile Card (Mobile Drawer Only) */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50/80 to-indigo-50/50 p-4 shadow-xs md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-500/20">
              {initials}
            </div>
            <div className="flex min-w-0 flex-col overflow-hidden text-left">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-extrabold text-slate-900">
                  {fullName}
                </span>
              </div>
              <span className="truncate text-[11px] font-medium text-slate-500">
                {user?.email || "admin@liveness.cloud"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <div className="mb-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex cursor-pointer items-center rounded-xl py-2.5 text-xs font-bold transition-colors duration-150 sm:text-sm ${
                      isCollapsed ? "justify-center px-0" : "px-3.5"
                    } ${
                      isActive
                        ? "bg-blue-50/80 font-extrabold text-blue-600"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <item.icon
                      className={`h-4.5 w-4.5 shrink-0 ${
                        isCollapsed ? "" : "mr-3"
                      } ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? "hidden w-0 opacity-0" : "inline-block opacity-100"}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Account Management (Mobile Drawer Only) */}
        <div className="md:hidden">
          <div className="mb-2 px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Account Management
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors duration-150 sm:text-sm ${
                  location.pathname === "/settings"
                    ? "bg-blue-50/80 font-extrabold text-blue-600"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <SettingsIcon className="mr-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                Account Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 sm:text-sm"
              >
                <LogOut className="mr-3 h-4.5 w-4.5 shrink-0 text-rose-500" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-40 cursor-pointer bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel (Smooth Slide-In) */}
      <aside
        aria-label="Mobile navigation"
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80vw] flex-col justify-between border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Desktop Sidebar (Smooth Hardware-Accelerated Collapse) */}
      <aside
        aria-label="Sidebar navigation"
        className={`relative z-10 hidden h-screen shrink-0 flex-col justify-between overflow-hidden border-r border-slate-100 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-[width] duration-300 ease-in-out md:flex ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Desktop Sidebar Header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-slate-100 md:h-20 ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-6"}`}
        >
          {!sidebarCollapsed && (
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 truncate"
            >
              <ShieldCheck className="h-7 w-7 shrink-0 text-blue-600" />
              <span className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                Liveness
                <span className="ml-0.5 font-light text-blue-600">Cloud</span>
              </span>
            </Link>
          )}

          <div className="flex items-center gap-1">
            {!sidebarCollapsed && (
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                title="Search Platform (Ctrl+K)"
                aria-label="Search Platform (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title={
                sidebarCollapsed
                  ? "Expand Sidebar (Ctrl+B)"
                  : "Collapse Sidebar (Ctrl+B)"
              }
              aria-label={
                sidebarCollapsed
                  ? "Expand Sidebar (Ctrl+B)"
                  : "Collapse Sidebar (Ctrl+B)"
              }
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4.5 w-4.5 text-blue-600" />
              ) : (
                <PanelLeftClose className="h-4.5 w-4.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Nav Content */}
        {renderNavContent(sidebarCollapsed)}
      </aside>
    </>
  );
}
