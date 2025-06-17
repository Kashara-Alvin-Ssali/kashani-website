import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub, FaCheck, FaTimes } from 'react-icons/fa';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import '../css/LoginPage.css';

const backendUrl = "https://kashani-backend.onrender.com";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { login } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    username: {
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens'
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    if (!touched[name]) return '';
    
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.minLength && value.length < rules.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at most ${rules.maxLength} characters`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }
    return '';
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Validate form on input change
  useEffect(() => {
    const { username, email, password, confirmPassword } = formData;
    const errors = {
      username: validateField('username', username),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: touched.confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''
    };

    setValidationErrors(errors);
    
    setIsFormValid(
      !Object.values(errors).some(error => error !== '') &&
      username.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword &&
      acceptedTerms
    );
  }, [formData, acceptedTerms, touched, validateField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);

    if (!isFormValid) {
      toast.error('Please fill in all fields correctly and accept the terms');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration with:', { username: formData.username, email: formData.email });
      
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        console.log('Registration successful, redirecting to login...');
        // Store username in localStorage for login page
        localStorage.setItem('registeredUsername', formData.username);
        toast.success('Registration successful! Redirecting to login...');
        
        // Force navigation to login page using window.location
        window.location.href = '/login';
      } else {
        console.error('Registration failed:', data.message);
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration API error:', err);
      toast.error('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    if (loading) return; // Prevent multiple clicks
    
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/${provider.toLowerCase()}/auth-url`);
      const data = await response.json();
      
      if (response.ok) {
        // Store current page in sessionStorage to return after social login
        sessionStorage.setItem('returnTo', '/');
        window.location.href = data.url;
      } else {
        toast.error(`Failed to initialize ${provider} login`);
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      toast.error(`An error occurred during ${provider} login`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container" role="main">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        disabled={loading}
      >
        {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
      </button>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
      />
      
      <div className="login-form-container animate-fade-in">
        <h2 className="animate-slide-down">Create Account</h2>
        <form onSubmit={handleSubmit} noValidate className="animate-fade-in">
          <div className="form-group animate-slide-up">
            <label htmlFor="username">Username</label>
            <div className="input-with-validation">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Choose a username"
                required
                disabled={loading}
                aria-required="true"
                aria-invalid={!!validationErrors.username}
                className={validationErrors.username ? 'error' : ''}
              />
              {formData.username && touched.username && (
                <span className="validation-icon">
                  {validationErrors.username ? <FaTimes className="error-icon" /> : <FaCheck className="success-icon" />}
                </span>
              )}
            </div>
            {validationErrors.username && touched.username && (
              <span className="error-message animate-fade-in">{validationErrors.username}</span>
            )}
          </div>

          <div className="form-group animate-slide-up">
            <label htmlFor="email">Email</label>
            <div className="input-with-validation">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                required
                disabled={loading}
                aria-required="true"
                aria-invalid={!!validationErrors.email}
                className={validationErrors.email ? 'error' : ''}
              />
              {formData.email && touched.email && (
                <span className="validation-icon">
                  {validationErrors.email ? <FaTimes className="error-icon" /> : <FaCheck className="success-icon" />}
                </span>
              )}
            </div>
            {validationErrors.email && touched.email && (
              <span className="error-message animate-fade-in">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group animate-slide-up">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a password"
                required
                disabled={loading}
                aria-required="true"
                aria-invalid={!!validationErrors.password}
                className={validationErrors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.password && touched.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
            {validationErrors.password && touched.password && (
              <span className="error-message animate-fade-in">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group animate-slide-up">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                required
                disabled={loading}
                aria-required="true"
                aria-invalid={!!validationErrors.confirmPassword}
                className={validationErrors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.confirmPassword && touched.confirmPassword && (
              <span className="error-message animate-fade-in">{validationErrors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group terms-group animate-slide-up">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={loading}
                aria-required="true"
              />
              <span>
                I accept the{' '}
                <Link to="/terms" className="terms-link" target="_blank" tabIndex={loading ? -1 : 0}>
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="terms-link" target="_blank" tabIndex={loading ? -1 : 0}>
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="login-button animate-slide-up" 
            disabled={loading || !isFormValid}
            aria-busy={loading}
          >
            {loading ? <LoadingSpinner /> : 'Create Account'}
          </button>
        </form>

        <div className="social-login animate-fade-in">
          <p>Or sign up with</p>
          <div className="social-buttons">
            <button
              type="button"
              className="social-button google animate-scale"
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
              aria-label="Sign up with Google"
            >
              <FaGoogle />
            </button>
            <button
              type="button"
              className="social-button facebook animate-scale"
              onClick={() => handleSocialLogin('Facebook')}
              disabled={loading}
              aria-label="Sign up with Facebook"
            >
              <FaFacebook />
            </button>
            <button
              type="button"
              className="social-button github animate-scale"
              onClick={() => handleSocialLogin('GitHub')}
              disabled={loading}
              aria-label="Sign up with GitHub"
            >
              <FaGithub />
            </button>
          </div>
        </div>

        <p className="register-link animate-fade-in">
          Already have an account? <Link to="/login" className="login-link" tabIndex={loading ? -1 : 0}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;