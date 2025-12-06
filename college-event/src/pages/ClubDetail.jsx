import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchClubById, joinClub, fetchMyMemberships, selectMyMemberships } from '../slices/clubsSlice';
import { selectCurrentClub, selectClubsLoading, selectClubsError } from '../slices/clubsSlice';
import { fetchEvents } from '../slices/eventsSlice';
import { selectEvents } from '../slices/eventsSlice';
import { selectUser } from '../slices/authSlice';
import {
  pageContainerStyle,
  contentWrapperStyle,
  pageHeaderStyle,
  pageTitleStyle,
  cardStyle,
  primaryButtonStyle,
  badgeStyle,
  badgeColors,
} from '../styles/uiStyles';

function ClubDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const club = useSelector(selectCurrentClub);
  const { fetching, joining } = useSelector(selectClubsLoading);
  const error = useSelector(selectClubsError);
  const events = useSelector(selectEvents);
  const user = useSelector(selectUser);
  const myMemberships = useSelector(selectMyMemberships);
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    if (id) {
      console.log('ClubDetail: Fetching club with id:', id);
      dispatch(fetchClubById(id));
      dispatch(fetchEvents({ page: 1, limit: 20 }));
      if (isStudent) {
        dispatch(fetchMyMemberships());
      }
    }
  }, [id, dispatch, isStudent]);

  // Filter events for this club
  const clubIdNum = id ? Number(id) : null;
  const clubEvents = events.filter((event) => event.clubId === clubIdNum);
  
  const membership = myMemberships.find((m) => m.clubId === clubIdNum);
  const membershipStatus = membership?.status;

  const handleJoinClub = async () => {
    try {
      await dispatch(joinClub(clubIdNum)).unwrap();
      dispatch(fetchMyMemberships());
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

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
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        <Link 
          to="/clubs" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            marginBottom: '24px', 
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          ← Back to Clubs
        </Link>

        <div style={pageHeaderStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={pageTitleStyle}>{club.name}</h1>
              {club.college && (
                <p style={{ color: '#718096', fontSize: '16px', marginTop: '8px' }}>
                  {club.college.name} ({club.college.code})
                </p>
              )}
            </div>
            {isStudent && (
              <div>
                {!membershipStatus && (
                  <button
                    onClick={handleJoinClub}
                    disabled={joining}
                    style={{
                      ...primaryButtonStyle,
                      opacity: joining ? 0.7 : 1,
                      cursor: joining ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {joining ? 'Joining...' : 'Join Club'}
                  </button>
                )}
                {membershipStatus === 'PENDING' && (
                  <div style={{ ...badgeStyle, ...badgeColors.INACTIVE, padding: '10px 16px', fontSize: '14px' }}>
                    Membership Request Pending
                  </div>
                )}
                {membershipStatus === 'APPROVED' && (
                  <div style={{ ...badgeStyle, ...badgeColors.ACTIVE, padding: '10px 16px', fontSize: '14px' }}>
                    Member
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          {club.description && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1a202c' }}>About</h3>
              <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{club.description}</p>
            </div>
          )}
          {club.createdAt && (
            <p style={{ color: '#718096', fontSize: '14px', marginTop: '16px' }}>
              Created: {new Date(club.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '20px' }}>Events</h2>
          {clubEvents && clubEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {clubEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  style={{
                    ...cardStyle,
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                  }}
                >
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>
                    {event.title}
                  </h3>
                  {event.dateTime && (
                    <p style={{ margin: '8px 0', color: '#4a5568', fontSize: '14px' }}>
                      📅 {new Date(event.dateTime).toLocaleString()}
                    </p>
                  )}
                  {event.venue && (
                    <p style={{ margin: '8px 0', color: '#4a5568', fontSize: '14px' }}>
                      📍 {event.venue}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div style={cardStyle}>
              <p style={{ color: '#718096', textAlign: 'center' }}>No events found for this club.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClubDetail;

