'use client';
import React, { useState } from "react";
import EventForm from "./forms/EventForm";
import { useRouter } from "next/navigation";

export default function EditEventButton({ eventId, onEventUpdated }: { eventId: number, onEventUpdated?: () => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
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
        onClick={() => setOpen(true)}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#1565c0')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1976d2')}
      >
        Edit
      </button>
      {open && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center">
          {/* Overlay with subtle blur and clear contrast */}
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Modal with strong contrast and blue border */}
          <div className="relative bg-white border-2 border-blue-400 p-6 rounded-xl shadow-2xl min-w-[640px] max-w-[95vw] min-h-[520px] flex flex-col items-center" style={{ zIndex: 10 }}>
            <div className="flex justify-between items-center w-full mb-4">
              <span className="font-semibold text-lg text-blue-800">Edit Event</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black text-2xl font-bold px-2">&times;</button>
            </div>
            <EventForm idString={eventId.toString()} onSuccess={async () => {
              setOpen(false);
              if (onEventUpdated) await onEventUpdated();
            }} />
          </div>
        </div>
      )}
    </>
  );
}
