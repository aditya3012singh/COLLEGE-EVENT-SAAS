import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, setToken } from '../slices/authSlice';
import { selectAuthError, selectAuthStatus } from '../slices/authSlice';
import { fetchColleges } from '../slices/collegesSlice';
import { selectColleges } from '../slices/collegesSlice';

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  width: '100%',
  overflow: 'hidden',
};

const leftPanelStyle = {
  flex: '1',
  minWidth: '500px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px',
  position: 'relative',
  overflow: 'hidden',
};

const rightPanelStyle = {
  flex: '1',
  minWidth: '500px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px',
  overflowY: 'auto',
};

const cardStyle = {
  width: '100%',
  maxWidth: '480px',
  transition: 'all 0.3s ease',
};

const headerStyle = {
  textAlign: 'left',
  marginBottom: '40px',
};

const titleStyle = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#1a202c',
  marginBottom: '12px',
  lineHeight: '1.2',
};

const subtitleStyle = {
  fontSize: '16px',
  color: '#718096',
  lineHeight: '1.6',
};

const heroTitleStyle = {
  fontSize: '48px',
  fontWeight: '800',
  color: '#ffffff',
  marginBottom: '24px',
  lineHeight: '1.2',
  textAlign: 'center',
};

const heroSubtitleStyle = {
  fontSize: '20px',
  color: 'rgba(255, 255, 255, 0.9)',
  lineHeight: '1.6',
  textAlign: 'center',
  maxWidth: '500px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#2d3748',
  marginBottom: '4px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '15px',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  color: '#1a202c',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  outline: 'none',
};

const inputFocusStyle = {
  borderColor: '#667eea',
  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%234a5568\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '40px',
};

