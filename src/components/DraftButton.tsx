'use client';
import React, { useState, } from "react";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/api";
import { Pairing } from "@/type";

interface DraftButtonProps {
  eventId: number;
  currentUserId: number
  childDraft: {option: boolean, childId?: number}
}

const DraftButton: React.FC<DraftButtonProps> = ({ eventId, currentUserId, childDraft }) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleDraft = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {

      const response = childDraft && childDraft.option ? await apiGet<{ username: string }>(`/api/events/${eventId}/my-pairing/children?childId=${childDraft.childId}`) : await apiGet<{ username: string }>(`/api/events/${eventId}/my-pairing/users?userId=${currentUserId}`);
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
        <div className="fixed inset-0 z-1000 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm" />
          {/* Modal */}
          <div className="relative bg-white border-2 border-blue-400 p-6 rounded-xl shadow-2xl min-w-[320px] max-w-[90vw] flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
              <span className="font-semibold text-lg text-blue-800">Draft Result</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black text-2xl font-bold px-2">&times;</button>
            </div>
            {loading && <div className="text-blue-700 font-semibold">Loading...</div>}
            {error && <div className="text-red-500 font-semibold">{error}</div>}
            {result && (
              <pre className="bg-blue-50 border border-blue-200 p-4 rounded text-base text-blue-900 font-mono overflow-x-auto max-h-80 text-center shadow-inner">{result}</pre>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DraftButton;
