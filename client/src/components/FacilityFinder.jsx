import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/facilities';

const CATEGORIES = [
  'All', 'Gate', 'Washroom', 'Restaurant', 'Drinking Water', 'Medical',
  'Information Desk', 'Lounge', 'Shop', 'Baggage', 'Security', 'Entrance',
];

const TERMINALS = ['All', 'Terminal 1', 'Terminal 2', 'Terminal 3'];

function FacilityFinder({ initialCategory = 'All' }) {
  const [category, setCategory] = useState(initialCategory);
  const [terminal, setTerminal] = useState('All');
  const [q, setQ] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (terminal !== 'All') params.set('terminal', terminal);
    if (q.trim()) params.set('q', q.trim());

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Server error');
        }
        const data = await response.json();
        if (!cancelled) {
          setFacilities(data.facilities);
          setError('');
        }
      } catch {
        if (!cancelled) {
          setError('Could not reach the server. Please check that the backend is running.');
          setFacilities([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, terminal, q]);

  return (
    <div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search facilities, e.g. water, food, Gate 24"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={50}
        />
        <select value={terminal} onChange={(e) => setTerminal(e.target.value)}>
          {TERMINALS.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All terminals' : t}
            </option>
          ))}
        </select>
      </div>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="message">Loading facilities...</p>}
      {error && <p className="message error">{error}</p>}
      {!loading && !error && facilities.length === 0 && (
        <p className="message">No facilities found. Try a different filter.</p>
      )}

      {!loading && !error && facilities.length > 0 && (
        <p className="result-count">{facilities.length} facilities found</p>
      )}

      <div className="facility-grid">
        {facilities.map((f) => (
          <div className="facility-card" key={f.id}>
            <div className="facility-name">{f.name}</div>
            <span className="tag">{f.category}</span>
            <div className="facility-location">{f.terminal} · {f.floor}</div>
            <div className="facility-desc">{f.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FacilityFinder;