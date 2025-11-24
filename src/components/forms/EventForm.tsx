'use client';
import { Event, Status } from "@/type";
import Link from "next/link";
import { useState, useEffect } from "react";
import ExclusionsManager from "./ExclusionsManager";
import InviteParticipantsField from "./InviteParticipantsField";
import { apiGet } from "@/lib/api";
import { useSession } from "next-auth/react";

export type ParticipantFormEntry = { id: number; username: string; type: 'user' | 'child' };

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
  const [exclusions, setExclusions] = useState<{ user_id: number; excluded_user_id: number }[]>([]);
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
    apiGet<{ user_id: number; excluded_user_id: number }[]>(`/api/exclusions/by-event-id?event-id=${eventId}`).then(setExclusions);
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
      exclusions,
    };

    let result, formData;
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
          <label className="block text-black font-semibold mb-1">
            Event name:
            <input value={name} onChange={event => setName(event.target.value)} required className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white" />
          </label>
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">
            Ends at (date):
            <input type="date" value={endsAt || ""} onChange={event => setEndsAt(event.target.value)} className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white" />
          </label>
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">
            Price limit (€):
            <input type="number" min="0" step="0.01" value={priceLimit} onChange={event => setPriceLimit(event.target.value)} className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white" />
          </label>
        </div>
        <InviteParticipantsField
          onInvite={user => {
            if (!invited.some(invitee => invitee.id === user.id && invitee.type === user.type )) {setInvited([...invited, user])} ;
          }}
          searchEndPoint="/api/autocomplete/invitees"
          inputClassName="border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white"
        />
        <div className="mt-2">
          <div className="font-semibold mb-1 text-black">Invited participants:</div>
          <ul className="list-disc ml-6 min-h-[1.5em]">
            {invited.map(u => (
              <li key={u.id} className="flex items-center gap-2 text-black">
                <span>{u.username}</span>
                <button
                  type="button"
                  aria-label={`Remove ${u.username}`}
                  className="text-red-600 hover:text-red-800 ml-2 font-bold"
                  onClick={() => setInvited(invited.filter(p => p.id !== u.id))}
                >
                  &#10005;
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2">
          <div className="font-semibold mb-1 text-black">Exclusions:</div>
          <div>
            <ExclusionsManager
              participants={invited}
              exclusions={exclusions}
              setExclusions={setExclusions}
              disabled={invited.length < 2}
            />
            {invited.length < 2 && (
              <div className="text-gray-400 opacity-60 mt-1">Add at least 2 participants to manage exclusions</div>
            )}
          </div>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">{isEdit ? 'Update Event' : 'Create Event'}</button>
        {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
        {success && <div className="text-green-600 font-semibold mt-2">{success}</div>}
      </form>
    </>
  );
}
