export function Notifications({ notifications = [] }) {
  if (notifications.length === 0) {
    return <p>No new notifications.</p>;
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-3">Notifications</h3>
      <ul className="space-y-2 max-h-64 overflow-y-auto border p-3 rounded bg-gray-50 dark:bg-gray-800">
        {notifications.map((note) => (
          <li key={note.id} className="p-2 border-b last:border-b-0">
            <p><strong>{note.title}</strong></p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{note.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
