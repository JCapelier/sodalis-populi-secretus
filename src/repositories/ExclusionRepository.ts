import { query } from "@/lib/db";
import { Exclusion, InviteeType } from "@/type";

export class ExclusionRepository {

  async findById(id: number): Promise<Exclusion | null> {
    const result = await query<Exclusion>(
      `SELECT * FROM exclusions WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<Exclusion[]> {
    const result = await query<Exclusion>(`SELECT * FROM exclusions`);
    return result.rows;
  }

  async findByEventId(eventId: number): Promise<Exclusion[]> {
    const result = await query<Exclusion>(
      `SELECT * FROM exclusions WHERE event_id = $1`,
      [eventId]
    );
    return result.rows;
  }

  async create(data: {
    event_id: number;
    invitee_id: number;
    invitee_type: InviteeType;
    excluded_invitee_id: number;
    excluded_invitee_type: InviteeType;
  }): Promise<Exclusion> {
    const result = await query<Exclusion>(
      `INSERT INTO exclusions (event_id, invitee_id, invitee_type, excluded_invitee_id, excluded_invitee_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.event_id, data.invitee_id, data.invitee_type, data.excluded_invitee_id, data.excluded_invitee_type]
    );
    return result.rows[0];
  }

  async update(id: number, data: {
    event_id: number;
    invitee_id: number;
    invitee_type: InviteeType;
    excluded_invitee_id: number;
    excluded_invitee_type: InviteeType;
  }): Promise<Exclusion> {
    const result = await query<Exclusion>(
      `UPDATE exclusions
       SET event_id = $1, invitee_id = $2, invitee_type = $3, excluded_invitee_id = $4, excluded_invitee_type = $5
       WHERE id = $6
       RETURNING *`,
      [data.event_id, data.invitee_id, data.invitee_type, data.excluded_invitee_id, data.excluded_invitee_type, id]
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM exclusions WHERE id = $1`, [id]);
  }

  async deleteByEventId(eventId: number): Promise<void> {
    await query(`DELETE FROM exclusions WHERE event_id = $1`, [eventId])
  }
}

export const exclusionRepository = new ExclusionRepository();
