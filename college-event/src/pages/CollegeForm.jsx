import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCollege } from '../slices/collegesSlice';
import { selectCollegesLoading, selectCollegesError } from '../slices/collegesSlice';
import { selectUser } from '../slices/authSlice';

function CollegeForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { creating } = useSelector(selectCollegesLoading);
  const error = useSelector(selectCollegesError);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logo: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Role guard
  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
          Unauthorized: Only admins can create colleges.
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
      errors.name = 'College name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'College name must be at least 2 characters';
    }
    if (!formData.code.trim()) {
      errors.code = 'College code is required';
    } else if (formData.code.trim().length < 2) {
      errors.code = 'College code must be at least 2 characters';
    }
    if (formData.logo && formData.logo.trim()) {
      try {
        new URL(formData.logo);
      } catch (e) {
        errors.logo = 'Logo must be a valid URL';
      }
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
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        logo: formData.logo.trim() || null,
      };

      console.log('CollegeForm: Creating college...', payload);
      const result = await dispatch(createCollege(payload)).unwrap();
      console.log('CollegeForm: Success:', result);

      // Navigate to colleges list on success
      navigate('/colleges');
    } catch (error) {
      console.error('CollegeForm: Error:', error);
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

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Create College</h1>

      {error && (
        <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '8px', marginBottom: '20px' }}>
          {typeof error === 'string' ? error : error.error || 'Failed to create college'}
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
          <label htmlFor="name">College Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Massachusetts Institute of Technology"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.name && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.name}</div>
          )}
        </div>

        <div>
          <label htmlFor="code">College Code *</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., MIT"
            style={{ width: '100%', padding: '8px', marginTop: '5px', textTransform: 'uppercase' }}
            onBlur={(e) => {
              // Auto-uppercase the code
              setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase().trim() }));
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Unique identifier for the college (will be converted to uppercase)
          </div>
          {validationErrors.code && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.code}</div>
          )}
        </div>

        <div>
          <label htmlFor="logo">Logo URL (Optional)</label>
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.logo && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.logo}</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={creating}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {creating ? 'Creating...' : 'Create College'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/colleges')}
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

export default CollegeForm;

