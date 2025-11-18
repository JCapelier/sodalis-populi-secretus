import React from "react";
import { query } from "@/lib/db";
import EventDetails from "@/components/EventDetails";
import ParticipantsList from "@/components/ParticipantsList";
import { Event } from "@/type";

async function fetchEvent(eventId: number) {
  const fetchEventByIdQuery = `SELECT * FROM events WHERE id = $1`;

  const result = await query(fetchEventByIdQuery, [eventId]);
  if (!result) {
    console.log('Fetching failed')
    return;
  } else {
    return result.rows[0];
  }
}

async function fetchUsernameByUserId(userId: number) {
  const fetchUsernameByUserIdQuery = 'SELECT username FROM users WHERE id = $1';
  const result = await query(fetchUsernameByUserIdQuery, [userId]);

  if (!result) {
    console.log('Failed fetching username by user id');
    return;
  } else {
    return result.rows[0];
  }
}
async function fetchEventParticipants(eventId: number) {
  const fetchEventParticipantsQuery = `SELECT id, user_id, status FROM event_participants WHERE event_id = $1`;

  const result = await query(fetchEventParticipantsQuery, [eventId]);
  if (!result) {
    console.log('Fetching participants failed');
    return;
  } else {
    return Promise.all(
      result.rows.map(async (participant) => {
        const user = await fetchUsernameByUserId(participant.user_id);
        return {
          id: participant.id,
          user_id: participant.user_id,
          status: participant.status,
          username: user?.username ?? "Unknown",
        };
      })
    );
  }
}

export default async function EventShowPage({params}) {
  const { id } = await params;
  console.log(id)
  const event: Event = await fetchEvent(id);
  const participants = await fetchEventParticipants(id);

	return (
		<main className="max-w-2xl mx-auto p-4">
			<EventDetails
				event={event}
			/>
			<h3 className="mt-8 mb-2 text-xl font-semibold">Participants</h3>
			<ParticipantsList participants={participants} />
		</main>
	);
};
