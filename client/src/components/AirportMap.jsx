import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/facilities';

const TERMINALS = ['Terminal 1', 'Terminal 2', 'Terminal 3'];

const ICONS = {
  Gate: '✈️',
  Washroom: '🚻',
  Restaurant: '🍴',
  'Drinking Water': '💧',
  Medical: '➕',
  'Information Desk': 'ℹ️',
  Lounge: '🛋️',
  Shop: '🛍️',
  Baggage: '🧳',
  Security: '🛡️',
  Entrance: '🚪',
};

function AirportMap() {
  const [terminal, setTerminal] = useState('Terminal 3');
  const [floor, setFloor] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams({ terminal });
        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Server error');
        }
        const data = await response.json();
        if (!cancelled) {
          setFacilities(data.facilities);
          setSelected(null);
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
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [terminal]);

  const floors = [...new Set(facilities.map((f) => f.floor))].sort();
  const activeFloor = floors.includes(floor) ? floor : floors[floors.length - 1];
  const visible = facilities.filter((f) => f.floor === activeFloor);

  return (
    <div>
      <div className="map-controls">
        <div className="chips">
          {TERMINALS.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${terminal === t ? 'active' : ''}`}
              onClick={() => {
                setTerminal(t);
                setFloor('');
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="chips">
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip ${activeFloor === f ? 'active' : ''}`}
              onClick={() => {
                setFloor(f);
                setSelected(null);
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="message">Loading map...</p>}
      {error && <p className="message error">{error}</p>}

      {!loading && !error && (
        <div className="map-wrapper">
          <svg viewBox="0 0 100 100" className="map-svg" role="img" aria-label="Terminal map">
            <rect x="3" y="3" width="94" height="94" rx="3" className="map-building" />
            <rect x="12" y="30" width="76" height="40" rx="2" className="map-concourse" />
            <rect x="12" y="76" width="30" height="16" rx="2" className="map-concourse" />
            <text x="50" y="68" textAnchor="middle" className="map-label">
              Main concourse
            </text>

            {visible.map((f) => (
              <g
                key={f.id}
                className="map-marker"
                onClick={() => setSelected(f)}
                style={{ cursor: 'pointer' }}
              >
                <title>{f.name}</title>
                <circle
                  cx={f.x}
                  cy={f.y}
                  r={selected && selected.id === f.id ? 3.6 : 2.8}
                  className={selected && selected.id === f.id ? 'marker-dot selected' : 'marker-dot'}
                />
                <text x={f.x} y={f.y + 1.2} textAnchor="middle" className="marker-icon">
                  {ICONS[f.category] || '📍'}
                </text>
              </g>
            ))}

            {selected && selected.floor === activeFloor && (
              <text x={selected.x} y={selected.y - 5} textAnchor="middle" className="marker-name">
                {selected.name}
              </text>
            )}
          </svg>
        </div>
      )}

      {!loading && !error && (
        <div className="map-info">
          {selected ? (
            <>
              <div className="facility-name">{selected.name}</div>
              <span className="tag">{selected.category}</span>
              <div className="facility-location">
                {selected.terminal} · {selected.floor}
              </div>
              <div className="facility-desc">{selected.description}</div>
            </>
          ) : (
            <p className="message">Click an icon on the map to see its details.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AirportMap;