import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchClubById, joinClub, fetchMyMemberships, selectMyMemberships } from '../slices/clubsSlice';
import { selectCurrentClub, selectClubsLoading, selectClubsError } from '../slices/clubsSlice';
import { fetchEvents } from '../slices/eventsSlice';
import { selectEvents } from '../slices/eventsSlice';
import { selectUser } from '../slices/authSlice';

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
      <div style={{ 
        maxWidth: '1200px', 
        margin: '50px auto', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#718096', fontSize: '16px' }}>Loading club details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
        <div style={{ 
          color: '#c53030', 
          padding: '16px', 
          backgroundColor: '#fed7d7', 
          borderRadius: '12px',
          marginBottom: '16px',
        }}>
          <strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load club'}
        </div>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-block', 
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!club) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
        <p style={{ color: '#718096', fontSize: '16px', marginBottom: '16px' }}>Club not found.</p>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-block', 
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Total Members', value: club.memberCount || 0, icon: '👥', color: '#3b82f6' },
    { label: 'Alumni', value: club.alumniCount || 0, icon: '🎓', color: '#10b981' },
    { label: 'Total Events', value: club.eventCount || 0, icon: '📅', color: '#8b5cf6' },
    { label: 'Upcoming Events', value: clubEvents.filter(e => new Date(e.dateTime) >= new Date()).length, icon: '🔥', color: '#f59e0b' },
  ];

  const clubAchievements = (club.achievements || []).filter(a => !a.type || a.type === 'CLUB');
  const memberAchievements = (club.achievements || []).filter(a => a.type === 'MEMBER');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            marginBottom: '24px', 
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          ← Back to Dashboard
        </Link>

        {/* Club Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '32px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#1a202c', 
                marginBottom: '12px',
                lineHeight: '1.2',
              }}>
                {club.name}
              </h1>
              {club.college && (
                <p style={{ 
                  color: '#718096', 
                  fontSize: '18px', 
                  marginBottom: '8px',
                  fontWeight: '500',
                }}>
                  {club.college.name} ({club.college.code})
                </p>
              )}
              {club.department && (
                <p style={{ 
                  color: '#4a5568', 
                  fontSize: '16px', 
                  marginBottom: '8px',
                }}>
                  📚 Department: {club.department}
                </p>
              )}
              {club.domain && (
                <p style={{ 
                  color: '#4a5568', 
                  fontSize: '16px', 
                  marginBottom: '16px',
                }}>
                  🎯 Domain: {club.domain}
                </p>
              )}
              {club.description && (
                <p style={{ 
                  color: '#4a5568', 
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  marginTop: '16px',
                }}>
                  {club.description}
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
                      padding: '12px 24px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: joining ? 'not-allowed' : 'pointer',
                      opacity: joining ? 0.7 : 1,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!joining) {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!joining) {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {joining ? 'Joining...' : 'Join Club'}
                  </button>
                )}
                {membershipStatus === 'PENDING' && (
                  <div style={{
                    padding: '12px 24px',
                    backgroundColor: '#feebc8',
                    color: '#7c2d12',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    Membership Request Pending
                  </div>
                )}
                {membershipStatus === 'APPROVED' && (
                  <div style={{
                    padding: '12px 24px',
                    backgroundColor: '#c6f6d5',
                    color: '#22543d',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    Member ✓
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
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
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: stat.color,
                marginBottom: '8px',
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#718096',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Club Lead */}
            {club.clubLead && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
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
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '20px',
                    fontWeight: '700',
                  }}>
                    {club.clubLead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                      {club.clubLead.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096' }}>
                      {club.clubLead.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Domain Leads */}
            {club.domainLeads && club.domainLeads.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  🌟 Domain Leads
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {club.domainLeads.map((domainLead) => (
                    <div
                      key={domainLead.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#8b5cf6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontWeight: '700',
                        }}>
                          {domainLead.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a202c' }}>
                            {domainLead.user.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>
                            {domainLead.user.email}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: '#ede9fe',
                        color: '#6d28d9',
                        padding: '4px 12px',
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

            {/* Club Achievements */}
            {clubAchievements.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  🏆 Club Achievements
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {clubAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px',
                        borderLeft: '4px solid #f59e0b',
                      }}
                    >
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a202c',
                        marginBottom: '4px',
                      }}>
                        {achievement.title}
                      </div>
                      {achievement.description && (
                        <div style={{
                          fontSize: '14px',
                          color: '#718096',
                          lineHeight: '1.5',
                          marginTop: '8px',
                        }}>
                          {achievement.description}
                        </div>
                      )}
                      {achievement.achievedAt && (
                        <div style={{
                          fontSize: '12px',
                          color: '#a0aec0',
                          marginTop: '8px',
                        }}>
                          {new Date(achievement.achievedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Member Achievements */}
            {memberAchievements.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  ⭐ Member Achievements
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {memberAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px',
                        borderLeft: '4px solid #10b981',
                      }}
                    >
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a202c',
                        marginBottom: '4px',
                      }}>
                        {achievement.title}
                      </div>
                      {achievement.member && (
                        <div style={{
                          fontSize: '13px',
                          color: '#3b82f6',
                          fontWeight: '500',
                          marginTop: '4px',
                        }}>
                          By: {achievement.member.name}
                        </div>
                      )}
                      {achievement.description && (
                        <div style={{
                          fontSize: '14px',
                          color: '#718096',
                          lineHeight: '1.5',
                          marginTop: '8px',
                        }}>
                          {achievement.description}
                        </div>
                      )}
                      {achievement.achievedAt && (
                        <div style={{
                          fontSize: '12px',
                          color: '#a0aec0',
                          marginTop: '8px',
                        }}>
                          {new Date(achievement.achievedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Club Events */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                📅 Club Events
              </h3>
              {clubEvents && clubEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {clubEvents.slice(0, 5).map((event) => (
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
                          padding: '16px',
                          backgroundColor: '#f7fafc',
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#edf2f7';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f7fafc';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1a202c',
                          marginBottom: '4px',
                        }}>
                          {event.title}
                        </div>
                        {event.dateTime && (
                          <div style={{
                            fontSize: '13px',
                            color: '#718096',
                          }}>
                            📅 {new Date(event.dateTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                  {clubEvents.length > 5 && (
                    <Link
                      to="/events"
                      style={{
                        textAlign: 'center',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginTop: '8px',
                      }}
                    >
                      View All Events →
                    </Link>
                  )}
                </div>
              ) : (
                <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>
                  No events found for this club.
                </p>
              )}
            </div>

            {/* Club Members (if member or organizer) */}
            {club.memberships && club.memberships.length > 0 && (membershipStatus === 'APPROVED' || user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  👥 Club Members ({club.memberships.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {club.memberships.slice(0, 20).map((membership) => (
                    <div
                      key={membership.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '700',
                      }}>
                        {membership.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                          {membership.user.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>
                          {membership.user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                  {club.memberships.length > 20 && (
                    <p style={{ textAlign: 'center', color: '#718096', fontSize: '13px', marginTop: '8px' }}>
                      +{club.memberships.length - 20} more members
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubDetail;
