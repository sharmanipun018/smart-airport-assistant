import { useState, useRef, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/chat';

const SUGGESTIONS = [
  'Where is the nearest washroom?',
  'Status of SK101',
  'Flights to Mumbai',
  'Where is Gate 24?',
  'Medical help',
  'Where can I drink water?',
];

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hello! I am the airport assistant. Ask me about flights, gates and facilities.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text) {
    const question = text.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { from: 'user', text: question }]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });
      const data = await response.json();
      const reply = response.ok ? data.reply : data.message || 'Something went wrong.';
      setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Could not reach the server. Please check that the backend is running.' },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    send(input);
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.from}`}>
            {m.text}
          </div>
        ))}
        {sending && <div className="chat-bubble bot">Typing...</div>}
        <div ref={endRef} />
      </div>

      <div className="chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <form className="search-box" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={200}
        />
        <button type="submit" disabled={sending}>Send</button>
      </form>
    </div>
  );
}

export default Chatbot;