import { User } from "@/api";

class UserCacheManager {
  private cache: { [userId: string]: User | null } = {};
  private ongoingRequests: { [userId: string]: Promise<User | null> } = {};

  get(userId: string): User | null | undefined {
    return this.cache[userId];
  }

  set(userId: string, user: User | null): void {
    this.cache[userId] = user;
  }

  clear(userId: string): void {
    delete this.cache[userId];
    delete this.ongoingRequests[userId];
  }

  hasOngoingRequest(userId: string): boolean {
    return userId in this.ongoingRequests;
  }

  getOngoingRequest(userId: string): Promise<User | null> | undefined {
    return this.ongoingRequests[userId];
  }

  setOngoingRequest(userId: string, promise: Promise<User | null>): void {
    this.ongoingRequests[userId] = promise;
  }

  clearOngoingRequest(userId: string): void {
    delete this.ongoingRequests[userId];
  }

  clearAll(): void {
    this.cache = {};
    this.ongoingRequests = {};
  }
}

export const userCacheManager = new UserCacheManager();
