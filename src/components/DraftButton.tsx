'use client';
import React, { useState, } from "react";
import { useSession } from "next-auth/react";

interface DraftButtonProps {
  eventId: number;
}

const DraftButton: React.FC<DraftButtonProps> = ({ eventId }) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleDraft = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const payload = {drafterId: session?.user?.id}

    try {
      const result = await fetch(`/api/events/${eventId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })
      if (!result.ok) throw new Error("Draft failed");
      const data = await result.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => { setOpen(true); handleDraft(); }} className="px-2 py-1 bg-blue-500 text-white rounded">
        Draft
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg min-w-[300px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Draft Result</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black">&times;</button>
            </div>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {result && (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-80">{result}</pre>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DraftButton;
