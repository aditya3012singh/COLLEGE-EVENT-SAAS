import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../slices/authSlice';
import { 
  fetchMyMemberships, 
  selectMyMemberships, 
  fetchClubs, 
  selectClubs, 
  joinClub, 
  selectClubsLoading,
  fetchClubById,
  selectCurrentClub,
} from '../slices/clubsSlice';
import { fetchEvents, selectEvents } from '../slices/eventsSlice';
import { fetchMyRegistrations, selectMyRegistrations } from '../slices/registrationsSlice';

function StudentDashboard() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const myMemberships = useSelector(selectMyMemberships);
  const clubs = useSelector(selectClubs);
  const events = useSelector(selectEvents);
  const myRegistrations = useSelector(selectMyRegistrations);
  const { fetchingMemberships, joining } = useSelector(selectClubsLoading);
  const currentClub = useSelector(selectCurrentClub);
  
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinFormData, setJoinFormData] = useState({ reason: '' });

  // Filter clubs by student's college
  const collegeClubs = useMemo(() => {
    if (!user?.collegeId || !clubs) return [];
    return clubs.filter((club) => club.collegeId === user.collegeId);
  }, [clubs, user?.collegeId]);

  // Your clubs (where student is a member)
  const myClubs = useMemo(() => {
    if (!myMemberships || !Array.isArray(myMemberships)) return [];
    return myMemberships
      .filter(m => m && m.status === 'APPROVED' && m.club)
      .map(m => m.club)
      .filter(Boolean);
  }, [myMemberships]);

  // Separate events
  const { allEvents, upcomingEvents, registeredEvents, completedEvents, outsideCollegeEvents } = useMemo(() => {
    if (!events || !Array.isArray(events)) {
      return {
        allEvents: [],
        upcomingEvents: [],
        registeredEvents: [],
        completedEvents: [],
        outsideCollegeEvents: [],
      };
    }

    const now = new Date();
    const all = events.filter(e => e && e.dateTime);
    const upcoming = all.filter((e) => new Date(e.dateTime) >= now);
    const completed = all.filter((e) => new Date(e.dateTime) < now);
    
    // Registered events
    const registeredEventIds = new Set(
      (myRegistrations || [])
        .filter(r => r && r.eventId)
        .map((r) => r.eventId)
    );
    const registered = all.filter((e) => registeredEventIds.has(e.id));
    
    // Outside college events (events from other colleges)
    const outside = all.filter((e) => 
      e.collegeId && e.collegeId !== user?.collegeId
    );

    return {
      allEvents: all.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)),
      upcomingEvents: upcoming.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)),
      registeredEvents: registered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)),
      completedEvents: completed.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)),
      outsideCollegeEvents: outside.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)),
    };
  }, [events, myRegistrations, user?.collegeId]);

  useEffect(() => {
    dispatch(fetchMyMemberships());
    dispatch(fetchEvents({ page: 1, limit: 100 }));
    dispatch(fetchMyRegistrations());
    dispatch(fetchClubs({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleClubClick = async (clubId) => {
    setSelectedClubId(clubId);
    await dispatch(fetchClubById(clubId));
    // Check if club is accepting new members (we'll assume all clubs accept members for now)
    // You can add a field to the club model later if needed
    setShowJoinForm(true);
  };

  const handleJoinClub = async (clubId) => {
    try {
      await dispatch(joinClub(clubId)).unwrap();
      dispatch(fetchMyMemberships());
      setShowJoinForm(false);
      setSelectedClubId(null);
      setJoinFormData({ reason: '' });
    } catch (error) {
      console.error('Failed to join club:', error);
      alert(`Failed to join club: ${error.error || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getEventCardGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    ];
    return gradients[index % gradients.length];
  };

  const renderEventCard = (event, idx) => {
    if (!event || !event.id || !event.title) return null;
    
    return (
      <Link
        key={event.id}
        to={`/events/${event.id}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #e2e8f0',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{
            background: getEventCardGradient(idx),
            padding: '20px',
            color: '#ffffff',
            minHeight: '100px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '8px',
              lineHeight: '1.3',
              color: '#ffffff',
            }}>
              {event.title}
            </h3>
            {event.club && event.club.name && (
              <div style={{
                fontSize: '12px',
                opacity: 0.9,
                fontWeight: '500',
              }}>
                🏛️ {event.club.name}
              </div>
            )}
          </div>
          <div style={{ padding: '16px' }}>
            {event.description && (
              <p style={{
                fontSize: '13px',
                color: '#718096',
                lineHeight: '1.5',
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {event.description}
              </p>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              color: '#4a5568',
            }}>
              {event.dateTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📅</span>
                  <span>{formatDate(event.dateTime)} • {formatTime(event.dateTime)}</span>
                </div>
              )}
              {event.venue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span>
                  <span>{event.venue}</span>
                </div>
              )}
              {event.isPaid && event.price && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#c05621',
                  fontWeight: '600',
                  backgroundColor: '#feebc8',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  width: 'fit-content',
                }}>
                  💰 {event.price} {event.currency || 'INR'}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const renderSection = (title, items, renderItem, emptyMessage) => (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e2e8f0',
      }}>
        {title}
      </h2>
      {items.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {items.map((item, idx) => renderItem(item, idx))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <p style={{ fontSize: '16px', color: '#718096' }}>{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1a202c', marginBottom: '8px' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p style={{ fontSize: '16px', color: '#718096' }}>
            Explore events, join clubs, and grow your network
          </p>
        </div>

        {/* 1. All Events */}
        {renderSection(
          'All Events',
          allEvents,
          renderEventCard,
          'No events available at the moment.'
        )}

        {/* 2. Upcoming Events */}
        {renderSection(
          'Upcoming Events',
          upcomingEvents,
          renderEventCard,
          'No upcoming events scheduled.'
        )}

        {/* 3. Registered Events */}
        {renderSection(
          'My Registered Events',
          registeredEvents,
          (event, idx) => {
            if (!event || !event.id) return null;
            const registration = (myRegistrations || []).find((r) => r && r.eventId === event.id);
            return (
              <div key={event.id}>
                {renderEventCard(event, idx)}
                {registration && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: registration.paymentStatus === 'PAID' ? '#c6f6d5' : '#feebc8',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: registration.paymentStatus === 'PAID' ? '#22543d' : '#7c2d12',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    {registration.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Payment Pending'}
                    {registration.attended && ' • Attended'}
                  </div>
                )}
              </div>
            );
          },
          'You haven\'t registered for any events yet.'
        )}

        {/* 4. Completed Events */}
        {renderSection(
          'Completed Events',
          completedEvents,
          renderEventCard,
          'No completed events yet.'
        )}

        {/* 5. College Clubs */}
        {renderSection(
          'College Clubs',
          collegeClubs,
          (club, idx) => {
            if (!club || !club.id || !club.name) return null;
            const membership = (myMemberships || []).find((m) => m && m.clubId === club.id);
            const isMember = membership?.status === 'APPROVED';
            const isPending = membership?.status === 'PENDING';
            
            return (
              <div
                key={club.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
                onClick={() => handleClubClick(club.id)}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏛️</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px',
                }}>
                  {club.name}
                </h3>
                {club.description && (
                  <p style={{
                    fontSize: '13px',
                    color: '#718096',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {club.description}
                  </p>
                )}
                {club.college && club.college.name && (
                  <p style={{
                    fontSize: '12px',
                    color: '#a0aec0',
                    marginBottom: '12px',
                  }}>
                    {club.college.name}
                  </p>
                )}
                {isMember && (
                  <span style={{
                    fontSize: '11px',
                    backgroundColor: '#c6f6d5',
                    color: '#22543d',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'inline-block',
                  }}>
                    Member ✓
                  </span>
                )}
                {isPending && (
                  <span style={{
                    fontSize: '11px',
                    backgroundColor: '#feebc8',
                    color: '#7c2d12',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'inline-block',
                  }}>
                    Request Pending
                  </span>
                )}
                {!isMember && !isPending && (
                  <span style={{
                    fontSize: '11px',
                    color: '#3b82f6',
                    fontWeight: '600',
                  }}>
                    Click to view details →
                  </span>
                )}
              </div>
            );
          },
          'No clubs available in your college.'
        )}

        {/* Club Detail Modal */}
        {showJoinForm && selectedClubId && currentClub && currentClub.name && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflow: 'auto',
          }}
          onClick={() => {
            setShowJoinForm(false);
            setSelectedClubId(null);
            setJoinFormData({ reason: '' });
          }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏛️</div>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1a202c', marginBottom: '8px' }}>
                    {currentClub.name}
                  </h2>
                  {currentClub.college && (
                    <p style={{ fontSize: '16px', color: '#718096', marginBottom: '4px' }}>
                      {currentClub.college.name} ({currentClub.college.code})
                    </p>
                  )}
                  {currentClub.department && (
                    <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '4px' }}>
                      📚 Department: {currentClub.department}
                    </p>
                  )}
                  {currentClub.domain && (
                    <p style={{ fontSize: '14px', color: '#4a5568' }}>
                      🎯 Domain: {currentClub.domain}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowJoinForm(false);
                    setSelectedClubId(null);
                    setJoinFormData({ reason: '' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    color: '#718096',
                    cursor: 'pointer',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}>
                {[
                  { label: 'Members', value: currentClub.memberCount || 0, icon: '👥' },
                  { label: 'Alumni', value: currentClub.alumniCount || 0, icon: '🎓' },
                  { label: 'Events', value: currentClub.eventCount || 0, icon: '📅' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f7fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '4px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {currentClub.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c', marginBottom: '12px' }}>
                    About
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    lineHeight: '1.6',
                  }}>
                    {currentClub.description}
                  </p>
                </div>
              )}

              {/* Club Lead */}
              {currentClub.clubLead && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c', marginBottom: '12px' }}>
                    👑 Club Lead
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f7fafc',
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '700',
                    }}>
                      {currentClub.clubLead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a202c' }}>
                        {currentClub.clubLead.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#718096' }}>
                        {currentClub.clubLead.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Domain Leads */}
              {currentClub.domainLeads && currentClub.domainLeads.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c', marginBottom: '12px' }}>
                    🌟 Domain Leads
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentClub.domainLeads.map((domainLead) => (
                      <div
                        key={domainLead.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px',
                          backgroundColor: '#f7fafc',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '700',
                          }}>
                            {domainLead.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                              {domainLead.user.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#718096' }}>
                              {domainLead.user.email}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          backgroundColor: '#ede9fe',
                          color: '#6d28d9',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontWeight: '600',
                        }}>
                          {domainLead.domain}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {currentClub.achievements && currentClub.achievements.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c', marginBottom: '12px' }}>
                    🏆 Achievements
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {currentClub.achievements.slice(0, 5).map((achievement) => (
                      <div
                        key={achievement.id}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f7fafc',
                          borderRadius: '8px',
                          borderLeft: '3px solid #f59e0b',
                        }}
                      >
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                          {achievement.title}
                        </div>
                        {achievement.description && (
                          <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
                            {achievement.description}
                          </div>
                        )}
                        {achievement.member && (
                          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>
                            By: {achievement.member.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Join Form */}
              {!myMemberships.find(m => m && m.clubId === selectedClubId) && (
                <>
                  <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c', marginBottom: '12px' }}>
                      Join This Club
                    </h3>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '8px',
                    }}>
                      Why do you want to join this club? (Optional)
                    </label>
                    <textarea
                      value={joinFormData.reason}
                      onChange={(e) => setJoinFormData({ ...joinFormData, reason: e.target.value })}
                      placeholder="Tell us why you're interested in joining..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        minHeight: '100px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleJoinClub(selectedClubId)}
                      disabled={joining}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: joining ? 'not-allowed' : 'pointer',
                        opacity: joining ? 0.7 : 1,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!joining) {
                          e.target.style.backgroundColor = '#2563eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!joining) {
                          e.target.style.backgroundColor = '#3b82f6';
                        }
                      }}
                    >
                      {joining ? 'Joining...' : 'Join Club'}
                    </button>
                    <button
                      onClick={() => {
                        setShowJoinForm(false);
                        setSelectedClubId(null);
                        setJoinFormData({ reason: '' });
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#ffffff',
                        color: '#4a5568',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#cbd5e0';
                        e.target.style.backgroundColor = '#f7fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.backgroundColor = '#ffffff';
                      }}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}

              {/* Already a member */}
              {myMemberships.find(m => m && m.clubId === selectedClubId) && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#c6f6d5',
                  color: '#22543d',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: '600',
                }}>
                  You are already a member of this club ✓
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Your Clubs */}
        {renderSection(
          'Your Clubs',
          myClubs,
          (club, idx) => {
            if (!club || !club.id || !club.name) return null;
            return (
              <Link
                key={club.id}
                to={`/clubs/${club.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏛️</div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '8px',
                  }}>
                    {club.name}
                  </h3>
                  {club.description && (
                    <p style={{
                      fontSize: '13px',
                      color: '#718096',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {club.description}
                    </p>
                  )}
                  <span style={{
                    fontSize: '11px',
                    backgroundColor: '#c6f6d5',
                    color: '#22543d',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'inline-block',
                  }}>
                    Member ✓
                  </span>
                </div>
              </Link>
            );
          },
          'You\'re not a member of any clubs yet.'
        )}

        {/* 7. Outside College Events */}
        {renderSection(
          'Outside College Events',
          outsideCollegeEvents,
          renderEventCard,
          'No events from other colleges available.'
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
