import React, { useState } from 'react';
import { authAPI } from '../../api';
import { useAuth } from '../../auth/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authAPI.updateProfile({ email });
      setMessage('Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setMessage('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Change failed');
    }
  };

  return (
    <div className="page-content fade-in-up">
      <h1>Profile</h1>
      {message && <div className="auth-error" style={{ background: 'rgba(38,222,129,0.15)', color: 'var(--state-approved)' }}>{message}</div>}
      {error && <div className="auth-error">{error}</div>}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Update Email</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Update Profile</button>
        </form>
      </div>
      <div className="card">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="label">Current Password</label>
            <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">New Password (min 6)</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary">Change Password</button>
        </form>
      </div>
    </div>
  );
}
