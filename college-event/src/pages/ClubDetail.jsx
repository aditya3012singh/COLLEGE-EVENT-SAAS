import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchClubById } from '../slices/clubsSlice';
import { selectCurrentClub, selectClubsLoading, selectClubsError } from '../slices/clubsSlice';
import { fetchEvents } from '../slices/eventsSlice';
import { selectEvents } from '../slices/eventsSlice';

function ClubDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const club = useSelector(selectCurrentClub);
  const { fetching } = useSelector(selectClubsLoading);
  const error = useSelector(selectClubsError);
  const events = useSelector(selectEvents);

  useEffect(() => {
    if (id) {
      console.log('ClubDetail: Fetching club with id:', id);
      dispatch(fetchClubById(id));
      // Also fetch events for this club
      dispatch(fetchEvents({ page: 1, limit: 20 }));
    }
  }, [id, dispatch]);

  // Filter events for this club
  const clubEvents = events.filter((event) => event.clubId === id);

  if (fetching) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading club details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          <strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load club'}
        </div>
        <Link to="/clubs" style={{ display: 'inline-block', marginTop: '15px', color: '#007bff' }}>
          Back to Clubs
        </Link>
      </div>
    );
  }

  if (!club) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <p>Club not found.</p>
        <Link to="/clubs" style={{ display: 'inline-block', marginTop: '15px', color: '#007bff' }}>
          Back to Clubs
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <Link to="/clubs" style={{ display: 'inline-block', marginBottom: '20px', color: '#007bff' }}>
        ← Back to Clubs
      </Link>

      <h1>{club.name}</h1>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        {club.description && <p style={{ marginBottom: '10px' }}>{club.description}</p>}
        {club.collegeId && <p style={{ marginBottom: '5px' }}><strong>College ID:</strong> {club.collegeId}</p>}
        {club.createdAt && (
          <p style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
            Created: {new Date(club.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <h2>Events</h2>
      {clubEvents && clubEvents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {clubEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              style={{
                display: 'block',
                padding: '15px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #90caf9',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>{event.title}</h3>
              {event.dateTime && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  Date: {new Date(event.dateTime).toLocaleString()}
                </p>
              )}
              {event.venue && <p style={{ margin: '5px 0', color: '#666' }}>Venue: {event.venue}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <p>No events found for this club.</p>
      )}
    </div>
  );
}

export default ClubDetail;

