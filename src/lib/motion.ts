export const dur = { micro: 0.15, standard: 0.25, emphasis: 0.4, celebrate: 0.9, count: 0.45, scene: 0.8, timeline: 1.4, shimmer: 1.2, pulse: 2.4, twinkle: 6, loading: 0.7, skeleton: 0.6 };
export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeIn = [0.4, 0, 1, 1] as const;
export const easeInOut = [0.42, 0, 0.58, 1] as const;
export const linear = [0, 0, 1, 1] as const;
export const delay = { first: 0.1, short: 0.08, stagger: 0.04, step: 0.28, shine: 0.5, roll: 0.7, settle: 2, notice: 1.6, path: 0.3 };
export const phaseMs = { done: 500, deposit: 700, celebrate: 800, finish: 2600, firstLoad: 600 };
export const motionCss = { "--motion-twinkle": `${dur.twinkle}s`, "--motion-loading": `${dur.loading}s`, "--motion-skeleton": `${dur.skeleton}s`, "--motion-ease": `cubic-bezier(${easeOut.join(",")})`, "--motion-ease-in-out": `cubic-bezier(${easeInOut.join(",")})` };
export const spring = { type: "spring", stiffness: 380, damping: 32 } as const;
export const press = { whileTap: { scale: 0.97 }, transition: spring };

export const staggerParent = (enabled: boolean) => ({
  initial: enabled ? "hidden" : false,
  animate: "show",
    variants: { hidden: {}, show: { transition: { staggerChildren: delay.stagger } } },
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
