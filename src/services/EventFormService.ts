import { apiGet, apiPost, apiPut } from "@/lib/api";
import { Event, EventInfo, EventPayload, Exclusion, Participant } from "@/type";
import { ExclusionService } from "./ExclusionService";

export class EventFormService {
  static async fetchEvent(eventId: number): Promise<Event> {
    return await apiGet<Event>(`/api/events/${eventId}`)
  }

  static async fetchEventParticipants(eventId: number): Promise<Participant[]> {
    return await apiGet<Participant[]>(`/api/event-participants/by-event-id?event-id=${eventId}`);
  }

  static async fetchEventExclusions(eventId: number): Promise<Exclusion[]> {
    return await apiGet<Exclusion[]>(`/api/exclusions/by-event-id?event-id=${eventId}`)
  }

  static async fetchEventFormData(eventId: number): Promise<(EventInfo & {participants: Participant[], exclusions: Exclusion[]})> {
    const [event, participants, rawExclusions] = await Promise.all([
      this.fetchEvent(eventId),
      this.fetchEventParticipants(eventId),
      this.fetchEventExclusions(eventId),
    ]);

    const adminUsername: string = await apiGet(`/api/users/username-by-user-id?user-id=${event.admin_id}`)
    const fullExclusions = ExclusionService.inferReciprocalExclusions(rawExclusions)

    return {
      ...event,
      adminUsername,
      participants,
      exclusions: fullExclusions
    }
  }

  static async submitEventForm(isEdit: boolean, eventId: number, payload: EventPayload) {
    if (isEdit && eventId) {
      return await apiPut(`/api/events/${eventId}`, payload);
    } else {
      return await apiPost(`/api/events`, payload);
    }
  }
}
