"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function UserDetailsPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/admin/users"
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
        >
          ← Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
      </div>

      {/* Placeholder */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> User management API endpoints need to be implemented in the backend.
          <br />
          User ID: {id}
        </p>
      </div>

      {/* Content Placeholder */}
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">User details will be displayed here once the API is ready.</p>
      </div>
    </div>
  );
}
