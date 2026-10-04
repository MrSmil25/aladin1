import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Check, Footprints, Lightbulb, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Kaaba, Money, Progress } from "@/components/app/primitives";
import { mock } from "@/data/mock";
import { estimasiSiapDaftar, formatBulan, formatPercent, formatRp, formatTanggal } from "@/lib/estimate";
import { delay, dur, easeOut, phaseMs, press } from "@/lib/motion";
import { useAppActions } from "@/lib/store";

export const Route = createFileRoute("/pitch")({
  head: () => ({ meta: [
    { title: "Demo Juri · Ala Impian Haji STEP" },
    { name: "description", content: "Dari niat menjadi langkah: demo konsep Ala Impian Haji STEP dengan simulasi setoran." },
    { property: "og:title", content: "Demo Juri · Ala Impian Haji STEP" },
    { property: "og:description", content: "Satu Langkah, Lebih Dekat. Lima babak perjalanan menabung haji." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Pitch,
});

function Scene({ children, index, dark = false }: { children: ReactNode; index: number; dark?: boolean }) {
  const reduce = useReducedMotion();
  return <section id={`scene-${index}`} aria-label={`Babak ${index}`} className={`pitch-scene relative flex min-h-dvh snap-start snap-always items-center px-6 py-20 sm:px-16 ${dark ? "bg-navy text-primary-foreground" : "bg-background text-foreground"}`}>
    <motion.div initial={reduce ? false : { opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.25, once: true }} transition={{ duration: reduce ? 0 : dur.scene, ease: easeOut }} className="mx-auto w-full max-w-6xl">{children}</motion.div>
  </section>;
}

function Phone({ children, container, after = false }: { children: ReactNode; container: RefObject<HTMLDivElement | null>; after?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const rotate = useTransform(scrollYProgress, [0, 1], after ? [4, -2] : [-4, 2]);
  return <motion.div ref={ref} style={reduce ? {} : { y, rotate }} className="pitch-phone mx-auto relative w-full max-w-[280px] rounded-[32px] border-[7px] border-navy-deep bg-background p-4 text-foreground shadow-[var(--shadow-navy)]">
    <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-navy-deep" />{children}
  </motion.div>;
}

function YearChange({ year }: { year: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const [changed, setChanged] = useState(false);
  useEffect(() => { if (!visible) return; const timer = setTimeout(() => setChanged(true), reduce ? 0 : dur.timeline * 1000); return () => clearTimeout(timer); }, [visible, reduce]);
  return <div ref={ref} className="mt-6 flex h-20 items-center gap-5" aria-label={`${mock.pitch.beforeDate.getFullYear()} menjadi ${year}`}>
    <div className="relative text-5xl font-semibold tabular text-muted-foreground">{mock.pitch.beforeDate.getFullYear()}<motion.span aria-hidden className="absolute inset-x-0 top-1/2 h-1 origin-left bg-destructive" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }} transition={{ duration: reduce ? 0 : dur.emphasis, delay: delay.shine, ease: easeOut }} /></div>
    <ArrowRight className="text-primary" />
    <div className="relative h-16 min-w-[125px] overflow-hidden"><AnimatePresence initial={false}>{changed && <motion.span initial={reduce ? false : { y: 64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduce ? 0 : dur.scene, ease: easeOut }} className="absolute inset-0 text-5xl font-semibold tabular text-primary">{year}</motion.span>}</AnimatePresence></div>
  </div>;
}

function Pitch() {
  const scroll = useRef<HTMLDivElement>(null);
  const { state, deposit } = useAppActions();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(1);
  const [busy, setBusy] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const ready = estimasiSiapDaftar(mock.haji.saldo, mock.haji.target, mock.pitch.weekly, mock.today);
  const pct = state.haji.saldo / state.haji.target * 100;
  const simulate = () => {
    if (busy || state.dompet.saldo < mock.pitch.deposit) return;
    setBusy(true);
    timer.current = setTimeout(() => {
      try { deposit(mock.pitch.deposit); setRecorded(true); toast.success(`Langkah tercatat · ${formatPercent((state.haji.saldo + mock.pitch.deposit) / state.haji.target * 100)} lebih dekat`); }
      catch { toast.error("Saldo Ala Dompet tidak cukup"); }
      setBusy(false);
    }, phaseMs.deposit);
  };
  const go = (index: number) => document.getElementById(`scene-${index}`)?.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });

  return <div className="relative h-full">
    <header className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-6 py-4 sm:px-16 ${active === 1 || active === 4 || active === 5 ? "text-primary-foreground" : "text-foreground"}`}>
      <span className="text-sm font-semibold">Ala Impian Haji <span className="ml-2 font-normal">· STEP</span></span>
      <span className="text-xs tabular">{active} / 5</span>
    </header>
    <div id="pitch-scroll" ref={scroll} tabIndex={0} className="no-scrollbar h-dvh snap-y snap-mandatory overflow-y-auto outline-none" onScroll={e => setActive(Math.max(1, Math.min(5, Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight) + 1)))}>
      <Scene index={1} dark>
        <Kaaba className="mb-8 h-16 w-16 text-mint" />
        <p className="mb-5 text-xs font-medium uppercase tracking-widest text-mint">Dari niat, menjadi langkah</p>
        <h1 className="pitch-heading max-w-4xl font-semibold">Niatnya ada.<br /><span className="text-mint">Langkahnya belum.</span></h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-xl">Banyak anak muda ingin berhaji, tapi menunda persiapan karena terasa jauh.</p>
        <Button variant="ghost" onClick={() => go(2)} className="mt-8 gap-3 text-mint hover:text-mint-foreground"><ArrowDown />Lihat langkahnya</Button>
      </Scene>
      <Scene index={2}>
        <div className="pitch-comparison grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-destructive">Sebelum</p><h2 className="pitch-subheading mt-4 max-w-xl font-semibold">Target ada.<br />Arahnya belum.</h2><YearChange year={ready.getFullYear()} /><p className="mt-4 max-w-lg text-base text-muted-foreground">Hari ini, rencana yang tidak realistis dibiarkan begitu saja.</p></div>
          <Phone container={scroll}><p className="text-base font-semibold">Buat target tabungan</p><p className="mt-5 text-xs text-muted-foreground">Nama target</p><div className="mt-2 border-b py-2 text-sm">Tabungan Haji</div><p className="mt-4 text-xs text-muted-foreground">Nominal per bulan</p><div className="mt-2 border-b py-2 text-xl font-semibold tabular">{formatRp(mock.pitch.beforeMonthly)}<span className="text-xs font-normal">/bulan</span></div><p className="mt-4 text-xs text-muted-foreground">Waktu tercapai pada</p><p className="mt-2 text-2xl font-semibold tabular">{formatTanggal(mock.pitch.beforeDate)}</p><div className="mt-6 border-t py-3 text-center text-sm text-muted-foreground">Simpan target</div></Phone>
        </div>
      </Scene>
      <Scene index={3}>
        <div className="pitch-comparison grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Sesudah · STEP</p><h2 className="pitch-subheading mt-4 max-w-xl font-semibold">Rencana realistis.<br /><span className="text-primary">Langkah terasa dekat.</span></h2><p className="mt-5 max-w-lg text-base text-muted-foreground">Dengan STEP, setiap rencana diarahkan jadi langkah yang bisa dijalani.</p></div>
          <Phone container={scroll} after><div className="flex items-center gap-2"><Kaaba className="h-6 w-6 text-navy" /><p className="text-base font-semibold">Rencana Haji</p></div><p className="mt-5 text-xs text-muted-foreground">Setoran nyamanmu</p><p className="mt-2 text-xl font-semibold tabular">{formatRp(mock.pitch.weekly)}<span className="text-xs font-normal">/minggu</span></p><div className="mt-4 rounded-lg bg-navy p-4 text-primary-foreground"><p className="text-xs">Siap daftar</p><p className="mt-1 text-3xl font-semibold tabular text-mint">{formatBulan(ready)}</p></div><div className="mt-4 border-l-2 border-primary pl-3"><Lightbulb className="mb-2 text-primary" /><p className="text-xs font-semibold">Saran langkahmu</p><p className="mt-1 text-xs text-muted-foreground">Sisihkan {formatRp(mock.pitch.weekly)} tiap Jumat. Mulai kecil, lanjutkan rutin.</p></div><p className="mt-4 text-[10px] text-muted-foreground">Estimasi setoran awal, bukan keberangkatan.</p></Phone>
        </div>
      </Scene>
      <Scene index={4} dark>
        <p className="text-xs font-medium uppercase tracking-widest text-mint">Demo langsung</p><h2 className="pitch-subheading mt-4 font-semibold">Satu setoran.<br />Satu langkah nyata.</h2>
        <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4"><div><p className="text-xs text-primary-foreground/80">Saldo Ala Impian Haji</p><Money value={state.haji.saldo} className="mt-2 block text-3xl font-semibold sm:text-5xl" /></div><div><p className="text-xs text-primary-foreground/80">Menuju setoran awal</p><MoneyPercent value={pct} /></div></div>
        <div className="mt-6 max-w-2xl"><Progress pct={pct} track="bg-primary-foreground/20" /><div className="mt-5 flex justify-between">{mock.haji.milestones.map(m => <motion.span key={m.name} animate={{ scale: recorded && m.amount <= state.haji.saldo && !reduce ? [1, 1.25, 1] : 1 }} transition={{ duration: dur.emphasis, ease: easeOut }} title={m.name} className={`flex h-9 w-9 items-center justify-center rounded-full border ${m.amount <= state.haji.saldo ? "border-mint bg-mint text-mint-foreground shadow-[var(--shadow-glow)]" : "border-primary-foreground/30 text-primary-foreground/80"}`}>{m.amount <= state.haji.saldo ? <Check size={16} /> : <Footprints size={16} />}</motion.span>)}</div></div>
        <motion.div {...press} className="mt-7 w-fit max-w-full"><Button onClick={simulate} disabled={busy || state.dompet.saldo < mock.pitch.deposit} className="min-h-12 whitespace-normal bg-mint px-5 text-mint-foreground hover:bg-mint/90"><Footprints />{busy ? "Mencatat langkah…" : `Simulasikan setor ${formatRp(mock.pitch.deposit)}`}</Button></motion.div>
        <p aria-live="polite" className="mt-3 text-sm text-primary-foreground/80">{recorded ? "Langkah tercatat. Saldo prototipe ikut diperbarui." : `Dari Ala Dompet · ${formatRp(state.dompet.saldo)}`}</p>
      </Scene>
      <Scene index={5} dark>
        <Sparkles className="mb-7 text-mint" size={40} /><p className="text-base font-medium text-mint sm:text-xl">Ala Impian Haji · STEP</p><h2 className="pitch-heading mt-5 max-w-4xl font-semibold">Satu Langkah,<br /><span className="text-mint">Lebih Dekat.</span></h2><Button asChild className="mt-8 min-h-12 bg-mint px-6 text-mint-foreground hover:bg-mint/90"><Link to="/">Buka prototipe<ArrowRight /></Link></Button>
      </Scene>
    </div>
    <footer className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-6 py-4 text-[10px] sm:px-16 ${active === 1 || active === 4 || active === 5 ? "text-primary-foreground/80" : "text-muted-foreground"}`}><span>Prototipe konsep — data ilustrasi</span><span>Ala Impian Haji · STEP</span></footer>
  </div>;
}

function MoneyPercent({ value }: { value: number }) {
  return <motion.p key={value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur.count, ease: easeOut }} className="mt-2 text-3xl font-semibold tabular text-mint sm:text-5xl">{formatPercent(value)}</motion.p>;
}