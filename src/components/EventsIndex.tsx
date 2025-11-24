import React from "react";
import EventsCategory from "./EventsCategory";
import { EventInfo, Event as EventType } from "@/type";

export type Child = {
  id: number;
  parent_id: number;
  username: string;
  other_parent_id: number
}

interface EventsIndexProps {
  managedEvents: EventInfo[];
  participatingEvents: EventInfo[];
  childrenEvents: {child: Child, events: EventInfo[]}[]
  currentUserId: number,
}

const EventsIndex: React.FC<EventsIndexProps> = ({ managedEvents, participatingEvents, childrenEvents, currentUserId }) => (
  <div className="w-full max-w-3xl mx-auto mt-8 flex flex-col gap-6">
    <EventsCategory
      title="Events I Manage"
      color="blue"
      events={managedEvents}
      currentUserId={currentUserId}
      childDraft={false}
    />
    <EventsCategory
      title="Events I Participate In"
      color="green"
      events={participatingEvents}
      currentUserId={currentUserId}
      childDraft={false}
    />
    {childrenEvents.map(childEvents => (
      <EventsCategory
        key={childEvents.child.id}
        title={`Events for ${childEvents.child.username}`}
        color="purple"
        events={childEvents.events}
        currentUserId={currentUserId}
        childDraft={{option: true, childId: childEvents.child.id}}
      />
    ))}
  </div>
);

export default EventsIndex;
