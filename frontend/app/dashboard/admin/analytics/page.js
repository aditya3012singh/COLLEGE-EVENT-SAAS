"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllColleges } from "@/store/api/college.thunk";
import { getAllEvents } from "@/store/api/event.thunk";
import { getAllClubs } from "@/store/api/club.thunk";

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { colleges } = useSelector((state) => state.colleges);
  const { events } = useSelector((state) => state.events);
  const { clubs } = useSelector((state) => state.clubs);

  useEffect(() => {
    dispatch(getAllColleges());
    dispatch(getAllEvents());
    dispatch(getAllClubs());
  }, [dispatch]);

  // Calculate analytics
  const totalColleges = colleges?.length || 0;
  const totalEvents = events?.length || 0;
  const totalClubs = clubs?.length || 0;
  const activeEvents = events?.filter(e => new Date(e.endDate) > new Date()).length || 0;

  // Top colleges by clubs
  const collegeClubCount = colleges?.map(college => ({
    name: college.name,
    clubCount: clubs?.filter(club => club.collegeId === college.id).length || 0,
  })).sort((a, b) => b.clubCount - a.clubCount).slice(0, 5) || [];

  // Top colleges by events
  const collegeEventCount = colleges?.map(college => ({
    name: college.name,
    eventCount: events?.filter(event => event.club?.collegeId === college.id).length || 0,
  })).sort((a, b) => b.eventCount - a.eventCount).slice(0, 5) || [];

  // Recent events
  const recentEvents = events
    ?.slice()
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive overview of platform statistics and trends
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                  <span className="text-2xl">🏫</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Colleges
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalColleges}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Events
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalEvents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clubs
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalClubs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-md flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Events
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {activeEvents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Colleges by Clubs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Colleges by Clubs
            </h3>
            <div className="space-y-3">
              {collegeClubCount.length > 0 ? (
                collegeClubCount.map((college, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-8 text-sm font-medium text-gray-500">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {college.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {college.clubCount} clubs
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(college.clubCount / (collegeClubCount[0]?.clubCount || 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Colleges by Events */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Colleges by Events
            </h3>
            <div className="space-y-3">
              {collegeEventCount.length > 0 ? (
                collegeEventCount.map((college, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-8 text-sm font-medium text-gray-500">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {college.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {college.eventCount} events
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(college.eventCount / (collegeEventCount[0]?.eventCount || 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Events
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.club?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.venue || "TBA"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

