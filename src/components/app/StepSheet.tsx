import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowDownToLine, Check, ChevronRight, Copy, LoaderCircle, Share2, Sparkles, Store, Users, Wallet, CalendarDays, Info, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, Portal } from "./Sheet";
import { Money, Kaaba } from "./primitives";
import { useAppActions, type StepView, type Milestone } from "@/lib/store";
import { formatRp } from "@/lib/estimate";
import { spring } from "@/lib/motion";

const titles: Record<StepView, string> = { menu: "Ambil STEP", deposit: "Setor sekarang", transact: "Setor tunai di kasir", save: "Nabung Rutin", how: "Cara kerja STEP" };
const options = [
  { view: "deposit", icon: Wallet, title: "Setor sekarang", note: "Dari Ala Dompet" },
  { view: "transact", icon: Store, title: "Setor tunai", note: "Di Alfamart / Alfamidi" },
  { view: "save", icon: CalendarDays, title: "Atur setoran otomatis", note: "Nabung rutin tiap Jumat" },
  { view: "family", icon: Users, title: "Ajak keluarga", note: "Bagikan link undangan" },
  { view: "how", icon: Info, title: "Cara kerja STEP", note: "Satu langkah, lebih dekat" },
] as const;
async function shareInvitation() {
  const url = new URL("/impian-haji", window.location.origin).href;
  try {
    if (navigator.share) await navigator.share({ title: "Ambil STEP bersama", text: "Yuk, ikut menabung untuk impian haji. #MyFirstSTEP", url });
    else { await navigator.clipboard.writeText(url); toast.success("Link undangan disalin"); }
  } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Link belum bisa dibagikan. Coba lagi."); }
}
export function StepSheet() {
  const { stepView, openStep, closeStep } = useAppActions();
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState(1);
  return <>
    <Sheet open={stepView !== null} onClose={closeStep} title={stepView ? titles[stepView] : "Ambil STEP"}>
      {stepView && <>
        {stepView !== "menu" && <Button variant="ghost" size="sm" onClick={() => { setDirection(-1); openStep(); }} className="mb-3 -ml-2"><ArrowLeft />Kembali</Button>}
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div key={stepView} custom={direction}
            variants={{ enter: (d: number) => ({ x: reduce ? 0 : d * 32, opacity: 0 }), exit: (d: number) => ({ x: reduce ? 0 : -d * 32, opacity: 0 }) }}
            initial="enter" animate={{ x: 0, opacity: 1 }} exit="exit" transition={{ duration: reduce ? 0 : 0.18 }}>
            {stepView === "menu" && <div className="divide-y">{options.map(({ view, icon: Icon, title, note }) => <Button key={view} variant="ghost" onClick={() => { if (view === "family") void shareInvitation(); else { setDirection(1); openStep(view); } }} className="h-auto min-h-16 w-full justify-start gap-3 rounded-none px-1 py-3 whitespace-normal text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"><Icon /></span><span className="flex-1"><span className="block text-sm font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{note}</span></span><ChevronRight className="text-muted-foreground" /></Button>)}</div>}
            {stepView === "deposit" && <Deposit />}
            {stepView === "transact" && <CashCode />}
            {stepView === "save" && <SaveSettings />}
            {stepView === "how" && <div className="space-y-5 py-2">{[["Nabung rutin", "Save", "mulai dari setoran kecil"], ["Setor di mana saja", "Transact", "termasuk kasir Alfamart"], ["Bagi hasil", "Earn", "tabunganmu tumbuh secara syariah"], ["Progres", "Progress", "setiap langkah menyalakan jalurmu"]].map(([label, english, note]) => <div key={english}><p className="text-sm font-semibold">{label} <span className="text-xs font-normal text-muted-foreground">({english})</span></p><p className="mt-1 text-sm text-muted-foreground">{note}</p></div>)}</div>}
          </motion.div>
        </AnimatePresence>
      </>}
    </Sheet>
    <MilestoneCelebration />
  </>;
}
function Deposit() {
  const { state, deposit } = useAppActions();
  const [amount, setAmount] = useState(10_000);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const invalid = !Number.isSafeInteger(amount) || amount < 10_000 || amount > state.dompet.saldo;
  const submit = () => {
    if (invalid || phase !== "idle") return;
    setPhase("loading");
    timers.current.push(setTimeout(() => setPhase("done"), 500));
    timers.current.push(setTimeout(() => {
      try { deposit(amount); toast.success(`Langkah tercatat · ${Math.min(100, ((state.haji.saldo + amount) / state.haji.target) * 100).toLocaleString("id-ID", { maximumFractionDigits: 2 })}% lebih dekat`); }
      catch { setPhase("idle"); toast.error("Saldo Ala Dompet tidak cukup"); }
    }, 700));
  };
  return <form onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className="mb-5 flex items-center gap-3 rounded-lg bg-surface p-4"><Wallet className="text-primary" size={22} /><div><p className="text-xs text-muted-foreground">Saldo Ala Dompet</p><Money value={state.dompet.saldo} className="text-base font-semibold" /></div></div>
    <fieldset disabled={phase !== "idle"}><legend className="mb-2 text-sm font-medium">Pilih nominal</legend><LayoutGroup id="step-amount"><div className="grid grid-cols-2 gap-2">{[10_000, 25_000, 50_000, 100_000].map(value => <Button key={value} type="button" variant="ghost" aria-pressed={amount === value} onClick={() => setAmount(value)} className={`relative h-11 overflow-hidden rounded-full bg-surface ${amount === value ? "text-primary-foreground hover:text-primary-foreground" : ""}`}>{amount === value && <motion.span layoutId="selected-amount" className="absolute inset-0 rounded-full bg-primary" transition={spring} />}<span className="relative tabular">{formatRp(value)}</span></Button>)}</div></LayoutGroup>
    <label className="mt-5 block text-sm font-medium" htmlFor="step-amount">Nominal lain</label><input id="step-amount" inputMode="numeric" autoComplete="off" value={amount ? amount.toLocaleString("id-ID") : ""} onChange={e => setAmount(Number(e.target.value.replace(/\D/g, "")))} className="mt-2 h-12 w-full rounded-lg border bg-background px-4 tabular text-lg outline-none focus:ring-2 focus:ring-ring" aria-describedby="deposit-error" />
    <p id="deposit-error" className={`mt-2 min-h-5 text-xs ${invalid ? "text-destructive" : "text-muted-foreground"}`}>{amount > state.dompet.saldo ? "Saldo Ala Dompet tidak cukup." : "Minimum setoran Rp10.000 · Gratis biaya"}</p></fieldset>
    <Button type="submit" disabled={invalid || phase !== "idle"} aria-label={phase === "idle" ? "Setor" : phase === "loading" ? "Memproses setoran" : "Setoran berhasil"} className="mt-5 h-12 w-full rounded-full"><AnimatePresence mode="wait" initial={false}><motion.span key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">{phase === "idle" ? <><ArrowDownToLine />Setor</> : phase === "loading" ? <><LoaderCircle className="step-spinner" />Memproses</> : <><Check />Tercatat</>}</motion.span></AnimatePresence></Button>
  </form>;
}
function SaveSettings() {
  const { state, setAppState, closeStep } = useAppActions();
  const [weekly, setWeekly] = useState(state.haji.setoranPerMinggu);
  const [auto, setAuto] = useState(state.autoOn);
  const [lock, setLock] = useState(state.lockOn);
  return <><p className="text-sm text-muted-foreground">Setoran otomatis tiap Jumat dari Ala Dompet.</p><div className="mt-4 grid grid-cols-2 gap-2">{[50_000, 100_000, 150_000, 250_000].map(v => <Button key={v} variant={weekly === v ? "default" : "secondary"} aria-pressed={weekly === v} className="h-11 rounded-full text-xs" onClick={() => setWeekly(v)}>{formatRp(v)}</Button>)}</div><div className="mt-5 space-y-5">{[{ label: "Setoran otomatis tiap Jumat", value: auto, set: setAuto }, { label: "Kunci Ala Impian", value: lock, set: setLock }].map(item => <label key={item.label} className="flex items-center justify-between gap-4 text-sm font-medium">{item.label}<Switch checked={item.value} onCheckedChange={item.set} aria-label={item.label} /></label>)}<p className="text-xs text-muted-foreground">Dana dikunci khusus untuk haji, tidak bisa terpakai untuk jajan.</p></div><Button className="mt-6 h-12 w-full rounded-full" onClick={() => { setAppState({ haji: { ...state.haji, setoranPerMinggu: weekly }, autoOn: auto, lockOn: lock }); closeStep(); toast.success("Pengaturan disimpan"); }}>Simpan</Button></>;
}
function CashCode() {
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));
  const [left, setLeft] = useState(1800);
  useEffect(() => { const timer = setInterval(() => setLeft(v => Math.max(0, v - 1)), 1000); return () => clearInterval(timer); }, []);
  return <><div className="rounded-lg bg-navy p-5 text-center text-primary-foreground"><p className="text-xs text-primary-foreground/70">Kode setor tunai · Prototipe</p><p className="mt-2 text-4xl font-semibold tabular">{code}</p><p className="mt-2 text-xs">Berlaku {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</p><Button variant="ghost" disabled={left === 0} className="mt-3 text-mint" onClick={async () => { try { await navigator.clipboard.writeText(code); toast.success("Kode disalin"); } catch { toast.error("Kode belum bisa disalin"); } }}><Copy />Salin kode</Button></div><ol className="mt-5 space-y-4 text-sm">{["Datang ke kasir Alfamart/Alfamidi terdekat.", 'Bilang “Setor Aladin” dan tunjukkan kode ini.', "Bayar tunai dan simpan bukti setoran."].map((text, i) => <li key={text} className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">{i + 1}</span>{text}</li>)}</ol><p className="mt-4 text-xs text-muted-foreground">Kode ilustrasi, tidak dapat digunakan untuk transaksi nyata.</p></>;
}
function MilestoneCelebration() {
  const { state, celebrations, dismissCelebration } = useAppActions();
  const milestone = celebrations[0];
  const reduce = useReducedMotion();
  const [sharing, setSharing] = useState(false);
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setSharing(false); setImage("");
    if (!milestone) return;
    if (!reduce && navigator.vibrate) navigator.vibrate(20);
    let active = true;
    void createShareImage(milestone, Math.min(100, state.haji.saldo / state.haji.target * 100)).then(url => { if (active) setImage(url); });
    const timer = setTimeout(() => setSharing(true), reduce ? 0 : 900);
    return () => { active = false; clearTimeout(timer); };
  }, [milestone, reduce, state.haji.saldo, state.haji.target]);
  const share = async () => {
    if (!image || busy) return;
    setBusy(true);
    try { const blob = await (await fetch(image)).blob(); const file = new File([blob], "MyFirstSTEP.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: `Tonggak ${milestone?.name} tercapai`, text: "#MyFirstSTEP" });
      else { const a = document.createElement("a"); a.href = image; a.download = file.name; a.click(); toast.success("Kartu share diunduh"); }
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Kartu belum bisa dibagikan"); }
    finally { setBusy(false); }
  };
  return <Portal><AnimatePresence>{milestone && <motion.div role="dialog" aria-modal="true" aria-label={sharing ? "Bagikan tonggak" : "Tonggak tercapai"} className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-navy-deep/90 px-6 text-center text-primary-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {!sharing ? <><div className="relative flex h-36 w-36 items-center justify-center"><motion.span className="absolute inset-3 rounded-full border-2 border-mint shadow-[var(--shadow-glow)]" initial={{ scale: reduce ? 1 : 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} /><motion.span className="flex h-24 w-24 items-center justify-center rounded-full bg-mint text-mint-foreground" initial={{ scale: reduce ? 1 : 0.4 }} animate={{ scale: 1 }} transition={spring}><Check size={42} /></motion.span>{!reduce && Array.from({ length: 6 }, (_, i) => <motion.span key={i} className="absolute text-mint" initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: Math.cos(i * Math.PI / 3) * 100, y: Math.sin(i * Math.PI / 3) * 100, opacity: [0, 1, 0], scale: [0.5, 1, 0.6] }} transition={{ duration: 0.85 }}><Sparkles size={14} /></motion.span>)}</div><p className="mt-6 text-xl font-semibold">Tonggak {milestone.name} tercapai</p></> : <motion.div initial={{ y: reduce ? 0 : 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring} className="flex max-h-full w-full flex-col items-center gap-4 py-5"><div className="flex w-full items-center justify-between"><p className="text-left text-sm font-semibold">Tonggak {milestone.name} tercapai</p><Button variant="ghost" size="icon" aria-label="Tutup perayaan" onClick={dismissCelebration}><X /></Button></div>{image ? <img src={image} alt={`Tonggak ${milestone.name} · ${Math.min(100, state.haji.saldo / state.haji.target * 100).toLocaleString("id-ID", { maximumFractionDigits: 2 })}% · #MyFirstSTEP`} className="aspect-[9/16] min-h-0 w-auto max-w-full flex-1 rounded-lg object-contain" /> : <div className="flex aspect-[9/16] min-h-0 w-full flex-1 items-center justify-center"><LoaderCircle /></div>}<Button disabled={!image || busy} onClick={share} className="h-12 w-full shrink-0 rounded-full bg-mint text-mint-foreground hover:bg-mint/90"><Share2 />Bagikan</Button><Button variant="ghost" onClick={dismissCelebration} className="shrink-0 text-primary-foreground">Nanti saja</Button></motion.div>}
  </motion.div>}</AnimatePresence></Portal>;
}
async function createShareImage(milestone: Milestone, percent: number) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext("2d"); if (!ctx) return "";
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  ctx.fillStyle = token("--navy"); ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = token("--mint"); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(540, 650, 180, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = token("--mint"); ctx.beginPath(); ctx.arc(540, 650, 125, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = token("--mint-foreground"); ctx.lineWidth = 18; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(482, 650); ctx.lineTo(522, 688); ctx.lineTo(605, 607); ctx.stroke();
  ctx.textAlign = "center"; ctx.fillStyle = token("--primary-foreground"); ctx.font = 'italic 700 56px Poppins'; ctx.fillText("Aladin", 540, 180);
  ctx.font = '500 36px Poppins'; ctx.fillText("TONGGAK TERCAPAI", 540, 955);
  ctx.font = '600 62px Poppins'; const words = milestone.name.split(" "); let line = ""; const lines: string[] = [];
  for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > 880 && line) { lines.push(line); line = word; } else line = test; } lines.push(line);
  lines.forEach((text, i) => ctx.fillText(text, 540, 1070 + i * 85));
  ctx.fillStyle = token("--mint"); ctx.font = '600 100px Poppins'; ctx.fillText(`${percent.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`, 540, 1380);
  ctx.fillStyle = token("--primary-foreground"); ctx.font = '400 34px Poppins'; ctx.fillText("lebih dekat ke impian haji", 540, 1455);
  ctx.fillStyle = token("--mint"); ctx.font = '600 42px Poppins'; ctx.fillText("#MyFirstSTEP", 540, 1750);
  return canvas.toDataURL("image/png");
}
