import { apiPost } from "@/lib/api"
import { Child } from "@/type"

export class ChildService {
  static async submitChildCreation(username: string, parentId: number, otherParentId?: number) {
    const payload = {
      username: username,
      parent_id: parentId,
      other_parent_id: otherParentId ? otherParentId : null
    }

    return await apiPost<Child>(`/api/users/${parentId}/children`, payload);
  }
}
