"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

export default function OrganiserDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalClubs: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    // Placeholder stats - will be fetched from API in real implementation
    setStats({
      totalEvents: 12,
      activeEvents: 5,
      totalClubs: 3,
      totalRegistrations: 150,
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-green-900">
          Welcome, {user?.name || "Organiser"}!
        </h1>
        <p className="text-green-700 mt-2">
          Manage your events, clubs, and registrations from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Events</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeEvents}</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Clubs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClubs}</p>
            </div>
            <div className="text-4xl">🎪</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Registrations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Events</h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage all your events, create new ones, and track registrations.
          </p>
          <Link
            href="/dashboard/organiser/events"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            View Events →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clubs</h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage clubs, members, and club-related activities.
          </p>
          <Link
            href="/dashboard/organiser/clubs"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            View Clubs →
          </Link>
        </div>
      </div>
    </div>
  );
}
