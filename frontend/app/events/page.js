"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Dummy events
    const dummyEvents = [
      {
        id: 1,
        title: "Hackathon 2025",
        description: "24-hour coding challenge for all branches.",
        dateTime: "2025-10-15T10:00:00Z",
        venue: "KIET Auditorium",
        club: { name: "CPByte" },
      },
      {
        id: 2,
        title: "AI Workshop",
        description: "Hands-on session on AI & ML fundamentals.",
        dateTime: "2025-11-05T14:00:00Z",
        venue: "Seminar Hall 2",
        club: { name: "AI Club" },
      },
      {
        id: 3,
        title: "Cultural Fest",
        description: "Dance, drama, and music competition.",
        dateTime: "2025-12-20T18:00:00Z",
        venue: "Open Ground",
        club: { name: "Cultural Club" },
      },
    ];

    setEvents(dummyEvents);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
