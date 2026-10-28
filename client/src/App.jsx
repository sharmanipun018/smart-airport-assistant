import { useState } from 'react';
import './App.css';
import FlightSearch from './components/FlightSearch';
import FacilityFinder from './components/FacilityFinder';
import AirportMap from './components/AirportMap';
import Chatbot from './components/Chatbot';
import Admin from './components/Admin';

const TABS = [
  { id: 'flights', label: 'Flights' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'map', label: 'Map' },
  { id: 'chat', label: 'Assistant' },
];

function App() {
  const [view, setView] = useState('public');
  const [tab, setTab] = useState('flights');

  return (
    <div>
      <header className="header">
        <h1>Smart Airport Passenger Assistance</h1>
        <p>Find flights, facilities and your way around the terminal</p>
      </header>

      <main className="container">
        {view === 'admin' ? (
          <Admin onExit={() => setView('public')} />
        ) : (
          <>
            <div className="tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'flights' && <FlightSearch />}
            {tab === 'facilities' && <FacilityFinder />}
            {tab === 'map' && <AirportMap />}
            {tab === 'chat' && <Chatbot />}
          </>
        )}
      </main>

      <footer className="footer">
        Proposed prototype with fictional sample data. Not an official AAI system.
        {view === 'public' && (
          <div>
            <button type="button" className="link-btn" onClick={() => setView('admin')}>
              Admin login
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;