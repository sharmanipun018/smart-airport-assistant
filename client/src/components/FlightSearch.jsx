import { useState } from 'react';

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

function FlightSearch() {
  const [query, setQuery] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}?q=${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        throw new Error('Server error');
      }
      const data = await response.json();
      setFlights(data.flights);
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
        <p className="message">Type something and press Search, or leave it empty to see all flights.</p>
      )}
      {!loading && !error && searched && flights.length === 0 && (
        <p className="message">No flights found. Try a different search.</p>
      )}

      {flights.map((flight) => (
        <div className="flight-card" key={flight.id}>
          <div className="flight-top">
            <div>
              <div className="flight-number">{flight.flight_number}</div>
              <div className="airline">{flight.airline}</div>
            </div>
            <span className={`badge ${statusClass(flight.status)}`}>{flight.status}</span>
          </div>

          <div className="route">
            <div>
              <div className="code">{flight.origin_code}</div>
              <div className="city">{flight.origin_city}</div>
              <div className="time">{formatTime(flight.departure_time)}</div>
            </div>
            <div className="arrow">→</div>
            <div style={{ textAlign: 'right' }}>
              <div className="code">{flight.destination_code}</div>
              <div className="city">{flight.destination_city}</div>
              <div className="time">{formatTime(flight.arrival_time)}</div>
            </div>
          </div>

          <div className="details">
            <div><span>Terminal: </span>{flight.terminal}</div>
            <div><span>Gate: </span>{flight.gate}</div>
            <div><span>Check-in: </span>{flight.checkin_counters || '-'}</div>
            <div><span>Boarding: </span>{formatTime(flight.boarding_time)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FlightSearch;