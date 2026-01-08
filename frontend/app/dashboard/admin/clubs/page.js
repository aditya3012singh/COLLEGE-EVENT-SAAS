"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllClubs } from "@/store/api/club.thunk";
import Link from "next/link";

export default function ClubsPage() {
  const dispatch = useDispatch();
  const { clubs, loading, error } = useSelector((state) => state.clubs);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllClubs());
  }, [dispatch]);

  const filteredClubs = clubs?.filter((club) =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubs Overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all clubs across all colleges
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clubs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            {error.message || "Failed to load clubs"}
          </p>
        </div>
      )}

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clubs...</p>
          </div>
        ) : filteredClubs?.length > 0 ? (
          filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              {club.logo && (
                <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {club.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {club.description || "No description"}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  {club.college && <p>🏫 {club.college.name}</p>}
                  {club._count?.events > 0 && (
                    <p>📅 {club._count.events} events</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? "No clubs found matching your search" : "No clubs found"}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && filteredClubs && (
        <div className="text-sm text-gray-500">
          Showing {filteredClubs.length} of {clubs?.length || 0} clubs
        </div>
      )}
    </div>
  );
}

