"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCollegeById, updateCollege } from "@/store/api/college.thunk";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CollegeDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const { selectedCollege, loading, error } = useSelector((state) => state.colleges);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    logo: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (params.id) {
      dispatch(getCollegeById(params.id));
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (selectedCollege) {
      setFormData({
        name: selectedCollege.name || "",
        code: selectedCollege.code || "",
        logo: selectedCollege.logo || "",
      });
    }
  }, [selectedCollege]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.name || !formData.code) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        logo: formData.logo.trim() || null,
      };

      await dispatch(updateCollege({ id: params.id, data })).unwrap();
      setIsEditing(false);
      dispatch(getCollegeById(params.id));
    } catch (err) {
      setFormError(err.message || "Failed to update college");
    }
  };

  if (loading && !selectedCollege) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading college details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <Link
          href="/dashboard/admin/colleges"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Back to Colleges
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            {error.message || "Failed to load college details"}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedCollege) {
    return (
      <div className="max-w-2xl">
        <Link
          href="/dashboard/admin/colleges"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Back to Colleges
        </Link>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">College not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/admin/colleges"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Back to Colleges
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">College Details</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and edit college information
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow sm:rounded-lg">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* College Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                College Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* College Code */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                College Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                id="code"
                required
                value={formData.code}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label
                htmlFor="logo"
                className="block text-sm font-medium text-gray-700"
              >
                Logo URL (optional)
              </label>
              <input
                type="url"
                name="logo"
                id="logo"
                value={formData.logo}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: selectedCollege.name || "",
                    code: selectedCollege.code || "",
                    logo: selectedCollege.logo || "",
                  });
                  setFormError("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-6 space-y-6">
            {/* Logo */}
            {selectedCollege.logo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <img
                  src={selectedCollege.logo}
                  alt={selectedCollege.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  College Name
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {selectedCollege.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  College Code
                </label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {selectedCollege.code}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedCollege.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedCollege.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
