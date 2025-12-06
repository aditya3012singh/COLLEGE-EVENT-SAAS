import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createEvent, updateEvent, fetchEventById } from '../slices/eventsSlice';
import { selectCurrentEvent, selectEventsLoading, selectEventsError } from '../slices/eventsSlice';
import { selectUser } from '../slices/authSlice';
import { fetchClubs } from '../slices/clubsSlice';
import { selectClubs } from '../slices/clubsSlice';

function EventForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const user = useSelector(selectUser);
  const currentEvent = useSelector(selectCurrentEvent);
  const { creating, updating, fetching } = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);
  const clubs = useSelector(selectClubs);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    venue: '',
    clubId: '',
    visibility: 'PUBLIC',
    isPaid: false,
    price: '',
    currency: 'INR',
    allowedColleges: [],
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Role guard
  useEffect(() => {
    if (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      console.log('Unauthorized access to EventForm');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch clubs for dropdown
  useEffect(() => {
    dispatch(fetchClubs({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Fetch event data if editing
  useEffect(() => {
    if (isEditMode && id) {
      console.log('EventForm: Fetching event for edit, id:', id);
      dispatch(fetchEventById(id));
    }
  }, [id, isEditMode, dispatch]);

  // Populate form when event data is loaded
  useEffect(() => {
    if (isEditMode && currentEvent) {
      console.log('EventForm: Populating form with event data:', currentEvent);
      setFormData({
        title: currentEvent.title || '',
        description: currentEvent.description || '',
        dateTime: currentEvent.dateTime ? new Date(currentEvent.dateTime).toISOString().slice(0, 16) : '',
        venue: currentEvent.venue || '',
        clubId: currentEvent.clubId || '',
        visibility: currentEvent.visibility || 'PUBLIC',
        isPaid: currentEvent.isPaid || false,
        price: currentEvent.price || '',
        currency: currentEvent.currency || 'INR',
        allowedColleges: currentEvent.allowedColleges || [],
      });
    }
  }, [currentEvent, isEditMode]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.dateTime) errors.dateTime = 'Date & Time is required';
    if (!formData.venue.trim()) errors.venue = 'Venue is required';
    if (!formData.clubId) errors.clubId = 'Club is required';
    if (formData.isPaid && (!formData.price || parseFloat(formData.price) <= 0)) {
      errors.price = 'Valid price is required for paid events';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm()) {
      console.log('Validation failed', validationErrors);
      return;
    }

    try {
      const payload = {
        ...formData,
        price: formData.isPaid ? parseFloat(formData.price) : undefined,
        allowedColleges: formData.allowedColleges.length > 0 ? formData.allowedColleges : undefined,
      };

      let result;
      if (isEditMode) {
        console.log('EventForm: Updating event...', payload);
        result = await dispatch(updateEvent({ id, ...payload })).unwrap();
      } else {
        console.log('EventForm: Creating event...', payload);
        result = await dispatch(createEvent(payload)).unwrap();
      }

      console.log('EventForm: Success:', result);
      navigate(`/events/${result.id || id}`);
    } catch (error) {
      console.error('EventForm: Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          Unauthorized: Only organizers and admins can create/edit events.
        </div>
      </div>
    );
  }

  if (isEditMode && fetching) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading event data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>{isEditMode ? 'Edit Event' : 'Create Event'}</h1>

      {error && (
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px', marginBottom: '20px' }}>
          {typeof error === 'string' ? error : error.error || 'Operation failed'}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.title && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.title}</div>
          )}
        </div>

        <div>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.description && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.description}</div>
          )}
        </div>

        <div>
          <label htmlFor="dateTime">Date & Time *</label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.dateTime && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.dateTime}</div>
          )}
        </div>

        <div>
          <label htmlFor="venue">Venue *</label>
          <input
            type="text"
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.venue && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.venue}</div>
          )}
        </div>

        <div>
          <label htmlFor="clubId">Club *</label>
          <select
            id="clubId"
            name="clubId"
            value={formData.clubId}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select a club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
          {validationErrors.clubId && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.clubId}</div>
          )}
        </div>

        <div>
          <label htmlFor="visibility">Visibility</label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="COLLEGE_ONLY">College Only</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
            />
            Paid Event
          </label>
        </div>

        {formData.isPaid && (
          <>
            <div>
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {validationErrors.price && (
                <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.price}</div>
              )}
            </div>

            <div>
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={creating || updating}
          style={{
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creating || updating ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {creating || updating ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default EventForm;

