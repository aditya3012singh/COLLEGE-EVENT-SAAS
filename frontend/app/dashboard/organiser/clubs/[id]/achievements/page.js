"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getClubById } from "@/store/api/club.thunk";
import Link from "next/link";

export default function ClubAchievementsPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { currentClub, loading } = useSelector((state) => state.club);
  const [achievements, setAchievements] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", date: "", category: "award" });

  useEffect(() => {
    if (params.id) {
      dispatch(getClubById(params.id));
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (currentClub?.achievements) {
      setAchievements(currentClub.achievements);
    }
  }, [currentClub]);

  const handleAddAchievement = (e) => {
    e.preventDefault();
    if (formData.title) {
      setAchievements([...achievements, { ...formData, id: Date.now() }]);
      setFormData({ title: "", description: "", date: "", category: "award" });
      setShowAddForm(false);
    }
  };

  const handleDeleteAchievement = (id) => {
    setAchievements(achievements.filter((a) => a.id !== id));
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
        <h2 className="text-2xl font-bold text-gray-900">Club Achievements</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showAddForm ? "Cancel" : "Add Achievement"}
        </button>
      </div>

      {/* Add Achievement Form */}
      {showAddForm && (
        <form onSubmit={handleAddAchievement} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Achievement Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          >
            <option value="award">Award</option>
            <option value="event">Event Success</option>
            <option value="participation">Participation</option>
            <option value="milestone">Milestone</option>
          </select>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Add Achievement
          </button>
        </form>
      )}

      {/* Achievements List */}
      <div className="space-y-3">
        {achievements.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No achievements yet</p>
        ) : (
          achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                  {achievement.description && (
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  )}
                  <div className="flex gap-4 mt-2">
                    {achievement.date && (
                      <span className="text-xs text-gray-500">📅 {achievement.date}</span>
                    )}
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {achievement.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAchievement(achievement.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                >
                  Delete
                </button>
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
