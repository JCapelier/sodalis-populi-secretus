'use client';
import Link from "next/link";

export default function EditEventButton({ eventId }: { eventId: number }) {
  return (
    <Link href={`/events/${eventId}/edit`}>
      <button
        style={{
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '6px 16px',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: 14,
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#1565c0')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1976d2')}
      >
        Edit
      </button>
    </Link>
  );
}
