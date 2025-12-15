import { query } from "@/lib/db";
import { Event, EventStatus } from "@/type";

export class EventRepository {

  async findById(id: number): Promise<Event | null> {
    const result = await query<Event>(
      `SELECT * FROM events WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<Event[]> {
    const result = await query<Event>(`SELECT * FROM events`);
    return result.rows;
  }

  async findByAdminId(adminId: number): Promise<Event[]> {
    const result = await query<Event>(
      `SELECT * FROM events WHERE admin_id = $1`,
      [adminId]
    );
    return result.rows;
  }

  async findByChildParticipant(childId: number): Promise<Event[]> {
    const result = await query<Event>(
      `SELECT e.* FROM events e
      JOIN event_participants ep ON ep.event_id = e.id
      WHERE ep.invitee_id = $1 AND ep.type = 'child'`,
      [childId]
    )
    return result.rows
  }

  async findByUserParticipant(userId: number): Promise<Event[]> {
    const result = await query<Event>(
      `SELECT e.* FROM events e
      JOIN event_participants ep ON ep.event_id = e.id
      WHERE ep.invitee_id = $1 AND ep.type = 'user' AND e.admin_id != $1`,
      [userId]
    )
    return result.rows
  }

  async create(data: {
    name: string;
    ends_at: string;
    admin_id: number;
    price_limit_cents: number | null;
  }): Promise<Event> {
    const result = await query<Event>(
      `INSERT INTO events (name, ends_at, admin_id, price_limit_cents)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.ends_at, data.admin_id, data.price_limit_cents]
    );
    return result.rows[0];
  }

  async updateStatusToActive(id: number) {
    const result = await query<Event>(
      `UPDATE events
      SET status = $1
      WHERE id = $2
      RETURNING *`,
      [EventStatus.Active, id]
    );
    return result.rows[0];
  }

  async update(id: number, data: {
    name: string;
    ends_at: string;
    price_limit_cents: number | null;
  }): Promise<Event> {
    const result = await query<Event>(
      `UPDATE events
       SET name = $1, ends_at = $2, price_limit_cents = $3
       WHERE id = $4
       RETURNING *`,
      [data.name, data.ends_at, data.price_limit_cents, id]
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM events WHERE id = $1`, [id]);
  }
}

export const eventRepository = new EventRepository();
