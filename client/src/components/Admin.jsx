import { useState, useEffect } from 'react';
import AdminFlights from './AdminFlights';
import AdminFacilities from './AdminFacilities';

const API_URL = 'http://localhost:5000/api/auth';
const TOKEN_KEY = 'adminToken';

function Admin({ onExit }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [adminName, setAdminName] = useState('');
  const [checking, setChecking] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState('flights');

  // If a token is saved, ask the server whether it is still valid.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) {
          setAdminName(data.username);
          setChecking(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken('');
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setAdminName(data.username);
      setToken(data.token);
      setPassword('');
    } catch {
      setError('Could not reach the server. Please check that the backend is running.');
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setAdminName('');
    setUsername('');
    setPassword('');
  }

  if (checking) {
    return <p className="message">Checking your session...</p>;
  }

  if (!token) {
    return (
      <div className="login-card">
        <h2>Admin login</h2>
        <form onSubmit={handleLogin}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={100}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="message error">{error}</p>}
          <button type="submit" className="small-btn" disabled={busy || !username || !password}>
            {busy ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <button type="button" className="link-btn" onClick={onExit}>
          ← Back to passenger site
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-top">
        <div>
          <h2>Admin dashboard</h2>
          <p className="message" style={{ padding: 0, textAlign: 'left' }}>
            Logged in as <strong>{adminName}</strong>
          </p>
        </div>
        <button type="button" className="clear-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
            <div className="tabs">
        <button
          className={`tab ${section === 'flights' ? 'active' : ''}`}
          onClick={() => setSection('flights')}
        >
          Flights
        </button>
        <button
          className={`tab ${section === 'facilities' ? 'active' : ''}`}
          onClick={() => setSection('facilities')}
        >
          Facilities
        </button>
      </div>

      {section === 'flights' && <AdminFlights token={token} onAuthError={handleLogout} />}
      {section === 'facilities' && <AdminFacilities token={token} onAuthError={handleLogout} />}

      <button type="button" className="link-btn" onClick={onExit}>
        ← Back to passenger site
      </button>
    </div>
  );
}

export default Admin;