import React from "react";
import Dashboard from "@/components/Dashboard";
import EventsIndex from "@/components/EventsIndex";
import { Child, Event as EventType } from "@/type";
import CreateEventButton from "@/components/CreateEventButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { childRepository } from "@/repositories/ChildRepository";
import { eventRepository } from "@/repositories/EventRepository";
import { EventService } from "@/services/EventService";

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

  const children = await childRepository.findByParentId(userId);

  const childrenEvents: { child: Child; events: EventType[] }[] = await Promise.all(
    children.map(async (child: Child) => ({
      child,
      events: await eventRepository.findByChildParticipant(child.id),
    }))
  );

  const fullChildrenEvents = await Promise.all(
    childrenEvents.map(async ({ child, events }) => ({
      child,
      events: await Promise.all(events.map(event => await `/api/events/${event.id}/event-info`)),
    }))
  );

  // Fetch managed events
  const managedEvents = await eventRepository.findByAdminId(userId);

  // Fetch participating events (not admin)
  const participatingEvents = await eventRepository.findByUserParticipant(userId);

  const fullManagedEvents = await Promise.all(
    managedEvents.map((event) => EventService.getEventInfo(event))
  );

  const fullParticipatingEvents = await Promise.all(
    participatingEvents.map((event) => EventService.getEventInfo(event))
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
