import { apiGet, apiPut } from "@/lib/api";
import { ChildIdAndParentsUsernames, InviteeKey, InviteeSearchResult, InviteeType, Participant } from "@/type";
import { getFullSuggestions } from "@/utils/invitee-utils";

export class InviteeService {

  static async getParentsInfoFromChildrenAutocomplete(suggestions: InviteeSearchResult[]): Promise<ChildIdAndParentsUsernames[]> {
    const childIds = suggestions
      .filter((suggestion) => suggestion.type === InviteeType.Child)
      .map((suggestion) => suggestion.id)

    const result = await apiGet<{childId: number, parentUsername: string, otherParentUsername?: string}[]>(
      `/api/children/parents-username-by-ids?ids=${childIds}`
    );

    return result
  }

  static async getSuggestions(searchEndPoint: string, search: string): Promise<{ invitee: InviteeSearchResult, parentsInfo: ChildIdAndParentsUsernames | null }[]> {
    const invitees = await apiGet<InviteeSearchResult[]>(`${searchEndPoint}?search=${encodeURIComponent(search)}`);
    const childrenParentsInfo = await this.getParentsInfoFromChildrenAutocomplete(invitees);
    return getFullSuggestions(invitees, childrenParentsInfo)
  }


  static async updateStatusFromInvitedToNotified(eventParticipants: Participant[], inviteeParticipant: Participant) {
    console.log(inviteeParticipant)
      return await apiPut<{updatedParticipant: Participant, updatedEventParticipants: Participant[], updatedEvent: Event}>(
        `/api/event-participants/${inviteeParticipant.id}`,
        {eventParticipants: eventParticipants})
  }
}
