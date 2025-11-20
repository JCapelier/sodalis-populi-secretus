import EditEventButton from "./EditEventButton";
import DraftButton from "./DraftButton";

interface EventCardProps {
  name: string;
  endsAt?: string | null;
  priceLimitCents?: number | null;
  adminName?: string;
  eventId: number;
  adminId: number;
  currentUserId: number
}

export default function EventCard({ name, endsAt, priceLimitCents, adminName, eventId, adminId, currentUserId }: EventCardProps) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 16, position: 'relative', minHeight: 120 }}>
      <h2>{name}</h2>
      {adminName && <div><strong>Admin:</strong> {adminName}</div>}
      {endsAt && <div><strong>Ends at:</strong> {endsAt}</div>}
      {priceLimitCents !== undefined && priceLimitCents !== null && (
        <div><strong>Price limit:</strong> €{(priceLimitCents / 100).toFixed(2)}</div>
      )}
      <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Number(currentUserId) === Number(adminId) && <EditEventButton eventId={eventId} />}
        <DraftButton eventId={eventId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
