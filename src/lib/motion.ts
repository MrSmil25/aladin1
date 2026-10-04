export const dur = { micro: 0.15, standard: 0.25, emphasis: 0.4, celebrate: 0.9 };
export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeIn = [0.4, 0, 1, 1] as const;
export const spring = { type: "spring", stiffness: 380, damping: 32 } as const;
export const press = { whileTap: { scale: 0.97 }, transition: spring };

export const staggerParent = (enabled: boolean) => ({
  initial: enabled ? "hidden" : false,
  animate: "show",
  variants: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
});
export const staggerChild = {
  variants: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: dur.standard, ease: easeOut } },
  },
};

// Pages animated in this session (first-open stagger only).
const seen = new Set<string>();
export function firstVisit(key: string) {
  if (typeof window === "undefined") return true;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}
