import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from 'bcrypt';

export async function POST(request: Readonly<Request>) {
  try {

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    const body = await request.json();
    const {username, email, password} = body;

    if (!usernameRegex.test(username)) return NextResponse.json({ error: 'Invalid username' }, { status: 400 });

    if (!emailRegex.test(email)) return NextResponse.json({error: 'Invalid email'}, {status: 400});

    if (!passwordRegex.test(password)) return NextResponse.json({error: 'Invalid password'}, {status: 400});

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *`;

    const result = await query(insertQuery, [
      username,
      email,
      hashedPassword,
    ]);

    const newUser = result.rows[0] as { id: number; username: string; email: string };
    return NextResponse.json({ user: { id: newUser.id, username: newUser.username, email: newUser.email } }, { status: 201 });
  } catch (error) {
    console.error('User sign up error', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
