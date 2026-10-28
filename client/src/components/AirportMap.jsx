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

const WALKWAY_Y = 50;
const METERS_PER_UNIT = 3;
const WALK_METERS_PER_MIN = 75;

function buildRoute(a, b) {
  const rawPoints = [
    [a.x, a.y],
    [a.x, WALKWAY_Y],
    [b.x, WALKWAY_Y],
    [b.x, b.y],
  ];

  const points = rawPoints.filter(
    (p, i) => i === 0 || p[0] !== rawPoints[i - 1][0] || p[1] !== rawPoints[i - 1][1]
  );

  let units = 0;
  for (let i = 1; i < points.length; i++) {
    units += Math.abs(points[i][0] - points[i - 1][0]) + Math.abs(points[i][1] - points[i - 1][1]);
  }

  const meters = Math.round(units * METERS_PER_UNIT);
  const minutes = Math.max(1, Math.round(meters / WALK_METERS_PER_MIN));

  return { points, meters, minutes };
}

function AirportMap() {
  const [terminal, setTerminal] = useState('Terminal 3');
  const [floor, setFloor] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
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
          setFromId('');
          setToId('');
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

  const fromFacility = visible.find((f) => String(f.id) === fromId) || null;
  const toFacility = visible.find((f) => String(f.id) === toId) || null;
  const sameSpot = fromFacility && toFacility && fromFacility.id === toFacility.id;
  const route = fromFacility && toFacility && !sameSpot ? buildRoute(fromFacility, toFacility) : null;

  function clearRoute() {
    setFromId('');
    setToId('');
  }

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
                clearRoute();
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
        <div className="nav-panel">
          <div className="nav-row">
            <label>
              From
              <select value={fromId} onChange={(e) => setFromId(e.target.value)}>
                <option value="">Choose start point</option>
                {visible.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </label>
            <label>
              To
              <select value={toId} onChange={(e) => setToId(e.target.value)}>
                <option value="">Choose destination</option>
                {visible.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </label>
            <button type="button" className="clear-btn" onClick={clearRoute}>
              Clear
            </button>
          </div>

          {sameSpot && <p className="message">Please choose two different places.</p>}

          {route && (
            <div className="route-summary">
              <div className="route-stats">
                <strong>{route.minutes} min</strong> · about {route.meters} m
                <span className="route-note"> (estimate)</span>
              </div>
              <ol className="route-steps">
                <li>Start at <strong>{fromFacility.name}</strong>.</li>
                <li>Walk to the main walkway through the concourse.</li>
                <li>Follow the walkway towards <strong>{toFacility.name}</strong>.</li>
                <li>Arrive at <strong>{toFacility.name}</strong>.</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="map-wrapper">
          <svg viewBox="0 0 100 100" className="map-svg" role="img" aria-label="Terminal map">
            <rect x="3" y="3" width="94" height="94" rx="3" className="map-building" />
            <rect x="12" y="30" width="76" height="40" rx="2" className="map-concourse" />
            <rect x="12" y="76" width="30" height="16" rx="2" className="map-concourse" />
            <text x="50" y="68" textAnchor="middle" className="map-label">
              Main concourse
            </text>

            {route && (
              <polyline
                points={route.points.map((p) => p.join(',')).join(' ')}
                className="route-line"
              />
            )}

            {visible.map((f) => {
              const isSelected = selected && selected.id === f.id;
              const isStart = fromFacility && fromFacility.id === f.id;
              const isEnd = toFacility && toFacility.id === f.id;
              let dotClass = 'marker-dot';
              if (isStart) dotClass += ' start';
              else if (isEnd) dotClass += ' end';
              else if (isSelected) dotClass += ' selected';

              return (
                <g
                  key={f.id}
                  className="map-marker"
                  onClick={() => setSelected(f)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{f.name}</title>
                  <circle cx={f.x} cy={f.y} r={isSelected || isStart || isEnd ? 3.6 : 2.8} className={dotClass} />
                  <text x={f.x} y={f.y + 1.2} textAnchor="middle" className="marker-icon">
                    {ICONS[f.category] || '📍'}
                  </text>
                </g>
              );
            })}

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
              <div className="info-actions">
                <button type="button" className="small-btn" onClick={() => setFromId(String(selected.id))}>
                  Set as start
                </button>
                <button type="button" className="small-btn" onClick={() => setToId(String(selected.id))}>
                  Set as destination
                </button>
              </div>
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