import { query } from "@/lib/db";
import { InviteeType, Participant, ParticipantStatus } from "@/type";

export class EventParticipantRepository {

  async findByInvitee(id: number, type: InviteeType): Promise<Participant[] | null> {
    const result = await query<Participant>(
      `SELECT * FROM event_participants WHERE invitee_id = $1 AND type = $2`,
      [id, type]
    );
    return result.rows || null;
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
    type: InviteeType;
    status: ParticipantStatus;
  }): Promise<Participant> {
    const result = await query<Participant>(
      `INSERT INTO event_participants (event_id, invitee_id, type, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.event_id, data.invitee_id, data.type, data.status]
    );
    return result.rows[0];
  }

  async createAllParticipantsForEvent(
    event_id: number,
    participants: Participant[]
  ): Promise<Participant[]> {
    if (participants.length === 0) return [];

    const eventIds   = participants.map(() => event_id);
    const inviteeIds = participants.map((p) => p.invitee_id);
    const types      = participants.map((p) => p.type);
    const statuses   = participants.map(() => ParticipantStatus.Invited);

    const sql = `
      INSERT INTO event_participants (event_id, invitee_id, type, status)
      SELECT *
      FROM unnest($1::int[], $2::int[], $3::text[], $4::text[])
      RETURNING *
    `;

    const result = await query<Participant>(sql, [
      eventIds,
      inviteeIds,
      types,
      statuses,
    ]);

    return result.rows;
  }

  async resetParticipantsStatusForEvent(event_id: number): Promise<Participant[]> {
    const result = await query<Participant>(
      `UPDATE event_participants
      SET status = $1
      WHERE event_id = $2
      RETURNING *`,
      [ParticipantStatus.Invited, event_id]
    );
    return result.rows;
  }

  async update(id: number, data: {
    event_id: number;
    invitee_id: number;
    type: InviteeType;
    status: ParticipantStatus;
  }): Promise<Participant> {
    const result = await query<Participant>(
      `UPDATE event_participants
       SET event_id = $1, invitee_id = $2, type = $3, status = $5
       WHERE id = $5
       RETURNING *`,
      [data.event_id, data.invitee_id, data.type, data.status, id]
    );
    return result.rows[0];
  }

  async updateStatusToNotified(id: number): Promise<Participant> {
    const result = await query<Participant>(
      `UPDATE event_participants
      SET status = $1
      WHERE id = $2
      RETURNING *`,
      [ParticipantStatus.Notified, id]
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM event_participants WHERE id = $1`, [id]);
  }

  async deleteByInviteeIdAndType(id: number, type: InviteeType): Promise<void> {
    await query(`DELETE FROM event_participants WHERE invitee_id = $1 AND type = $2`,
      [id, type]
    )
  }
}

export const eventParticipantRepository = new EventParticipantRepository();
