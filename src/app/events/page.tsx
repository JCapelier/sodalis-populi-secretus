import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { query } from "@/lib/db";
import EventCard from "@/components/EventCard";
import { Event } from "@/type";

export default async function EventsIndex() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return <div>You must be signed in to view your events.</div>;
  }

  const fetchAdminEventQuery = "SELECT * FROM events WHERE admin_id = $1";
  const result = await query(fetchAdminEventQuery, [session.user.id]);
  const adminEvents = result.rows as Event[];

  const fetchEventParticipantsQuery = `
    SELECT event.*
    FROM events event
    JOIN event_participants event_participant ON event_participant.event_id = event.id
    WHERE event_participant.user_id = $1 AND event.admin_id <> $1
    `;
  const participantResult = await query(fetchEventParticipantsQuery, [session.user.id]);
  const participantEvents = participantResult.rows as Event[];


  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Events I Manage</h2>
      {adminEvents.length === 0 && <div>No managed events found.</div>}
      {adminEvents.map(event => (
        <EventCard
          key={event.id}
          name={event.name}
          endsAt={event.ends_at ? new Date(event.ends_at).toLocaleDateString() : undefined}
          priceLimitCents={event.price_limit_cents}
          eventId={event.id}
          adminId={event.admin_id}
          currentUserId={session.user.id}
        />
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">Events I Participate In</h2>
      {participantEvents.length === 0 && <div>No participation events found.</div>}
      {participantEvents.map(event => (
        <EventCard
          key={event.id}
          name={event.name}
          endsAt={event.ends_at ? new Date(event.ends_at).toLocaleDateString() : undefined}
          priceLimitCents={event.price_limit_cents}
          eventId={event.id}
          adminId={event.admin_id}
          currentUserId={session.user.id}
        />
      ))}
    </div>
  );
}
