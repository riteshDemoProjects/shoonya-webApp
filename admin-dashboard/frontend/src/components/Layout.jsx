import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: DashboardIcon },
  { path: "/products", label: "Products", icon: ProductsIcon },
  { path: "/orders", label: "Orders", icon: OrdersIcon },
  { path: "/users", label: "Users", icon: UsersIcon },
];

function DashboardIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function ProductsIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function OrdersIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

export function Layout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell min-h-screen">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="app-brand flex items-center justify-between h-20 px-6">
            <Link
              to="/"
              className="flex items-center gap-3"
              aria-label="Shoonya Farms Admin Home"
            >
              <div className="app-mark w-9 h-9 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Shoonya Farms</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            className="app-nav flex-1 px-4 py-6 space-y-2 overflow-y-auto"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" &&
                  location.pathname.startsWith(item.path + "/"));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`app-nav-link flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "app-nav-link-active" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="app-profile p-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="app-avatar w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {admin?.full_name || "Admin"}
                </p>
                <p className="text-xs truncate">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="app-logout w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            >
              <LogoutIcon className="w-5 h-5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="app-topbar sticky top-0 z-30">
          <div className="app-demo-notice" role="status">
            This is a demo-purpose page, not to be used for business purposes.
          </div>
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center gap-4">
              <span className="hidden sm:block app-topbar-label text-sm">
                Operations / Admin Dashboard
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="app-main p-4 sm:p-6 lg:p-8"
          id="main-content"
          role="main"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
