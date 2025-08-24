"use client";
import React from "react";
import "../globals.css";

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
    />
  </svg>
);

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-200 min-h-screen font-sans flex">
        {/* Top Header Bar */}
        <header className="bg-gray-800 shadow-md h-20 flex items-center px-8">
          <div className="flex items-center">
            <LogoIcon />
            <span className="ml-3 text-2xl font-bold text-white">SkyScan</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}
