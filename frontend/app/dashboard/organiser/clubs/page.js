"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { getClubs } from "@/store/api/club.thunk";

export default function OrganiserClubsPage() {
  const dispatch = useDispatch();
  const { clubs, loading, error } = useSelector((state) => state.club);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClubs, setFilteredClubs] = useState([]);

  useEffect(() => {
    dispatch(getClubs());
  }, [dispatch]);

  useEffect(() => {
    if (clubs) {
      const filtered = clubs.filter((club) =>
        club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClubs(filtered);
    }
  }, [clubs, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Clubs</h1>
        <Link
          href="/dashboard/organiser/clubs/create"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Create Club
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-600 mt-2">Loading clubs...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Clubs Grid */}
      {!loading && filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <Link
              key={club.id}
              href={`/dashboard/organiser/clubs/${club.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {club.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {club.description}
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>👥 {club._count?.members || 0} members</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : !loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No clubs found</p>
          <Link
            href="/dashboard/organiser/clubs/create"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Create your first club →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
