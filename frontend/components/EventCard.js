export default function EventCard({ event }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-xl font-bold">{event.name}</h3>
      <p className="text-gray-600">{event.description}</p>
      <p className="text-sm text-gray-500 mt-2">
        📍 {event.location} | 🗓 {new Date(event.date).toDateString()}
      </p>
    </div>
  );
}
