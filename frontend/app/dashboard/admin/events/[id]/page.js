"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { getEventById, updateEvent, deleteEvent } from "@/store/api/event.thunk";
import Link from "next/link";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentEvent, loading, error } = useSelector((state) => state.events);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getEventById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentEvent) {
      setFormData({
        name: currentEvent.name || "",
        description: currentEvent.description || "",
        startDate: currentEvent.startDate?.split('T')[0] || "",
        endDate: currentEvent.endDate?.split('T')[0] || "",
        venue: currentEvent.venue || "",
        maxAttendees: currentEvent.maxAttendees || "",
        registrationDeadline: currentEvent.registrationDeadline?.split('T')[0] || "",
        banner: currentEvent.banner || "",
      });
    }
  }, [currentEvent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateEvent({ id, data: formData })).unwrap();
      setIsEditing(false);
      alert("Event updated successfully!");
    } catch (error) {
      alert(error.message || "Failed to update event");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await dispatch(deleteEvent(id)).unwrap();
        router.push("/dashboard/admin/events");
      } catch (error) {
        alert(error.message || "Failed to delete event");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-800">{error.message || "Failed to load event"}</p>
      </div>
    );
  }

  if (!currentEvent) {
    return <div className="p-4">Event not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/admin/events"
            className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
          >
            ← Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Event" : "Event Details"}
          </h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/admin/events/${id}/registrations`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            View Registrations
          </Link>
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Attendees</label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Banner URL</label>
              <input
                type="url"
                name="banner"
                value={formData.banner}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Update Event
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {currentEvent.banner && (
              <img
                src={currentEvent.banner}
                alt={currentEvent.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentEvent.name}</h2>
              <p className="mt-2 text-gray-600">{currentEvent.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="mt-1 text-gray-900">
                  {new Date(currentEvent.startDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="mt-1 text-gray-900">
                  {new Date(currentEvent.endDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Venue</p>
                <p className="mt-1 text-gray-900">{currentEvent.venue || "TBA"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Max Attendees</p>
                <p className="mt-1 text-gray-900">{currentEvent.maxAttendees || "Unlimited"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Registration Deadline</p>
                <p className="mt-1 text-gray-900">
                  {currentEvent.registrationDeadline
                    ? new Date(currentEvent.registrationDeadline).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Club</p>
                <p className="mt-1 text-gray-900">{currentEvent.club?.name || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
