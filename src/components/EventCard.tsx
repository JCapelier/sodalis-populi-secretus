'use client';
import React, { useState } from "react";
import EditEventButton from "./EditEventButton";
import DraftButton from "./DraftButton";
import DeleteEventButton from "./DeleteEventButton";
import { Exclusion, Participant } from "@/type";

interface EventCardProps {
  name: string;
  endsAt?: string | null;
  priceLimitCents?: number | null;
  adminName?: string;
  eventId: number;
  adminId: number;
  currentUserId: number;
  eventParticipants?: Participant[];
  eventExclusions?: (Exclusion & { giverUsername?: string; receiverUsername?: string })[];
  childDraft: {option: boolean, childId?: number, childName?: string}
}

export default function EventCard({ name, endsAt, priceLimitCents, adminName, eventId, adminId, currentUserId, childDraft, eventParticipants = [], eventExclusions = [] }: EventCardProps) {
  const [open, setOpen] = useState(false);
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
                {(() => {
                  // Build a map to detect reciprocal exclusions
                  const exclusionMap = new Map();
                  eventExclusions.forEach(ex => {
                    const key = `${ex.giverUsername}--${ex.receiverUsername}`;
                    exclusionMap.set(key, ex);
                  });
                  const displayed = new Set();
                  return eventExclusions.filter(ex => {
                    const key = `${ex.giverUsername}--${ex.receiverUsername}`;
                    const reverseKey = `${ex.receiverUsername}--${ex.giverUsername}`;
                    if (displayed.has(key) || displayed.has(reverseKey)) return false;
                    displayed.add(key);
                    // If reverse exists, treat as reciprocal
                    return true;
                  }).map((ex) => {
                    const key = `${ex.giverUsername}--${ex.receiverUsername}`;
                    const reverseKey = `${ex.receiverUsername}--${ex.giverUsername}`;
                    const isReciprocal = exclusionMap.has(reverseKey);
                    return (
                      <li key={key}>
                        {ex.giverUsername}
                        {isReciprocal ? (
                          <span title="Reciprocal exclusion" className="mx-1">&#8646;</span>
                        ) : (
                          <span title="One-way exclusion" className="mx-1">&#8594;</span>
                        )}
                        {ex.receiverUsername}
                      </li>
                    );
                  });
                })()}
              </ul>
            </div>
          )}
          <div className="flex gap-2 mt-4 items-center">
            {Number(currentUserId) === Number(adminId) && (
              <>
                <EditEventButton eventId={eventId} />
              </>
            )}
            {(eventParticipants.some(p => p.invitee_id === currentUserId && p.type === 'user')
              || (childDraft.option && childDraft.childId && eventParticipants.some(p => p.invitee_id === childDraft.childId && p.type === 'child'))
            ) && (
              <DraftButton eventId={eventId} currentUserId={currentUserId} childDraft={childDraft} priceLimitCents={priceLimitCents} />
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
