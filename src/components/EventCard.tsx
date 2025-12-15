'use client';
import React, { useState } from "react";
import EditEventButton from "./EditEventButton";
import DraftButton from "./DraftButton";
import DeleteEventButton from "./DeleteEventButton";
import { ExclusionWithUsernames, InviteeType, Participant } from "@/type";
import { formatExclusion } from "@/utils/exclusion-utils";

interface EventCardProps {
  name: string;
  endsAt?: string | null;
  priceLimitCents?: number | null;
  adminName?: string;
  eventId: number;
  adminId: number;
  currentUserId: number;
  eventParticipants?: Participant[];
  eventExclusions?: ExclusionWithUsernames[];
  childDraft: {option: boolean, childId?: number, childName?: string}
}

export default function EventCard({ name, endsAt, priceLimitCents, adminName, eventId, adminId, currentUserId, childDraft, eventParticipants = [], eventExclusions = [] }: EventCardProps) {
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState(eventParticipants);

  const handleStatusUpdate = (updatedParticipant: Participant) => {
    setParticipants(prev => prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p));
  };


  return (
    <div className="bg-white border border-gray-400 rounded-xl p-5 mb-4 shadow-md relative">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(o => !o)}>
        <h2 className="text-lg font-bold text-gray-900 mb-0">{name}</h2>
        <button className="ml-2 px-3 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold shadow-sm border border-gray-300">
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-2">
          {adminName && <div className="text-gray-700"><strong>Admin:</strong> {adminName}</div>}
          {endsAt && (
            <div className="text-gray-700">
              <strong>Ends at:</strong> {typeof endsAt === 'string' ? endsAt.slice(0, 10) : endsAt}
            </div>
          )}
          {priceLimitCents !== undefined && priceLimitCents !== null && (
            <div className="text-gray-700"><strong>Price limit:</strong> {Number.isInteger(priceLimitCents / 100) ? (priceLimitCents / 100).toFixed(0) : (priceLimitCents / 100).toFixed(2)}€</div>
          )}
          {eventParticipants.length > 0 && (
            <div className="text-gray-700"><strong>Participants:</strong> {eventParticipants.map(p => p.username).join(", ")}</div>
          )}
          {eventExclusions.length > 0 && (
            <div className="text-gray-700"><strong>Exclusions:</strong>
              <ul className="list-disc ml-6">
                {formatExclusion(eventExclusions).map(({ giverUsername, receiverUsername, reciprocal }) => (
                  <li key={`${giverUsername}--${receiverUsername}`}>
                    {giverUsername}
                    {reciprocal ? (
                      <span title="Reciprocal exclusion" className="mx-1">&#8646;</span>
                    ) : (
                      <span title="One-way exclusion" className="mx-1">&#8594;</span>
                    )}
                    {receiverUsername}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2 mt-4 items-center">
            {Number(currentUserId) === Number(adminId) && (
              <>
                <EditEventButton eventId={eventId} />
              </>
            )}
            {(participants.some(participant => participant.invitee_id === currentUserId && participant.type === InviteeType.User)
              || (childDraft.option && childDraft.childId && participants.some(participant => participant.invitee_id === childDraft.childId && participant.type === InviteeType.Child))
            ) && (
              <DraftButton eventId={eventId} currentUserId={currentUserId} childDraft={childDraft} priceLimitCents={priceLimitCents} eventParticipants={participants} onStatusUpdate={handleStatusUpdate}/>
            )}
            {Number(currentUserId) === Number(adminId) && (
              <div className="flex-1 flex justify-end">
                <DeleteEventButton eventId={eventId} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
