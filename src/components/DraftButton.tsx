'use client';
import React, { useState, } from "react";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/api";
import { Pairing } from "@/type";

interface DraftButtonProps {
  eventId: number;
  currentUserId: number
}

const DraftButton: React.FC<DraftButtonProps> = ({ eventId, currentUserId }) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  console.log(currentUserId)
  console.log(eventId)


  const handleDraft = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiGet<{ username: string }>(`/api/events/${eventId}/my-pairing?userId=${currentUserId}`);
      setResult(response?.username ?? null);
    } catch (e: unknown) {
      function isErrorWithMessage(error: unknown): error is { message: string } {
        return (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        );
      }
      if (isErrorWithMessage(e)) {
        setError(e.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };


  // Only enable if session is loaded and userId is a valid number
  const userIdRaw = session?.user?.id;
  const userId = typeof userIdRaw === 'number' ? userIdRaw : Number(userIdRaw);
  const isSignedIn = typeof userId === 'number' && !isNaN(userId) && userId > 0;
  console.log(result)

  return (
    <>
      <button
        onClick={() => { if (isSignedIn) { setOpen(true); handleDraft(); } }}
        className={`px-2 py-1 rounded ${isSignedIn ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        disabled={!isSignedIn}
      >
        Draft
      </button>
      {!isSignedIn && (
        <div className="mt-2 text-sm text-gray-500">Sign in to see your pairing</div>
      )}
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
