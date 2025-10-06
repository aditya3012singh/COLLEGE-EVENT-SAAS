"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const router = useRouter();
  const params = useParams();
  const collegeCode = params.collegeCode;

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        // Replace with your backend API endpoint for fetching registrations, adjust as needed
        const res = await fetch(`/api/colleges/${collegeCode}/registrations`);
        const data = await res.json();
        setRegistrations(data);
      } catch (error) {
        console.error("Failed to fetch registrations", error);
      }
    }

    fetchRegistrations();
  }, [collegeCode]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Event Registrations</h1>

      {registrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        <ul>
          {registrations.map((reg) => (
            <li key={reg.id} style={{ margin: '10px 0' }}>
              Event: {reg.eventTitle || reg.event?.title} — Status: {reg.paymentStatus}
              {/* You can expand with attendance status, payment info etc */}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
