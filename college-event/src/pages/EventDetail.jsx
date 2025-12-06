import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchEventById } from '../slices/eventsSlice';
import { selectCurrentEvent, selectEventsLoading, selectEventsError } from '../slices/eventsSlice';

function EventDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const event = useSelector(selectCurrentEvent);
  const { fetching } = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);

  useEffect(() => {
    if (id) {
      console.log('EventDetail: Fetching event with id:', id);
      dispatch(fetchEventById(id));
    }
  }, [id, dispatch]);

  if (fetching) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          <strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load event'}
        </div>
        <Link to="/events" style={{ display: 'inline-block', marginTop: '15px', color: '#007bff' }}>
          Back to Events
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <p>Event not found.</p>
        <Link to="/events" style={{ display: 'inline-block', marginTop: '15px', color: '#007bff' }}>
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <Link to="/events" style={{ display: 'inline-block', marginBottom: '20px', color: '#007bff' }}>
        ← Back to Events
      </Link>

      <h1>{event.title}</h1>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        {event.description && (
          <div style={{ marginBottom: '15px' }}>
            <h3>Description</h3>
            <p>{event.description}</p>
          </div>
        )}

        {event.dateTime && (
          <p style={{ marginBottom: '10px' }}>
            <strong>Date & Time:</strong> {new Date(event.dateTime).toLocaleString()}
          </p>
        )}

        {event.venue && (
          <p style={{ marginBottom: '10px' }}>
            <strong>Venue:</strong> {event.venue}
          </p>
        )}

        {event.isPaid && (
          <p style={{ marginBottom: '10px', color: '#d32f2f', fontSize: '18px' }}>
            <strong>Price:</strong> {event.price} {event.currency || 'INR'}
          </p>
        )}

        {event.visibility && (
          <p style={{ marginBottom: '10px' }}>
            <strong>Visibility:</strong> {event.visibility}
          </p>
        )}

        {event.clubId && (
          <p style={{ marginBottom: '10px' }}>
            <strong>Club ID:</strong> {event.clubId}
          </p>
        )}

        {event.createdAt && (
          <p style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
            Created: {new Date(event.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <Link
        to={`/events/${event.id}/register`}
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        Register for Event
      </Link>
    </div>
  );
}

export default EventDetail;

