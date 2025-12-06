import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createClub, updateClub, fetchClubById } from '../slices/clubsSlice';
import { selectCurrentClub, selectClubsLoading, selectClubsError } from '../slices/clubsSlice';
import { selectUser } from '../slices/authSlice';
import { fetchColleges } from '../slices/collegesSlice';
import { selectColleges } from '../slices/collegesSlice';

function ClubForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const currentClub = useSelector(selectCurrentClub);
  const { creating, updating, fetching } = useSelector(selectClubsLoading);
  const error = useSelector(selectClubsError);
  const colleges = useSelector(selectColleges);

  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Role guard
  useEffect(() => {
    if (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch colleges for dropdown
  useEffect(() => {
    dispatch(fetchColleges());
  }, [dispatch]);

  // Fetch club data if editing
  useEffect(() => {
    if (isEditMode && id) {
      console.log('ClubForm: Fetching club for edit, id:', id);
      dispatch(fetchClubById(id));
    }
  }, [id, isEditMode, dispatch]);

  // Populate form when club data is loaded
  useEffect(() => {
    if (isEditMode && currentClub) {
      console.log('ClubForm: Populating form with club data:', currentClub);
      setFormData({
        name: currentClub.name || '',
        collegeId: currentClub.collegeId || user?.collegeId || '',
      });
    } else if (!isEditMode && user?.collegeId) {
      // Auto-select user's college for new clubs
      setFormData((prev) => ({ ...prev, collegeId: user.collegeId }));
    }
  }, [currentClub, isEditMode, user]);

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          Unauthorized: Only organizers and admins can create/edit clubs.
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Club name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Club name must be at least 2 characters';
    }
    if (!formData.collegeId) {
      errors.collegeId = 'College is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm()) {
      console.log('Validation failed', validationErrors);
      return;
    }

    try {
      let result;
      if (isEditMode) {
        // Update only supports name field
        const payload = {
          name: formData.name.trim(),
        };
        console.log('ClubForm: Updating club...', payload);
        result = await dispatch(updateClub({ id, ...payload })).unwrap();
      } else {
        // Create supports name and collegeId (description not in backend schema)
        const payload = {
          name: formData.name.trim(),
          collegeId: Number(formData.collegeId),
        };
        console.log('ClubForm: Creating club...', payload);
        result = await dispatch(createClub(payload)).unwrap();
      }

      console.log('ClubForm: Success:', result);
      navigate(`/clubs/${result.id || id}`);
    } catch (error) {
      console.error('ClubForm: Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (isEditMode && fetching) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <p>Loading club data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>{isEditMode ? 'Edit Club' : 'Create Club'}</h1>

      {error && (
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px', marginBottom: '20px' }}>
          {typeof error === 'string' ? error : error.error || 'Operation failed'}
          {error.issues && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              {Object.entries(error.issues).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {Array.isArray(value._errors) ? value._errors.join(', ') : JSON.stringify(value)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="name">Club Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Computer Science Club"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.name && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.name}</div>
          )}
        </div>

        <div>
          <label htmlFor="collegeId">College *</label>
          <select
            id="collegeId"
            name="collegeId"
            value={formData.collegeId}
            onChange={handleChange}
            disabled={user.role !== 'ADMIN' && !isEditMode}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              backgroundColor: user.role !== 'ADMIN' && !isEditMode ? '#f5f5f5' : 'white',
            }}
          >
            <option value="">Select a college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name} ({college.code})
              </option>
            ))}
          </select>
          {user.role !== 'ADMIN' && !isEditMode && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Automatically set to your college
            </div>
          )}
          {validationErrors.collegeId && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.collegeId}</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={creating || updating}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creating || updating ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {creating || updating ? 'Saving...' : isEditMode ? 'Update Club' : 'Create Club'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clubs')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClubForm;

