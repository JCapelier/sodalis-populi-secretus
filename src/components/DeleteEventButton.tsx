import { apiDelete } from "@/lib/api";
import { useRouter } from "next/navigation";
import React from "react";

interface DeleteEventButtonProps {
  eventId: number;
  onDelete?: (eventId: number) => void;
}

const DeleteEventButton: React.FC<DeleteEventButtonProps> = ({ eventId, onDelete }) => {
  const router = useRouter();

  async function handleClick() {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        if (onDelete) {
          onDelete(eventId);
        } else {
          await apiDelete(`/api/events/${eventId}`);
          router.refresh();
        }
      } catch (error) {
        alert('Failed to delete event. Please try again.');
        console.error(error);
      }
    }
  }

  return (
    <button
      style={{
        backgroundColor: '#d32f2f',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        padding: '6px 16px',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: 14,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        transition: 'background 0.2s',
        minWidth: 64,
      }}
      onClick={handleClick}
      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#b71c1c')}
      onMouseOut={e => (e.currentTarget.style.backgroundColor = '#d32f2f')}
    >
      Delete
    </button>
  );
};

export default DeleteEventButton;
