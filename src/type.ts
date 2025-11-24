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
      username?: string | null;
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

export type Exclusion = { invitee_id: number; invitee_type: 'child' | 'user', excluded_invitee_id: number; excluded_invitee_type: 'child' | 'user', };
export type Participant = { invitee_id: number; type: 'child' | 'user', username: string };
export type Pairing = { giver_id: number; giver_type: 'child' | 'user', receiver_id: number; receiver_type: 'child' | 'user',}

export interface EventInfo extends Event {
  adminUsername: string;
  participants: Participant[];
  exclusions: Exclusion[];
}
