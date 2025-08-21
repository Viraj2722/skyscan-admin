'use client'; // This is a client component because it uses state

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Reusable Input Field Component
const InputField = ({ label, type = 'text', placeholder }: { label: string, type?: string, placeholder: string }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
      />
    </div>
  );
};

export default function BillboardRegPage() {
    const [image, setImage] = useState<string | null>(null);
    const router = useRouter();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted!");
        alert("Billboard registered successfully!");
        router.push('/');
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Register a New Billboard</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 items-start">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-full">
                    <div className="w-full h-64 flex items-center justify-center bg-gray-700 rounded-lg">
                        {image ? (
                            <img src={image} alt="Billboard" className="max-h-full max-w-full object-contain rounded-lg" />
                        ) : (
                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="mt-2 text-sm">Upload Billboard Image</span>
                            </label>
                        )}
                    </div>
                    <input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </div>

                {/* Form Fields Section */}
                <div className="space-y-4">
                    <InputField label="Billboard ID" placeholder="e.g., BB-12345" />
                    <InputField label="Longitude and Latitude" placeholder="e.g., 19.0760, 72.8777" />
                    <InputField label="Size" placeholder="e.g., 40x20 ft" />
                    <InputField label="Address" placeholder="Enter full address" />
                    <InputField label="Owner" placeholder="Owner's name" />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Validity Date From" type="date" placeholder={''} />
                        <InputField label="Validity Date To" type="date" placeholder={''} />
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
            </form>
        </div>
    );
};
