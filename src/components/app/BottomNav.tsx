import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, QrCode, Wallet } from "lucide-react";
import { press } from "@/lib/motion";
import { notInPrototype } from "./primitives";

export function BottomNav() {
  const item = "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium";
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 flex items-center rounded-t-3xl border-t bg-background px-4 pb-4 pt-2 shadow-[var(--shadow-card)]">
      <Link to="/" className={item} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} inactiveProps={{ className: "text-muted-foreground" }}>
        <Home size={24} strokeWidth={1.75} />Beranda
      </Link>
      <motion.button {...press} onClick={notInPrototype} aria-label="QRIS" className="flex h-12 w-28 items-center justify-center gap-1 rounded-full bg-navy text-sm font-semibold text-primary-foreground shadow-[var(--shadow-navy)]">
        <QrCode size={22} strokeWidth={1.75} />QRIS
      </motion.button>
      <Link to="/keuangan" className={item} activeProps={{ className: "text-primary" }} inactiveProps={{ className: "text-muted-foreground" }}>
        <Wallet size={24} strokeWidth={1.75} />Keuangan
      </Link>
    </nav>
  );
}
