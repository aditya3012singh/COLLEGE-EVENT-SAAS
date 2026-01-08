"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCollege } from "@/store/api/college.thunk";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateCollegePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.colleges);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    logo: "",
  });
  const [formError, setFormError] = useState("");

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

    if (formData.code.length < 2) {
      setFormError("College code must be at least 2 characters");
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        logo: formData.logo.trim() || null,
      };

      await dispatch(createCollege(data)).unwrap();
      router.push("/dashboard/admin/colleges");
    } catch (err) {
      setFormError(err.message || "Failed to create college");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/admin/colleges"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Back to Colleges
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New College</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new college to the system
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow sm:rounded-lg">
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
              placeholder="e.g., KIET Group of Institutions"
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
              placeholder="e.g., KIET"
              maxLength={10}
            />
            <p className="mt-1 text-xs text-gray-500">
              A unique identifier for the college (will be converted to uppercase)
            </p>
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
              placeholder="https://example.com/logo.png"
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide a URL to the college logo image
            </p>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                {formError || error.message || "An error occurred"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/dashboard/admin/colleges"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating..." : "Create College"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
