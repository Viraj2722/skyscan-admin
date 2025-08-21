'use client'; // This page uses client-side hooks for state

import React, { useState } from 'react';
import Link from 'next/link'; // Import Link for navigation
import { complaintsData } from './data'; // Import data from the central file

// List of complaints for a selected category
const ComplaintsList = ({ category, onBack }) => {
    const filteredComplaints = complaintsData.filter(c => c.category === category);

    return (
        <div>
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-4">&larr; Back</button>
                <h2 className="text-3xl font-bold text-white">{category} Complaints</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComplaints.length > 0 ? (
                    filteredComplaints.map(complaint => (
                        // Each card is now a link to the dynamic detail page
                        <Link href={`/complains/${complaint.report_id}`} key={complaint.report_id}>
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-transform transform hover:-translate-y-1 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-semibold text-gray-400">{complaint.report_id}</span>
                                        <span className={`text-sm font-bold ${complaint.status === 'Pending' ? 'text-yellow-400' : 'text-green-400'}`}>{complaint.status}</span>
                                    </div>
                                    {/* Using user_comments for consistency */}
                                    <p className="text-gray-300 mb-4 text-sm line-clamp-3">{complaint.user_comments}</p>
                                </div>
                                <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">{new Date(complaint.submitted_at).toLocaleDateString()}</div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center">No complaints in this category.</p>
                )}
            </div>
        </div>
    );
};

// Category selection cards
const CategoryCard = ({ title, description, onClick, count }) => (
    <div onClick={onClick} className="bg-gray-800 p-8 rounded-lg shadow-2xl cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="text-purple-400 font-bold text-lg">{count} Open Complaints</div>
    </div>
);

// Main Page Component
export default function ComplainsPage() {
    const [selectedCategory, setSelectedCategory] = useState(null);

    if (selectedCategory) {
        return <ComplaintsList category={selectedCategory} onBack={() => setSelectedCategory(null)} />;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Complaint Categories</h2>
            <div className="grid lg:grid-cols-3 gap-8">
                <CategoryCard 
                    title="Hazardous (Danger)"
                    description="Complaints related to structural integrity, electrical issues, or immediate public danger."
                    count={complaintsData.filter(c => c.category === 'Hazardous' && c.status === 'Pending').length}
                    onClick={() => setSelectedCategory('Hazardous')}
                />
                <CategoryCard 
                    title="Illegal"
                    description="Complaints about billboards that violate local laws, permits, or placement restrictions."
                    count={complaintsData.filter(c => c.category === 'Illegal' && c.status === 'Pending').length}
                    onClick={() => setSelectedCategory('Illegal')}
                />
                <CategoryCard 
                    title="Inappropriate"
                    description="Complaints regarding offensive, misleading, or otherwise inappropriate content."
                    count={complaintsData.filter(c => c.category === 'Inappropriate' && c.status === 'Pending').length}
                    onClick={() => setSelectedCategory('Inappropriate')}
                />
            </div>
        </div>
    );
};
