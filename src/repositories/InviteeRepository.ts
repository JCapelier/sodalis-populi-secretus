import { query } from "@/lib/db";
import { InviteeType } from "@/type";

export class InviteeRepository {
  async findInviteesByPartialUsername(partialUsername: string) {
    const result = await query<{id: number, type: InviteeType, username: string}>(
      `SELECT id, username, 'user' AS type FROM users WHERE username ILIKE $1
      UNION ALL
      SELECT id, username, 'child' AS type FROM children WHERE username ILIKE $1`,
      [`%${partialUsername}%`]
    );
    return result.rows;
  }
}

export const inviteeRepository = new InviteeRepository();
