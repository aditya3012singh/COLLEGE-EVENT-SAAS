import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchColleges } from '../slices/collegesSlice';
import { selectColleges, selectCollegesLoading, selectCollegesError } from '../slices/collegesSlice';
import {
  pageContainerStyle,
  contentWrapperStyle,
  pageHeaderStyle,
  pageTitleStyle,
  pageSubtitleStyle,
  cardStyle,
  gridStyle,
  loadingStyle,
  errorBannerStyle,
  emptyStateStyle,
  listItemStyle,
} from '../styles/uiStyles';

function CollegesList() {
  const dispatch = useDispatch();
  const colleges = useSelector(selectColleges);
  const { fetching } = useSelector(selectCollegesLoading);
  const error = useSelector(selectCollegesError);

  useEffect(() => {
    console.log('CollegesList: Fetching colleges...');
    dispatch(fetchColleges());
  }, [dispatch]);

  if (fetching) {
    return (
      <div style={pageContainerStyle}>
        <div style={loadingStyle}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#667eea', marginBottom: '16px' }} />
          <p>Loading colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        <div style={pageHeaderStyle}>
          <h1 style={pageTitleStyle}>Colleges</h1>
          <p style={pageSubtitleStyle}>Browse all registered colleges and institutions</p>
        </div>

        {error && (
          <div style={errorBannerStyle}>
            <span>⚠</span>
            <span><strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load colleges'}</span>
          </div>
        )}

        {colleges && colleges.length > 0 ? (
          <div style={gridStyle}>
            {colleges.map((college) => (
              <Link
                key={college.id}
                to={`/colleges/${college.id}`}
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '32px', flexShrink: 0 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>
                      {college.name}
                    </h3>
                    {college.code && (
                      <p style={{ margin: '4px 0', color: '#667eea', fontSize: '14px', fontWeight: '500' }}>
                        Code: {college.code}
                      </p>
                    )}
                    {college.description && (
                      <p style={{ margin: '8px 0 0 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                        {college.description.substring(0, 120)}
                        {college.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !fetching && (
            <div style={emptyStateStyle}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No colleges found.</p>
              <p style={{ fontSize: '14px', color: '#a0aec0' }}>Be the first to add a college!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default CollegesList;

