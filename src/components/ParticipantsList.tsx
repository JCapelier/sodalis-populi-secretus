import { EventParticipantFull } from "@/type";
import React from "react";
import { ParticipantFormEntry } from "./forms/EventForm";

type ParticipantsListProps = {
	participants: ParticipantFormEntry[];
};

const statusColors: Record<string, string> = {
	confirmed: "bg-green-200 text-green-800",
	pending: "bg-yellow-200 text-yellow-800",
	declined: "bg-red-200 text-red-800",
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
					{participant.status && (
						<span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${statusColors[participant.status] || "bg-gray-200 text-gray-700"}`}>
							{participant.status}
						</span>
					)}
				</li>
			))}
		</ul>
	);
};
