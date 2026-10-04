import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { dur, spring } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function Portal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.getElementById("sheet-root")), []);
  return el ? createPortal(children, el) : null;
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const scroll = document.getElementById("pitch-scroll") ?? document.getElementById("app-scroll");
    const overflow = scroll?.style.overflow;
    if (scroll) scroll.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => dialog.current?.focus());
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
      if (event.key !== "Tab") return;
      const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]') ?? []);
      const first = items[0]; const last = items.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keyboard);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", keyboard); if (scroll) scroll.style.overflow = overflow ?? ""; if (previous instanceof HTMLElement) previous.focus(); };
  }, [open]);
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="absolute inset-0 z-40">
            <motion.div className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.standard }} onClick={onClose} />
            <motion.div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg max-h-[85%] overflow-y-auto overflow-x-hidden rounded-t-[28px] bg-background px-5 pb-8 pt-3 outline-none"
              initial={{ y: reduce ? 0 : "100%" }} animate={{ y: 0 }} exit={{ y: reduce ? 0 : "100%" }} transition={reduce ? { duration: 0 } : spring}>
              <motion.div drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.3} onDragEnd={(_, info) => { if (info.offset.y > 55 || info.velocity.y > 450) onClose(); }} className="-mx-5 flex h-7 touch-none items-start justify-center cursor-grab"><div className="h-1 w-10 rounded-full bg-muted" /></motion.div>
              <div className="flex items-center justify-between gap-2"><h3 className="text-xl font-semibold">{title}</h3><Button variant="ghost" size="icon" aria-label="Tutup sheet" onClick={onClose}><X /></Button></div>
              <div className="mt-3">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
