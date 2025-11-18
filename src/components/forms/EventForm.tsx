'use client';
import { Event, Status } from "@/type";
import Link from "next/link";
import { useState, useEffect } from "react";
import InviteParticipantsField from "./InviteParticipantsField";
import { apiGet } from "@/lib/api";
import { useSession } from "next-auth/react";

export type ParticipantFormEntry = { user_id: number; username: string; status?: Status };

interface EventFormProps {
  idString?: string | null;
}

export default function EventForm({ idString }: EventFormProps) {
  const [name, setName] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priceLimit, setPriceLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invited, setInvited] = useState<ParticipantFormEntry[]>([]);
  const { data: session } = useSession();
  const eventId = idString ? Number(idString) : undefined;
  const isEdit = !!eventId;


  // Load event data if editing
  useEffect(() => {
    if (!isEdit || !eventId) return;
    apiGet<Event>(`/api/events/${eventId}`).then(data => {
      setName(data.name || "");
      setEndsAt(data.ends_at ? data.ends_at.slice(0, 10) : "");
      setPriceLimit(
        data.price_limit_cents !== undefined && data.price_limit_cents !== null
        ? (data.price_limit_cents / 100).toString()
        : ""
      );
    });
    apiGet<ParticipantFormEntry[]>(`/api/event-participants/by-event-id?event-id=${eventId}`).then(setInvited);
  }, [eventId, isEdit]);

  if (!(session && session.user && session.user.id)) {
    return <div style={{ color: 'red' }}>You must be signed in to create an event</div>;
  }

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
      admin_id: session?.user?.id,
      ends_at: endsAt || null,
      price_limit_cents: priceLimit ? Math.round(Number(priceLimit) * 100) : null,
      participants: invited,
    };

    let result, formData;
    console.log(invited)
    if (isEdit && eventId) {
      result = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      result = await fetch(`/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    formData = await result.json();
    if (!result.ok) {
      setError(formData.error || (isEdit ? 'Failed to update event' : 'Failed to create event'));
    } else {
      setSuccess(isEdit ? 'Event updated!' : 'Event created!');
      if (!isEdit) {
        setName("");
        setEndsAt("");
        setPriceLimit("");
        setInvited([]);
      }
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
        <button type="submit">{isEdit ? 'Update Event' : 'Create Event'}</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}
      </form>
      <Link href='/events'>Back to index</Link>
    </>
  );
}
