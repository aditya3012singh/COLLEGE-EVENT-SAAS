import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../slices/eventsSlice';
import { selectEvents, selectEventsMeta, selectEventsLoading, selectEventsError } from '../slices/eventsSlice';
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
  searchInputStyle,
  paginationStyle,
  paginationButtonStyle,
  paginationButtonActiveStyle,
  badgeColors,
  badgeStyle,
} from '../styles/uiStyles';

function EventsList() {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const { page, totalPages, total } = useSelector(selectEventsMeta);
  const { fetching } = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    console.log('EventsList: Fetching events...', { page: currentPage, search: searchTerm });
    dispatch(fetchEvents({ page: currentPage, limit: 10, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (fetching && events.length === 0) {
    return (
      <div style={pageContainerStyle}>
        <div style={loadingStyle}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#667eea', marginBottom: '16px' }} />
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        <div style={pageHeaderStyle}>
          <h1 style={pageTitleStyle}>Events</h1>
          <p style={pageSubtitleStyle}>Discover and register for upcoming college events</p>
        </div>

        <input
          type="text"
          placeholder="Search events by title or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={searchInputStyle}
        />

        {error && events.length === 0 && (
          <div style={errorBannerStyle}>
            <span>⚠</span>
            <span><strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load events'}</span>
          </div>
        )}

        {fetching && events.length > 0 && (
          <p style={{ color: '#718096', marginBottom: '20px' }}>Loading more events...</p>
        )}

        {events && events.length > 0 ? (
          <>
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
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a202c', flex: 1 }}>
                        {event.title}
                      </h3>
                      {event.isPaid && (
                        <span style={{ ...badgeStyle, ...badgeColors.PAID, marginLeft: '12px' }}>
                          Paid
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p style={{ margin: '0 0 12px 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                        {event.description.substring(0, 120)}
                        {event.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4a5568' }}>
                      {event.dateTime && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>📅</span>
                          <span>{new Date(event.dateTime).toLocaleString()}</span>
                        </div>
                      )}
                      {event.venue && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>📍</span>
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {event.isPaid && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c05621', fontWeight: '600' }}>
                          <span>💰</span>
                          <span>{event.price} {event.currency || 'INR'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={paginationStyle}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    ...(currentPage === 1 ? paginationButtonStyle : paginationButtonActiveStyle),
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '14px', color: '#4a5568' }}>
                  Page {currentPage} of {totalPages} (Total: {total} events)
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    ...(currentPage >= totalPages ? paginationButtonStyle : paginationButtonActiveStyle),
                    opacity: currentPage >= totalPages ? 0.5 : 1,
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          !fetching && (
            <div style={emptyStateStyle}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No events found.</p>
              <p style={{ fontSize: '14px', color: '#a0aec0' }}>
                {searchTerm ? 'Try a different search term.' : 'Be the first to create an event!'}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default EventsList;

