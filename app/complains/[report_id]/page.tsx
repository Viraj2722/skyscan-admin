"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { registeredBillboards } from "../data";

function calculateMatchProbability(latitude, longitude, gps_latitude, gps_longitude) {
  const R = 6371;
  const dLat = ((gps_latitude - latitude) * Math.PI) / 180;
  const dLon = ((gps_longitude - longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((gps_latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const probability = Math.max(0, 100 - distance * 2000);
  return Math.round(probability);
}

function ActionModal({ action, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const title =
    action === "Reject"
      ? "Reason for Rejection"
      : "Action Taken for Completion";
  const placeholder =
    action === "Reject"
      ? "e.g., Duplicate complaint..."
      : "e.g., Repaired structural damage...";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-40 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder={placeholder}
        ></textarea>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const report_id = params.report_id as string;
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("Not Found");
  const [matchedBillboard, setMatchedBillboard] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, action: null });

  useEffect(() => {
    async function fetchComplaint() {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("report_id", report_id)
        .single();
      setComplaint(data);
      setStatus(data?.status || "Not Found");
    }
    fetchComplaint();
  }, [report_id]);

  useEffect(() => {
    if (!complaint) return;
    let bestMatch = null;
    let highestProb = 0;
    for (const board of registeredBillboards) {
      const prob = calculateMatchProbability(
        complaint.gps_latitude,
        complaint.gps_longitude,
        board.latitude,
        board.longitude
      );
      if (prob > highestProb) {
        highestProb = prob;
        bestMatch = { ...board, probability: prob };
      }
    }
    if (bestMatch && bestMatch.probability >= 80) {
      setMatchedBillboard(bestMatch);
    }
  }, [complaint]);

  const handleActionClick = async (newStatus) => {
    if (newStatus === "Reject" || newStatus === "Completed") {
      setModalState({ isOpen: true, action: newStatus });
    } else {
      setStatus(newStatus);
      await updateComplaintStatus(newStatus, "");
    }
  };

  async function updateComplaintStatus(newStatus, actionReason) {
    if (!complaint) return;
    await supabase
      .from("reports")
      .update({ status: newStatus, action_taken: actionReason })
      .eq("report_id", complaint.report_id);
  }

  const handleModalSubmit = async (reason) => {
    const newStatus = modalState.action === "Reject" ? "Rejected" : "Completed";
    await updateComplaintStatus(newStatus, reason);
    setStatus(newStatus);
    setModalState({ isOpen: false, action: null });
  };

  if (!complaint) {
    return <div className="text-center text-red-500">Complaint not found.</div>;
  }

  return (
    <div>
      {modalState.isOpen && (
        <ActionModal
          action={modalState.action}
          onClose={() => setModalState({ isOpen: false, action: null })}
          onSubmit={handleModalSubmit}
        />
      )}
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-4"
        >
          &larr; Back
        </button>
        <h2 className="text-3xl font-bold text-white">Complaint Details</h2>
      </div>
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <img
            src={complaint.image_url}
            alt="User submitted complaint"
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div>
            <span className="font-bold text-gray-400">Report ID:</span>{" "}
            <span className="text-white">{complaint.report_id}</span>
          </div>
          <div>
            <span className="font-bold text-gray-400">User ID:</span>{" "}
            <span className="text-white">{complaint.user_id}</span>
          </div>
          <div>
            <span className="font-bold text-gray-400">Submitted At:</span>{" "}
            <span className="text-white">
              {complaint.timestamp
                ? new Date(complaint.timestamp).toLocaleString()
                : ""}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-400">User Location:</span>{" "}
            <span className="text-white">
              {complaint.gps_latitude}, {complaint.gps_longitude}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-400">Status:</span>{" "}
            <span
              className={
                "font-bold " +
                (status === "Pending"
                  ? "text-yellow-400"
                  : status === "Working"
                  ? "text-blue-400"
                  : status.includes("Completed")
                  ? "text-green-400"
                  : "text-red-400")
              }
            >
              {status}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-400">Issue:</span>{" "}
            <p className="text-gray-300 bg-gray-700 p-3 rounded-md mt-1">
              {complaint.issue}
            </p>
          </div>
          {matchedBillboard && (
            <div className="bg-green-900/50 border border-green-500 p-3 rounded-lg">
              <h4 className="font-bold text-green-400">
                High Probability Match Found!
              </h4>
              <p className="text-gray-300">
                Billboard ID: {matchedBillboard.billboard_id} (
                {matchedBillboard.probability}% Match)
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-3 border-t border-gray-700 mt-4 pt-6 flex justify-center gap-4">
          <button
            onClick={() => handleActionClick("Reject")}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Reject
          </button>
          <button
            onClick={() => handleActionClick("Working")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Mark as Working
          </button>
          <button
            onClick={() => handleActionClick("Completed")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetailPage;
