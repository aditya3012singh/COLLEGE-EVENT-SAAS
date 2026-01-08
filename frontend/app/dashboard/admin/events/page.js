"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "@/store/api/event.thunk";
import Link from "next/link";

export default function EventsPage() {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);

  const filteredEvents = events?.filter((event) =>
    event.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all events across all colleges
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events by name..."
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
            {error.message || "Failed to load events"}
          </p>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : filteredEvents?.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              {event.banner && (
                <img
                  src={event.banner}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event.description || "No description"}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📅 {new Date(event.startDate).toLocaleDateString()}</p>
                  <p>📍 {event.venue || "TBA"}</p>
                  {event.club && <p>🎯 {event.club.name}</p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? "No events found matching your search" : "No events found"}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && filteredEvents && (
        <div className="text-sm text-gray-500">
          Showing {filteredEvents.length} of {events?.length || 0} events
        </div>
      )}
    </div>
  );
}

