"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EventDetailsPage() {
  const params = useParams();
  const { collegeCode, eventId } = params;
  const [event, setEvent] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        // Replace with your backend API endpoint for event details
        const res = await fetch(`/api/colleges/${collegeCode}/events/${eventId}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    }
    fetchEvent();
  }, [collegeCode, eventId]);

  if (!event) return <p>Loading event details...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>{event.title}</h1>
      <p><strong>Date:</strong> {new Date(event.dateTime).toLocaleString()}</p>
      <p><strong>Venue:</strong> {event.venue}</p>
      <p>{event.description}</p>
      {/* Add registration buttons or links here */}
    </main>
  );
}
