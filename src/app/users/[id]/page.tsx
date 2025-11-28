import React from "react";
import Dashboard from "@/components/Dashboard";
import EventsIndex from "@/components/EventsIndex";
import { getEventInfo, query } from "@/lib/db";
import { Child, EventInfo, Event as EventType } from "@/type";
import CreateEventButton from "@/components/CreateEventButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function UserDashboardPage({ params }: Props) {
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);
  const session = await getServerSession(authOptions);
  if (!session || !session.user || Number(session.user.id) !== userId) {
    redirect("/");
  }


  const childrenResult = await query(
    `SELECT * FROM children WHERE parent_id = $1 OR other_parent_id = $1`,
    [userId]
  );
  const children = childrenResult.rows as Child[];

  // For each child, fetch events where the child is a participant
  const childrenEvents: { child: Child; events: EventType[] }[] = await Promise.all(
    children.map(async (child: Child) => {
      const childEventsResult = await query(
        `SELECT e.* FROM events e
         JOIN event_participants ep ON ep.event_id = e.id
         WHERE ep.invitee_id = $1 AND ep.type = 'child'`,
        [child.id]
      );
      return {
        child,
        events: childEventsResult.rows as EventType[],
      };
    })
  );

  const fullChildrenEvents = await Promise.all(
    childrenEvents.map(async ({ child, events }) => ({
      child,
      events: await Promise.all(events.map(event => getEventInfo(event))),
    }))
  );


  // Fetch managed events
  const managedEventsResult = await query(
    "SELECT * FROM events WHERE admin_id = $1",
    [userId]
  );
  const managedEvents = managedEventsResult.rows as EventType[];

  // Fetch participating events (not admin)
  const participatingEventsResult = await query(
    `SELECT e.* FROM events e
     JOIN event_participants ep ON ep.event_id = e.id
     WHERE ep.invitee_id = $1 AND e.admin_id != $1`,
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
      <Dashboard childrenList={children} />
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center my-8">
        <CreateEventButton />
      </div>
      <EventsIndex
        managedEvents={fullManagedEvents}
        participatingEvents={fullParticipatingEvents}
        childrenEvents={fullChildrenEvents}
        currentUserId={userId}
      />
    </div>
  );
}
