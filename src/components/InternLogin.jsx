import { useState } from 'react';
import { GraduationCap, LogIn, Mail, Lock, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './InternLogin.css';

export default function InternLogin() {
  const { interns, loginIntern, registerIntern } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email is required.');
    if (!password) return setError('Password is required.');
    if (isRegister) {
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
    }
    setLoading(true);
    const result = isRegister
      ? await registerIntern(email, password)
      : await loginIntern(email, password);
    if (!result.success) setError(result.message);
    setLoading(false);
  }

  return (
    <div className="intern-login-page">
      {/* Left panel */}
      <div className="il-left">
        <div className="il-left-content">
          <div className="il-brand-icon">
            <GraduationCap size={38} />
          </div>
          <h1 className="il-brand-title">Intern Portal</h1>
          <p className="il-brand-sub">AttendTrack · Intern Monitoring System</p>
          <div className="il-features">
            <div className="il-feature"><div className="il-dot" /><span>View your attendance record</span></div>
            <div className="il-feature"><div className="il-dot" /><span>Track your attendance analytics</span></div>
            <div className="il-feature"><div className="il-dot" /><span>Manage your assigned tasks</span></div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="il-right">
        <div className="il-card">
          <div className="il-card-header">
            <div className="il-card-icon">{isRegister ? <UserPlus size={22} /> : <LogIn size={22} />}</div>
            <h2>{isRegister ? 'Create Intern Account' : 'Intern Sign In'}</h2>
            <p>
              {isRegister
                ? 'Use the email your admin registered for you.'
                : 'Sign in with your email and password.'}
            </p>
          </div>

          {interns.length === 0 ? (
            <div className="il-no-interns">
              <GraduationCap size={36} color="#d1d5db" />
              <p>No interns have been registered yet.</p>
              <p className="il-no-interns-sub">Ask your admin to add you first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="il-form" noValidate>
              <div className="il-field">
                <label htmlFor="intern-email"><Mail size={14} /> Email</label>
                <input
                  id="intern-email"
                  type="email"
                  placeholder="e.g. you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                />
              </div>

              <div className="il-field">
                <label htmlFor="intern-password"><Lock size={14} /> Password</label>
                <input
                  id="intern-password"
                  type="password"
                  placeholder={isRegister ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>

              {isRegister && (
                <div className="il-field">
                  <label htmlFor="intern-confirm"><Lock size={14} /> Confirm Password</label>
                  <input
                    id="intern-confirm"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && <div className="il-error">{error}</div>}

              <button type="submit" className={`il-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? (
                  <span className="il-spinner" />
                ) : isRegister ? (
                  <><UserPlus size={16} /> Create Account</>
                ) : (
                  <><LogIn size={16} /> Sign In</>
                )}
              </button>

              <button
                type="button"
                className="il-toggle"
                onClick={() => {
                  setIsRegister((prev) => !prev);
                  setError('');
                }}
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </form>
          )}

          <p className="il-footer">Use the email your admin registered for your profile.</p>
        </div>
      </div>
    </div>
  );
}
