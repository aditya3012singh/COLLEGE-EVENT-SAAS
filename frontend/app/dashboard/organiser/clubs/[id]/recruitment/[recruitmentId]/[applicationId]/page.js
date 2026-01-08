"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const params = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setApplication({
        id: params.applicationId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 234 567 8900",
        position: "Software Developer",
        appliedDate: "2025-01-05",
        status: "pending",
        resume: "resume.pdf",
        coverLetter: "Passionate about software development with 3 years of experience...",
        experience: "3 years at Tech Company",
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        education: "BS in Computer Science",
      });
      setLoading(false);
    }, 300);
  }, [params.applicationId]);

  const handleStatusChange = (newStatus) => {
    if (application) {
      setApplication({ ...application, status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!application) {
    return <div className="text-gray-600">Application not found</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{application.name}</h1>
          <p className="text-gray-600 mt-1">Applied for {application.position}</p>
        </div>
        <div className="text-right">
          <select
            value={application.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
            <p className="text-gray-900">{application.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
            <p className="text-gray-900">{application.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Applied Date</h3>
            <p className="text-gray-900">{application.appliedDate}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <span
              className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${
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
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
          <p className="text-gray-900">{application.education}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
          <p className="text-gray-900">{application.experience}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
          <div className="flex gap-2 flex-wrap">
            {application.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cover Letter</h2>
          <div className="p-4 bg-gray-50 rounded-lg text-gray-900">
            {application.coverLetter}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href="#"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Download Resume
        </a>
        <Link
          href={`/dashboard/organiser/clubs/${params.id}/recruitment/${params.recruitmentId}`}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Back to Applications
        </Link>
      </div>
    </div>
  );
}
