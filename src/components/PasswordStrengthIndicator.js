import React from 'react';
import '../css/PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0: return '#ff4444';
      case 1: return '#ffbb33';
      case 2: return '#ffeb3b';
      case 3: return '#00C851';
      case 4: return '#007E33';
      case 5: return '#2E7D32';
      default: return '#e0e0e0';
    }
  };

  const strength = calculateStrength(password);
  const strengthText = getStrengthText(strength);
  const strengthColor = getStrengthColor(strength);

  return (
    <div className="password-strength" role="status" aria-live="polite">
      <div className="strength-bars">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`strength-bar ${index < strength ? 'filled' : ''}`}
            style={{
              backgroundColor: index < strength ? strengthColor : 'var(--input-border)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
      {password && (
        <span 
          className="strength-text"
          style={{ color: strengthColor }}
        >
          {strengthText}
        </span>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator; 