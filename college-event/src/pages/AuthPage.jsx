import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, setToken } from '../slices/authSlice';
import { selectAuthError, selectAuthStatus } from '../slices/authSlice';
import { fetchColleges } from '../slices/collegesSlice';
import { selectColleges } from '../slices/collegesSlice';

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

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <>
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {validationErrors.name && (
                <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.name}</div>
              )}
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="STUDENT">Student</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="collegeId">College *</label>
              <select
                id="collegeId"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select a college</option>
                {colleges && colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
              {validationErrors.collegeId && (
                <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.collegeId}</div>
              )}
            </div>
          </>
        )}

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.email && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.email}</div>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {validationErrors.password && (
            <div style={{ color: 'red', fontSize: '12px' }}>{validationErrors.password}</div>
          )}
        </div>

        {authError && (
          <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {typeof authError === 'string' ? authError : authError.error || 'Authentication failed'}
          </div>
        )}

        <button
          type="submit"
          disabled={loggingIn || registering}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loggingIn || registering ? 'not-allowed' : 'pointer',
          }}
        >
          {loggingIn || registering ? 'Processing...' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setValidationErrors({});
            setFormData({ email: '', password: '', name: '', role: 'STUDENT', collegeId: '' });
          }}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;

