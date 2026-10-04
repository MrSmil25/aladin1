import { useSyncExternalStore } from "react";
import { mock, type UserState } from "@/data/mock";

// In-memory global state (no backend). Resets on reload.
export type AppState = {
  userState: UserState;
  haji: { name: string; saldo: number; target: number; setoranPerMinggu: number };
};

let state: AppState = {
  userState: mock.userState,
  haji: { name: "Setoran Awal Haji", saldo: mock.haji.saldo, target: mock.haji.target, setoranPerMinggu: mock.haji.setoranPerMinggu },
};
const subs = new Set<() => void>();

export function setAppState(next: Partial<AppState>) {
  state = { ...state, ...next };
  subs.forEach((f) => f());
}
export function useAppState() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => state,
    () => state,
  );
}
