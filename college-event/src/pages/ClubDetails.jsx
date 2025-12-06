import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClubById, selectCurrentClub, selectClubsLoading } from '../slices/clubsSlice';
import { selectUser } from '../slices/authSlice';
import {
  pageContainerStyle,
  contentWrapperStyle,
  pageHeaderStyle,
  pageTitleStyle,
  pageSubtitleStyle,
  loadingStyle,
  errorBannerStyle,
  cardStyle,
  primaryButtonStyle,
} from '../styles/uiStyles';

function ClubDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const club = useSelector(selectCurrentClub);
  const { fetching, error } = useSelector(selectClubsLoading);
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (id) {
      dispatch(fetchClubById(id));
    }
  }, [dispatch, id]);

  if (fetching) {
    return (
      <div style={pageContainerStyle}>
        <div style={loadingStyle}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#667eea', marginBottom: '16px' }} />
          <p>Loading club details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageContainerStyle}>
        <div style={errorBannerStyle}>
          <span>⚠</span>
          <span><strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load club details'}</span>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div style={pageContainerStyle}>
        <div style={{ ...errorBannerStyle, backgroundColor: '#fef2f2' }}>
          <span>🔍</span>
          <span>Club not found</span>
        </div>
      </div>
    );
  }

  // Helper function to render social links
  const renderSocialLinks = (user) => (
    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
      {user.linkedin && (
        <a 
          href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'none' }}
        >
          LinkedIn
        </a>
      )}
      {user.github && (
        <a 
          href={user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'none' }}
        >
          GitHub
        </a>
      )}
    </div>
  );

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Club Members</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {club.members?.map((member) => (
                <div key={member.id} style={{ ...cardStyle, padding: '16px' }}>
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
                  <div key={alum.id} style={{ ...cardStyle, padding: '16px' }}>
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
                <div style={{ ...cardStyle, padding: '16px' }}>
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
                    <div key={lead.id} style={{ ...cardStyle, padding: '16px' }}>
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
            <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px' }}>
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
                  <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>Members</div>
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
            {club.upcomingEvents && club.upcomingEvents.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a202c' }}>Upcoming Events</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {club.upcomingEvents.slice(0, 3).map((event) => (
                    <Link 
                      key={event.id} 
                      to={`/events/${event.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ ...cardStyle, padding: '16px', transition: 'all 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{event.title}</div>
                        <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>
                          {new Date(event.dateTime).toLocaleDateString()} • {event.venue}
                        </div>
                        <div style={{ 
                          display: 'inline-block',
                          backgroundColor: '#e6fffa',
                          color: '#2c7a7b',
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

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        {/* Header with back button */}
        <div style={{ marginBottom: '24px' }}>
          <Link 
            to="/clubs" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#4a5568',
              textDecoration: 'none',
              marginBottom: '16px',
              '&:hover': { color: '#2d3748' }
            }}
          >
            <span style={{ marginRight: '8px' }}>←</span> Back to Clubs
          </Link>
          
          <div style={pageHeaderStyle}>
            <div>
              <h1 style={pageTitleStyle}>{club.name}</h1>
              <p style={pageSubtitleStyle}>
                {club.college?.name} • {club.department || 'College Club'}
              </p>
            </div>
            {user?.role === 'STUDENT' && (
              <button style={primaryButtonStyle}>
                Join Club
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['about', 'members', 'alumni', 'leads'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: activeTab === tab ? '#3b82f6' : '#718096',
                  borderBottom: `2px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: 'all 0.2s',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

export default ClubDetails;
