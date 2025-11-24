import React, { useState } from "react";
import type { ParticipantFormEntry } from "./EventForm";

interface Exclusion {
  user_id: number;
  excluded_user_id: number;
  reciprocal?: boolean;
}

interface ExclusionsManagerProps {
  participants: ParticipantFormEntry[];
  exclusions: Exclusion[];
  setExclusions: (exclusions: Exclusion[]) => void;
}

const ExclusionsManager: React.FC<ExclusionsManagerProps> = ({ participants, exclusions, setExclusions }) => {
  const [newExclusion, setNewExclusion] = useState<Exclusion>({ user_id: 0, excluded_user_id: 0, reciprocal: true });

  const handleAdd = () => {
    if (
      newExclusion.user_id &&
      newExclusion.excluded_user_id &&
      newExclusion.user_id !== newExclusion.excluded_user_id &&
      !exclusions.some(e => e.user_id === newExclusion.user_id && e.excluded_user_id === newExclusion.excluded_user_id)
    ) {
      let newList = [...exclusions, { ...newExclusion, reciprocal: !!newExclusion.reciprocal }];
      if (newExclusion.reciprocal) {
        // Add the reverse exclusion if not already present
        if (!exclusions.some(e => e.user_id === newExclusion.excluded_user_id && e.excluded_user_id === newExclusion.user_id)) {
          newList.push({ user_id: newExclusion.excluded_user_id, excluded_user_id: newExclusion.user_id, reciprocal: true });
        }
      }
      setExclusions(newList);
      setNewExclusion({ user_id: 0, excluded_user_id: 0, reciprocal: true });
    }
  };

  const handleRemove = (index: number) => {
    const ex = exclusions[index];
    let newList = exclusions.filter((_, i) => i !== index);
    // If reciprocal, remove the reverse as well
    if (ex.reciprocal) {
      newList = newList.filter(e => !(e.user_id === ex.excluded_user_id && e.excluded_user_id === ex.user_id));
    }
    setExclusions(newList);
  };

  return (
    <div className="mt-4">
      {exclusions.map((ex, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-1">
          <span className="text-black">
            {participants.find(p => p.id === ex.user_id)?.username || "?"} cannot draw {participants.find(p => p.id === ex.excluded_user_id)?.username || "?"}
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
          value={newExclusion.user_id}
          onChange={e => setNewExclusion({ ...newExclusion, user_id: Number(e.target.value) })}
          className="border border-gray-400 rounded px-2 py-1 text-black bg-white font-normal w-full"
          style={{ minWidth: '0' }}
        >
          <option value={0}>Select participant</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.username}</option>
          ))}
        </select>
        <span className="text-black font-normal">can&apos;t draw</span>
        <select
          value={newExclusion.excluded_user_id}
          onChange={e => setNewExclusion({ ...newExclusion, excluded_user_id: Number(e.target.value) })}
          className="border border-gray-400 rounded px-2 py-1 text-black bg-white font-normal w-full"
          style={{ minWidth: '0' }}
        >
          <option value={0}>Select participant</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.username}</option>
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
