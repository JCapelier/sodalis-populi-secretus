import { query } from "@/lib/db";
import { Child } from "@/type";

export class ChildRepository {

  async findById(id: number): Promise<Child> {
    const result = await query<Child>(
      `SELECT * FROM children WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIds(ids: number[]): Promise<Child[]> {
    if (ids.length === 0) return [];
    const result = await query<Child>(
      `SELECT id, username FROM children WHERE id = ANY($1)`,
      [ids]
    );
    return result.rows;
  }

  async findAll(): Promise<Child[]> {
    const result = await query<Child>(`SELECT * FROM children`);
    return result.rows;
  }

  async findByParentId(parentId: number): Promise<Child[]> {
    const result = await query<Child>(
      `SELECT * FROM children WHERE parent_id = $1 OR other_parent_id = $1`,
      [parentId]
    );
    return result.rows;
  }

  async getParentIds(id: number): Promise<{parent_id: number, other_parent_id: number | null}> {
    const result = await query<{ parent_id: number; other_parent_id: number | null }>(
      `SELECT parent_id, other_parent_id FROM children WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null
  }

  async getParentsUsernamesFromIds(ids: number[]): Promise<{childId: number, parentUsername: string, otherParentUsername: string}[]> {
    if (ids.length === 0) return [];
    const result = await query<{
      childId: number,
      parentUsername: string,
      otherParentUsername: string
    }>(
      `
      SELECT
        c.id AS "childId",
        u1.username AS "parentUsername",
        u2.username AS "otherParentUsername"
      FROM children c
      LEFT JOIN users u1 ON c.parent_id = u1.id
      LEFT JOIN users u2 ON c.other_parent_id = u2.id
      WHERE c.id = ANY($1)
      `,
      [ids]
    );
    return result.rows;
  }

  async create(data: {
    username: string;
    parent_id: string;
    other_parent_id: number;
  }): Promise<Child> {
    const result = await query<Child>(
      `INSERT INTO children (username, parent_id, other_parent_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.username, data.parent_id, data.other_parent_id]
    );
    return result.rows[0];
  }

  async update(id: number, data: {
    username: string;
    parent_id: string;
    other_parent_id: number;
  }): Promise<Child> {
    const result = await query<Child>(
      `UPDATE children
       SET username = $1, parent_id = $2, other_parent_id = $3
       WHERE id = $4
       RETURNING *`,
      [data.username, data.parent_id, data.other_parent_id, id]
    );
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM children WHERE id = $1`, [id]);
  }
}

export const childRepository = new ChildRepository();
