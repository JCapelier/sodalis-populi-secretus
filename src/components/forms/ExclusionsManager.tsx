import { ExclusionWithReciprocal, InviteeType, Participant } from "@/type";
import React, { useState } from "react";


interface ExclusionsManagerProps {
  participants: Participant[];
  exclusions: ExclusionWithReciprocal[];
  setExclusions: (exclusions: ExclusionWithReciprocal[]) => void;
}

const ExclusionsManager: React.FC<ExclusionsManagerProps> = ({ participants, exclusions, setExclusions }) => {
  const [newExclusion, setNewExclusion] = useState<ExclusionWithReciprocal>({ invitee_id: 0, invitee_type: InviteeType.User, excluded_invitee_id: 0, excluded_invitee_type: InviteeType.User, reciprocal: true });
  const handleAdd = () => {
    if (
      newExclusion.invitee_id &&
      newExclusion.excluded_invitee_id &&
      // Check both id and type for self-exclusion
      !(newExclusion.invitee_id === newExclusion.excluded_invitee_id && newExclusion.invitee_type === newExclusion.excluded_invitee_type) &&
      // Check both id and type for uniqueness
      !exclusions.some(e =>
        e.invitee_id === newExclusion.invitee_id &&
        e.invitee_type === newExclusion.invitee_type &&
        e.excluded_invitee_id === newExclusion.excluded_invitee_id &&
        e.excluded_invitee_type === newExclusion.excluded_invitee_type
      )
    ) {
      // Find types from participants
      const invitee = participants.find(p => p.invitee_id === newExclusion.invitee_id && p.type === newExclusion.invitee_type);
      const excluded = participants.find(p => p.invitee_id === newExclusion.excluded_invitee_id && p.type === newExclusion.excluded_invitee_type);
      const exclusionToAdd = {
        ...newExclusion,
        invitee_type: invitee?.type || InviteeType.User,
        excluded_invitee_type: excluded?.type || InviteeType.User,
        reciprocal: !!newExclusion.reciprocal
      };
      const newList = [...exclusions, exclusionToAdd];
      if (newExclusion.reciprocal) {
        // Add the reverse exclusion if not already present
        if (!exclusions.some(e => e.invitee_id === newExclusion.excluded_invitee_id && e.invitee_type === (excluded?.type || InviteeType.User) && e.excluded_invitee_id === newExclusion.invitee_id && e.excluded_invitee_type === (invitee?.type || InviteeType.User))) {
          newList.push({
            invitee_id: newExclusion.excluded_invitee_id,
            invitee_type: excluded?.type || InviteeType.User,
            excluded_invitee_id: newExclusion.invitee_id,
            excluded_invitee_type: invitee?.type || InviteeType.User,
            reciprocal: true
          });
        }
      }
      setExclusions(newList);
      setNewExclusion({ invitee_id: 0, invitee_type: InviteeType.User, excluded_invitee_id: 0, excluded_invitee_type: InviteeType.User, reciprocal: true });
    }
  };

  const handleRemove = (index: number) => {
    const ex = exclusions[index];
    let newList = exclusions.filter((_, i) => i !== index);
    // If reciprocal, remove the reverse as well
    if (ex.reciprocal) {
      newList = newList.filter(e =>
        !((e.invitee_id === ex.excluded_invitee_id && e.invitee_type === ex.excluded_invitee_type) &&
         (e.excluded_invitee_id === ex.invitee_id && e.excluded_invitee_type === ex.invitee_type)));
    }
    setExclusions(newList);
  };

  // Deduplicate reciprocal exclusions for display
  const displayed: Set<string> = new Set();
  const displayExclusions = exclusions.filter(ex => {
    if (ex.reciprocal) {
      // Only display one direction for reciprocal exclusions
      const key = [ex.invitee_type, ex.invitee_id, ex.excluded_invitee_type, ex.excluded_invitee_id].join('-');
      const reverseKey = [ex.excluded_invitee_type, ex.excluded_invitee_id, ex.invitee_type, ex.invitee_id].join('-');
      if (displayed.has(reverseKey)) return false;
      displayed.add(key);
      return true;
    } else {
      // Always display non-reciprocal exclusions
      return true;
    }
  });

  return (
    <div className="mt-4">
      {displayExclusions.map((ex, idx) => {
        const from = participants.find(p => p.invitee_id === ex.invitee_id && p.type === ex.invitee_type)?.username || "?";
        const to = participants.find(p => p.invitee_id === ex.excluded_invitee_id && p.type === ex.excluded_invitee_type)?.username || "?";
        return (
          <div key={`${ex.invitee_type}-${ex.invitee_id}_x_${ex.excluded_invitee_type}-${ex.excluded_invitee_id}_${idx}`} className="flex items-center gap-2 mb-1">
            <span className="text-black flex items-center gap-1">
              {from}
              {ex.reciprocal ? (
                <span title="Reciprocal exclusion" className="mx-1">&#8646;</span> // double arrow
              ) : (
                <span title="One-way exclusion" className="mx-1">&#8594;</span> // single arrow
              )}
              {to}
            </span>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 ml-2"
              onClick={() => handleRemove(idx)}
              aria-label="Remove exclusion"
            >
              &#10005;
            </button>
          </div>
        );
      })}
      <div className="flex items-center gap-2 mt-2">
        <select
          value={newExclusion.invitee_id ? `${newExclusion.invitee_type}-${newExclusion.invitee_id}` : ''}
          onChange={e => {
            const [type, idStr] = e.target.value.split('-');
            const id = Number(idStr);
            setNewExclusion({ ...newExclusion, invitee_id: id, invitee_type: type as InviteeType });
          }}
          className="border border-gray-400 rounded px-2 py-1 text-black bg-white font-normal w-full"
          style={{ minWidth: '0' }}
        >
          <option value="">Select participant</option>
          {participants.map(p => (
            <option key={`${p.type}-${p.invitee_id}`} value={`${p.type}-${p.invitee_id}`}>{p.username}</option>
          ))}
        </select>
        <span className="text-black font-normal">can&apos;t draw</span>
        <select
          value={newExclusion.excluded_invitee_id ? `${newExclusion.excluded_invitee_type}-${newExclusion.excluded_invitee_id}` : ''}
          onChange={e => {
            const [type, idStr] = e.target.value.split('-');
            const id = Number(idStr);
            setNewExclusion({ ...newExclusion, excluded_invitee_id: id, excluded_invitee_type: type as InviteeType });
          }}
          className="border border-gray-400 rounded px-2 py-1 text-black bg-white font-normal w-full"
          style={{ minWidth: '0' }}
        >
          <option value="">Select participant</option>
          {participants.map(p => (
            <option key={`${p.type}-${p.invitee_id}`} value={`${p.type}-${p.invitee_id}`}>{p.username}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 ml-2 text-black font-normal">
          <input
            type="checkbox"
            checked={!!newExclusion.reciprocal}
            onChange={e => setNewExclusion({ ...newExclusion, reciprocal: e.target.checked })}
          />
          <span className="text-xs">reciprocal</span>
        </label>
        <button type="button" className="ml-2 px-2 py-1 bg-blue-500 text-white rounded font-normal w-full" style={{ minWidth: '0' }} onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
};

export default ExclusionsManager;
