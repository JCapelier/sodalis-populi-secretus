import { query } from "@/lib/db";
import { InviteeType, User, UserRow } from "@/type";

export class UserRepository {

  async findByUsernameForAuth(username: string): Promise<UserRow> {
    const result = await query<UserRow>(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  }

  // For public use - no sensitive data
  async findById(id: number): Promise<User> {
    const result = await query<User>(
      `SELECT id, username FROM users WHERE id = $1`,  // Only select safe fields
      [id]
    );
    return result.rows[0];
  }

  async findByIds(ids: number[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const result = await query<User>(
      `SELECT id, username FROM users WHERE id = ANY($1)`,
      [ids]
    );
    return result.rows;
  }

  async findByUsername(username: string): Promise<User> {
    const result = await query<User>(
      `SELECT id, username FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  }

  async findUsersByPartialUsernam(partialUsername: string | null) {
    const result = await query<{id: number, type: InviteeType, username: string}>(
      `SELECT id, username, 'user' AS type FROM users WHERE username ILIKE $1`,
      [`%${partialUsername}%`]
    );
    return result.rows;
  }
  
  async getPasswordHashById(id: number): Promise<string> {
    const result = await query<{password_hash: string}>(
      `SELECT password_hash FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0].password_hash
  }

  async create(data: {
    username: string;
    email: string;
    password_hash: string;
  }): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username`,  // Only return safe fields
      [data.username, data.email, data.password_hash]
    );
    return result.rows[0];
  }

  async updatePassword(id: number, passwordHash: string): Promise<User> {
    const result = await query<User>(
      `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, username`,
      [passwordHash, id]
    );
    return result.rows[0];
  }

  async updateUsername(id: number, username: string): Promise<User> {
    const result = await query<User>(
      `UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username`,
      [username, id]
    );
    return result.rows[0];
  }
}

export const userRepository = new UserRepository();
