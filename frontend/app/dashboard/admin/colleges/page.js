"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllColleges, deleteCollege } from "@/store/api/college.thunk";
import Link from "next/link";

export default function CollegesPage() {
  const dispatch = useDispatch();
  const { colleges, loading, error } = useSelector((state) => state.colleges);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllColleges());
  }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await dispatch(deleteCollege(id)).unwrap();
        dispatch(getAllColleges());
      } catch (err) {
        alert("Failed to delete college: " + (err.message || "Unknown error"));
      }
    }
  };

  const filteredColleges = colleges?.filter(
    (college) =>
      college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colleges Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all colleges in the system
          </p>
        </div>
        <Link
          href="/dashboard/admin/colleges/create"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ➕ Add College
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search colleges by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error.message || "Failed to load colleges"}</p>
        </div>
      )}

      {/* Colleges Table */}
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredColleges?.length > 0 ? (
              filteredColleges.map((college) => (
                <tr key={college.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {college.logo ? (
                        <img
                          src={college.logo}
                          alt={college.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                          <span className="text-sm font-medium text-indigo-600">
                            {college.code?.substring(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {college.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {college.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(college.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/admin/colleges/${college.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(college.id, college.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? "No colleges found matching your search" : "No colleges found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      {!loading && filteredColleges && (
        <div className="text-sm text-gray-500">
          Showing {filteredColleges.length} of {colleges?.length || 0} colleges
        </div>
      )}
    </div>
  );
}

