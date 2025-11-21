import React from "react";
import Dashboard from "@/components/Dashboard";
import EventsIndex from "@/components/EventsIndex";
import CreateEventButton from "@/components/CreateEventButton";
import { getEventInfo, query } from "@/lib/db";
import { EventInfo, Event as EventType } from "@/type";

interface Props {
  params: { id: string };
}

export default async function UserDashboardPage({ params }: Props) {
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  // Fetch managed events
  const managedEventsResult = await query(
    "SELECT * FROM events WHERE admin_id = $1",
    [userId]
  );
  const managedEvents = managedEventsResult.rows as EventType[];

  // Fetch participating events (not admin)
  const participatingEventsResult = await query(
    `SELECT * FROM events e
     JOIN event_participants ep ON ep.event_id = e.id
     WHERE ep.user_id = $1 AND e.admin_id != $1`,
    [userId]
  );
  const participatingEvents = participatingEventsResult.rows as EventType[];

  const fullManagedEvents: EventInfo[] = await Promise.all(
    managedEvents.map((event) => getEventInfo(event))
  );

  const fullParticipatingEvents: EventInfo[] = await Promise.all(
    participatingEvents.map((event) => getEventInfo(event))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Dashboard />
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center my-8">
        <CreateEventButton />
      </div>
      <EventsIndex
        managedEvents={fullManagedEvents}
        participatingEvents={fullParticipatingEvents}
        currentUserId={userId}
      />
    </div>
  );
}
