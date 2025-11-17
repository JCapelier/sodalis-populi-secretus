'use client';
import { useState } from "react";
import InviteParticipantsField from "./InviteParticipantsField";
import { useSession } from "next-auth/react";

export default function CreateEventForm() {
  const [name, setName] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [priceLimit, setPriceLimit] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invited, setInvited] = useState<{ id: number; username: string }[]>([]);
  const { data: session } = useSession();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!(session && session.user && session.user.id)) {
      setError('You must be signed in to create an event');
      return;
    }

    const payload = {
      name: name.trim(),
      admin_id: session.user.id,
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
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Event name:
          <input value={name} onChange={event => setName(event.target.value)} required />
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
    <InviteParticipantsField
      onInvite={user => {
        if (!invited.some(u => u.id === user.id)) setInvited([...invited, user]);
      }}
    />
    {invited.length > 0 && (
      <div className="mt-2">
        <div className="font-semibold mb-1">Invited participants:</div>
        <ul className="list-disc ml-6">
          {invited.map(u => (
            <li key={u.id}>{u.username}</li>
          ))}
        </ul>
      </div>
    )}
  </>
  );
}
