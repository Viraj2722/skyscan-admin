"use client"; // This is a client component because it uses state

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerBillboard } from "../../lib/supabaseClient";
import { insertComplaint } from "../../lib/supabaseClient";

// Reusable Input Field Component
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}: InputFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
      />
    </div>
  );
};

export default function BillboardRegPage() {
  const [form, setForm] = useState({
    billboard_id: "",
    coordinates: "",
    size: "",
    address: "",
    owner: "",
    validity_from: "",
    validity_to: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.url) {
        setImagePreview(result.url);
        setForm({ ...form, image_url: result.url });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      id: form.billboard_id,
      address: form.address,
      owner: form.owner,
      status: "active",
      image_url: form.image_url,
      validity_from: form.validity_from,
      validity_till: form.validity_to,
      size: form.size,
      "latitude and latitude": form.coordinates,
    };
    const error = await registerBillboard(data);
    // Insert a complaint for this billboard registration
    await insertComplaint({
      billboard_id: form.billboard_id ? form.billboard_id : "",
      report_type: "registration",
      description: `Billboard ${form.billboard_id} registered by ${form.owner}`,
      status: "open",
      image_url: form.image_url,
    });
    if (error) {
      console.error("Supabase registration error:", error);
      setMessage("Registration failed.");
    } else {
      setMessage("Billboard registered!");
      setForm({
        billboard_id: "",
        coordinates: "",
        size: "",
        address: "",
        owner: "",
        validity_from: "",
        validity_to: "",
        image_url: "",
      });
      setImagePreview(null);
      setTimeout(() => router.push("/"), 1500);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Register a New Billboard
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-8 items-start"
      >
        {/* Image Upload Section */}
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-full">
          <div className="w-full h-64 flex items-center justify-center bg-gray-700 rounded-lg">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Billboard"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="mt-2 text-sm">Upload Billboard Image</span>
              </label>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            onChange={handleImageUpload}
            accept="image/*"
          />
        </div>

        {/* Form Fields Section */}
        <div className="space-y-4">
          <InputField
            label="Billboard ID"
            placeholder="e.g., BB-12345"
            value={form.billboard_id}
            onChange={handleChange}
            name="billboard_id"
          />
          <InputField
            label="Longitude and Latitude"
            placeholder="e.g., 19.0760, 72.8777"
            value={form.coordinates}
            onChange={handleChange}
            name="coordinates"
          />
          <InputField
            label="Size"
            placeholder="e.g., 40x20 ft"
            value={form.size}
            onChange={handleChange}
            name="size"
          />
          <InputField
            label="Address"
            placeholder="Enter full address"
            value={form.address}
            onChange={handleChange}
            name="address"
          />
          <InputField
            label="Owner"
            placeholder="Owner's name"
            value={form.owner}
            onChange={handleChange}
            name="owner"
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Validity Date From"
              type="date"
              placeholder={""}
              value={form.validity_from}
              onChange={handleChange}
              name="validity_from"
            />
            <InputField
              label="Validity Date To"
              type="date"
              placeholder={""}
              value={form.validity_to}
              onChange={handleChange}
              name="validity_to"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex justify-center items-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full md:w-1/2 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-gray-500/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full md:w-1/2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-green-500/50"
          >
            Register Billboard
          </button>
        </div>
        {message && (
          <div className="md:col-span-2 text-center text-white mt-4">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
