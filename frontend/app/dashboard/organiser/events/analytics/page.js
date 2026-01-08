"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getEvents } from "@/store/api/event.thunk";

export default function EventAnalyticsPage() {
  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.event);
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  useEffect(() => {
    if (events && events.length > 0) {
      const now = new Date();
      const upcoming = events.filter((e) => new Date(e.date) > now).length;
      const past = events.filter((e) => new Date(e.date) <= now).length;

      setAnalytics({
        totalEvents: events.length,
        upcomingEvents: upcoming,
        pastEvents: past,
        totalRegistrations: events.reduce((sum, e) => sum + (e._count?.registrations || 0), 0),
      });
    }
  }, [events]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Events Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalEvents}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Upcoming Events</p>
              <p className="text-3xl font-bold text-green-600">{analytics.upcomingEvents}</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Past Events</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.pastEvents}</p>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalRegistrations}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>
      </div>
    </div>
  );
}
