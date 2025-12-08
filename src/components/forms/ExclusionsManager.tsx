import { ExclusionWithReciprocal, InviteeType, Participant } from "@/type";
import { addNonReciprocalExclusionToList, addReciprocalExclusionToList, getUsernamesForExclusionsFromParticipants, inferReciprocalExclusions, removeNonReciprocalExclusionFromList, removeReciprocalExclusionFromList } from "@/utils/exclusion-utils";
import React, { useState } from "react";


interface ExclusionsManagerProps {
  participants: Participant[];
  exclusions: ExclusionWithReciprocal[];
  setExclusions: (exclusions: ExclusionWithReciprocal[]) => void;
}

const ExclusionsManager: React.FC<ExclusionsManagerProps> = ({ participants, exclusions, setExclusions }) => {
  const [newExclusion, setNewExclusion] = useState<ExclusionWithReciprocal>({ invitee_id: 0, invitee_type: InviteeType.User, excluded_invitee_id: 0, excluded_invitee_type: InviteeType.User, reciprocal: true });

  const handleAdd = () => {
    const newList = newExclusion.reciprocal
      ? addReciprocalExclusionToList(exclusions, newExclusion)
      : addNonReciprocalExclusionToList(exclusions, newExclusion)
    setExclusions(newList);
    setNewExclusion({ invitee_id: 0, invitee_type: InviteeType.User, excluded_invitee_id: 0, excluded_invitee_type: InviteeType.User, reciprocal: true });
  }

  const handleRemove = (index: number) => {
    const removedExclusion = exclusions[index];
    const newList = removedExclusion.reciprocal
      ? removeReciprocalExclusionFromList(exclusions, removedExclusion)
      : removeNonReciprocalExclusionFromList(exclusions, removedExclusion)
    setExclusions(newList);
  };

  const displayExclusionsWithReciprocals = inferReciprocalExclusions(exclusions);
  const displayExclusionsWithReciprocalsAndUsernames = getUsernamesForExclusionsFromParticipants(displayExclusionsWithReciprocals, participants);

  return (
    <div className="mt-4">
      {displayExclusionsWithReciprocalsAndUsernames.map((exclusion, index) => {
        return (
          <div key={`${index}`} className="flex items-center gap-2 mb-1">
            <span className="text-black flex items-center gap-1">
              {exclusion.giverUsername}
              {exclusion.reciprocal ? (
                <span title="Reciprocal exclusion" className="mx-1">&#8646;</span> // double arrow
              ) : (
                <span title="One-way exclusion" className="mx-1">&#8594;</span> // single arrow
              )}
              {exclusion.receiverUsername}
            </span>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 ml-2"
              onClick={() => handleRemove(index)}
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
