export function RegistrationsSummary({ registrations = [] }) {
  if (registrations.length === 0) {
    return <p>No registrations found.</p>;
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-3">Registrations Summary</h3>
      <ul className="space-y-2">
        {registrations.map((reg) => (
          <li
            key={reg.id}
            className={`p-3 rounded border ${
              reg.status === "confirmed" ? "border-green-500" : "border-yellow-500"
            }`}
          >
            <strong>{reg.eventTitle}</strong> — Status: {reg.status}, Payment: {reg.paymentStatus}
          </li>
        ))}
      </ul>
    </section>
  );
}
