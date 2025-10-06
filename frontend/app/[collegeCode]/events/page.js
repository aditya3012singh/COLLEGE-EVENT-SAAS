"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const router = useRouter();
  const params = useParams();
  const collegeCode = params.collegeCode;

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Replace with your backend API endpoint to get events by collegeCode
        const res = await fetch(`/api/colleges/${collegeCode}/events`);
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    }
    fetchEvents();
  }, [collegeCode]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Events at {collegeCode?.toUpperCase()}</h1>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li
              key={event.id}
              style={{ cursor: "pointer", margin: "10px 0", textDecoration: "underline", color: "blue" }}
              onClick={() => router.push(`/${collegeCode}/events/${event.id}`)}
            >
              {event.title} - {new Date(event.dateTime).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
