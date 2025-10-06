export function PerformanceStats({ stats }) {
  // Example stats object: { eventsAttended: 12, clubsJoined: 3, points: 250 }

  if (!stats) {
    return null;
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-3">Performance Stats</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-200 dark:bg-gray-700 rounded p-4">
          <div className="font-bold text-2xl">{stats.eventsAttended}</div>
          <div>Events Attended</div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded p-4">
          <div className="font-bold text-2xl">{stats.clubsJoined}</div>
          <div>Clubs Joined</div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded p-4">
          <div className="font-bold text-2xl">{stats.points}</div>
          <div>Points</div>
        </div>
      </div>
    </section>
  );
}
