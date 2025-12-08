"use client";
import React, { useState } from "react";
import EventCard from "@/components/EventCard";
import type { EventInfo, ExclusionWithUsernames, Participant } from "@/type";

interface EventsCategoryProps {
  title: string;
  color: "blue" | "green" | 'purple';
  events: (EventInfo & { participants: Participant[]; exclusions: ExclusionWithUsernames[] })[];
  currentUserId?: number;
  childDraft: {option: boolean, childId?: number, childName?: string};
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
  },
  green: {
    bg: "bg-green-50",
  },
  purple: {
    bg: "bg-purple-50"
  },
};

const EventsCategory: React.FC<EventsCategoryProps> = ({ title, color, events, currentUserId, childDraft }) => {
  const [open, setOpen] = useState(true);
  const c = colorMap[color];

  return (
    <div className={`mb-8 rounded-xl p-6 shadow-md ${c.bg}`}>
      <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => setOpen(o => !o)}>
        <h3 className="text-lg font-bold text-black">
          <span className="mr-2 text-base text-black font-semibold">[{events.length}]</span>
          {title}
        </h3>
        <button className="ml-2 px-3 py-1 rounded bg-gray-200 text-black text-xs font-semibold shadow-sm border border-gray-300">{open ? 'Hide' : 'Show'}</button>
      </div>
      {open && (
        <ul className="space-y-4 mt-2">
          {events.length === 0 ? (
            <li className="text-gray-800 italic">No events yet.</li>
          ) : (
            events.map(event => (
              <li key={event.id}>
                <EventCard
                  name={event.name}
                  eventId={event.id}
                  priceLimitCents={event.price_limit_cents}
                  eventParticipants={event.participants}
                  eventExclusions={event.exclusions}
                  adminId={event.admin_id ?? 0}
                  endsAt={event.ends_at ? event.ends_at.toLocaleString() : undefined}
                  currentUserId={currentUserId ?? 0}
                  childDraft={childDraft.option && event.participants.some(p => p.type === 'child')
                    ? { ...childDraft, option: true }
                    : { option: false }}
                />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default EventsCategory;
