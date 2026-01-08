"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllColleges } from "@/store/api/college.thunk";
import { getAllEvents } from "@/store/api/event.thunk";
import { getAllClubs } from "@/store/api/club.thunk";
import Link from "next/link";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { colleges, loading: collegesLoading } = useSelector((state) => state.colleges);
  const { events, loading: eventsLoading } = useSelector((state) => state.events);
  const { clubs, loading: clubsLoading } = useSelector((state) => state.clubs);

  useEffect(() => {
    dispatch(getAllColleges());
    dispatch(getAllEvents());
    dispatch(getAllClubs());
  }, [dispatch]);

  const stats = [
    {
      name: "Total Colleges",
      value: colleges?.length || 0,
      icon: "🏫",
      color: "bg-blue-500",
      link: "/dashboard/admin/colleges",
    },
    {
      name: "Total Events",
      value: events?.length || 0,
      icon: "📅",
      color: "bg-green-500",
      link: "/dashboard/admin/events",
    },
    {
      name: "Total Clubs",
      value: clubs?.length || 0,
      icon: "🎯",
      color: "bg-purple-500",
      link: "/dashboard/admin/clubs",
    },
    {
      name: "Active Users",
      value: "--",
      icon: "👥",
      color: "bg-orange-500",
      link: "/dashboard/admin/users",
    },
  ];

  const isLoading = collegesLoading || eventsLoading || clubsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your college event SaaS platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.link}
            className="overflow-hidden transition-transform transform bg-white rounded-lg shadow hover:scale-105"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Colleges */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Colleges</h2>
            <Link
              href="/dashboard/admin/colleges"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : colleges?.length > 0 ? (
              colleges.slice(0, 5).map((college) => (
                <div
                  key={college.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {college.code?.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{college.name}</p>
                      <p className="text-xs text-gray-500">{college.code}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No colleges found</p>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
            <Link
              href="/dashboard/admin/events"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : events?.length > 0 ? (
              events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {event.status || 'Active'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No events found</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/admin/colleges/create"
          className="p-4 text-center transition-colors bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
        >
          <span className="text-2xl">➕</span>
          <p className="mt-2 font-medium text-gray-900">Add New College</p>
        </Link>
        <Link
          href="/dashboard/admin/users"
          className="p-4 text-center transition-colors bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
        >
          <span className="text-2xl">👥</span>
          <p className="mt-2 font-medium text-gray-900">Manage Users</p>
        </Link>
        <Link
          href="/dashboard/admin/analytics"
          className="p-4 text-center transition-colors bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
        >
          <span className="text-2xl">📊</span>
          <p className="mt-2 font-medium text-gray-900">View Analytics</p>
        </Link>
      </div>
    </div>
  );
}
