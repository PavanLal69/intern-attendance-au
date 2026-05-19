import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const { loginAdmin } = useApp();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Name is required.');
    if (!password) return setError('Password is required.');

    setLoading(true);
    const result = await loginAdmin(name, password);
    if (!result.success) {
      setError(result.message);
      setPassword('');
    }
    setLoading(false);
  }

  return (
    <div className="admin-login-page">
      {/* Left decorative panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand-icon">
            <ShieldCheck size={40} />
          </div>
          <h1 className="login-brand-title">AttendTrack</h1>
          <p className="login-brand-sub">Intern Attendance Monitoring System</p>

          <div className="login-features">
            <div className="login-feature-item">
              <div className="feature-dot" />
              <span>Generate daily QR codes for attendance</span>
            </div>
            <div className="login-feature-item">
              <div className="feature-dot" />
              <span>Manage intern profiles and notes</span>
            </div>
            <div className="login-feature-item">
              <div className="feature-dot" />
              <span>View analytics and attendance reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-icon">
              <LogIn size={24} />
            </div>
            <h2 className="login-card-title">
              Admin Login
            </h2>
            <p className="login-card-sub">
              Sign in to access the admin panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Name */}
            <div className="login-field">
              <label htmlFor="name">Admin Name</label>
              <div className="login-input-wrap">
                <User size={16} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={'Enter password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete={'current-password'}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={`login-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <><LogIn size={17} /> Sign In</>
              )}
            </button>
          </form>

          <p className="login-footer-note">
            Only Bharat can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
}
