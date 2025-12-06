import { useSelector } from 'react-redux';
import { selectUser } from '../slices/authSlice';
import StudentDashboard from './StudentDashboard';
import ClubDashboard from './ClubDashboard';
import CollegeDashboard from './CollegeDashboard';
import {
  pageContainerStyle,
  contentWrapperStyle,
  cardStyle,
} from '../styles/uiStyles';

function Dashboard() {
  const user = useSelector(selectUser);

  if (!user) {
    return (
      <div style={pageContainerStyle}>
        <div style={contentWrapperStyle}>
          <div style={cardStyle}>
            <p style={{ color: '#e53e3e' }}>Please log in to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (user.role === 'STUDENT') {
    return <StudentDashboard />;
  } else if (user.role === 'ORGANIZER') {
    return <ClubDashboard />;
  } else if (user.role === 'ADMIN') {
    return <CollegeDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        <div style={cardStyle}>
          <p style={{ color: '#e53e3e' }}>Unknown user role. Please contact support.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