const errorTextStyle = {
  color: '#e53e3e',
  fontSize: '13px',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const errorBannerStyle = {
  backgroundColor: '#fed7d7',
  border: '1px solid #fc8181',
  color: '#c53030',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const submitButtonStyle = {
  width: '100%',
  padding: '14px',
  fontSize: '16px',
  fontWeight: '600',
  color: '#ffffff',
  backgroundColor: '#667eea',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginTop: '8px',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const submitButtonDisabledStyle = {
  ...submitButtonStyle,
  backgroundColor: '#cbd5e0',
  cursor: 'not-allowed',
  opacity: 0.7,
};

const submitButtonHoverStyle = {
  backgroundColor: '#5568d3',
  transform: 'translateY(-1px)',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
};

const toggleContainerStyle = {
  marginTop: '24px',
  textAlign: 'center',
  paddingTop: '24px',
  borderTop: '1px solid #e2e8f0',
};

const toggleButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#667eea',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  padding: '8px',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
};

const roleBadgeStyle = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase',
  marginLeft: '8px',
};

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'STUDENT',
    collegeId: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authError = useSelector(selectAuthError);
  const { loggingIn, registering } = useSelector(selectAuthStatus);
  const colleges = useSelector(selectColleges);

  useEffect(() => {
    console.log('AuthPage mounted');
    // Fetch colleges when component mounts (needed for registration)
    dispatch(fetchColleges());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!isLogin && !formData.name) {
      errors.name = 'Name is required';
    }
    if (!isLogin && (!formData.collegeId || formData.collegeId === '')) {
      errors.collegeId = 'College is required';
    }
    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      console.log('Validation errors:', errors);
    }
    return isValid;
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
      if (isLogin) {
        console.log('Attempting login...');
        result = await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
      } else {
        console.log('Attempting registration...');
        console.log('Form data before validation:', formData);
        
        // Double-check all required fields are present and valid
        const name = formData.name?.trim();
        const email = formData.email?.trim();
        const password = formData.password;
        const role = formData.role;
        const collegeIdStr = formData.collegeId;
        
        if (!name || name.length < 2) {
          setValidationErrors({ name: 'Name is required (min 2 characters)' });
          return;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          setValidationErrors({ email: 'Valid email is required' });
          return;
        }
        if (!password || password.length < 6) {
          setValidationErrors({ password: 'Password is required (min 6 characters)' });
          return;
        }
        if (!collegeIdStr || collegeIdStr === '') {
          setValidationErrors({ collegeId: 'College is required' });
          return;
        }
        
        const collegeIdNum = Number(collegeIdStr);
        if (isNaN(collegeIdNum) || collegeIdNum <= 0) {
          setValidationErrors({ collegeId: 'Please select a valid college' });
          return;
        }
        
        const payload = {
          email,
          password,
          name,
          role: role || 'STUDENT',
          collegeId: collegeIdNum,
        };
        
        console.log('Registration payload:', payload);
        console.log('Payload types:', {
          email: typeof payload.email,
          password: typeof payload.password,
          name: typeof payload.name,
          role: typeof payload.role,
          collegeId: typeof payload.collegeId,
        });
        
        result = await dispatch(register(payload)).unwrap();
      }

      console.log('Auth success:', result);
      
      // If token is in result, ensure it's set
      if (result.token) {
        dispatch(setToken(result.token));
      }

      // Navigate to dashboard on success
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      // Error is already in Redux state via rejected action
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

  const getInputStyle = (fieldName) => {
    const isFocused = focusedField === fieldName;
    const hasError = validationErrors[fieldName];
    return {
      ...inputStyle,
      ...(isFocused ? inputFocusStyle : {}),
      borderColor: hasError ? '#e53e3e' : isFocused ? '#667eea' : '#e2e8f0',
    };
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      STUDENT: { bg: '#bee3f8', text: '#2c5282' },
      ORGANIZER: { bg: '#fed7aa', text: '#c05621' },
      ADMIN: { bg: '#fbb6ce', text: '#97266d' },
    };
    return colors[role] || colors.STUDENT;
  };

  const isLoading = loggingIn || registering;

  return (
    <div style={containerStyle}>
      {/* Left Panel - Branding/Hero */}
      <div className="auth-left-panel" style={leftPanelStyle}>
        <div>
          <h1 style={heroTitleStyle}>College Event SaaS</h1>
          <p style={heroSubtitleStyle}>
            Manage your college events, registrations, and attendees all in one place.
            Join thousands of institutions already using our platform.
          </p>
        </div>
        <div style={{ marginTop: '60px', display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>10K+</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>Active Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>500+</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>Colleges</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>50K+</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>Events</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right-panel" style={rightPanelStyle}>
        <div className="auth-card" style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h1>
            <p style={subtitleStyle}>
              {isLogin 
                ? 'Sign in to continue to your dashboard' 
                : 'Join our platform and start managing events today'}
            </p>
          </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {!isLogin && (
            <>
              <div style={inputGroupStyle}>
                <label htmlFor="name" style={labelStyle}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  style={getInputStyle('name')}
                />
                {validationErrors.name && (
                  <div style={errorTextStyle}>
                    <span>⚠</span>
                    <span>{validationErrors.name}</span>
                  </div>
                )}
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="role" style={labelStyle}>
                  Role
                  <span style={{ ...roleBadgeStyle, ...getRoleBadgeColor(formData.role) }}>
                    {formData.role}
                  </span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  style={{
                    ...selectStyle,
                    borderColor: focusedField === 'role' ? '#667eea' : '#e2e8f0',
                  }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="ORGANIZER">Organizer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="collegeId" style={labelStyle}>
                  College <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <select
                  id="collegeId"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('collegeId')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  style={{
                    ...selectStyle,
                    borderColor: validationErrors.collegeId
                      ? '#e53e3e'
                      : focusedField === 'collegeId'
                      ? '#667eea'
                      : '#e2e8f0',
                  }}
                >
                  <option value="">Select a college</option>
                  {colleges &&
                    colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name} {college.code ? `(${college.code})` : ''}
                      </option>
                    ))}
                </select>
                {validationErrors.collegeId && (
                  <div style={errorTextStyle}>
                    <span>⚠</span>
                    <span>{validationErrors.collegeId}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="you@example.com"
              disabled={isLoading}
              style={getInputStyle('email')}
            />
            {validationErrors.email && (
              <div style={errorTextStyle}>
                <span>⚠</span>
                <span>{validationErrors.email}</span>
              </div>
            )}
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your password"
              disabled={isLoading}
              style={getInputStyle('password')}
            />
            {validationErrors.password && (
              <div style={errorTextStyle}>
                <span>⚠</span>
                <span>{validationErrors.password}</span>
              </div>
            )}
          </div>

          {authError && (
            <div style={errorBannerStyle}>
              <span>⚠</span>
              <span>{typeof authError === 'string' ? authError : authError.error || 'Authentication failed'}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                Object.assign(e.target.style, submitButtonHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
            style={isLoading ? submitButtonDisabledStyle : submitButtonStyle}
          >
            {isLoading && <span className="loading-spinner" />}
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={toggleContainerStyle}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setValidationErrors({});
              setFormData({ email: '', password: '', name: '', role: 'STUDENT', collegeId: '' });
              setFocusedField(null);
            }}
            style={toggleButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = 'none';
            }}
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ fontWeight: '600' }}>{isLogin ? 'Sign Up' : 'Sign In'}</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default AuthPage;

