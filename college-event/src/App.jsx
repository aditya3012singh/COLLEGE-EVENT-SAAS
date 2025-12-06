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
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
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

  return (
    <nav
      style={{
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        marginBottom: '20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontSize: '20px', fontWeight: 'bold' }}>
            College Event SaaS
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {user ? (
            <>
              <span>Welcome, {user.name || user.email}</span>
              <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" style={{ textDecoration: 'none', color: '#007bff' }}>
              Login
            </Link>
          )}
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
      <div style={{ minHeight: '100vh' }}>
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
