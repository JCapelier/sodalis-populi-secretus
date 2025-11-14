import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: number | string;
  }
  interface Session {
    user?: {
      id?: number | string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export type Event = {
  id: number;
  name: string;
  ends_at?: string | null;
  price_limit_cents?: number | null;

};
