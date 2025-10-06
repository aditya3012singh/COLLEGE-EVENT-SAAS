"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CreateRecruitmentForm() {
  const params = useParams();
  const collegeCode = params.collegeCode;
  const router = useRouter();

  const [formData, setFormData] = useState({
    position: "",
    description: "",
    eligibility: "",
    applicationDeadline: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Connect to backend API to create recruitment event
    alert(`Recruitment created with data: ${JSON.stringify(formData)}`);

    // On success, redirect to total registrations or recruitment list
    router.push(`/${collegeCode}/clubDashboard/total-registrations`);
  };

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>Create Recruitment Event</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          name="position"
          placeholder="Position"
          value={formData.position}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
        <input
          name="eligibility"
          placeholder="Eligibility Criteria"
          value={formData.eligibility}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="applicationDeadline"
          value={formData.applicationDeadline}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{ padding: 12 }}>
          Create Recruitment
        </button>
      </form>
    </main>
  );
}
