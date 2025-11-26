import { query } from "@/lib/db";
import { User, UserRow } from "@/type";

export class UserRepository {

  async findByUsernameForAuth(username: string): Promise<UserRow | null> {
    const result = await query<UserRow>(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }

  // For public use - no sensitive data
  async findById(id: number): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, username FROM users WHERE id = $1`,  // Only select safe fields
      [id]
    );
    return result.rows[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, username FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
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

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, id]
    );
  }

  async updateUsername(id: number, username: string): Promise<void> {
    await query(
      `UPDATE users SET username = $1 WHERE id = $2`,
      [username, id]
    );
  }
}
