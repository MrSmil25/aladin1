import { animate, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { delay as motionDelay, dur, easeOut, phaseMs, press } from "@/lib/motion";
import { formatRp } from "@/lib/estimate";
import { mock } from "@/data/mock";

export const notInPrototype = () => toast(mock.notInPrototype);

export function Money({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(value);
  const previous = useRef(value);
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (reduce) return setV(value);
    const c = animate(from, value, { duration: dur.count, ease: easeOut, onUpdate: setV });
    return () => c.stop();
  }, [value, reduce]);
  return <span className={`tabular ${className ?? ""}`}>{formatRp(v)}</span>;
}

export function Progress({ pct, layoutId, track = "bg-muted", delay = motionDelay.first }: { pct: number; layoutId?: string; track?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const safePct = Math.max(0, Math.min(100, pct));
  return (
    <motion.div {...(layoutId ? { layoutId } : {})} className={`relative h-2 w-full rounded-full ${track}`}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-mint"
        initial={{ width: 0 }}
        animate={{ width: `${safePct}%` }}
        transition={{ duration: reduce ? 0 : 0.45, ease: easeOut, delay: reduce ? 0 : delay }}
      >
        <span className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-mint shadow-[var(--shadow-glow)]" />
      </motion.div>
    </motion.div>
  );
}

export function Pressable({ children, className, onClick, label }: { children: ReactNode; className?: string; onClick?: () => void; label?: string }) {
  return (
    <motion.button type="button" aria-label={label} onClick={onClick} className={className} {...press}>
      {children}
    </motion.button>
  );
}

export function Kaaba({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M8 13l12-5 12 5v17l-12 4-12-4z" fill="currentColor" opacity=".95" />
      <path d="M8 13l12 4 12-4M20 17v17" stroke="var(--mint)" strokeWidth="1.2" fill="none" opacity=".5" />
      <path d="M8 18l12 4 12-4" stroke="var(--profit)" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-2xl ${className ?? ""}`} />;
}

export function useFirstLoad(show: boolean) {
  const [loading, setLoading] = useState(show);
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [show]);
  return loading;
}
