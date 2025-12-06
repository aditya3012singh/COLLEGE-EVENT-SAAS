import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/authSlice';

function Dashboard() {
  const user = useSelector(selectUser);

  const isOrganizerOrAdmin = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Dashboard</h1>

      {user ? (
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h2>Welcome, {user.name || user.email}!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {user.collegeId && <p><strong>College ID:</strong> {user.collegeId}</p>}
        </div>
      ) : (
        <div style={{ color: 'red' }}>Not logged in. Please login first.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3>Navigation</h3>
        
        <Link
          to="/colleges"
          style={{
            display: 'block',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#1976d2',
          }}
        >
          View Colleges
        </Link>

        <Link
          to="/clubs"
          style={{
            display: 'block',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#1976d2',
          }}
        >
          View Clubs
        </Link>

        <Link
          to="/events"
          style={{
            display: 'block',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#1976d2',
          }}
        >
          View Events
        </Link>

        {isOrganizerOrAdmin && (
          <>
            <h3 style={{ marginTop: '20px' }}>Create New</h3>
            <Link
              to="/events/new"
              style={{
                display: 'block',
                padding: '15px',
                backgroundColor: '#fff3e0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#e65100',
              }}
            >
              Create Event
            </Link>
            <Link
              to="/clubs/new"
              style={{
                display: 'block',
                padding: '15px',
                backgroundColor: '#fff3e0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#e65100',
              }}
            >
              Create Club
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/colleges/new"
                style={{
                  display: 'block',
                  padding: '15px',
                  backgroundColor: '#fff3e0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#e65100',
                }}
              >
                Create College
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

