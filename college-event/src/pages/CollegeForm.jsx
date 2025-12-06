import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCollege } from '../slices/collegesSlice';
import { selectCollegesLoading, selectCollegesError } from '../slices/collegesSlice';
import { selectUser } from '../slices/authSlice';
import {
  pageContainerStyle,
  contentWrapperStyle,
  pageHeaderStyle,
  pageTitleStyle,
  pageSubtitleStyle,
  cardStyle,
  inputStyle,
  labelStyle,
  errorTextStyle,
  errorBannerStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '../styles/uiStyles';

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
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={pageHeaderStyle}>
            <h1 style={pageTitleStyle}>Create New College</h1>
            <p style={pageSubtitleStyle}>Add a new college to the platform</p>
          </div>

          {error && (
            <div style={errorBannerStyle}>
              <span>⚠</span>
              <span>{typeof error === 'string' ? error : error.error || 'Failed to create college'}</span>
            </div>
          )}

          <div style={cardStyle}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label htmlFor="name" style={labelStyle}>College Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Massachusetts Institute of Technology"
                  disabled={creating}
                  style={inputStyle}
                />
                {validationErrors.name && (
                  <div style={errorTextStyle}>
                    <span>⚠</span>
                    <span>{validationErrors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="code" style={labelStyle}>College Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., MIT"
                  disabled={creating}
                  style={{ ...inputStyle, textTransform: 'uppercase' }}
                  onBlur={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase().trim() }));
                  }}
                />
                <div style={{ fontSize: '13px', color: '#718096', marginTop: '6px' }}>
                  Unique identifier for the college (will be converted to uppercase)
                </div>
                {validationErrors.code && (
                  <div style={errorTextStyle}>
                    <span>⚠</span>
                    <span>{validationErrors.code}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="logo" style={labelStyle}>Logo URL (Optional)</label>
                <input
                  type="url"
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  disabled={creating}
                  style={inputStyle}
                />
                {validationErrors.logo && (
                  <div style={errorTextStyle}>
                    <span>⚠</span>
                    <span>{validationErrors.logo}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    ...primaryButtonStyle,
                    flex: 1,
                    opacity: creating ? 0.7 : 1,
                    cursor: creating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating ? 'Creating...' : 'Create College'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/colleges')}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollegeForm;

