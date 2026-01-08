"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getClubById, updateClub, deleteClub } from "@/store/api/club.thunk";
import Link from "next/link";

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { currentClub, loading, error } = useSelector((state) => state.club);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const tabs = [
    { name: "Overview", href: `/dashboard/organiser/clubs/${params.id}`, icon: "📋" },
    { name: "Members", href: `/dashboard/organiser/clubs/${params.id}/members`, icon: "👥" },
    { name: "Achievements", href: `/dashboard/organiser/clubs/${params.id}/achievements`, icon: "🏆" },
    { name: "Recruitments", href: `/dashboard/organiser/clubs/${params.id}/recruitments`, icon: "📢" },
  ];

  useEffect(() => {
    if (params.id) {
      dispatch(getClubById(params.id));
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (currentClub) {
      setFormData(currentClub);
    }
  }, [currentClub]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateClub({
          id: params.id,
          ...formData,
        })
      ).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this club?")) {
      try {
        await dispatch(deleteClub(params.id)).unwrap();
        router.push("/dashboard/organiser/clubs");
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  if (!formData.id) {
    return <div className="text-gray-600">Club not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Club" : formData.name}
        </h1>
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200 bg-white rounded-t-lg">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                isActive
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-b-lg shadow p-8">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="SPORTS">Sports</option>
                <option value="CULTURAL">Cultural</option>
                <option value="TECHNICAL">Technical</option>
                <option value="SOCIAL">Social</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900">{formData.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                <p className="text-gray-900">{formData.category || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Members</h3>
                <p className="text-gray-900">{formData._count?.members || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
