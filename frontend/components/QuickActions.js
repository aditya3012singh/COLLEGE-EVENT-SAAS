export function QuickActions({ actions = [] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-3">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map(({ id, label, onClick }) => (
          <button
            key={id}
            onClick={onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
