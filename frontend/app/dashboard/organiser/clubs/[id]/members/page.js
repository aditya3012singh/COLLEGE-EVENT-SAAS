"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getClubById } from "@/store/api/club.thunk";
import Link from "next/link";

export default function ClubMembersPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { currentClub, loading } = useSelector((state) => state.club);
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "member", email: "" });

  useEffect(() => {
    if (params.id) {
      dispatch(getClubById(params.id));
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (currentClub?.members) {
      setMembers(currentClub.members);
    }
  }, [currentClub]);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setMembers([...members, { ...formData, id: Date.now() }]);
      setFormData({ name: "", role: "member", email: "" });
      setShowAddForm(false);
    }
  };

  const handleRemoveMember = (id) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleRoleChange = (id, newRole) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, role: newRole } : m
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Club Members</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showAddForm ? "Cancel" : "Add Member"}
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <form onSubmit={handleAddMember} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Member Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          >
            <option value="member">Member</option>
            <option value="coordinator">Coordinator</option>
            <option value="president">President</option>
          </select>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Add Member
          </button>
        </form>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No members yet</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="member">Member</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="president">President</option>
                </select>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4">
        <Link
          href={`/dashboard/organiser/clubs/${params.id}`}
          className="text-green-600 hover:text-green-700"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}
