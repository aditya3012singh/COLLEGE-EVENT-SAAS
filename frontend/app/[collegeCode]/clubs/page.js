"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ClubsListPage() {
  const [clubs, setClubs] = useState([]);
  const router = useRouter();
  const params = useParams();
  const collegeCode = params.collegeCode;

  useEffect(() => {
    async function fetchClubs() {
      try {
        // Replace URL with your backend API to fetch clubs for the college
        const res = await fetch(`/api/colleges/${collegeCode}/clubs`);
        const data = await res.json();
        setClubs(data);
      } catch (error) {
        console.error("Failed to fetch clubs", error);
      }
    }
    fetchClubs();
  }, [collegeCode]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Clubs at {collegeCode?.toUpperCase()}</h1>
      {clubs.length === 0 ? (
        <p>No clubs found.</p>
      ) : (
        <ul>
          {clubs.map((club) => (
            <li 
              key={club.id} 
              onClick={() => router.push(`/${collegeCode}/clubs/${club.id}`)} 
              style={{ cursor: "pointer", margin: "10px 0", textDecoration: "underline", color: "blue" }}
            >
              {club.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
