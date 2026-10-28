import { useState } from 'react';
import './App.css';
import FlightSearch from './components/FlightSearch';
import FacilityFinder from './components/FacilityFinder';

function App() {
  const [tab, setTab] = useState('flights');

  return (
    <div>
      <header className="header">
        <h1>Smart Airport Passenger Assistance</h1>
        <p>Find flights and airport facilities</p>
      </header>

      <main className="container">
        <div className="tabs">
          <button
            className={`tab ${tab === 'flights' ? 'active' : ''}`}
            onClick={() => setTab('flights')}
          >
            Flights
          </button>
          <button
            className={`tab ${tab === 'facilities' ? 'active' : ''}`}
            onClick={() => setTab('facilities')}
          >
            Facilities
          </button>
        </div>

        {tab === 'flights' ? <FlightSearch /> : <FacilityFinder />}
      </main>

      <footer className="footer">
        Proposed prototype with fictional sample data. Not an official AAI system.
      </footer>
    </div>
  );
}

export default App;