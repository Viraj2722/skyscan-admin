"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [form, setForm] = useState({
    admin_name: "",
    admin_pass: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Query the admin table for matching credentials
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("admin_name", form.admin_name)
      .eq("admin_pass", form.admin_pass)
      .single();
    if (error || !data) {
      setMessage("Invalid credentials");
    } else {
      setMessage("");
      if (typeof window !== "undefined") {
        localStorage.setItem("isAdminLoggedIn", "true");
      }
      router.push("/"); // Redirect to home or dashboard
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-white mb-4 text-center">
          Admin Login
        </h2>
        <input
          name="admin_name"
          type="text"
          placeholder="Admin Name"
          value={form.admin_name}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          required
        />
        <input
          name="admin_pass"
          type="password"
          placeholder="Password"
          value={form.admin_pass}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all"
        >
          Login
        </button>
        {message && (
          <div className="text-center text-red-400 mt-2">{message}</div>
        )}
      </form>
    </div>
  );
}
