"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getEventById } from "@/store/api/event.thunk";
import api from "@/lib/axios";
import Link from "next/link";

export default function EventRegistrationsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentEvent } = useSelector((state) => state.events);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getEventById(id));
      fetchRegistrations();
    }
  }, [id, dispatch]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/registrations/event/${id}`);
      setRegistrations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) =>
    reg.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const colors = {
      CONFIRMED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELLED: "bg-red-100 text-red-800",
      CHECKED_IN: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/admin/events/${id}`}
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
        >
          ← Back to Event Details
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
        {currentEvent && (
          <p className="mt-1 text-sm text-gray-600">{currentEvent.name}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Registrations</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {registrations.length}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {registrations.filter((r) => r.status === "CONFIRMED").length}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Checked In</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">
              {registrations.filter((r) => r.status === "CHECKED_IN").length}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Cancelled</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">
              {registrations.filter((r) => r.status === "CANCELLED").length}
            </dd>
          </div>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Registrations Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {registration.user?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {registration.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(
                          registration.status
                        )}`}
                      >
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.paymentStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {registration.paymentStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? "No registrations found matching your search" : "No registrations yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      {!loading && filteredRegistrations.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filteredRegistrations.length} of {registrations.length} registrations
        </div>
      )}
    </div>
  );
}
