import { query } from "@/lib/db";
import { InviteeType, Pairing } from "@/type";

export class PairingRepository {

  async findById(id: number): Promise<Pairing | null> {
    const result = await query<Pairing>(
      `SELECT * FROM pairings WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<Pairing[]> {
    const result = await query<Pairing>(`SELECT * FROM pairings`);
    return result.rows;
  }

  async findByGiver(giverId: number, giverType: InviteeType): Promise<Pairing[]> {
    const result = await query<Pairing>(
      `SELECT * FROM pairings WHERE giver_id = $1 AND giver_type = $2`,
      [giverId, giverType]
    );
    return result.rows;
  }

  async findByReceiver(receiverId: number, receiverType: InviteeType): Promise<Pairing[]> {
    const result = await query<Pairing>(
      `SELECT * FROM pairings WHERE receiver_id = $1 AND receiver_type = $2`,
      [receiverId, receiverType]
    );
    return result.rows;
  }

  async create(data: {
    event_id: number;
    giver_id: number;
    giver_type: InviteeType;
    receiver_id: number;
    receiver_type: InviteeType;
  }): Promise<Pairing> {
    const result = await query<Pairing>(
      `INSERT INTO pairings (event_id, giver_id, giver_type, receiver_id, receiver_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.event_id, data.giver_id, data.giver_type, data.receiver_id, data.receiver_type]
    );
    return result.rows[0];
  }

  async update(id: number, data: {
    event_id: number;
    giver_id: number;
    giver_type: InviteeType;
    receiver_id: number;
    receiver_type: InviteeType;
  }): Promise<Pairing> {
    const result = await query<Pairing>(
      `UPDATE pairings
       SET event_id = $1, giver_id = $2, giver_type = $3, receiver_id = $4, receiver_type = $5
       WHERE id = $4
       RETURNING *`,
      [data.event_id, data.giver_id, data.giver_type, data.receiver_id, data.receiver_type, id]
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM pairings WHERE id = $1`, [id]);
  }
}

export const pairingRepository = new PairingRepository();
