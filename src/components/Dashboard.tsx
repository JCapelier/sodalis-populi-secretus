'use client';
import React from "react";
import CreateEventButton from "./CreateEventButton";
import { useSession } from "next-auth/react";

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow text-center text-gray-700 border-2 border-blue-400">
        Loading your dashboard...
      </div>
    );
  }

  const username = session?.user?.username || session?.user?.name;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow border-2 border-blue-500">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">
        Welcome, <span className="text-blue-700 font-extrabold">{username || "Unknown user"}</span>
      </h2>
      {/* TODO: Add children management UI here */}
      <div className="text-gray-700 text-sm mb-4 font-medium">(Children management coming soon)</div>
    </div>
  );
};

export default Dashboard;
