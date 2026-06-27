export const AUTH_CHANGED_EVENT = "dume:auth-changed";
export const TASKS_CHANGED_EVENT = "dume:tasks-changed";
export const STATS_CHANGED_EVENT = "dume:stats-changed";

export function emitClientEvent(eventName: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(eventName));
  }
}
