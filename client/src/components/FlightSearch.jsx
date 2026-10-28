import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/flights';

function formatTime(value) {
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function statusClass(status) {
  return status.toLowerCase().replace(' ', '-');
}

async function fetchFlights(query) {
  const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Server error');
  }
  const data = await response.json();
  return data.flights;
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="plane-icon" aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

// initialQuery: null = do not search yet, '' = show all flights, text = search for it.
function FlightSearch({ initialQuery = null }) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(initialQuery !== null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery === null) return;
    let cancelled = false;

    fetchFlights(initialQuery)
      .then((list) => {
        if (!cancelled) {
          setFlights(list);
          setSearched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not reach the server. Please check that the backend is running.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialQuery]);

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      setFlights(await fetchFlights(query.trim()));
      setSearched(true);
    } catch {
      setError('Could not reach the server. Please check that the backend is running.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g. SK101, Mumbai, Skyline Air"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={50}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="message">Searching...</p>}
      {error && <p className="message error">{error}</p>}
      {!loading && !error && !searched && (
        <p className="message">Type a flight number, airline or city, or leave the box empty and press Search to see all flights.</p>
      )}
      {!loading && !error && searched && flights.length === 0 && (
        <p className="message">No flights found. Try a different search.</p>
      )}

      {flights.map((flight) => (
        <article className="flight-card" key={flight.id}>
          <div className="flight-main">
            <div>
              <div className="flight-number">{flight.flight_number}</div>
              <div className="airline">{flight.airline}</div>
            </div>

            <div className="route">
              <div className="stop">
                <div className="code">{flight.origin_code}</div>
                <div className="city">{flight.origin_city}</div>
                <div className="time">{formatTime(flight.departure_time)}</div>
              </div>
              <div className="route-track">
                <PlaneIcon />
              </div>
              <div className="stop stop-end">
                <div className="code">{flight.destination_code}</div>
                <div className="city">{flight.destination_city}</div>
                <div className="time">{formatTime(flight.arrival_time)}</div>
              </div>
            </div>

            <div className="flight-side">
              <div className="gate-sign">
                <span>Gate</span>
                <strong>{flight.gate}</strong>
              </div>
              <span className={`badge ${statusClass(flight.status)}`}>{flight.status}</span>
            </div>
          </div>

          <div className="details">
            <div><span>Terminal: </span>{flight.terminal}</div>
            <div><span>Check-in: </span>{flight.checkin_counters || '-'}</div>
            <div><span>Boarding: </span>{formatTime(flight.boarding_time)}</div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default FlightSearch;