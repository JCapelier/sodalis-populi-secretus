import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import type { SessionStrategy } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { redirect } from "next/dist/server/api-utils";

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
          password_hash: string;
        };
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;
        return { id: String(user.id), username: user.username, email: "" };
      },
    }),
  ],
  session: { strategy: "jwt" as SessionStrategy },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: unknown }) {
      if (user && typeof user === 'object' && 'id' in user && 'username' in user) {
        token.id = user.id as string;
        token.username = user.username as string;
      }
      return token;
    },
    async session({ session, token }: { session: unknown; token: JWT }) {
      const sess = session as { user?: { id?: string; username?: string; email?: string }; expires: string };
      if (sess.user && token.sub) {
        sess.user.id = token.sub;
      }
      if (sess.user && token.username) {
        sess.user.username = token.username as string;
      }
      return sess;
    },
    async redirect({ url, baseUrl, token }) {
      if (token && token.id) {
        return `/users/${token.id}`;
      }
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
