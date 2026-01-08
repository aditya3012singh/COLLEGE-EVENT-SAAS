"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function RecruitmentListPage() {
  const params = useParams();
  const [recruitments, setRecruitments] = useState([
    {
      id: 1,
      title: "Software Developer",
      positions: 5,
      applications: 12,
      status: "open",
      deadline: "2025-02-01",
    },
    {
      id: 2,
      title: "Event Manager",
      positions: 3,
      applications: 8,
      status: "open",
      deadline: "2025-02-15",
    },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setRecruitments(
      recruitments.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    );
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this recruitment?")) {
      setRecruitments(recruitments.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Recruitment Drives</h2>
        <Link
          href={`/dashboard/organiser/clubs/${params.id}/recruitment/create`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          New Recruitment
        </Link>
      </div>

      <div className="space-y-3">
        {recruitments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No active recruitments</p>
        ) : (
          recruitments.map((recruitment) => (
            <div
              key={recruitment.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/dashboard/organiser/clubs/${params.id}/recruitment/${recruitment.id}`}
                    className="font-medium text-gray-900 hover:text-green-600"
                  >
                    {recruitment.title}
                  </Link>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>📍 {recruitment.positions} positions</span>
                    <span>👤 {recruitment.applications} applications</span>
                    <span>📅 {recruitment.deadline}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={recruitment.status}
                    onChange={(e) => handleStatusChange(recruitment.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="reviewing">Reviewing</option>
                  </select>
                  <Link
                    href={`/dashboard/organiser/clubs/${params.id}/recruitment/${recruitment.id}`}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(recruitment.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    recruitment.status === "open"
                      ? "bg-green-100 text-green-800"
                      : recruitment.status === "reviewing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {recruitment.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4">
        <Link
          href={`/dashboard/organiser/clubs/${params.id}`}
          className="text-green-600 hover:text-green-700"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}
