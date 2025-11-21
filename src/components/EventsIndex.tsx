import React from "react";
import EventsCategory from "./EventsCategory";
import { EventInfo, Event as EventType } from "@/type";

interface EventsIndexProps {
  managedEvents: EventInfo[];
  participatingEvents: EventInfo[];
  currentUserId: number,
}

const EventsIndex: React.FC<EventsIndexProps> = ({ managedEvents, participatingEvents, currentUserId }) => (
  <div className="w-full max-w-3xl mx-auto mt-8 flex flex-col gap-6">
    <EventsCategory
      title="Events I Manage"
      color="blue"
      events={managedEvents}
      currentUserId={currentUserId}
    />
    <EventsCategory
      title="Events I Participate In"
      color="green"
      events={participatingEvents}
      currentUserId={currentUserId}
    />
  </div>
);

export default EventsIndex;
