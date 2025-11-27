import React, { useState } from "react";
import InviteParticipantsField from "./forms/InviteParticipantsField";
import { Participant, InviteeType } from "@/type";

interface EditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: {
    id: number;
    username?: string;
    name?: string;
    parent_id?: number;
    other_parent_id?: number;
    other_parent_username?: string;
  };
  onSave: (updated: { id: number; username?: string; name?: string; other_parent_id?: number }) => void;
  onDelete: () => void;
  deleteError?: string;
}

const EditChildModal: React.FC<EditChildModalProps> = ({ isOpen, onClose, child, onSave, onDelete, deleteError }) => {
  const [name, setName] = useState(child.username || child.name || "");
  const [otherParent, setOtherParent] = useState<Participant | undefined>(
    child.other_parent_id && child.other_parent_username
      ? { invitee_id: child.other_parent_id, username: child.other_parent_username, type: InviteeType.User }
      : undefined
  );

  React.useEffect(() => {
    setName(child.username || child.name || "");
    setOtherParent(
      child.other_parent_id && child.other_parent_username
        ? { invitee_id: child.other_parent_id, username: child.other_parent_username, type: InviteeType.User }
        : undefined
    );
  }, [child]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center">
      <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border-2 border-green-400 p-6 rounded-xl shadow-2xl min-w-[400px] max-w-[95vw] min-h-[200px] flex flex-col items-center" style={{ zIndex: 10 }}>
        <div className="flex justify-between items-center w-full mb-4">
          <span className="font-semibold text-lg text-green-800">Edit Child</span>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl font-bold px-2">&times;</button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave({
              id: child.id,
              username: name,
              name,
              other_parent_id: otherParent ? otherParent.invitee_id : undefined
            });
            onClose();
          }}
          className="w-full"
        >
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
              prefill={otherParent}
            />
            {otherParent && (
              <div className="text-sm text-gray-700 mt-1">Selected: {otherParent.username}</div>
            )}
          </label>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save</button>
            <button type="button" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={onDelete}>Delete</button>
            {deleteError && (
              <div className="text-red-600 text-sm mt-2 w-full text-center font-semibold">{deleteError}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChildModal;
