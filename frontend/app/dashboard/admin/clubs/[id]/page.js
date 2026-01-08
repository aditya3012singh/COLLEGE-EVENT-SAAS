"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { getClubById, updateClub, deleteClub } from "@/store/api/club.thunk";
import Link from "next/link";

export default function ClubDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentClub, loading, error } = useSelector((state) => state.clubs);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getClubById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentClub) {
      setFormData({
        name: currentClub.name || "",
        description: currentClub.description || "",
        logo: currentClub.logo || "",
      });
    }
  }, [currentClub]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateClub({ id, data: formData })).unwrap();
      setIsEditing(false);
      alert("Club updated successfully!");
    } catch (error) {
      alert(error.message || "Failed to update club");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this club?")) {
      try {
        await dispatch(deleteClub(id)).unwrap();
        router.push("/dashboard/admin/clubs");
      } catch (error) {
        alert(error.message || "Failed to delete club");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-800">{error.message || "Failed to load club"}</p>
      </div>
    );
  }

  if (!currentClub) {
    return <div className="p-4">Club not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/admin/clubs"
            className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
          >
            ← Back to Clubs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Club" : "Club Details"}
          </h1>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Club Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {formData.logo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Preview</label>
                <img
                  src={formData.logo}
                  alt="Club logo preview"
                  className="h-32 w-32 object-contain border rounded-md"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Update Club
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {currentClub.logo && (
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <img
                  src={currentClub.logo}
                  alt={currentClub.name}
                  className="h-48 w-48 object-contain"
                />
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentClub.name}</h2>
              <p className="mt-2 text-gray-600">{currentClub.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">College</p>
                <p className="mt-1 text-gray-900">{currentClub.college?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created By</p>
                <p className="mt-1 text-gray-900">
                  {currentClub.organizer?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="mt-1 text-gray-900">
                  {currentClub._count?.events || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="mt-1 text-gray-900">
                  {new Date(currentClub.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
