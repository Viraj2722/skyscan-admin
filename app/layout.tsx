"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

const DashboardIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
const BillboardIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-6V5m0 2v6m0 0h6m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z"
    />
  </svg>
);
const ComplaintIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364m12.728 0L5.636 5.636"
    />
  </svg>
);
const LogoutIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    ></path>
  </svg>
);
const LogoIcon = () => (
  <svg
    className="w-8 h-8 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h14M12 5l7 7-7 7"
    ></path>
  </svg>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navLinks = [
    { href: "/", label: "Dashboard", icon: <DashboardIcon /> },
    {
      href: "/billboard-reg",
      label: "Manage Billboards",
      icon: <BillboardIcon />,
    },
    { href: "/complains", label: "View Complaints", icon: <ComplaintIcon /> },
  ];

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
      if (!isLoggedIn && pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAdminLoggedIn");
      window.location.href = "/login";
    }
  };

  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-200 min-h-screen font-sans flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gray-800 shadow-2xl flex flex-col flex-shrink-0">
          <div className="flex items-center justify-center h-20 border-b border-gray-700">
            <LogoIcon />
            <span className="ml-3 text-2xl font-bold text-white">SkyScan</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <LogoutIcon />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-gray-800 shadow-md h-20 flex items-center px-8">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          </header>
          <main className="flex-1 p-8 overflow-y-auto bg-gray-900">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
