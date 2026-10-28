import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:5000/api/flights';
const STATUSES = ['On Time', 'Boarding', 'Delayed', 'Cancelled'];
const TERMINALS = ['Terminal 1', 'Terminal 2', 'Terminal 3'];

const TEXT_FIELDS = [
  { name: 'flight_number', label: 'Flight number', max: 10 },
  { name: 'airline', label: 'Airline', max: 60 },
  { name: 'origin_code', label: 'From (3-letter code)', max: 3 },
  { name: 'origin_city', label: 'From (city)', max: 60 },
  { name: 'destination_code', label: 'To (3-letter code)', max: 3 },
  { name: 'destination_city', label: 'To (city)', max: 60 },
  { name: 'gate', label: 'Gate', max: 10 },
  { name: 'checkin_counters', label: 'Check-in counters (optional)', max: 30, optional: true },
];

const TIME_FIELDS = [
  { name: 'departure_time', label: 'Departure' },
  { name: 'arrival_time', label: 'Arrival' },
  { name: 'boarding_time', label: 'Boarding' },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

// Turns a stored time into the format the date-time input needs.
function toInputValue(value) {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function emptyForm() {
  const t = new Date();
  const day = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  return {
    flight_number: '',
    airline: '',
    origin_code: 'DEL',
    origin_city: 'New Delhi',
    destination_code: '',
    destination_city: '',
    departure_time: `${day}T12:00`,
    arrival_time: `${day}T14:00`,
    boarding_time: `${day}T11:30`,
    terminal: 'Terminal 3',
    gate: '',
    checkin_counters: '',
    status: 'On Time',
  };
}

function formFromFlight(f) {
  return {
    flight_number: f.flight_number,
    airline: f.airline,
    origin_code: f.origin_code,
    origin_city: f.origin_city,
    destination_code: f.destination_code,
    destination_city: f.destination_city,
    departure_time: toInputValue(f.departure_time),
    arrival_time: toInputValue(f.arrival_time),
    boarding_time: toInputValue(f.boarding_time),
    terminal: f.terminal,
    gate: f.gate,
    checkin_counters: f.checkin_counters || '',
    status: f.status,
  };
}

function AdminFlights({ token, onAuthError }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const loadFlights = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Server error');
      }
      const data = await response.json();
      setFlights(data.flights);
      setLoadError('');
    } catch {
      setLoadError('Could not load flights. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  function openAdd() {
    setForm(emptyForm());
    setEditingId(null);
    setFormError('');
    setNotice('');
  }

  function openEdit(flight) {
    setForm(formFromFlight(flight));
    setEditingId(flight.id);
    setFormError('');
    setNotice('');
  }

  function closeForm() {
    setForm(null);
    setEditingId(null);
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    const editing = editingId !== null;

    try {
      const response = await fetch(editing ? `${API_URL}/${editingId}` : API_URL, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.status === 401) {
        onAuthError();
        return;
      }
      if (!response.ok) {
        setFormError(data.message || 'Could not save the flight');
        return;
      }

      setNotice(editing ? 'Flight updated.' : 'Flight added.');
      closeForm();
      await loadFlights();
    } catch {
      setFormError('Could not reach the server. Please check that the backend is running.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(flight) {
    if (!window.confirm(`Delete flight ${flight.flight_number}? This cannot be undone.`)) {
      return;
    }
    setNotice('');

    try {
      const response = await fetch(`${API_URL}/${flight.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        onAuthError();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        setNotice(data.message || 'Could not delete the flight');
        return;
      }

      setNotice(`Flight ${flight.flight_number} deleted.`);
      await loadFlights();
    } catch {
      setNotice('Could not reach the server. Please check that the backend is running.');
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h3>Flights ({flights.length})</h3>
        <button type="button" className="small-btn" onClick={openAdd}>
          + Add flight
        </button>
      </div>

      {notice && <p className="notice">{notice}</p>}

      {form && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId !== null ? 'Edit flight' : 'Add flight'}</h3>

          <div className="form-grid">
            {TEXT_FIELDS.map((f) => (
              <label key={f.name}>
                {f.label}
                <input
                  type="text"
                  value={form[f.name]}
                  onChange={set(f.name)}
                  maxLength={f.max}
                  required={!f.optional}
                />
              </label>
            ))}

            {TIME_FIELDS.map((f) => (
              <label key={f.name}>
                {f.label}
                <input type="datetime-local" value={form[f.name]} onChange={set(f.name)} required />
              </label>
            ))}

            <label>
              Terminal
              <select value={form.terminal} onChange={set('terminal')}>
                {TERMINALS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {formError && <p className="message error">{formError}</p>}

          <div className="info-actions">
            <button type="submit" className="small-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="clear-btn" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p className="message">Loading flights...</p>}
      {loadError && <p className="message error">{loadError}</p>}

      {!loading && !loadError && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Route</th>
                <th>Departs</th>
                <th>Terminal / Gate</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id}>
                  <td>
                    <strong>{f.flight_number}</strong>
                    <div className="airline">{f.airline}</div>
                  </td>
                  <td>{f.origin_code} → {f.destination_code}</td>
                  <td>{formatDateTime(f.departure_time)}</td>
                  <td>{f.terminal} / {f.gate}</td>
                  <td>{f.status}</td>
                  <td className="row-actions">
                    <button type="button" className="link-btn" onClick={() => openEdit(f)}>Edit</button>
                    <button type="button" className="link-btn danger" onClick={() => handleDelete(f)}>Delete</button>
                  </td>
                </tr>
              ))}
              {flights.length === 0 && (
                <tr>
                  <td colSpan="6" className="message">No flights yet. Click "Add flight".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminFlights;