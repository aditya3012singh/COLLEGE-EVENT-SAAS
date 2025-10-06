"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ClubDetailsPage() {
  const params = useParams();
  const { collegeCode, clubId } = params;
  const [club, setClub] = useState(null);

  useEffect(() => {
    async function fetchClub() {
      try {
        // Replace URL with your backend API to get club details by ID
        const res = await fetch(`/api/colleges/${collegeCode}/clubs/${clubId}`);
        if (!res.ok) throw new Error("Failed to fetch club");
        const data = await res.json();
        setClub(data);
      } catch (error) {
        console.error("Error fetching club:", error);
      }
    }
    fetchClub();
  }, [collegeCode, clubId]);

  if (!club) return <p>Loading club details...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>{club.name}</h1>
      <p>{club.description || "No description available."}</p>
      {/* Add more club details and actions here */}
    </main>
  );
}
