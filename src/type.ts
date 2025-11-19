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

export type PublicUser = { id: number, username: string};

export enum Status {
  Confirmed = "confirmed",
  Pending = "pending",
  Declined = "declined",
}

export type Event = {
  id: number;
  name: string;
  ends_at?: string | null;
  price_limit_cents?: number | null;
  admin_id: number;
};

export type User = {
  id: number;
  email: string;
  username: string;
}

export type EventParticipant = {
  id: number;
  event_id: number;
  user_id: number;
  status: Status;
}

export type EventParticipantFull = {
  id: number;
  event: Event;
  user: User;
  status: Status;
}

export type Exclusion = { user_id: number; excluded_user_id: number };
export type Participant = { user_id: number; username: string };
