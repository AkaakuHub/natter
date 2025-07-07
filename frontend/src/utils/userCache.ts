import { User } from "@/api";

class UserCacheManager {
  private cache: { [twitterId: string]: User | null } = {};
  private ongoingRequests: { [twitterId: string]: Promise<User | null> } = {};

  get(twitterId: string): User | null | undefined {
    return this.cache[twitterId];
  }

  set(twitterId: string, user: User | null): void {
    this.cache[twitterId] = user;
  }

  clear(twitterId: string): void {
    delete this.cache[twitterId];
    delete this.ongoingRequests[twitterId];
  }

  hasOngoingRequest(twitterId: string): boolean {
    return twitterId in this.ongoingRequests;
  }

  getOngoingRequest(twitterId: string): Promise<User | null> | undefined {
    return this.ongoingRequests[twitterId];
  }

  setOngoingRequest(twitterId: string, promise: Promise<User | null>): void {
    this.ongoingRequests[twitterId] = promise;
  }

  clearOngoingRequest(twitterId: string): void {
    delete this.ongoingRequests[twitterId];
  }
}

export const userCacheManager = new UserCacheManager();
