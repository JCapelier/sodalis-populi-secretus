import { query } from "@/lib/db";
import { InviteeType, Participant, Status } from "@/type";

export class EventParticipantRepository {

  async findById(id: number): Promise<Participant | null> {
    const result = await query<Participant>(
      `SELECT * FROM event_participants WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEventId(eventId: number): Promise<Participant[]> {
    const result = await query<Participant>(
      `SELECT * FROM event_participants WHERE event_id = $1`,
      [eventId]
    );
    return result.rows;
  }

  async create(data: {
    event_id: number;
    invitee_id: number;
    invitee_type: InviteeType;
    status: Status;
  }): Promise<Participant> {
    const result = await query<Participant>(
      `INSERT INTO event_participants (event_id, invitee_id, invitee_type, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.event_id, data.invitee_id, data.invitee_type, data.status]
    );
    return result.rows[0];
  }

  async update(id: number, data: {
    event_id: number;
    invitee_id: number;
    invitee_type: InviteeType;
    status: Status;
  }): Promise<Participant> {
    const result = await query<Participant>(
      `UPDATE event_participants
       SET event_id = $1, invitee_id = $2, invitee_type = $3, status = $5
       WHERE id = $5
       RETURNING *`,
      [data.event_id, data.invitee_id, data.invitee_type, data.status, id]
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM event_participants WHERE id = $1`, [id]);
  }
}

export const eventParticipantRepository = new EventParticipantRepository();
