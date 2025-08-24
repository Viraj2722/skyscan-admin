"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type Complaint = {
  report_id: number;
  image_url: string;
  gps_latitude: number;
  gps_longitude: number;
  timestamp: string;
  status: string;
  issue: string;
  user_id: string;
  report_type: string;
};

type ComplaintsListProps = {
  category: string;
  onBack: () => void;
  complaints: Complaint[];
};

type CategoryCardProps = {
  title: string;
  description: string;
  onClick: () => void;
  count: number;
};

// List of complaints for a selected category
const ComplaintsList = ({
  category,
  onBack,
  complaints,
}: ComplaintsListProps) => {
  const pendingStatuses = ["pending", "under review"];
  const pendingComplaints = complaints.filter(
    (c) =>
      c.report_type === category &&
      c.status &&
      pendingStatuses.includes(c.status.trim().toLowerCase())
  );
  const resolvedComplaints = complaints.filter(
    (c) =>
      c.report_type === category &&
      c.status &&
      !pendingStatuses.includes(c.status.trim().toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-4"
        >
          &larr; Back
        </button>
        <h2 className="text-3xl font-bold text-white">{category} Complaints</h2>
      </div>
      <h3 className="text-xl font-bold text-yellow-400 mb-4">Pending</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {pendingComplaints.length > 0 ? (
          pendingComplaints.map((complaint) => (
            <Link
              href={`/complains/${complaint.report_id}`}
              key={complaint.report_id}
            >
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-transform transform hover:-translate-y-1 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-400">
                      {complaint.report_id}
                    </span>
                    <span className="text-sm font-bold text-yellow-400">
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                    {complaint.issue}
                  </p>
                </div>
                <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
                  {complaint.timestamp
                    ? new Date(complaint.timestamp).toLocaleDateString()
                    : ""}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No pending complaints in this category.
          </p>
        )}
      </div>
      <h3 className="text-xl font-bold text-green-400 mb-4">Resolved</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resolvedComplaints.length > 0 ? (
          resolvedComplaints.map((complaint) => (
            <Link
              href={`/complains/${complaint.report_id}`}
              key={complaint.report_id}
            >
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-transform transform hover:-translate-y-1 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-400">
                      {complaint.report_id}
                    </span>
                    <span className="text-sm font-bold text-green-400">
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                    {complaint.issue}
                  </p>
                </div>
                <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
                  {complaint.timestamp
                    ? new Date(complaint.timestamp).toLocaleDateString()
                    : ""}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No resolved complaints in this category.
          </p>
        )}
      </div>
    </div>
  );
};

// Category selection cards
const CategoryCard = ({
  title,
  description,
  onClick,
  count,
}: CategoryCardProps) => (
  <div
    onClick={onClick}
    className="bg-gray-800 p-8 rounded-lg shadow-2xl cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
  >
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-4">{description}</p>
    <div className="text-purple-400 font-bold text-lg">
      {count} Open Complaints
    </div>
  </div>
);

// Main Page Component
export default function ComplainsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComplaints() {
      setLoading(true);
      const { data, error } = await supabase.from("reports").select("*");
      setComplaints(data || []);
      setLoading(false);
    }
    fetchComplaints();
  }, []);

  if (selectedCategory) {
    return (
      <ComplaintsList
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        complaints={complaints}
      />
    );
  }

  const openStatuses = ["pending", "under review"];
  const hazardousCount = complaints.filter(
    (c) =>
      c.report_type === "Hazardous" &&
      c.status &&
      openStatuses.includes(c.status.trim().toLowerCase())
  ).length;
  const illegalCount = complaints.filter(
    (c) =>
      c.report_type === "Illegal" &&
      c.status &&
      openStatuses.includes(c.status.trim().toLowerCase())
  ).length;
  const inappropriateCount = complaints.filter(
    (c) =>
      c.report_type === "Inappropriate" &&
      c.status &&
      openStatuses.includes(c.status.trim().toLowerCase())
  ).length;
  const totalComplaints = complaints.filter(
    (c) => c.report_type === "Inappropriate"
  ).length;

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Complaint Categories
      </h2>
      {loading ? (
        <div className="text-center text-gray-400">Loading complaints...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <CategoryCard
            title="Hazardous"
            description="Complaints related to structural integrity, electrical issues, or immediate public danger."
            count={hazardousCount}
            onClick={() => setSelectedCategory("Hazardous")}
          />
          <CategoryCard
            title="Illegal"
            description="Complaints about billboards that violate local laws, permits, or placement restrictions."
            count={illegalCount}
            onClick={() => setSelectedCategory("Illegal")}
          />
          <CategoryCard
            title="Inappropriate"
            description="Complaints regarding offensive, misleading, or otherwise inappropriate content."
            count={inappropriateCount}
            onClick={() => setSelectedCategory("Inappropriate")}
          />
        </div>
      )}
    </div>
  );
}
