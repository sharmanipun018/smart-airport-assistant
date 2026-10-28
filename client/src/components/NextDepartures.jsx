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

function NextDepartures({ onSelect }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(API_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setFlights(data.flights.slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="board">
      <div className="board-head">
        <h2>Departures board</h2>
        <button type="button" className="link-btn" onClick={() => onSelect('')}>
          See all flights
        </button>
      </div>

      {loading && <p className="message">Loading flights...</p>}
      {error && <p className="message">Could not load flights. Please check that the backend is running.</p>}

      {flights.map((f) => (
        <button type="button" key={f.id} className="board-row" onClick={() => onSelect(f.flight_number)}>
          <span className="board-time">{formatTime(f.departure_time)}</span>
          <span className="board-flight">
            <strong>{f.flight_number}</strong>
            <small>{f.airline}</small>
          </span>
          <span className="board-dest">{f.destination_city}</span>
          <span className="gate-sign">
            <span>Gate</span>
            <strong>{f.gate}</strong>
          </span>
          <span className={`badge ${statusClass(f.status)}`}>{f.status}</span>
        </button>
      ))}
    </section>
  );
}

export default NextDepartures;