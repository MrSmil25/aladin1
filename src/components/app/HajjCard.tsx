import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronRight, Footprints } from "lucide-react";
import { useState } from "react";
import { DEPOSIT_MIN, mock } from "@/data/mock";
import { useAppState, useAppActions } from "@/lib/store";
import { estimasiSiapDaftar, formatBulan, formatRp } from "@/lib/estimate";
import { delay, dur, easeInOut, easeOut, press, spring } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Kaaba, Money, Progress } from "./primitives";

export function HajjCard({ first }: { first: boolean }) {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();
  const nav = useNavigate();
  const app = useAppState();
  const { openStep } = useAppActions();
  const h = { ...mock.haji, ...app.haji };
  const baru = app.userState === "baru";
  const pct = (h.saldo / h.target) * 100;
  const next = h.milestones.find((m) => m.amount > h.saldo);
  const est = formatBulan(estimasiSiapDaftar(h.saldo, h.target, h.setoranPerMinggu, mock.today));

  return (
    <motion.div layoutId="hajj-card" className="card-navy" transition={spring}>
      <div className="islamic-pattern absolute inset-0" />
      <div className="corner-light pointer-events-none absolute inset-0" />
      {first && !reduce && (
        <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/15 to-transparent"
          initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: dur.shimmer, delay: delay.shine, ease: easeInOut }} />
      )}
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wider text-mint">{baru ? "ALA IMPIAN HAJI · STEP" : "PERJALANAN HAJIMU"}</span>
          <motion.button {...press} aria-label={open ? "Ciutkan" : "Buka"} onClick={() => setOpen(!open)} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full">
            <motion.span animate={{ rotate: open ? 0 : -90 }} transition={spring}><ChevronDown size={20} strokeWidth={1.75} /></motion.span>
          </motion.button>
        </div>

        {!open ? (
          <button onClick={() => nav({ to: baru ? "/impian-haji/rencana" : "/impian-haji" })} className="flex w-full items-center gap-3 text-left text-sm">
            <span className="tabular font-semibold">{baru ? "Kapan kamu bisa daftar haji?" : formatRp(h.saldo)}</span>
            {!baru && <div className="flex-1"><Progress pct={pct} track="bg-primary-foreground/15" /></div>}
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
        ) : null}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
              {baru ? (
                <div className="pt-2">
                  <motion.div animate={reduce ? {} : { y: [0, -2, 0] }} transition={{ duration: dur.scene, ease: easeInOut }} className="mb-3 w-fit text-primary-foreground">
                    <Kaaba className="h-11 w-11" />
                  </motion.div>
                  <h2 className="text-xl font-semibold">Kapan kamu bisa daftar haji?</h2>
                  <p className="mt-1 text-sm text-primary-foreground/70">Hitung rencanamu dalam 30 detik. Mulai dari {formatRp(DEPOSIT_MIN)}.</p>
                  <motion.div animate={reduce ? {} : { scale: [1, 1.04, 1] }} transition={{ delay: delay.settle, duration: dur.celebrate }} className="mt-5">
                    <Link to="/impian-haji/rencana" className="flex h-12 items-center justify-center rounded-full bg-mint text-sm font-semibold text-mint-foreground">Hitung Rencana Hajiku</Link>
                  </motion.div>
                  <Button onClick={() => openStep()} className="mt-3 h-11 w-full rounded-full"><Footprints />Ambil STEP</Button>
                  <p className="mt-3 text-center text-xs text-primary-foreground/60">{mock.trust}</p>
                </div>
              ) : (
                <div className="pt-1">
                  <button onClick={() => nav({ to: "/impian-haji" })} className="block w-full text-left">
                    <div className="flex items-end justify-between">
                      <div>
                        <motion.div layoutId="hajj-saldo"><Money value={h.saldo} className="text-[34px] font-semibold leading-tight" /></motion.div>
                        <p className="tabular text-xs text-primary-foreground/60">dari {formatRp(h.target)}</p>
                      </div>
                      <motion.div layoutId="hajj-kaaba" className="text-primary-foreground"><Kaaba className="h-12 w-12" /></motion.div>
                    </div>
                    <div className="mt-4"><Progress pct={pct} layoutId="hajj-progress" track="bg-primary-foreground/15" /></div>
                    <p className="tabular mt-3 text-xs text-primary-foreground/80">{formatRp(h.target - h.saldo)} lagi menuju setoran awal</p>
                    {next && <p className="tabular mt-1 text-xs text-primary-foreground/60">Tonggak berikutnya: <span className="text-mint">{next.name}</span> · {formatRp(next.amount)}</p>}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur.celebrate, duration: dur.standard, ease: easeOut }} className="mt-1 text-xs text-primary-foreground/60">
                      Estimasi siap daftar: <span className="font-semibold text-primary-foreground">{est}</span>
                    </motion.p>
                  </button>
                  <div className="mt-5 flex gap-3">
                    <motion.button {...press} onClick={() => openStep()} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      <Footprints size={18} strokeWidth={1.75} />Ambil STEP
                    </motion.button>
                    <motion.div {...press} className="flex-1">
                      <Link to="/impian-haji" className="flex h-11 items-center justify-center rounded-full border border-primary-foreground/20 text-sm font-semibold">Lihat Perjalanan</Link>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
