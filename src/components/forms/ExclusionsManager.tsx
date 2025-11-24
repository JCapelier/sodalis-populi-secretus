import React, { useState } from "react";
import type { ParticipantFormEntry } from "./EventForm";

interface Exclusion {
  invitee_id: number;
  invitee_type: 'child' | 'user';
  excluded_invitee_id: number;
  excluded_invitee_type: 'child' | 'user';
  reciprocal?: boolean;
}

interface ExclusionsManagerProps {
  participants: ParticipantFormEntry[];
  exclusions: Exclusion[];
  setExclusions: (exclusions: Exclusion[]) => void;
}

const ExclusionsManager: React.FC<ExclusionsManagerProps> = ({ participants, exclusions, setExclusions }) => {
  const [newExclusion, setNewExclusion] = useState<Exclusion>({ invitee_id: 0, invitee_type: 'user', excluded_invitee_id: 0, excluded_invitee_type: 'user', reciprocal: true });
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
      const invitee = participants.find(p => p.id === newExclusion.invitee_id && p.type === newExclusion.invitee_type);
      const excluded = participants.find(p => p.id === newExclusion.excluded_invitee_id && p.type === newExclusion.excluded_invitee_type);
      const exclusionToAdd = {
        ...newExclusion,
        invitee_type: invitee?.type || 'user',
        excluded_invitee_type: excluded?.type || 'user',
        reciprocal: !!newExclusion.reciprocal
      };
      let newList = [...exclusions, exclusionToAdd];
      if (newExclusion.reciprocal) {
        // Add the reverse exclusion if not already present
        if (!exclusions.some(e => e.invitee_id === newExclusion.excluded_invitee_id && e.invitee_type === (excluded?.type || 'user') && e.excluded_invitee_id === newExclusion.invitee_id && e.excluded_invitee_type === (invitee?.type || 'user'))) {
          newList.push({
            invitee_id: newExclusion.excluded_invitee_id,
            invitee_type: excluded?.type || 'user',
            excluded_invitee_id: newExclusion.invitee_id,
            excluded_invitee_type: invitee?.type || 'user',
            reciprocal: true
          });
        }
      }
      setExclusions(newList);
      setNewExclusion({ invitee_id: 0, invitee_type: 'user', excluded_invitee_id: 0, excluded_invitee_type: 'user', reciprocal: true });
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

  return (
    <div className="mt-4">
      {exclusions.map((ex, idx) => (
        <div key={`${ex.invitee_type}-${ex.invitee_id}_x_${ex.excluded_invitee_type}-${ex.excluded_invitee_id}_${idx}`} className="flex items-center gap-2 mb-1">
          <span className="text-black">
            {participants.find(p => p.invitee_id === ex.invitee_id && p.type === ex.invitee_type)?.username || "?"} cannot draw {participants.find(p => p.invitee_id === ex.excluded_invitee_id && p.type === ex.excluded_invitee_type)?.username || "?"}
          </span>
          <input
            type="checkbox"
            checked={!!ex.reciprocal}
            disabled
            className="ml-2"
            title="Reciprocal exclusion"
          />
          <span className="text-xs text-gray-500">reciprocal</span>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 ml-2"
            onClick={() => handleRemove(idx)}
            aria-label="Remove exclusion"
          >
            &#10005;
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <select
          value={newExclusion.invitee_id ? `${newExclusion.invitee_type}-${newExclusion.invitee_id}` : ''}
          onChange={e => {
            const [type, idStr] = e.target.value.split('-');
            const id = Number(idStr);
            const participant = participants.find(p => p.invitee_id === id && p.type === type);
            setNewExclusion({ ...newExclusion, invitee_id: id, invitee_type: type as 'user' | 'child' });
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
            const participant = participants.find(p => p.invitee_id === id && p.type === type);
            setNewExclusion({ ...newExclusion, excluded_invitee_id: id, excluded_invitee_type: type as 'user' | 'child' });
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
