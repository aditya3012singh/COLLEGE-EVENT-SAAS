import React from "react";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";

export default function UpcomingEvents({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300">
        No upcoming events at the moment.
      </div>
    );
  }

  return (
    <section className="my-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-blue-600">⚡</span> Upcoming Club Recruits
        </h3>
        <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="min-w-[280px] max-w-[300px] bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition p-4 border border-gray-200 dark:border-gray-700"
          >
            {/* Event Header (tags + logo placeholder) */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                  {event.mode || "Offline"}
                </span>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-600 font-medium">
                  {event.type || "Free"}
                </span>
              </div>
              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-sm font-bold">
                {event.logo ? (
                  <img
                    src={event.logo}
                    alt="logo"
                    className="h-full w-full object-cover rounded-md"
                  />
                ) : (
                  "Logo"
                )}
              </div>
            </div>

            {/* Event Title */}
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              {event.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {event.organizer || "Unknown Organizer"}
            </p>

            {/* Stats */}
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {event.applied || 0} Applied
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {event.daysLeft || 0} days left
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
