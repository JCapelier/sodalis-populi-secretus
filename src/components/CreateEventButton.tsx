'use client';
import React, { useState } from "react";
import EventForm from "./forms/EventForm";

const CreateEventButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-block mb-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition"
        style={{ textDecoration: 'none' }}
      >
        + Create Event
      </button>
      {open && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center">
          {/* Overlay with subtle blur and clear contrast */}
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Modal with strong contrast and blue border */}
          <div className="relative bg-white border-2 border-blue-400 p-6 rounded-xl shadow-2xl min-w-[640px] max-w-[95vw] min-h-[520px] flex flex-col items-center" style={{ zIndex: 10 }}>
            <div className="flex justify-between items-center w-full mb-4">
              <span className="font-semibold text-lg text-blue-800">Create Event</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black text-2xl font-bold px-2">&times;</button>
            </div>
            <EventForm />
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEventButton;
