import React from "react";

export default function ClubsJoined({ clubs = [] }) {
  if (clubs.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center text-gray-700 dark:text-gray-300">
        You have not joined any clubs yet.
      </div>
    );
  }

  return (
    <section>
      <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Clubs Joined
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
              {club.name}
            </h4>
            <p className="text-gray-800 dark:text-gray-300 mb-4">
              {club.description.length > 100
                ? club.description.slice(0, 100) + "..."
                : club.description}
            </p>
            <button
              onClick={() => alert(`Navigate to ${club.name} page`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Visit Club
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
