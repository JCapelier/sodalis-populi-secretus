'use client';
import { useState } from "react";

export default function CreateEventForm() {
  const [name, setName] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [priceLimit, setPriceLimit] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!username.trim()) {
      setError('Admin username is required');
      return;
    }

    // Fetch admin_id from username
    let admin_id;
    try {
      const result = await fetch(`/api/users/by-username?username=${encodeURIComponent(username.trim())}`);
      if (!result.ok) throw new Error('Could not resolve admin username');
      const data = await result.json();
      admin_id = data.id;
      if (!admin_id) throw new Error('No admin ID found for username');
    } catch (error: any) {
      setError(error.message || 'Failed to resolve admin username');
      return;
    }

    const payload = {
      name: name.trim(),
      admin_id,
      ends_at: endsAt || null,
      price_limit_cents: priceLimit ? Math.round(Number(priceLimit) * 100) : null,
    };

    const result = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const formData = await result.json();
    if (!result.ok) {
      setError(formData.error || 'Failed to create event');
    } else {
      setSuccess('Event created!');
      setName('');
      setEndsAt('');
      setPriceLimit('');
      setUsername('');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Event name:
          <input value={name} onChange={event => setName(event.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Admin username:
          <input value={username} onChange={event => setUsername(event.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Ends at (date):
          <input type="date" value={endsAt} onChange={event => setEndsAt(event.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Price limit (€):
          <input type="number" min="0" step="0.01" value={priceLimit} onChange={event => setPriceLimit(event.target.value)} />
        </label>
      </div>
      <button type="submit">Create Event</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </form>
  );
}
