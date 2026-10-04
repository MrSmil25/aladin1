import { createContext, useContext, useState, type ReactNode } from "react";
import { DEPOSIT_MIN, mock, type UserState } from "@/data/mock";

export type StepView = "menu" | "deposit" | "transact" | "save" | "how";
export type Milestone = (typeof mock.haji.milestones)[number];
export type AppState = {
  userState: UserState;
  dompet: { saldo: number };
  haji: { name: string; saldo: number; target: number; setoranPerMinggu: number };
  autoOn: boolean;
  lockOn: boolean;
  deposits: { label: string; date: string; amount: number }[];
};
export const initialState: AppState = {
  userState: mock.userState, dompet: { ...mock.dompet },
  haji: { name: "Setoran Awal Haji", saldo: mock.haji.saldo, target: mock.haji.target, setoranPerMinggu: mock.haji.setoranPerMinggu },
  autoOn: true, lockOn: true, deposits: [],
};
export function applyDeposit(state: AppState, amount: number): AppState {
  if (!Number.isSafeInteger(amount) || amount < DEPOSIT_MIN || amount > state.dompet.saldo) throw new Error("Nominal setoran tidak valid");
  return { ...state, userState: "aktif", dompet: { saldo: state.dompet.saldo - amount },
    haji: { ...state.haji, saldo: state.haji.saldo + amount },
    deposits: [{ label: "Setor dari Ala Dompet", date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }), amount }, ...state.deposits] };
}
export function crossedMilestones(before: number, after: number) {
  return mock.haji.milestones.filter(m => m.amount > before && m.amount <= after);
}
type AppContextValue = {
  state: AppState; setAppState: (next: Partial<AppState>) => void;
  stepView: StepView | null; openStep: (view?: StepView) => void; closeStep: () => void;
  deposit: (amount: number) => void; celebrations: Milestone[]; dismissCelebration: () => void;
};
// Keep provider/consumer identity aligned when Vite replaces this module.
const AppContext = (import.meta.hot?.data?.appContext as ReturnType<typeof createContext<AppContextValue | null>> | undefined)
  ?? createContext<AppContextValue | null>(null);
if (import.meta.hot?.data) import.meta.hot.data.appContext = AppContext;
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [stepView, setStepView] = useState<StepView | null>(null);
  const [celebrations, setCelebrations] = useState<Milestone[]>([]);
  const deposit = (amount: number) => {
    const next = applyDeposit(state, amount);
    setCelebrations(crossedMilestones(state.haji.saldo, next.haji.saldo));
    setState(next);
    setStepView(null);
  };
  return <AppContext.Provider value={{ state, setAppState: next => setState(s => ({ ...s, ...next })), stepView,
    openStep: (view = "menu") => setStepView(view), closeStep: () => setStepView(null), deposit, celebrations,
    dismissCelebration: () => setCelebrations(s => s.slice(1)) }}>{children}</AppContext.Provider>;
}
export function useAppActions() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppProvider is required");
  return context;
}
export function useAppState() { return useAppActions().state; }
