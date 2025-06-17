import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../css/LoginPage.css';
import thrillBg from '../assets/thrill-bg.jpg'; // Import the thrill-bg image

const backendUrl = "https://kashani-backend.onrender.com";

const LoginPage = () => {
  const [username, setUsername] = useState(() => {
    console.log('LoginPage: Checking for registered username...');
    const registeredUsername = localStorage.getItem('registeredUsername');
    console.log('LoginPage: Registered username from storage:', registeredUsername);
    
    if (registeredUsername) {
      console.log('LoginPage: Found registered username, clearing storage');
      localStorage.removeItem('registeredUsername');
      return registeredUsername;
    }
    
    const saved = localStorage.getItem('rememberMe');
    const rememberedUsername = saved === 'true' ? localStorage.getItem('username') || '' : '';
    console.log('LoginPage: Using remembered username:', rememberedUsername);
    return rememberedUsername;
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('rememberMe');
    return saved === 'true';
  });
  const { login } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Add new state for animation
  const [showContent, setShowContent] = useState(false);

  // Log when component mounts
  useEffect(() => {
    console.log('LoginPage: Component mounted, current username:', username);
    // Trigger entrance animation
    setShowContent(true);
  }, [username]); // Added username to dependencies

  // Validate form on input change
  useEffect(() => {
    setIsFormValid(username.trim() !== '' && password.trim() !== '');
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);

    if (!isFormValid) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      console.log('LoginPage: Attempting login with username:', username);
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('LoginPage: Login response:', data);

      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem('username', username);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('username');
          localStorage.setItem('rememberMe', 'false');
        }

        login(data.user, data.token);
        toast.success('Login successful! Redirecting...');
        // Use replace to prevent going back to login page
        navigate('/', { replace: true });
      } else {
        console.error('LoginPage: Login failed:', data.message);
        toast.error(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('LoginPage: Login API error:', err);
      toast.error('An error occurred during login. Please try again.');
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
    <TransitionGroup>
      <CSSTransition
        in={showContent}
        timeout={300}
        classNames="page-transition"
        unmountOnExit
      >
        <div className="login-page-container" role="main" style={{ backgroundImage: `url(${thrillBg})` }}>
          <button 
            className="theme-toggle animate-scale" 
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
          
          <div className="login-form-container">
            <h2 className="animate-slide-down">Welcome Back</h2>
            <form onSubmit={handleSubmit} noValidate className="animate-fade-in">
              <div className="form-group animate-slide-up">
                <label htmlFor="username">Username</label>
                <div className="input-with-validation">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!username && isFormValid}
                    className="animate-fade-in"
                  />
                </div>
              </div>

              <div className="form-group animate-slide-up">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!password && isFormValid}
                    className="animate-fade-in"
                  />
                  <button
                    type="button"
                    className="password-toggle animate-scale"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
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
                <Link to="/forgot-password" className="forgot-password" tabIndex={loading ? -1 : 0}>
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="login-button animate-slide-up" 
                disabled={loading || !isFormValid}
                aria-busy={loading}
              >
                {loading ? <LoadingSpinner /> : 'Sign In'}
              </button>
            </form>

            <div className="social-login">
              <p className="animate-fade-in">Or continue with</p>
              <div className="social-buttons">
                <button
                  type="button"
                  className="social-button google animate-scale"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={loading}
                  aria-label="Sign in with Google"
                >
                  <FaGoogle />
                </button>
                <button
                  type="button"
                  className="social-button facebook animate-scale"
                  onClick={() => handleSocialLogin('Facebook')}
                  disabled={loading}
                  aria-label="Sign in with Facebook"
                >
                  <FaFacebook />
                </button>
                <button
                  type="button"
                  className="social-button github animate-scale"
                  onClick={() => handleSocialLogin('GitHub')}
                  disabled={loading}
                  aria-label="Sign in with GitHub"
                >
                  <FaGithub />
                </button>
              </div>
            </div>

            <p className="register-link animate-fade-in">
              Don't have an account? <Link to="/register" tabIndex={loading ? -1 : 0}>Create one here</Link>
            </p>
          </div>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default LoginPage;