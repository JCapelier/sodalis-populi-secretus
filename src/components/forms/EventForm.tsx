'use client';
import { Exclusion, Participant } from "@/type";
import { useState, useEffect } from "react";
import ExclusionsManager from "./ExclusionsManager";
import InviteParticipantsField from "./InviteParticipantsField";
import { useSession } from "next-auth/react";
import { EventFormService } from "@/services/EventFormService";
import { InviteeService } from "@/services/InviteeService";
import { ExclusionService } from "@/services/ExclusionService";
import { toDateInputValue } from "@/utils/date-format";


interface EventFormProps {
  idString?: string | null;
  onSuccess?: () => void;
}

export default function EventForm({ idString, onSuccess }: EventFormProps) {
  const [name, setName] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [priceLimit, setPriceLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invited, setInvited] = useState<Participant[]>([]);
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const { data: session } = useSession();
  const eventId = idString ? Number(idString) : undefined;
  const isEdit = !!eventId;


  // Load event data if editing
  useEffect(() => {
    if (!isEdit || !eventId) return;
    (async () => {
      const eventData = await EventFormService.fetchEventFormData(eventId);
      setName(eventData.name);
      setEndsAt(eventData.ends_at ? eventData.ends_at : '');
      const priceLimitEuros = eventData.price_limit_cents? Number(eventData.price_limit_cents) / 100 : undefined;
      setPriceLimit(priceLimitEuros ? priceLimitEuros.toString() : '')
      if (eventData.ends_at) setEndsAt(eventData.ends_at);
      setInvited(eventData.participants);
      setExclusions(eventData.exclusions);
    })();
  }, [eventId, isEdit]);

  if (!(session && session.user && session.user.id)) {
    return <div style={{ color: "red" }}>You must be signed in to create an event</div>;
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
      admin_id: Number(session?.user?.id),
      ends_at: endsAt || null,
      price_limit_cents: priceLimit ? Math.round(Number(priceLimit) * 100) : null,
      participants: invited,
      exclusions,
    };

    try {
      const result = await EventFormService.submitEventForm(isEdit, eventId!, payload);
      if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
        setError(result.error);
      } else {
        setSuccess(isEdit ? "Event updated!" : "Event created!");
        if (!isEdit) {
          setName("");
          setEndsAt("");
          setPriceLimit("");
          setInvited([]);
        }
        if (onSuccess) onSuccess();
      }
    } catch {
      setError(isEdit ? "Failed to update event" : "Failed to create event");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-black font-semibold mb-1">
            Event name:
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white"
            />
          </label>
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">
            Ends at (date):
            <input
              type="date"
              value={toDateInputValue(endsAt) || ""}
              onChange={(event) => setEndsAt(event.target.value)}
              className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white"
            />
          </label>
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">
            Price limit (€):
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceLimit}
              onChange={(event) => setPriceLimit(event.target.value)}
              className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white"
            />
          </label>
        </div>

        <InviteParticipantsField
          onInvite={(user) => {
            if (!invited.some((invitee) => invitee.invitee_id === user.invitee_id && invitee.type === user.type)) {
              setInvited([...invited, user]);
            }
          }}
          searchEndPoint="/api/autocomplete/invitees"
        />

        <div className="mt-2">
          <div className="font-semibold mb-1 text-black">Invited participants:</div>
          <ul className="list-disc ml-6 min-h-[1.5em]">
            {invited.map((invitee) => (
              <li
                key={invitee.type ? `${invitee.type}-${invitee.invitee_id}` : `${invitee.invitee_id}`}
                className="flex items-center gap-2 text-black"
              >
                <span>{invitee.username}</span>
                <button
                  type="button"
                  aria-label={`Remove ${invitee.username}`}
                  className="text-red-600 hover:text-red-800 ml-2 font-bold"
                  onClick={() => {
                    setInvited(InviteeService.removeInviteeFromInvited(invitee, invited));
                    setExclusions(ExclusionService.removeExclusionsWhenRemovingInvitee(exclusions, invitee));
                  }}
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
            />
            {invited.length < 2 && (
              <div className="text-gray-400 opacity-60 mt-1">
                Add at least 2 participants to manage exclusions
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          {isEdit ? "Update Event" : "Create Event"}
        </button>
        {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
        {success && <div className="text-green-600 font-semibold mt-2">{success}</div>}
      </form>
    </>
  );
}
