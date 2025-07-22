import { betStore, type Group } from '@/lib/betStore';

export class GroupService {
  // Read operations
  static async getGroup(id: string): Promise<Group | undefined> {
    return betStore.getGroup(id);
  }

  static async getUserGroups(userId: string): Promise<Group[]> {
    return betStore.getUserGroups(userId);
  }

  static async getGroupByInviteCode(inviteCode: string): Promise<Group | undefined> {
    return betStore.getGroupByInviteCode(inviteCode);
  }

  // Write operations
  static async createGroup(name: string, creatorId: string): Promise<Group> {
    return betStore.createGroup(name, creatorId);
  }

  static async joinGroup(inviteCode: string, userId: string): Promise<Group | null> {
    return betStore.joinGroup(inviteCode, userId);
  }

  static async updateGroup(id: string, updates: Partial<Pick<Group, 'name'>>): Promise<Group | null> {
    return betStore.updateGroup(id, updates);
  }

  static async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    return betStore.leaveGroup(groupId, userId);
  }
}