export type PublicUser = { id: number, username: string};

export enum ParticipantStatus {
  Invited = "invited",
  Notified = "notified",
}

export enum EventStatus {
  Pending = 'pending',
  Active = 'active',
  Closed = 'closed'
}

export enum InviteeType {
  Child = 'child',
  User = 'user'
}

export type Event = {
  id: number;
  name: string;
  ends_at?: string | null;
  price_limit_cents?: number | null;
  admin_id: number;
};

export type UserRow = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}
export type User = {
  id: number;
  username: string;
}

export type EventParticipant = {
  id: number;
  event_id: number;
  user_id: number;
  status: ParticipantStatus;
}

export type Exclusion = { id?: number, invitee_id: number; invitee_type: InviteeType, excluded_invitee_id: number; excluded_invitee_type: InviteeType, event_id?: number };
export type Participant = { id?: number, event_id?: number, invitee_id: number; type: InviteeType, status?: ParticipantStatus, username: string };
export type Pairing = { giver_id: number; giver_type: InviteeType, receiver_id: number; receiver_type: InviteeType,}

export interface EventInfo extends Event {
  adminUsername?: string;
  participants: Participant[];
  exclusions: Exclusion[];
}

export type Child = {
  id: number;
  parent_id: number;
  other_parent_id: number;
  username: string;
}

export type ExclusionWithUsernames = Exclusion & {
  giverUsername: string;
  receiverUsername: string
}

export type ExclusionWithReciprocal = Exclusion & {
  reciprocal?: boolean;
};

export type ExclusionWithUsernamesAndReciprocal = ExclusionWithReciprocal & ExclusionWithUsernames

export type InviteeSearchResult = {
  id: number;
  username: string;
  type: InviteeType;
};

export type InviteeKey = {
  id: number;
  type: InviteeType
}

export type EventPayload = {
  name: string;
  admin_id: number;
  ends_at: string;
  price_limit_cents: number | null;
  participants: Participant[];
  exclusions: ExclusionWithReciprocal[]
}

export type ChildIdAndParentsUsernames = {
  childId: number;
  parentUsername: string;
  otherParentUsername?: string;
}
