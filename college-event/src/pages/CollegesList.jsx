import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchColleges } from '../slices/collegesSlice';
import { selectColleges, selectCollegesLoading, selectCollegesError } from '../slices/collegesSlice';

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
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading colleges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          <strong>Error:</strong> {typeof error === 'string' ? error : error.error || 'Failed to load colleges'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Colleges</h1>
      
      {colleges && colleges.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {colleges.map((college) => (
            <Link
              key={college.id}
              to={`/colleges/${college.id}`}
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
              <h3 style={{ margin: '0 0 10px 0' }}>{college.name}</h3>
              {college.location && <p style={{ margin: '5px 0', color: '#666' }}>Location: {college.location}</p>}
              {college.description && (
                <p style={{ margin: '5px 0', color: '#666' }}>{college.description.substring(0, 100)}...</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p>No colleges found.</p>
      )}
    </div>
  );
}

export default CollegesList;

