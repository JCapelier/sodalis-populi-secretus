import { Exclusion } from "@/type";

export function buildReciprocalExclusion(exclusion: Exclusion): Exclusion {
  return ({
    invitee_id: exclusion.excluded_invitee_id,
    invitee_type: exclusion.excluded_invitee_type,
    excluded_invitee_id: exclusion.invitee_id,
    excluded_invitee_type: exclusion.invitee_type
  });
}
