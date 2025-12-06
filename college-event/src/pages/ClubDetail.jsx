import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { 
  fetchClubById, 
  joinClub, 
  fetchMyMemberships, 
  selectMyMemberships,
  selectCurrentClub, 
  selectClubsLoading, 
  selectClubsError 
} from '../slices/clubsSlice';
import { fetchEvents, selectEvents } from '../slices/eventsSlice';
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
  const [activeTab, setActiveTab] = useState('about');

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

  // Helper function to render social links
  const renderSocialLinks = (user) => (
    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
      {user.linkedin && (
        <a 
          href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>🔗</span> LinkedIn
        </a>
      )}
      {user.github && (
        <a 
          href={user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>🐙</span> GitHub
        </a>
      )}
    </div>
  );

  // Define stats data
  const stats = [
    {
      id: 'members',
      label: 'Total Members',
      value: club.memberCount || 0,
      icon: '👥',
      color: '#3b82f6',
    },
    {
      id: 'alumni',
      label: 'Alumni',
      value: club.alumni?.length || 0,
      icon: '🎓',
      color: '#8b5cf6',
    },
    {
      id: 'events',
      label: 'Total Events',
      value: clubEvents.length,
      icon: '📅',
      color: '#10b981',
    },
    {
      id: 'upcoming',
      label: 'Upcoming Events',
      value: clubEvents.filter(event => new Date(event.dateTime) > new Date()).length,
      icon: '⏳',
      color: '#f59e0b',
    },
  ];

  // Define tabs
  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'members', label: 'Members' },
    { id: 'alumni', label: 'Alumni' },
    { id: 'leads', label: 'Leadership' },
  ];

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Club Members</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {club.members?.map((member) => (
                <div key={member.id} style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#4a5568',
                    }}>
                      {member.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1a202c' }}>{member.user?.name || 'Unknown User'}</div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>{member.role || 'Member'}</div>
                      {renderSocialLinks(member.user || {})}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'alumni':
        return (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Alumni</h3>
            {club.alumni && club.alumni.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {club.alumni.map((alum) => (
                  <div key={alum.id} style={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#4a5568',
                      }}>
                        {alum.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>{alum.user?.name || 'Alumni'}</div>
                        <div style={{ fontSize: '14px', color: '#718096' }}>Batch of {alum.graduationYear || 'N/A'}</div>
                        {renderSocialLinks(alum.user || {})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#718096', fontStyle: 'italic' }}>No alumni records found.</p>
            )}
          </div>
        );

      case 'leads':
        return (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Leadership</h3>
            
            {/* Club Lead */}
            {club.clubLead && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>Club Lead</h4>
                <div style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  maxWidth: '500px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '600',
                      color: 'white',
                    }}>
                      {club.clubLead.name?.charAt(0)?.toUpperCase() || 'L'}
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>
                        {club.clubLead.name}
                      </div>
                      <div style={{ color: '#4a5568', margin: '4px 0' }}>Club Lead</div>
                      {renderSocialLinks(club.clubLead)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Domain Leads */}
            {club.domainLeads && club.domainLeads.length > 0 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>Domain Leads</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {club.domainLeads.map((lead) => (
                    <div key={lead.id} style={{ 
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: '#8b5cf6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: '600',
                          color: 'white',
                        }}>
                          {lead.user?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                            {lead.user?.name || 'Domain Lead'}
                          </div>
                          <div style={{ 
                            display: 'inline-block',
                            backgroundColor: '#ede9fe',
                            color: '#6d28d9',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            margin: '4px 0',
                          }}>
                            {lead.domain}
                          </div>
                          {renderSocialLinks(lead.user || {})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'about':
      default:
        return (
          <div style={{ marginTop: '24px' }}>
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a202c' }}>About {club.name}</h3>
              <div style={{ color: '#4a5568', lineHeight: '1.6', marginBottom: '16px' }}>
                {club.description || 'No description available.'}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>Department</div>
                  <div style={{ fontWeight: '500', color: '#1a202c' }}>{club.department || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>Domain</div>
                  <div style={{ fontWeight: '500', color: '#1a202c' }}>{club.domain || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>Total Members</div>
                  <div style={{ fontWeight: '500', color: '#1a202c' }}>{club.memberCount || '0'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>Established</div>
                  <div style={{ fontWeight: '500', color: '#1a202c' }}>
                    {club.createdAt ? new Date(club.createdAt).getFullYear() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            {clubEvents.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a202c' }}>Upcoming Events</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {clubEvents.slice(0, 3).map((event) => (
                    <Link 
                      key={event.id} 
                      to={`/events/${event.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ 
                        backgroundColor: '#ffffff',
                        borderRadius: '12px', 
                        padding: '16px', 
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s',
                        ':hover': { 
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }
                      }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{event.title}</div>
                        <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>
                          {new Date(event.dateTime).toLocaleDateString()} • {event.venue}
                        </div>
                        <div style={{ 
                          display: 'inline-block',
                          backgroundColor: event.isPaid ? '#f0f9ff' : '#f0fdf4',
                          color: event.isPaid ? '#0369a1' : '#166534',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {event.isPaid ? `₹${event.price || '0'}` : 'Free'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
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
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>⚠</span>
          <div>
            <strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load club'}
          </div>
        </div>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '600',
            padding: '8px 12px',
            borderRadius: '6px',
            ':hover': {
              backgroundColor: '#f0f4f8',
            }
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
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fff8f0', 
          borderRadius: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>🔍</span>
          <div>Club not found.</div>
        </div>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '600',
            padding: '8px 12px',
            borderRadius: '6px',
            ':hover': {
              backgroundColor: '#f0f4f8',
            }
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <Link 
          to="/clubs" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px', 
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '600',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s',
            ':hover': {
              backgroundColor: '#f0f4f8',
            }
          }}
        >
          ← Back to Clubs
        </Link>

        {/* Club Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: '#f0f4f8',
                marginBottom: '20px',
                fontSize: '32px',
              }}>
                {club.name?.charAt(0) || 'C'}
              </div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#1a202c', 
                marginBottom: '12px',
                lineHeight: '1.2',
              }}>
                {club.name}
              </h1>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                {club.college && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#4a5568', 
                    fontSize: '15px',
                    backgroundColor: '#f0f4f8',
                    padding: '4px 12px',
                    borderRadius: '12px',
                  }}>
                    <span>🏫</span>
                    <span>{club.college.name}</span>
                  </div>
                )}
                
                {club.department && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#4a5568', 
                    fontSize: '15px',
                    backgroundColor: '#f0f4f8',
                    padding: '4px 12px',
                    borderRadius: '12px',
                  }}>
                    <span>📚</span>
                    <span>{club.department}</span>
                  </div>
                )}
                
                {club.domain && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#4a5568', 
                    fontSize: '15px',
                    backgroundColor: '#f0f4f8',
                    padding: '4px 12px',
                    borderRadius: '12px',
                  }}>
                    <span>🎯</span>
                    <span>{club.domain}</span>
                  </div>
                )}
              </div>
              
              {club.description && (
                <p style={{ 
                  color: '#4a5568', 
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  margin: '16px 0 0',
                  maxWidth: '800px',
                }}>
                  {club.description}
                </p>
              )}
            </div>
            {isStudent && (
              <div style={{ textAlign: 'right' }}>
                {!membershipStatus ? (
                  <button
                    onClick={handleJoinClub}
                    disabled={joining}
                    style={{
                      backgroundColor: joining ? '#cbd5e0' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '15px',
                      cursor: joining ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      ':hover': joining ? {} : {
                        backgroundColor: '#2563eb',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    {joining ? 'Joining...' : 'Join Club'}
                  </button>
                ) : (
                  <div style={{
                    backgroundColor: membershipStatus === 'APPROVED' ? '#c6f6d5' : '#feebc8',
                    color: membershipStatus === 'APPROVED' ? '#22543d' : '#7c2d12',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {membershipStatus === 'APPROVED' ? (
                      <>
                        <span>✓</span>
                        <span>Member</span>
                      </>
                    ) : (
                      <>
                        <span>⏳</span>
                        <span>Request Pending</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '32px',
        }}>
          {stats.map((stat, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white',
                }}>
                  {stat.icon}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1a202c',
                  textAlign: 'right',
                }}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#718096',
                fontWeight: '500',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '32px',
          overflow: 'hidden',
        }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            overflowX: 'auto',
            scrollbarWidth: 'none', // Hide scrollbar for Firefox
            msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
            '&::-webkit-scrollbar': {
              display: 'none', // Hide scrollbar for Chrome/Safari
            },
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 20px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: activeTab === tab.id ? '#3b82f6' : '#718096',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  ':hover': {
                    color: activeTab === tab.id ? '#3b82f6' : '#4a5568',
                  },
                }}
              >
                {tab.label}
              </button>
            ))}
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
