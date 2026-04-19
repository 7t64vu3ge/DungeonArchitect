export interface IMatchmakingService {
  addToQueue(userId: string): void;
  removeFromQueue(userId: string): void;
  isInQueue(userId: string): boolean;
  findMatch(): [string, string] | null;
}

export class MatchmakingService implements IMatchmakingService {
  private queue: Set<string> = new Set();

  public addToQueue(userId: string): void {
    this.queue.add(userId);
  }

  public removeFromQueue(userId: string): void {
    this.queue.delete(userId);
  }

  public isInQueue(userId: string): boolean {
    return this.queue.has(userId);
  }

  public findMatch(): [string, string] | null {
    if (this.queue.size >= 2) {
      const it = this.queue.values();
      const p1 = it.next().value!;
      const p2 = it.next().value!;
      this.removeFromQueue(p1);
      this.removeFromQueue(p2);
      return [p1, p2];
    }
    return null;
  }
}
