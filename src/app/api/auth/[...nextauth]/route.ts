import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { username, password } = credentials;
        const userResult = await query(
          "SELECT * FROM users WHERE username = $1",
          [username]
        );
        const user = userResult.rows[0];
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;
        return { id: user.id, username: user.username, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };