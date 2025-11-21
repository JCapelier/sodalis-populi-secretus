import Link from "next/link";
import React from "react";

const CreateEventButton: React.FC = () => (
  <Link
    href="/events/new"
    className="inline-block mb-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition"
    style={{ textDecoration: 'none' }}
  >
    + Create Event
  </Link>
);

export default CreateEventButton;
