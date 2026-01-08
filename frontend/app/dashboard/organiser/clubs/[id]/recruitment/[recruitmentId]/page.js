"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function RecruitmentDetailPage() {
  const params = useParams();
  const [recruitment, setRecruitment] = useState(null);
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "pending",
      appliedDate: "2025-01-05",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "accepted",
      appliedDate: "2025-01-03",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      status: "rejected",
      appliedDate: "2025-01-01",
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRecruitment({
        id: params.recruitmentId,
        title: "Software Developer",
        description: "We are looking for talented developers to join our team.",
        positions: 5,
        deadline: "2025-02-01",
        status: "open",
      });
      setLoading(false);
    }, 300);
  }, [params.recruitmentId]);

  const handleStatusChange = (appId, newStatus) => {
    setApplications(
      applications.map((app) =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleDeleteApplication = (appId) => {
    if (confirm("Delete this application?")) {
      setApplications(applications.filter((app) => app.id !== appId));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!recruitment) {
    return <div className="text-gray-600">Recruitment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{recruitment.title}</h1>
          <p className="text-gray-600 mt-1">{recruitment.description}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${
              recruitment.status === "open"
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {recruitment.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Positions</div>
          <div className="text-2xl font-bold text-gray-900">{recruitment.positions}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Applications</div>
          <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Deadline</div>
          <div className="text-2xl font-bold text-gray-900">{recruitment.deadline}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Applications</h2>

        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No applications yet</p>
          ) : (
            applications.map((application) => (
              <div
                key={application.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/dashboard/organiser/clubs/${params.id}/recruitment/${params.recruitmentId}/${application.id}`}
                      className="font-medium text-gray-900 hover:text-green-600"
                    >
                      {application.name}
                    </Link>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>📧 {application.email}</span>
                      <span>📅 {application.appliedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={application.status}
                      onChange={(e) =>
                        handleStatusChange(application.id, e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <Link
                      href={`/dashboard/organiser/clubs/${params.id}/recruitment/${params.recruitmentId}/${application.id}`}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteApplication(application.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      application.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : application.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {application.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4">
        <Link
          href={`/dashboard/organiser/clubs/${params.id}/recruitment`}
          className="text-green-600 hover:text-green-700"
        >
          ← Back to Recruitments
        </Link>
      </div>
    </div>
  );
}
