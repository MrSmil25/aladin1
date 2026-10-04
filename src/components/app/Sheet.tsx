import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { dur, spring } from "@/lib/motion";

export function Portal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.getElementById("sheet-root")), []);
  return el ? createPortal(children, el) : null;
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="absolute inset-0 z-40">
            <motion.div className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.standard }} onClick={onClose} />
            <motion.div role="dialog" aria-label={title} className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-[28px] bg-background px-5 pb-8 pt-3"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}>
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <div className="mt-3">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
