"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    // TODO: Implement user fetching from backend
    // For now, showing placeholder
    setLoading(false);
  }, []);

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all users in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="ORGANIZER">Organizer</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College
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
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                No users found. User management API endpoint needs to be implemented.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          📝 Note: User management API endpoint needs to be implemented in the backend.
        </p>
      </div>
    </div>
  );
}
