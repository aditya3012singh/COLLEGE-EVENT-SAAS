import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { registerForEvent } from '../slices/registrationsSlice';
import { selectLastCreatedRegistration, selectLastOrder, selectRegistrationsError } from '../slices/registrationsSlice';
import { fetchEventById } from '../slices/eventsSlice';
import { selectCurrentEvent } from '../slices/eventsSlice';
import { selectUser } from '../slices/authSlice';

function RegistrationForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const event = useSelector(selectCurrentEvent);
  const registration = useSelector(selectLastCreatedRegistration);
  const razorpayOrder = useSelector(selectLastOrder);
  const error = useSelector(selectRegistrationsError);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('RegistrationForm: Fetching event with id:', id);
      dispatch(fetchEventById(id));
    }
  }, [id, dispatch]);

  // Load Razorpay script
  useEffect(() => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (razorpayKey && !razorpayLoaded && !window.Razorpay) {
      console.log('RegistrationForm: Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('RegistrationForm: Razorpay script loaded');
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error('RegistrationForm: Failed to load Razorpay script');
      };
      document.body.appendChild(script);
    } else if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, [razorpayLoaded]);

  // Handle Razorpay checkout when order is available
  useEffect(() => {
    if (razorpayOrder && razorpayLoaded && window.Razorpay) {
      console.log('RegistrationForm: Opening Razorpay checkout...', razorpayOrder);
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

      if (!razorpayKey) {
        console.error('RegistrationForm: VITE_RAZORPAY_KEY not set');
        return;
      }

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount, // amount in paise
        currency: razorpayOrder.currency || 'INR',
        order_id: razorpayOrder.id,
        name: event?.title || 'Event Registration',
        description: `Registration for ${event?.title || 'Event'}`,
        handler: function (response) {
          console.log('RegistrationForm: Payment success:', response);
          // Optionally verify payment on backend
          // You can dispatch a verify payment thunk here if needed
          alert('Payment successful! Registration confirmed.');
          navigate(`/events/${id}`);
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#007bff',
        },
        modal: {
          ondismiss: function () {
            console.log('RegistrationForm: Payment modal closed');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    }
  }, [razorpayOrder, razorpayLoaded, event, user, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('RegistrationForm: Submitting registration for event:', id);
      const result = await dispatch(registerForEvent({ eventId: id })).unwrap();
      console.log('RegistrationForm: Registration result:', result);

      // If it's a free event or registration doesn't require payment, show success
      if (!result.razorpayOrder && !event?.isPaid) {
        alert('Registration successful!');
        navigate(`/events/${id}`);
      }
      // If razorpayOrder exists, the useEffect will handle opening checkout
    } catch (error) {
      console.error('RegistrationForm: Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          Please login to register for events.
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Register for Event</h1>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>{event.title}</h2>
        {event.description && <p>{event.description}</p>}
        {event.dateTime && (
          <p>
            <strong>Date:</strong> {new Date(event.dateTime).toLocaleString()}
          </p>
        )}
        {event.venue && (
          <p>
            <strong>Venue:</strong> {event.venue}
          </p>
        )}
        {event.isPaid && (
          <p style={{ fontSize: '18px', color: '#d32f2f' }}>
            <strong>Price:</strong> {event.price} {event.currency || 'INR'}
          </p>
        )}
      </div>

      {error && (
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px', marginBottom: '20px' }}>
          {typeof error === 'string' ? error : error.error || 'Registration failed'}
        </div>
      )}

      {registration && !razorpayOrder && (
        <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Registration Successful!</h3>
          <p>Your registration has been confirmed.</p>
          {registration.qrCode && (
            <div style={{ marginTop: '15px' }}>
              <p><strong>QR Code:</strong></p>
              <img
                src={registration.qrCode}
                alt="Registration QR Code"
                style={{ maxWidth: '200px', border: '1px solid #ddd', padding: '10px', backgroundColor: 'white' }}
              />
            </div>
          )}
          {registration.id && <p><strong>Registration ID:</strong> {registration.id}</p>}
        </div>
      )}

      {!registration && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <p>You are registering as: <strong>{user.name || user.email}</strong></p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {isSubmitting ? 'Processing...' : event.isPaid ? 'Proceed to Payment' : 'Register for Event'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => navigate(`/events/${id}`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Event
        </button>
      </div>
    </div>
  );
}

export default RegistrationForm;

