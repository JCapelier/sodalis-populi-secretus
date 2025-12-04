import { apiGet } from "@/lib/api";
import { ChildIdAndParentsUsernames, InviteeKey, InviteeSearchResult, InviteeType, Participant } from "@/type";

export class InviteeService {
  static isSameInvitee(invitee: InviteeKey, otherInvitee: InviteeKey): boolean {
    return (
      invitee.id === otherInvitee.id &&
      invitee.type === otherInvitee.type
    );
  }

  static areSameInvitees(invitees: InviteeKey[], otherInvitees: InviteeKey[]): boolean {
    const aInB = invitees.every((invitee) => otherInvitees.some((otherInvitee) => this.isSameInvitee(invitee, otherInvitee)));
    const bInA = otherInvitees.every((otherInvitee) => invitees.some((invitee) => this.isSameInvitee(invitee, otherInvitee)));
    return (aInB && bInA);
  }

  static removeInviteeFromInvited(participant: Participant, invited: Participant[]): Participant[] {
    return invited.filter(invitee =>
      !(invitee.invitee_id === participant.invitee_id && invitee.type === participant.type)
    );
  }

  static async getParentsInfoFromChildrenAutocomplete(suggestions: InviteeSearchResult[]): Promise<ChildIdAndParentsUsernames[]> {
    const childIds = suggestions
      .filter((suggestion) => suggestion.type === InviteeType.Child)
      .map((suggestion) => suggestion.id)

    return await apiGet<{childId: number, parentUsername: string, otherParentUsername?: string}[]>(
      `/api/children/parents-username-by-ids?ids=${childIds}`
    );
  }

  static getFullSuggestions(suggestions: InviteeSearchResult[], childrenParentsInfo: ChildIdAndParentsUsernames[]): { invitee: InviteeSearchResult, parentsInfo: ChildIdAndParentsUsernames | null }[] {
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

  static async getSuggestions(searchEndPoint: string, search: string): Promise<{ invitee: InviteeSearchResult, parentsInfo: ChildIdAndParentsUsernames | null }[]> {
    const invitees = await apiGet<InviteeSearchResult[]>(`${searchEndPoint}?search=${encodeURIComponent(search)}`);
    const childrenParentsInfo = await this.getParentsInfoFromChildrenAutocomplete(invitees);
    return this.getFullSuggestions(invitees, childrenParentsInfo)
  }

  static suggestionText(suggestion: { invitee: InviteeSearchResult, parentsInfo: ChildIdAndParentsUsernames | null }) {
    if (suggestion.parentsInfo && suggestion.parentsInfo.otherParentUsername) return `${suggestion.invitee.username} (<i>child of ${suggestion.parentsInfo.parentUsername} and ${suggestion.parentsInfo.otherParentUsername}</i>)`

    if (suggestion.parentsInfo) return `${suggestion.invitee.username} (<i>child of ${suggestion.parentsInfo.parentUsername})`

    return suggestion.invitee.username;
  }
}
