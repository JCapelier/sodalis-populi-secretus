'use client';
import { Event } from "@/type";
import Link from "next/link";
import { useState, useEffect } from "react";
import InviteParticipantsField from "./InviteParticipantsField";

interface EditEventFormProps {
  idString: string;
}

export default function EditEventForm({ idString }: EditEventFormProps) {
  const [name, setName] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priceLimit, setPriceLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [event, setEvent] = useState<Event | null>(null);
  const [invited, setInvited] = useState<{ id: number; username: string }[]>([]);
  const id = Number(idString);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(result => result.json())
      .then(data => {
        setEvent(data);
        setName(data.name || "");
        setEndsAt(data.ends_at ? data.ends_at.slice(0, 10) : "");
        setPriceLimit(
          data.price_limit_cents !== undefined && data.price_limit_cents !== null
            ? (data.price_limit_cents / 100).toString()
            : ""
        );
      });
  }, [id]);

  if (!event) return <div>Loading...</div>;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      ends_at: endsAt || null,
      price_limit_cents: priceLimit ? Math.round(Number(priceLimit) * 100) : null,
    };

    const result = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const formData = await result.json();
    if (!result.ok) {
      setError(formData.error || 'Failed to update event');
    } else {
      setSuccess('Event updated!');
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
          <input type="date" value={endsAt || ""} onChange={event => setEndsAt(event.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Price limit (€):
          <input type="number" min="0" step="0.01" value={priceLimit} onChange={event => setPriceLimit(event.target.value)} />
        </label>
      </div>
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
      <button type="submit">Update Event</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </form>
    <Link href='/events'>Back to index</Link>
  </>
  );
}
