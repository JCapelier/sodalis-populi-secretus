import { Participant } from "@/type";
import React from "react";

type ParticipantsListProps = {
	participants: Participant[];
};

export default function ParticipantsList({ participants }: ParticipantsListProps) {
	if (!participants.length) {
		return <div className="text-gray-500">No participants yet.</div>;
	}
	return (
		<ul className="participants-list divide-y divide-gray-200 mt-4">
			{participants.map((participant) => (
				<li key={participant.invitee_id} className="flex items-center py-2">
					<span className="font-medium mr-2">{participant.username}</span>
				</li>
			))}
		</ul>
	);
};
