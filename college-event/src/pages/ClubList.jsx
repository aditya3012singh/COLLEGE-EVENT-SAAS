import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchClubs } from '../slices/clubsSlice';
import { selectClubs, selectClubsLoading, selectClubsError } from '../slices/clubsSlice';

function ClubList() {
  const dispatch = useDispatch();
  const clubs = useSelector(selectClubs);
  const { fetching } = useSelector(selectClubsLoading);
  const error = useSelector(selectClubsError);

  useEffect(() => {
    console.log('ClubList: Fetching clubs...');
    dispatch(fetchClubs({ page: 1, limit: 20 }));
  }, [dispatch]);

  if (fetching) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading clubs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          <strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load clubs'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Clubs</h1>
      
      {clubs && clubs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {clubs.map((club) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #ddd',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>{club.name}</h3>
              {club.description && (
                <p style={{ margin: '5px 0', color: '#666' }}>{club.description.substring(0, 150)}...</p>
              )}
              {club.collegeId && <p style={{ margin: '5px 0', color: '#666' }}>College ID: {club.collegeId}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <p>No clubs found.</p>
      )}
    </div>
  );
}

export default ClubList;

