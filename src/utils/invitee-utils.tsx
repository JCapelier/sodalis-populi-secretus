import { ChildIdAndParentsUsernames, InviteeKey, InviteeSearchResult, InviteeType, Participant } from "@/type";

export function suggestionText(suggestion: { invitee: InviteeSearchResult, parentsInfo: ChildIdAndParentsUsernames | null }) {
  if (suggestion.parentsInfo && suggestion.parentsInfo.otherParentUsername) {
    return (
      <>
        {suggestion.invitee.username} (
        <i>
          child of {suggestion.parentsInfo.parentUsername} and {suggestion.parentsInfo.otherParentUsername}
        </i>
        )
      </>
    );
  }

  if (suggestion.parentsInfo) {
    return (
      <>
        {suggestion.invitee.username} (
        <i>
          child of {suggestion.parentsInfo.parentUsername}
        </i>
        )
      </>
    );
  }

  return suggestion.invitee.username;
}

export function getFullSuggestions(suggestions: InviteeSearchResult[], childrenParentsInfo: ChildIdAndParentsUsernames[]): { invitee: InviteeSearchResult, parentsInfo: ChildIdAndParentsUsernames | null }[] {
  return suggestions.map((suggestion) => {
    const parentsInfo =
      suggestion.type === InviteeType.Child
        ? childrenParentsInfo.find((child) => child.childId === suggestion.id) || null
        : null;
    return {
      invitee: suggestion,
      parentsInfo
    };
  });
}

export function isSameInvitee(invitee: InviteeKey, otherInvitee: InviteeKey): boolean {
  return (
    invitee.id === otherInvitee.id &&
    invitee.type === otherInvitee.type
  );
}

export function areSameInvitees(invitees: InviteeKey[], otherInvitees: InviteeKey[]): boolean {
  const aInB = invitees.every((invitee) => otherInvitees.some((otherInvitee) => isSameInvitee(invitee, otherInvitee)));
  const bInA = otherInvitees.every((otherInvitee) => invitees.some((invitee) => isSameInvitee(invitee, otherInvitee)));
  return (aInB && bInA);
}

export function removeInviteeFromInvited(participant: Participant, invited: Participant[]): Participant[] {
  return invited.filter(invitee =>
    !(invitee.invitee_id === participant.invitee_id && invitee.type === participant.type)
  );
}
