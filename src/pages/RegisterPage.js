import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub, FaCheck, FaTimes } from 'react-icons/fa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import '../css/LoginPage.css';
import '../css/RegisterPage.css';
import thrillBg from '../assets/thrill-bg.jpg';

const backendUrl = "https://kashani-backend.onrender.com";

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useContext(AuthContext);
  const { isDarkMode /* Removed toggleTheme */ } = useTheme();
  const navigate = useNavigate();

  // Add new state for animation
  const [showContent, setShowContent] = useState(false);

  // Log when component mounts and trigger animation
  useEffect(() => {
    setShowContent(true);
  }, []);

  // Validation rules
  const validationRules = useMemo(() => ({
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
  }), []); // Empty dependency array since these rules are static

  // Wrap validateField in useCallback
  const validateField = useCallback((name, value) => {
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
  }, [touched, validationRules]);

  useEffect(() => {
    const newErrors = {};
    newErrors.username = validateField('username', username);
    newErrors.email = validateField('email', email);
    newErrors.password = validateField('password', password);

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    } else {
      newErrors.confirmPassword = '';
    }
    
    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    } else {
      newErrors.acceptTerms = '';
    }

    setErrors(newErrors);

    const isValid = Object.values(newErrors).every(error => error === '') &&
                    username.trim() !== '' && 
                    email.trim() !== '' &&
                    password.trim() !== '' && 
                    confirmPassword.trim() !== '' &&
                    acceptTerms;
    setIsFormValid(isValid);
  }, [username, email, password, confirmPassword, acceptTerms, touched, validateField]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'username') setUsername(value);
    else if (id === 'email') setEmail(value);
    else if (id === 'password') setPassword(value);
    else if (id === 'confirmPassword') setConfirmPassword(value);

    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    setTouched(prev => ({ ...prev, [id]: true }));
    // Validate immediately on blur if there's an error
    if (errors[id]) {
      const newErrors = { ...errors };
      if (id === 'username') newErrors.username = validateField('username', value);
      if (id === 'email') newErrors.email = validateField('email', value);
      if (id === 'password') newErrors.password = validateField('password', value);
      if (id === 'confirmPassword') newErrors.confirmPassword = value !== password ? 'Passwords do not match' : '';
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions

    setLoading(true);
    setTouched({ username: true, email: true, password: true, confirmPassword: true, acceptTerms: true });

    if (!isFormValid) {
      toast.error('Please fill in all fields correctly and accept terms.');
      setLoading(false);
      return;
    }

    try {
      console.log('RegisterPage: Attempting registration with username:', username, 'email:', email);

      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      console.log('RegisterPage: Registration response:', data);

      if (response.ok) {
        toast.success('Registration successful! Attempting to log in...');

        // Attempt to auto-login after successful registration
        try {
          const loginResponse = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            if (rememberMe) {
              localStorage.setItem('username', username);
              localStorage.setItem('rememberMe', 'true');
            } else {
              localStorage.removeItem('username');
              localStorage.setItem('rememberMe', 'false');
            }
            login(loginData.user, loginData.token);
            toast.success('Auto-login successful! Redirecting...');
            navigate('/', { replace: true }); // Redirect to home page
          } else {
            console.error('RegisterPage: Auto-login failed:', loginData.message);
            toast.warn('Registration successful, but auto-login failed. Please sign in.');
            // Store username for pre-filling login page
            localStorage.setItem('registeredUsername', username);
            navigate('/login'); // Redirect to login page
          }
        } catch (autoLoginErr) {
          console.error('RegisterPage: Auto-login API error:', autoLoginErr);
          toast.warn('Registration successful, but an error occurred during auto-login. Please sign in.');
          localStorage.setItem('registeredUsername', username);
          navigate('/login'); // Redirect to login page
        }
      } else {
        console.error('RegisterPage: Registration failed:', data.message);
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('RegisterPage: Registration API error:', err);
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
        sessionStorage.setItem('returnTo', '/'); // Store current page to return after social login
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
    <TransitionGroup>
      <CSSTransition
        in={showContent}
        timeout={300}
        classNames="page-transition"
        unmountOnExit
      >
        <div className="register-page-container" role="main" style={{ backgroundImage: `url(${thrillBg})` }}>
          {/* Theme toggle removed from here as per image design */}
          {/* <button 
            className="theme-toggle animate-scale" 
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            disabled={loading}
          >
            {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
          </button> */}
          {/* Hero section content also removed from here */}
          {/* <div className="hero-section" style={{ backgroundImage: `url(${goldPattern})` }}>
            <h2 className="animate-slide-down">Do you want to own and store gold in Switzerland?</h2>
            <p className="animate-fade-in">
              TaurusGold is the most cost effective way to buy, sell hold and transfer
              gold internationally. Find out how it works now.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="hero-button primary animate-scale" tabIndex={loading ? -1 : 0}>
                Create Account
              </Link>
              <Link to="/login" className="hero-button secondary animate-scale" tabIndex={loading ? -1 : 0}>
                Login
              </Link>
            </div>
          </div> */}

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

          <div className="register-form-container">
            <h2 className="animate-slide-down">Create Account</h2>
            <form onSubmit={handleSubmit} noValidate className="animate-fade-in">
              <div className="form-group animate-slide-up">
                <label htmlFor="username">Username</label>
                <div className="input-with-validation">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Choose a username"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.username}
                  />
                  {errors.username && touched.username && <span className="error-message">{errors.username}</span>}
                  {touched.username && !errors.username && username.length > 0 && <span className="success-icon"><FaCheck /></span>}
                  {touched.username && errors.username && <span className="error-icon"><FaTimes /></span>}
                </div>
              </div>

              <div className="form-group animate-slide-up">
                <label htmlFor="email">Email</label>
                <div className="input-with-validation">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && touched.email && <span className="error-message">{errors.email}</span>}
                  {touched.email && !errors.email && email.length > 0 && <span className="success-icon"><FaCheck /></span>}
                  {touched.email && errors.email && <span className="error-icon"><FaTimes /></span>}
                </div>
              </div>

              <div className="form-group animate-slide-up">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a password"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.password}
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
                {touched.password && <PasswordStrengthIndicator password={password} />}
              </div>

              <div className="form-group animate-slide-up">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-validation">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                {touched.confirmPassword && !errors.confirmPassword && confirmPassword.length > 0 && <span className="success-icon"><FaCheck /></span>}
                {touched.confirmPassword && errors.confirmPassword && <span className="error-icon"><FaTimes /></span>}
              </div>

              <div className="form-group terms-group animate-slide-up">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.acceptTerms}
                  />
                  <span>
                    I accept the <Link to="/terms" className="terms-link" target="_blank" tabIndex={loading ? -1 : 0}>Terms and Conditions</Link>
                  </span>
                </label>
                {errors.acceptTerms && touched.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}
              </div>
              
              <div className="form-options animate-fade-in">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    aria-label="Remember me"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className="register-button animate-slide-up"
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
                  className="social-button google"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={loading}
                  aria-label="Sign up with Google"
                >
                  <FaGoogle />
                </button>
                <button
                  type="button"
                  className="social-button facebook"
                  onClick={() => handleSocialLogin('Facebook')}
                  disabled={loading}
                  aria-label="Sign up with Facebook"
                >
                  <FaFacebook />
                </button>
                <button
                  type="button"
                  className="social-button github"
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
      </CSSTransition>
    </TransitionGroup>
  );
};

export default RegisterPage;