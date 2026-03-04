import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';



export default function RegisterPage() {
  const [username, setUsername]               = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: username.trim(),
        phoneNumber: phone.trim(),
        password,
        confirmPassword
      });

      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card">

        <p className="auth-eyebrow">Resume Portfolio</p>
        <h1>Create your account.</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── USERNAME ── */}
          <div className="form-group">
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourusername"
              required
            />
          </div>

          {/* ── PHONE NUMBER ── */}
          <div className="form-group">
            <label className="label" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />
          </div>

          {/* ── PASSWORD ── */}
          <div className="form-group">
            <label className="label" htmlFor="password">
              Password <span style={styles.minNote}>(min 6 characters)</span>
            </label>
            <div style={styles.passWrapper}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                required
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* ── CONFIRM PASSWORD ── */}
          <div className="form-group">
            <label className="label" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div style={styles.passWrapper}>
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                required
                style={{
                  paddingRight: 48,
                  borderColor: confirmPassword && confirmPassword !== password
                    ? 'rgba(139,42,42,0.4)'
                    : undefined,
                }}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {/* Live mismatch hint */}
            {confirmPassword && confirmPassword !== password && (
              <p style={styles.mismatch}>Passwords don't match yet.</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

      </div>
    </div>
  );
}

const styles = {
  fieldHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#8A8578',
    letterSpacing: '0.3px',
  },
  minNote: {
    fontSize: 10,
    fontWeight: 400,
    letterSpacing: '0.5px',
    color: '#B5AFA5',
    textTransform: 'none',
  },
  passWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: 14,
    cursor: 'pointer',
    lineHeight: 1,
    color: '#8A8578',
  },
  mismatch: {
    marginTop: 5,
    fontSize: 11,
    color: '#8B2A2A',
  },
};
