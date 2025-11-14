import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { query } from "@/lib/db";
import EventCard from "@/components/EventCard";

type Event = {
  id: number;
  name: string;
  ends_at?: string | null;
  price_limit_cents?: number | null;
};

export default async function EventsIndex() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return <div>You must be signed in to view your events.</div>;
  }

  const fetchAdminEventQuery = "SELECT * FROM events WHERE admin_id = $1";
  const result = await query(fetchAdminEventQuery, [session.user.id]);
  const events = result.rows as Event[];

  return (
    <div>
      {events.length === 0 && <div>No events found.</div>}
      {events.map(event => (
        <EventCard
          key={event.id}
          name={event.name}
          endsAt={event.ends_at ? new Date(event.ends_at).toLocaleDateString() : undefined}
          priceLimitCents={event.price_limit_cents}
        />
      ))}
    </div>
  );
}
