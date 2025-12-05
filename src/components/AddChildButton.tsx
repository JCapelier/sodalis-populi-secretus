"use client";
import { Participant } from "@/type";
import InviteParticipantsField from "./forms/InviteParticipantsField";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChildService } from "@/services/ChildService";

type AddChildButtonProps = {userId: number | null}

const AddChildButton: React.FC<AddChildButtonProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [otherParent, setOtherParent] = useState<Participant | null>(null);
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      const newChild = await ChildService.submitChildCreation(name, userId!, otherParent?.invitee_id);
        if (newChild) {
          setSuccess('Child added');
          setName('');
          setOtherParent(null);
          setOpen(false);
          router.refresh();
        }
    } catch {
      setError('Failed to add child');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-block mb-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow text-sm transition"
        style={{ textDecoration: 'none' }}
      >
        + Add Child
      </button>
      {open && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white border-2 border-green-400 p-6 rounded-xl shadow-2xl min-w-[400px] max-w-[95vw] min-h-[200px] flex flex-col items-center" style={{ zIndex: 10 }}>
            <div className="flex justify-between items-center w-full mb-4">
              <span className="font-semibold text-lg text-green-800">Add Child</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black text-2xl font-bold px-2">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="w-full">
              <label className="block text-black font-semibold mb-1">
                Child&apos;s name:
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="block w-full border border-gray-400 rounded px-2 py-1 mt-1 text-black bg-white"
                  style={{ minWidth: '0' }}
                />
              </label>
              <label className="block text-black font-semibold mb-1 mt-3">
                Other Parent (optional):
                <InviteParticipantsField
                  onInvite={user => setOtherParent(user)}
                  searchEndPoint="/api/autocomplete"
                />
                {otherParent && (
                  <div className="text-sm text-gray-700 mt-1">Selected: {otherParent.username}</div>
                )}
              </label>
              <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 w-full">Add</button>
              {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
              {success && <div className="text-green-600 font-semibold mt-2">{success}</div>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddChildButton;
