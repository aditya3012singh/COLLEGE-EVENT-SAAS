import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../slices/authSlice';
import { 
  fetchMyClubs,
  selectMyClubs,
  fetchMembershipRequests,
  selectMembershipRequests,
  updateMembershipStatus,
  selectClubsLoading,
  fetchClubs,
  selectClubs,
} from '../slices/clubsSlice';
import { fetchEvents, selectEvents, fetchMyEvents, selectMyEvents, selectEventsLoading } from '../slices/eventsSlice';
import { fetchColleges, selectColleges } from '../slices/collegesSlice';
import {
  pageContainerStyle,
  contentWrapperStyle,
  cardStyle,
  gridStyle,
  badgeColors,
  badgeStyle,
  primaryButtonStyle,
  listItemStyle,
  loadingStyle,
  emptyStateStyle,
} from '../styles/uiStyles';

function CollegeDashboard() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const myClubs = useSelector(selectMyClubs);
  const myEvents = useSelector(selectMyEvents);
  const membershipRequests = useSelector(selectMembershipRequests);
  const events = useSelector(selectEvents);
  const clubs = useSelector(selectClubs);
  const colleges = useSelector(selectColleges);
  const { fetchingMyClubs, fetchingRequests, updatingMembership } = useSelector(selectClubsLoading);
  const { fetchingMy: fetchingMyEvents } = useSelector(selectEventsLoading);
  
  const [activeTab, setActiveTab] = useState('overview');
  const roleBadgeColors = badgeColors[user?.role] || badgeColors.ADMIN;

  // Filter clubs and events by admin's college
  const collegeClubs = useMemo(() => {
    if (!user?.collegeId || !clubs) return [];
    return clubs.filter((club) => club.collegeId === user.collegeId);
  }, [clubs, user?.collegeId]);

  const collegeEvents = useMemo(() => {
    if (!user?.collegeId || !events) return [];
    return events.filter((event) => event.collegeId === user.collegeId);
  }, [events, user?.collegeId]);

  useEffect(() => {
    dispatch(fetchMyClubs());
    dispatch(fetchMyEvents({ page: 1, limit: 100 }));
    dispatch(fetchMembershipRequests());
    dispatch(fetchEvents({ page: 1, limit: 100 }));
    dispatch(fetchClubs({ page: 1, limit: 100 }));
    dispatch(fetchColleges());
  }, [dispatch]);

  const handleApproveMembership = async (membershipId) => {
    try {
      await dispatch(updateMembershipStatus({ membershipId, status: 'APPROVED' })).unwrap();
      dispatch(fetchMembershipRequests());
    } catch (error) {
      console.error('Failed to approve membership:', error);
    }
  };

  const handleRejectMembership = async (membershipId) => {
    try {
      await dispatch(updateMembershipStatus({ membershipId, status: 'REJECTED' })).unwrap();
      dispatch(fetchMembershipRequests());
    } catch (error) {
      console.error('Failed to reject membership:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'my-events', label: 'My Events', icon: '📅' },
    { id: 'my-clubs', label: 'My Clubs', icon: '🏛️' },
    { id: 'college-clubs', label: 'College Clubs', icon: '🎓' },
    { id: 'college-events', label: 'College Events', icon: '📋' },
    { id: 'membership-requests', label: 'Membership Requests', icon: '👥', badge: membershipRequests.length },
    { id: 'all-events', label: 'All Events', icon: '🌐' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <div style={cardStyle}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a202c' }}>Profile</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>
                    {user?.name || user?.email}
                  </h3>
                  <p style={{ margin: '8px 0', color: '#4a5568', fontSize: '14px' }}>
                    <strong>Email:</strong> {user?.email}
                  </p>
                  {user?.college?.name && (
                    <p style={{ margin: '8px 0', color: '#4a5568', fontSize: '14px' }}>
                      <strong>College:</strong> {user.college.name} ({user.college.code})
                    </p>
                  )}
                </div>
                <span style={{ ...badgeStyle, ...roleBadgeColors }}>{user?.role}</span>
              </div>
            </div>
          </div>
        );

      case 'overview':
        const totalEvents = myEvents.length;
        const totalClubs = myClubs.length;
        const totalMembers = myClubs.reduce((sum, club) => sum + (club.memberCount || 0), 0);
        const pendingRequests = membershipRequests.length;
        const collegeClubsCount = collegeClubs.length;
        const collegeEventsCount = collegeEvents.length;

        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a202c' }}>Overview</h2>
            <div style={gridStyle}>
              <div style={cardStyle}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                  {totalEvents}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  My Events
                </div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                  {collegeEventsCount}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  College Events
                </div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                  {totalClubs}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  My Clubs
                </div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                  {collegeClubsCount}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  College Clubs
                </div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                  {totalMembers}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Members
                </div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: pendingRequests > 0 ? '#c05621' : '#667eea', marginBottom: '8px' }}>
                  {pendingRequests}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pending Requests
                </div>
              </div>
            </div>
          </div>
        );

      case 'my-events':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>My Events</h2>
              <Link
                to="/events/new"
                style={{
                  ...primaryButtonStyle,
                  textDecoration: 'none',
                  display: 'inline-flex',
                }}
              >
                ➕ Create Event
              </Link>
            </div>
            {fetchingMyEvents ? (
              <div style={loadingStyle}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#667eea', marginBottom: '16px' }} />
                <p>Loading your events...</p>
              </div>
            ) : myEvents.length > 0 ? (
              <div style={gridStyle}>
                {myEvents.map((event) => (
                  <div
                    key={event.id}
                    style={listItemStyle}
                  >
                    <Link
                      to={`/events/${event.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>{event.title}</h3>
                          {event.registrationCount !== undefined && (
                            <span style={{ ...badgeStyle, ...badgeColors.ACTIVE, fontSize: '12px' }}>
                              {event.registrationCount} registrations
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p style={{ margin: '0 0 12px 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                            {event.description.substring(0, 120)}...
                          </p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4a5568' }}>
                          <div>📅 {new Date(event.dateTime).toLocaleString()}</div>
                          {event.venue && <div>📍 {event.venue}</div>}
                          {event.club && <div>🏛️ {event.club.name}</div>}
                        </div>
                      </div>
                    </Link>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <Link
                        to={`/events/${event.id}/edit`}
                        style={{
                          ...primaryButtonStyle,
                          flex: 1,
                          padding: '8px 16px',
                          fontSize: '14px',
                          textDecoration: 'none',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <p>You haven't created any events yet.</p>
                <Link
                  to="/events/new"
                  style={{
                    ...primaryButtonStyle,
                    marginTop: '16px',
                    display: 'inline-flex',
                    textDecoration: 'none',
                  }}
                >
                  Create Your First Event
                </Link>
              </div>
            )}
          </div>
        );

      case 'my-clubs':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>My Clubs</h2>
              <Link
                to="/clubs/new"
                style={{
                  ...primaryButtonStyle,
                  textDecoration: 'none',
                  display: 'inline-flex',
                }}
              >
                ➕ Create Club
              </Link>
            </div>
            {fetchingMyClubs ? (
              <div style={loadingStyle}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#667eea', marginBottom: '16px' }} />
                <p>Loading your clubs...</p>
              </div>
            ) : myClubs.length > 0 ? (
              <div style={gridStyle}>
                {myClubs.map((club) => (
                  <div
                    key={club.id}
                    style={listItemStyle}
                  >
                    <Link
                      to={`/clubs/${club.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>{club.name}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                            {club.memberCount !== undefined && (
                              <span style={{ fontSize: '12px', color: '#718096' }}>{club.memberCount} members</span>
                            )}
                            {club.eventCount !== undefined && (
                              <span style={{ fontSize: '12px', color: '#718096' }}>{club.eventCount} events</span>
                            )}
                          </div>
                        </div>
                        {club.college && (
                          <p style={{ margin: '4px 0', color: '#718096', fontSize: '14px' }}>
                            {club.college.name} ({club.college.code})
                          </p>
                        )}
                      </div>
                    </Link>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <Link
                        to={`/clubs/${club.id}/edit`}
                        style={{
                          ...primaryButtonStyle,
                          flex: 1,
                          padding: '8px 16px',
                          fontSize: '14px',
                          textDecoration: 'none',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <p>You haven't created any clubs yet.</p>
                <Link
                  to="/clubs/new"
                  style={{
                    ...primaryButtonStyle,
                    marginTop: '16px',
                    display: 'inline-flex',
                    textDecoration: 'none',
                  }}
                >
                  Create Your First Club
                </Link>
              </div>
            )}
          </div>
        );

      case 'college-clubs':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a202c' }}>College Clubs</h2>
            {collegeClubs.length > 0 ? (
              <div style={gridStyle}>
                {collegeClubs.map((club) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.id}`}
                    style={listItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏛️</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>{club.name}</h3>
                    {club.description && (
                      <p style={{ margin: '4px 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                        {club.description.substring(0, 100)}...
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <p>No clubs available in your college.</p>
              </div>
            )}
          </div>
        );

      case 'college-events':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a202c' }}>College Events</h2>
            {collegeEvents.length > 0 ? (
              <div style={gridStyle}>
                {collegeEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    style={listItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
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
                    {event.description && (
                      <p style={{ margin: '0 0 12px 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                        {event.description.substring(0, 120)}...
                      </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4a5568' }}>
                      <div>📅 {new Date(event.dateTime).toLocaleString()}</div>
                      {event.venue && <div>📍 {event.venue}</div>}
                      {event.club && <div>🏛️ {event.club.name}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <p>No events found in your college.</p>
              </div>
            )}
          </div>
        );

      case 'membership-requests':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a202c' }}>Membership Requests</h2>
            {fetchingRequests ? (
              <div style={loadingStyle}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#667eea', marginBottom: '16px' }} />
                <p>Loading membership requests...</p>
              </div>
            ) : membershipRequests.length > 0 ? (
              <div style={gridStyle}>
                {membershipRequests.map((request) => (
                  <div key={request.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1a202c' }}>
                          {request.user.name}
                        </h3>
                        <p style={{ margin: '4px 0', color: '#718096', fontSize: '14px' }}>{request.user.email}</p>
                        {request.user.college && (
                          <p style={{ margin: '4px 0', color: '#718096', fontSize: '14px' }}>
                            {request.user.college.name} ({request.user.college.code})
                          </p>
                        )}
                      </div>
                      <span style={{ ...badgeStyle, ...badgeColors.PENDING }}>PENDING</span>
                    </div>
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Club:</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#1a202c' }}>{request.club.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApproveMembership(request.id)}
                        disabled={updatingMembership}
                        style={{
                          ...primaryButtonStyle,
                          flex: 1,
                          padding: '10px 16px',
                          fontSize: '14px',
                          opacity: updatingMembership ? 0.7 : 1,
                          cursor: updatingMembership ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {updatingMembership ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectMembership(request.id)}
                        disabled={updatingMembership}
                        style={{
                          ...primaryButtonStyle,
                          backgroundColor: '#e53e3e',
                          flex: 1,
                          padding: '10px 16px',
                          fontSize: '14px',
                          opacity: updatingMembership ? 0.7 : 1,
                          cursor: updatingMembership ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!updatingMembership) e.target.style.backgroundColor = '#c53030';
                        }}
                        onMouseLeave={(e) => {
                          if (!updatingMembership) e.target.style.backgroundColor = '#e53e3e';
                        }}
                      >
                        {updatingMembership ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <p>No pending membership requests.</p>
              </div>
            )}
          </div>
        );

      case 'all-events':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a202c' }}>All Events</h2>
            {events.length > 0 ? (
              <div style={gridStyle}>
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    style={listItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
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
                    {event.description && (
                      <p style={{ margin: '0 0 12px 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                        {event.description.substring(0, 120)}...
                      </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4a5568' }}>
                      <div>📅 {new Date(event.dateTime).toLocaleString()}</div>
                      {event.venue && <div>📍 {event.venue}</div>}
                      {event.club && <div>🏛️ {event.club.name}</div>}
                      {event.college && event.college.id !== user?.collegeId && (
                        <div style={{ color: '#667eea' }}>🎓 {event.college.name}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <p>No events found.</p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a202c' }}>College Admin Dashboard</h1>
          <p style={{ color: '#718096', fontSize: '16px' }}>Welcome back, {user?.name || user?.email}!</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#667eea' : '#4a5568',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) e.target.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) e.target.style.color = '#4a5568';
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    backgroundColor: '#e53e3e',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

export default CollegeDashboard;

