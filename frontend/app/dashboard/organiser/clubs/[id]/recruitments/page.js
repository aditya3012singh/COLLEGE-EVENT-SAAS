"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getClubById } from "@/store/api/club.thunk";
import Link from "next/link";

export default function ClubRecruitmentsPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { currentClub, loading } = useSelector((state) => state.club);
  const [recruitments, setRecruitments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    deadline: "", 
    positions: 5,
    status: "open" 
  });

  useEffect(() => {
    if (params.id) {
      dispatch(getClubById(params.id));
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (currentClub?.recruitments) {
      setRecruitments(currentClub.recruitments);
    }
  }, [currentClub]);

  const handleAddRecruitment = (e) => {
    e.preventDefault();
    if (formData.title) {
      setRecruitments([...recruitments, { ...formData, id: Date.now(), applicants: 0 }]);
      setFormData({ title: "", description: "", deadline: "", positions: 5, status: "open" });
      setShowAddForm(false);
    }
  };

  const handleDeleteRecruitment = (id) => {
    setRecruitments(recruitments.filter((r) => r.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setRecruitments(
      recruitments.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Club Recruitments</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showAddForm ? "Cancel" : "New Recruitment"}
        </button>
      </div>

      {/* Add Recruitment Form */}
      {showAddForm && (
        <form onSubmit={handleAddRecruitment} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Position Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
          <textarea
            placeholder="Job Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
            <input
              type="number"
              min="1"
              placeholder="Positions Available"
              value={formData.positions}
              onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Create Recruitment
          </button>
        </form>
      )}

      {/* Recruitments List */}
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
                  <h3 className="font-medium text-gray-900">{recruitment.title}</h3>
                  {recruitment.description && (
                    <p className="text-sm text-gray-600 mt-1">{recruitment.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {recruitment.positions && (
                      <span>📍 {recruitment.positions} positions</span>
                    )}
                    {recruitment.applicants && (
                      <span>👤 {recruitment.applicants} applicants</span>
                    )}
                    {recruitment.deadline && (
                      <span>📅 {recruitment.deadline}</span>
                    )}
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
                  <button
                    onClick={() => handleDeleteRecruitment(recruitment.id)}
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
