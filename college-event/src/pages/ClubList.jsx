import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchClubs, joinClub, selectMyMemberships, fetchMyMemberships } from '../slices/clubsSlice';
import { selectClubs, selectClubsLoading, selectClubsError } from '../slices/clubsSlice';
import { selectUser } from '../slices/authSlice';
import {
  pageContainerStyle,
  contentWrapperStyle,
  pageHeaderStyle,
  pageTitleStyle,
  pageSubtitleStyle,
  gridStyle,
  loadingStyle,
  errorBannerStyle,
  emptyStateStyle,
  listItemStyle,
  badgeStyle,
  primaryButtonStyle,
} from '../styles/uiStyles';

function ClubList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const clubs = useSelector(selectClubs);
  const { fetching, joining } = useSelector(selectClubsLoading);
  const error = useSelector(selectClubsError);
  const user = useSelector(selectUser);
  const myMemberships = useSelector(selectMyMemberships);
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    console.log('ClubList: Fetching clubs...');
    dispatch(fetchClubs({ page: 1, limit: 20 }));
    if (isStudent) {
      dispatch(fetchMyMemberships());
    }
  }, [dispatch, isStudent]);

  const handleJoinClub = async (clubId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(joinClub(clubId)).unwrap();
      // Refresh memberships
      dispatch(fetchMyMemberships());
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  const getMembershipStatus = (clubId) => {
    const membership = myMemberships.find((m) => m.clubId === clubId);
    return membership ? membership.status : null;
  };

  if (fetching) {
    return (
      <div style={pageContainerStyle}>
        <div style={loadingStyle}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#667eea', marginBottom: '16px' }} />
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        <div style={pageHeaderStyle}>
          <h1 style={pageTitleStyle}>Clubs</h1>
          <p style={pageSubtitleStyle}>Explore all college clubs and organizations</p>
        </div>

        {error && (
          <div style={errorBannerStyle}>
            <span>⚠</span>
            <span><strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load clubs'}</span>
          </div>
        )}

        {clubs && clubs.length > 0 ? (
          <div style={gridStyle}>
            {clubs.map((club) => {
              const membershipStatus = getMembershipStatus(club.id);
              const statusColors = {
                APPROVED: { bg: '#c6f6d5', text: '#22543d' },
                PENDING: { bg: '#feebc8', text: '#7c2d12' },
              };
              const statusStyle = membershipStatus ? statusColors[membershipStatus] : null;

              return (
                <div
                  key={club.id}
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
                  <Link
                    to={`/clubs/${club.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ fontSize: '32px', flexShrink: 0 }}>🏛️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>
                            {club.name}
                          </h3>
                          {membershipStatus && statusStyle && (
                            <span style={{ ...badgeStyle, ...statusStyle }}>
                              {membershipStatus}
                            </span>
                          )}
                        </div>
                        {club.college?.name && (
                          <p style={{ margin: '4px 0', color: '#718096', fontSize: '14px' }}>
                            {club.college.name}
                          </p>
                        )}
                        {club.description && (
                          <p style={{ margin: '8px 0 0 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                            {club.description.substring(0, 120)}
                            {club.description.length > 120 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  {isStudent && !membershipStatus && (
                    <button
                      onClick={(e) => handleJoinClub(club.id, e)}
                      disabled={joining}
                      style={{
                        ...primaryButtonStyle,
                        marginTop: '12px',
                        width: '100%',
                        padding: '8px 16px',
                        fontSize: '14px',
                        opacity: joining ? 0.7 : 1,
                        cursor: joining ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {joining ? 'Joining...' : 'Join Club'}
                    </button>
                  )}
                  {isStudent && membershipStatus === 'PENDING' && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#feebc8', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#7c2d12' }}>
                      Request Pending
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !fetching && (
            <div style={emptyStateStyle}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No clubs found.</p>
              <p style={{ fontSize: '14px', color: '#a0aec0' }}>Create a new club to get started!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ClubList;

