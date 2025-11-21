import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import type { SessionStrategy } from "next-auth";

// Export the config object as authOptions
export const authOptions = {
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
        const user = userResult.rows[0] as {
          id: number;
          username: string;
          email: string;
          password_hash: string;
        };
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;
        return { id: user.id, username: user.username, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" as SessionStrategy },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username; // persist username
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.username) {
        session.user.username = token.username;
      }
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
