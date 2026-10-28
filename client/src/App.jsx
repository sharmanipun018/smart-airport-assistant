import { useState } from 'react';
import './App.css';
import FlightSearch from './components/FlightSearch';
import FacilityFinder from './components/FacilityFinder';
import AirportMap from './components/AirportMap';
import Chatbot from './components/Chatbot';
import Admin from './components/Admin';
import NextDepartures from './components/NextDepartures';

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'flights', label: 'Flights' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'map', label: 'Airport map' },
  { id: 'chat', label: 'Assistant' },
];

const QUICK = [
  { label: 'Flight info', icon: '✈️', go: 'flights' },
  { label: 'Airport map', icon: '🗺️', go: 'map' },
  { label: 'Restaurants', icon: '🍴', go: 'facilities', category: 'Restaurant' },
  { label: 'Washrooms', icon: '🚻', go: 'facilities', category: 'Washroom' },
  { label: 'Medical', icon: '➕', go: 'facilities', category: 'Medical' },
  { label: 'Shops', icon: '🛍️', go: 'facilities', category: 'Shop' },
  { label: 'Lounges', icon: '🛋️', go: 'facilities', category: 'Lounge' },
  { label: 'Baggage', icon: '🧳', go: 'facilities', category: 'Baggage' },
];

const PAGE_INFO = {
  flights: { title: 'Flight information', text: 'Search by flight number, airline or city.' },
  facilities: { title: 'Airport facilities', text: 'Find gates, washrooms, food, water, medical help and more.' },
  map: { title: 'Terminal map', text: 'Choose a start and a destination to see the way.' },
  chat: { title: 'Passenger assistant', text: 'Ask about flights, gates and facilities.' },
};

function App() {
  const [view, setView] = useState('public');
  const [tab, setTab] = useState('home');
  const [flightQuery, setFlightQuery] = useState(null);
  const [facilityCategory, setFacilityCategory] = useState('All');
  const [heroQuery, setHeroQuery] = useState('');

  function openTab(id) {
    setView('public');
    setFlightQuery(null);
    setFacilityCategory('All');
    setTab(id);
    window.scrollTo(0, 0);
  }

  function searchFlights(text) {
    setView('public');
    setFlightQuery(text.trim());
    setFacilityCategory('All');
    setTab('flights');
    window.scrollTo(0, 0);
  }

  function openQuick(item) {
    setView('public');
    setFlightQuery(item.go === 'flights' ? '' : null);
    setFacilityCategory(item.category || 'All');
    setTab(item.go);
    window.scrollTo(0, 0);
  }

  function handleHeroSubmit(event) {
    event.preventDefault();
    searchFlights(heroQuery);
    setHeroQuery('');
  }

  const isPublic = view === 'public';
  const isHome = isPublic && tab === 'home';
  const info = PAGE_INFO[tab];

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-inner">
          <button type="button" className="brand" onClick={() => openTab('home')}>
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </span>
            Smart Airport
            <span className="prototype-pill">Prototype</span>
          </button>

          <div className="nav-links">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`nav-link ${isPublic && tab === n.id ? 'active' : ''}`}
                onClick={() => openTab(n.id)}
              >
                {n.label}
              </button>
            ))}
          </div>

          {isPublic && (
            <button type="button" className="login-btn" onClick={() => setView('admin')}>
              Admin login
            </button>
          )}
        </div>
      </nav>

      {isHome && (
        <>
          <section className="hero">
            <div className="hero-inner">
              <h1>
                Your journey,
                <br />
                our assistance
              </h1>
              <p>Find your flight, locate facilities and find your way around the terminal.</p>

              <form className="hero-search" onSubmit={handleHeroSubmit}>
                <input
                  type="text"
                  placeholder="Search a flight number, airline or city"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  maxLength={50}
                  aria-label="Search flights"
                />
                <button type="submit">Search</button>
              </form>
            </div>
          </section>

          <div className="quick">
            {QUICK.map((q) => (
              <button key={q.label} type="button" className="quick-tile" onClick={() => openQuick(q)}>
                <span aria-hidden="true">{q.icon}</span>
                {q.label}
              </button>
            ))}
          </div>
        </>
      )}

      {isPublic && !isHome && info && (
        <section className="hero compact">
          <div className="hero-inner">
            <h1>{info.title}</h1>
            <p>{info.text}</p>
          </div>
        </section>
      )}

      <main className="container">
        {!isPublic && <Admin onExit={() => setView('public')} />}
        {isPublic && tab === 'home' && <NextDepartures onSelect={searchFlights} />}
        {isPublic && tab === 'flights' && <FlightSearch initialQuery={flightQuery} />}
        {isPublic && tab === 'facilities' && <FacilityFinder initialCategory={facilityCategory} />}
        {isPublic && tab === 'map' && <AirportMap />}
        {isPublic && tab === 'chat' && <Chatbot />}
      </main>

      <footer className="footer">
        Proposed prototype with fictional sample data. Not an official AAI system.
      </footer>
    </div>
  );
}

export default App;