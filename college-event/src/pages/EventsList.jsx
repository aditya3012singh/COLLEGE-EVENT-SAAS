import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../slices/eventsSlice';
import { selectEvents, selectEventsMeta, selectEventsLoading, selectEventsError } from '../slices/eventsSlice';

function EventsList() {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const { page, totalPages, total } = useSelector(selectEventsMeta);
  const { fetching } = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    console.log('EventsList: Fetching events...', { page: currentPage, search: searchTerm });
    dispatch(fetchEvents({ page: currentPage, limit: 10, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (fetching && events.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          <strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load events'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Events</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      </div>

      {fetching && <p style={{ color: '#666' }}>Loading...</p>}

      {events && events.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                style={{
                  display: 'block',
                  padding: '20px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid #ddd',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{event.title}</h3>
                {event.description && (
                  <p style={{ margin: '5px 0', color: '#666' }}>{event.description.substring(0, 150)}...</p>
                )}
                {event.dateTime && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Date:</strong> {new Date(event.dateTime).toLocaleString()}
                  </p>
                )}
                {event.venue && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Venue:</strong> {event.venue}
                  </p>
                )}
                {event.isPaid && (
                  <p style={{ margin: '5px 0', color: '#d32f2f' }}>
                    <strong>Price:</strong> {event.price} {event.currency || 'INR'}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                }}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages} (Total: {total})
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  backgroundColor: currentPage >= totalPages ? '#f5f5f5' : 'white',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p>No events found.</p>
      )}
    </div>
  );
}

export default EventsList;

