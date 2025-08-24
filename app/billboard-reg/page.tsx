"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  registerBillboard,
  uploadImageToSupabase,
  supabase, // <-- import supabase client
} from "../../lib/supabaseClient";

// Reusable Input Field Component
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required?: boolean;
}

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  required = false,
}: InputFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors text-white placeholder-gray-400"
      />
    </div>
  );
};

export default function BillboardRegPage() {
  const [form, setForm] = useState({
    billboard_id: "",
    latitude: "",
    longitude: "",
    size: "",
    address: "",
    owner: "",
    validity_from: "",
    validity_to: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setMessage("File size must be less than 10MB");
        return;
      }

      setIsUploading(true);
      setMessage("Uploading image...");

      try {
        const { error, publicUrl } = await uploadImageToSupabase(
          file,
          "adminbillboard"
        );

        if (error) {
          console.error("Upload error:", error);
          setMessage("Image upload failed. Please try again.");
          return;
        }

        if (publicUrl) {
          setImagePreview(publicUrl);
          setForm({ ...form, image_url: publicUrl });
          setMessage("Image uploaded successfully!");
          setTimeout(() => setMessage(""), 3000);
        }
      } catch (error) {
        console.error("Upload error:", error);
        setMessage("Image upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "billboard_id",
      "latitude",
      "longitude",
      "size",
      "address",
      "owner",
      "validity_from",
      "validity_to",
      "image_url", // Add image_url as required
    ];

    for (const field of requiredFields) {
      if (!form[field as keyof typeof form].trim()) {
        setMessage(
          field === "image_url"
            ? "Please upload a billboard image."
            : `Please fill in the ${field.replace("_", " ")} field.`
        );
        return false;
      }
    }

    // Validate coordinates
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setMessage("Please enter valid latitude and longitude coordinates.");
      return false;
    }

    // Validate dates
    const fromDate = new Date(form.validity_from);
    const toDate = new Date(form.validity_to);
    if (toDate <= fromDate) {
      setMessage("Validity end date must be after start date.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage("Checking for duplicate ID...");

    // Check for duplicate billboard_id
    const { data: existing, error: checkError } = await supabase
      .from("billboards")
      .select("id")
      .eq("id", form.billboard_id.trim())
      .single();

    if (existing) {
      setMessage("A billboard with this ID already exists.");
      setIsSubmitting(false);
      return;
    }
    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116: No rows found, which is fine
      setMessage("Error checking for duplicate ID. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setMessage("Registering billboard...");

    try {
      const billboardData = {
        id: form.billboard_id.trim(),
        address: form.address.trim(),
        owner: form.owner.trim(),
        status: "active",
        image_url: form.image_url,
        validity_from: form.validity_from,
        validity_till: form.validity_to,
        size: form.size.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      // Register billboard
      const registrationError = await registerBillboard(billboardData);

      if (registrationError) {
        console.error("Supabase registration error:", registrationError);
        setMessage("Registration failed. Please try again.");
        return;
      }

      setMessage("Billboard registered successfully!");

      // Reset form
      setForm({
        billboard_id: "",
        latitude: "",
        longitude: "",
        size: "",
        address: "",
        owner: "",
        validity_from: "",
        validity_to: "",
        image_url: "",
      });
      setImagePreview(null);

      // Redirect after success
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-6xl mx-auto">
        {/* Message Display (moved above heading) */}
        {message && (
          <div
            className={`text-center mb-6 p-3 rounded-lg ${
              message.includes("success") || message.includes("uploaded")
                ? "bg-green-900 text-green-200 border border-green-700"
                : message.includes("failed") || message.includes("error")
                ? "bg-red-900 text-red-200 border border-red-700"
                : "bg-blue-900 text-blue-200 border border-blue-700"
            }`}
          >
            {message}
          </div>
        )}
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Register a New Billboard
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-8 items-start"
        >
          {/* Image Upload Section */}
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-full">
            <div className="w-full h-64 flex items-center justify-center bg-gray-700 rounded-lg relative">
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-white">Uploading...</div>
                </div>
              )}
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Billboard Preview"
                    className="w-full h-full object-cover rounded-lg" // changed here
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setForm({ ...form, image_url: "" });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="mt-2 text-sm">Upload Billboard Image</span>
                  <span className="mt-1 text-xs text-gray-500">
                    (JPG, PNG, GIF up to 10MB)
                  </span>
                </label>
              )}
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
              disabled={isUploading}
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
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Latitude"
                type="number"
                placeholder="e.g., 19.0760"
                value={form.latitude}
                onChange={handleChange}
                name="latitude"
                required
              />
              <InputField
                label="Longitude"
                type="number"
                placeholder="e.g., 72.8777"
                value={form.longitude}
                onChange={handleChange}
                name="longitude"
                required
              />
            </div>
            <InputField
              label="Size"
              placeholder="e.g., 40x20 ft"
              value={form.size}
              onChange={handleChange}
              name="size"
              required
            />
            <InputField
              label="Address"
              placeholder="Enter full address"
              value={form.address}
              onChange={handleChange}
              name="address"
              required
            />
            <InputField
              label="Owner"
              placeholder="Owner's name"
              value={form.owner}
              onChange={handleChange}
              name="owner"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Validity Date From"
                type="date"
                placeholder=""
                value={form.validity_from}
                onChange={handleChange}
                name="validity_from"
                required
              />
              <InputField
                label="Validity Date To"
                type="date"
                placeholder=""
                value={form.validity_to}
                onChange={handleChange}
                name="validity_to"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex justify-center items-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full md:w-1/2 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full md:w-1/2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Registering..." : "Register Billboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
