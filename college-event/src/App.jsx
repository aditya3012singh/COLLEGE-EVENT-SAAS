import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { bootstrapAuth, logout } from './slices/authSlice';
import { selectUser, selectAuthStatus } from './slices/authSlice';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CollegesList from './pages/CollegesList';
import ClubList from './pages/ClubList';
import ClubDetail from './pages/ClubDetail';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import EventForm from './pages/EventForm';
import RegistrationForm from './pages/RegistrationForm';
import CollegeForm from './pages/CollegeForm';
import ClubForm from './pages/ClubForm';

// Protected Route Component
function ProtectedRoute({ children, requireAuth = true, requireRole = null }) {
  const user = useSelector(selectUser);
  const { verifying } = useSelector(selectAuthStatus);

  if (verifying) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '16px',
        color: '#718096',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e2e8f0',
            borderTopColor: '#667eea',
            margin: '0 auto 16px',
          }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRole && user?.role !== requireRole && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Navigation component (needs to be inside Router)
function Navigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const getRoleBadgeStyle = (role) => {
    const colors = {
      STUDENT: { bg: '#bee3f8', text: '#2c5282' },
      ORGANIZER: { bg: '#fed7aa', text: '#c05621' },
      ADMIN: { bg: '#fbb6ce', text: '#97266d' },
    };
    return colors[role] || colors.STUDENT;
  };

  if (!user) return null; // Don't show nav on auth page

  const roleStyle = getRoleBadgeStyle(user?.role);

  return (
    <nav
      style={{
        padding: '16px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            color: '#667eea', 
            fontSize: '24px', 
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          College Event SaaS
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            paddingLeft: '20px',
            borderLeft: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                {user.name || user.email}
              </span>
              <span style={{ 
                fontSize: '11px', 
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: roleStyle.bg,
                color: roleStyle.text,
                textTransform: 'uppercase',
                fontWeight: '600',
                marginTop: '4px',
              }}>
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#c53030';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#e53e3e';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Bootstrap auth on app mount
  useEffect(() => {
    console.log('App: Bootstrapping auth...');
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
        <Navigation />

        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/colleges"
            element={
              <ProtectedRoute>
                <CollegesList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/colleges/new"
            element={
              <ProtectedRoute requireRole="ADMIN">
                <CollegeForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clubs"
            element={
              <ProtectedRoute>
                <ClubList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clubs/:id"
            element={
              <ProtectedRoute>
                <ClubDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clubs/new"
            element={
              <ProtectedRoute requireRole="ORGANIZER">
                <ClubForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clubs/:id/edit"
            element={
              <ProtectedRoute requireRole="ORGANIZER">
                <ClubForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/new"
            element={
              <ProtectedRoute requireRole="ORGANIZER">
                <EventForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute requireRole="ORGANIZER">
                <EventForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:id/register"
            element={
              <ProtectedRoute>
                <RegistrationForm />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard if authenticated, else to auth */}
          <Route
            path="*"
            element={user ? <Navigate to="/" replace /> : <Navigate to="/auth" replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
