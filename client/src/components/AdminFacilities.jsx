import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:5000/api/facilities';

const CATEGORIES = [
  'Gate', 'Washroom', 'Restaurant', 'Drinking Water', 'Medical', 'Information Desk',
  'Lounge', 'Shop', 'Baggage', 'Security', 'Entrance',
];
const TERMINALS = ['Terminal 1', 'Terminal 2', 'Terminal 3'];
const FLOORS = ['Level 1', 'Level 2'];

function emptyForm() {
  return {
    name: '',
    category: 'Gate',
    terminal: 'Terminal 3',
    floor: 'Level 2',
    description: '',
    x: '50',
    y: '50',
  };
}

function formFromFacility(f) {
  return {
    name: f.name,
    category: f.category,
    terminal: f.terminal,
    floor: f.floor,
    description: f.description || '',
    x: String(f.x),
    y: String(f.y),
  };
}

function AdminFacilities({ token, onAuthError }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const loadFacilities = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Server error');
      }
      const data = await response.json();
      setFacilities(data.facilities);
      setLoadError('');
    } catch {
      setLoadError('Could not load facilities. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  function openAdd() {
    setForm(emptyForm());
    setEditingId(null);
    setFormError('');
    setNotice('');
  }

  function openEdit(facility) {
    setForm(formFromFacility(facility));
    setEditingId(facility.id);
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
        body: JSON.stringify({ ...form, x: Number(form.x), y: Number(form.y) }),
      });
      const data = await response.json();

      if (response.status === 401) {
        onAuthError();
        return;
      }
      if (!response.ok) {
        setFormError(data.message || 'Could not save the facility');
        return;
      }

      setNotice(editing ? 'Facility updated.' : 'Facility added.');
      closeForm();
      await loadFacilities();
    } catch {
      setFormError('Could not reach the server. Please check that the backend is running.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(facility) {
    if (!window.confirm(`Delete "${facility.name}"? This cannot be undone.`)) {
      return;
    }
    setNotice('');

    try {
      const response = await fetch(`${API_URL}/${facility.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        onAuthError();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        setNotice(data.message || 'Could not delete the facility');
        return;
      }

      setNotice(`"${facility.name}" deleted.`);
      await loadFacilities();
    } catch {
      setNotice('Could not reach the server. Please check that the backend is running.');
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h3>Facilities ({facilities.length})</h3>
        <button type="button" className="small-btn" onClick={openAdd}>
          + Add facility
        </button>
      </div>

      {notice && <p className="notice">{notice}</p>}

      {form && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId !== null ? 'Edit facility' : 'Add facility'}</h3>

          <div className="form-grid">
            <label>
              Name
              <input type="text" value={form.name} onChange={set('name')} maxLength={80} required />
            </label>

            <label>
              Category
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Terminal
              <select value={form.terminal} onChange={set('terminal')}>
                {TERMINALS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Floor
              <select value={form.floor} onChange={set('floor')}>
                {FLOORS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>

            <label>
              Map position x (0 = left, 100 = right)
              <input type="number" min="0" max="100" step="1" value={form.x} onChange={set('x')} required />
            </label>

            <label>
              Map position y (0 = top, 100 = bottom)
              <input type="number" min="0" max="100" step="1" value={form.y} onChange={set('y')} required />
            </label>
          </div>

          <label className="form-wide">
            Description (optional)
            <input type="text" value={form.description} onChange={set('description')} maxLength={200} />
          </label>

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

      {loading && <p className="message">Loading facilities...</p>}
      {loadError && <p className="message error">{loadError}</p>}

      {!loading && !loadError && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Terminal / Floor</th>
                <th>Position (x, y)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong></td>
                  <td>{f.category}</td>
                  <td>{f.terminal} / {f.floor}</td>
                  <td>{f.x}, {f.y}</td>
                  <td className="row-actions">
                    <button type="button" className="link-btn" onClick={() => openEdit(f)}>Edit</button>
                    <button type="button" className="link-btn danger" onClick={() => handleDelete(f)}>Delete</button>
                  </td>
                </tr>
              ))}
              {facilities.length === 0 && (
                <tr>
                  <td colSpan="5" className="message">No facilities yet. Click "Add facility".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminFacilities;