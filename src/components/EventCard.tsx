interface EventCardProps {
  name: string;
  endsAt?: string | null;
  priceLimitCents?: number | null;
  adminName?: string;
}

export default function EventCard({ name, endsAt, priceLimitCents, adminName }: EventCardProps) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h2>{name}</h2>
      {adminName && <div><strong>Admin:</strong> {adminName}</div>}
      {endsAt && <div><strong>Ends at:</strong> {endsAt}</div>}
      {priceLimitCents !== undefined && priceLimitCents !== null && (
        <div><strong>Price limit:</strong> €{(priceLimitCents / 100).toFixed(2)}</div>
      )}
    </div>
  );
}
