'use client';
import { Event, Status } from "@/type";
import Link from "next/link";
import { useState, useEffect } from "react";
import InviteParticipantsField from "./InviteParticipantsField";
import { apiGet } from "@/lib/api";

interface EditEventFormProps {
  idString: string;
}

export type ParticipantFormEntry = { user_id: number; username: string; status?: Status};

export default function EditEventForm({ idString }: EditEventFormProps) {
  const [name, setName] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priceLimit, setPriceLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [event, setEvent] = useState<Event | null>(null);
  const [invited, setInvited] = useState<ParticipantFormEntry[]>([]);
  const id: number = Number(idString);

  async function fetchEventParticipants(id: number): Promise<ParticipantFormEntry[]> {
    return await apiGet<ParticipantFormEntry[]>(`/api/event-participants/by-event-id?event-id=${id}`);
  }

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

  useEffect(() => {
    async function loadParticipants() {
      const participants = await fetchEventParticipants(id);
      setInvited(participants);
    }
    loadParticipants();
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
      participants: invited
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
        if (!invited.some(u => u.user_id === user.user_id)) setInvited([...invited, user]);
      }}
      />
    {invited.length > 0 && (
      <div className="mt-2">
        <div className="font-semibold mb-1">Invited participants:</div>
        <ul className="list-disc ml-6">
          {invited.map(u => (
            <li key={u.user_id} className="flex items-center gap-2">
              <span>{u.username}</span>
              <button
                type="button"
                aria-label={`Remove ${u.username}`}
                className="text-red-500 hover:text-red-700 ml-2"
                onClick={() => setInvited(invited.filter(p => p.user_id !== u.user_id))}
              >
                &#10005;
              </button>
            </li>
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
