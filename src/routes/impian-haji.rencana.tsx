import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, Lightbulb } from "lucide-react";
import { useMemo, useState } from "react";
import { DEPOSIT_MIN, FIRST_DEPOSITS, WEEKLY_CHIPS, mock, SETORAN_AWAL } from "@/data/mock";
import { estimasiSiapDaftar, formatBulan, formatRp } from "@/lib/estimate";
import { delay, dur, linear, phaseMs, easeOut, press, spring } from "@/lib/motion";
import { useAppActions } from "@/lib/store";
import { Money } from "@/components/app/primitives";

export const Route = createFileRoute("/impian-haji/rencana")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Rencana Haji · Aladin" },
      { name: "description", content: "Susun rencana tabungan haji yang realistis dalam 4 langkah." },
      { property: "og:title", content: "Rencana Haji · Aladin" },
      { property: "og:description", content: "Satu Langkah, Lebih Dekat. Mulai dari Rp10.000." },
    ],
  }),
  component: Rencana,
});

const WHO = [
  { id: "diri", label: "Diri sendiri", name: "Haji untuk Diriku" },
  { id: "ibu", label: "Ibu", name: "Haji untuk Ibu" },
  { id: "ayah", label: "Ayah", name: "Haji untuk Ayah" },
  { id: "keluarga", label: "Bersama pasangan/keluarga", name: "Haji Bersama Keluarga" },
];
const PROVINSI = ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten", "DI Yogyakarta", "Sumatera Utara", "Sumatera Barat", "Sulawesi Selatan", "Kalimantan Timur"];
const CHIPS = WEEKLY_CHIPS;
const FIRST = FIRST_DEPOSITS;

const monthsBetween = (a: Date, b: Date) => (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
const est = (saldo: number, perMinggu: number) => estimasiSiapDaftar(saldo, SETORAN_AWAL, perMinggu, mock.today);

function Rencana() {
  const reduced = useReducedMotion();
  const nav = useNavigate();
  const { setAppState } = useAppActions();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [who, setWho] = useState<string | null>(null);
  const [age, setAge] = useState(25);
  const [prov, setProv] = useState("");
  const [weekly, setWeekly] = useState<number>(0);
  const [existing, setExisting] = useState(0);
  const [auto, setAuto] = useState(true);
  const [lock, setLock] = useState(true);
  const [first, setFirst] = useState(FIRST[0] ?? DEPOSIT_MIN);
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "celebrate">("idle");

  const valid = [!!who, !!prov, weekly >= DEPOSIT_MIN, true][step];
  const go = (d: number) => { setDir(d); setStep((s) => s + d); };
  const back = () => (step === 0 ? router.history.back() : go(-1));

  const date = weekly >= DEPOSIT_MIN ? est(existing, weekly) : null;
  const months = date ? monthsBetween(mock.today, date) : 0;
  const ageThen = age + Math.floor(months / 12);
  const suggestion = useMemo(() => {
    if (!date || months <= 120) return null;
    const y = CHIPS.find((c) => monthsBetween(mock.today, est(existing, c)) <= 60);
    return y ? { y, date: est(existing, y) } : null;
  }, [date, months, existing]);
  const whoObj = WHO.find((w) => w.id === who);

  const finish = () => {
    setPhase("loading");
    setTimeout(() => setPhase("done"), phaseMs.done);
    setTimeout(() => setPhase("celebrate"), phaseMs.celebrate);
    setTimeout(() => {
      setAppState({ userState: "aktif", haji: { name: whoObj?.name ?? "Impian Haji", saldo: existing + first, target: SETORAN_AWAL, setoranPerMinggu: weekly }, autoOn: auto, lockOn: lock });
      nav({ to: "/impian-haji" });
    }, phaseMs.finish);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[image:var(--gradient-navy)] text-primary-foreground">
      <div className="islamic-pattern pointer-events-none absolute inset-0" />
      <div className="relative flex min-h-[100dvh] flex-col px-5 pb-6 pt-10 sm:min-h-[844px]">
        <div className="flex items-center justify-between">
          <motion.button {...press} onClick={back} aria-label="Kembali" className="-ml-2 flex h-11 w-11 items-center justify-center"><ArrowLeft size={24} strokeWidth={1.75} /></motion.button>
          <div className="flex gap-1.5" aria-label={`Langkah ${step + 1} dari 4`}>
            {[0, 1, 2, 3].map((i) => (
              <motion.span key={i} animate={{ width: i === step ? 24 : 8, opacity: i <= step ? 1 : 0.3 }} transition={spring} className="h-2 rounded-full bg-mint" />
            ))}
          </div>
          <span className="w-11" />
        </div>

        <div className="relative mt-6 flex-1">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={step} custom={dir}
              initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }}
              transition={{ duration: dur.emphasis, ease: easeOut }}>
              {step === 0 && (
                <>
                  <h1 className="text-xl font-semibold">Kamu menabung haji untuk siapa?</h1>
                  <div className="mt-6 space-y-3">
                    {WHO.map((w) => {
                      const sel = who === w.id;
                      return (
                        <motion.button key={w.id} {...press} onClick={() => setWho(w.id)}
                          animate={{ borderColor: sel ? "var(--mint)" : "oklch(1 0 0 / 0)" }}
                          className="flex min-h-16 w-full items-center justify-between rounded-3xl border-2 bg-card px-5 text-left text-base font-medium text-card-foreground shadow-[var(--shadow-card)]">
                          {w.label}
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${sel ? "bg-mint" : "bg-muted"}`}>
                            {sel && (
                              <svg viewBox="0 0 24 24" className="h-4 w-4"><motion.path d="M5 12l5 5 9-10" fill="none" stroke="var(--mint-foreground)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur.standard, ease: easeOut }} /></svg>
                            )}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {whoObj && <p className="mt-4 text-xs text-primary-foreground/70">Nama impian: <span className="font-semibold text-mint">{whoObj.name}</span></p>}
                </>
              )}

              {step === 1 && (
                <>
                  <h1 className="text-xl font-semibold">Sedikit tentang kamu</h1>
                  <div className="card-soft mt-6 space-y-6 p-5 text-card-foreground">
                    <div>
                      <div className="flex justify-between text-sm font-medium"><span>Usia</span><span className="tabular text-primary">{age} tahun</span></div>
                      <input type="range" min={18} max={60} value={age} onChange={(e) => setAge(+e.target.value)} className="mt-3 min-h-11 w-full accent-[var(--primary)]" aria-label="Usia" />
                    </div>
                    <div>
                      <label htmlFor="prov" className="text-sm font-medium">Domisili (provinsi)</label>
                      <select id="prov" value={prov} onChange={(e) => setProv(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border bg-surface px-4 text-sm">
                        <option value="" disabled>Pilih provinsi</option>
                        {PROVINSI.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <p className="mt-2 text-xs text-muted-foreground">Domisili menentukan kantor Kemenag tempat kamu mendaftar nanti.</p>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h1 className="text-xl font-semibold">Berapa yang nyaman kamu sisihkan per minggu?</h1>
                  <div className="mt-5 text-center">
                    <p className="text-xs text-primary-foreground/70">Setoran awal {formatRp(SETORAN_AWAL)} siap sekitar</p>
                    <div className="relative h-12 overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.p key={date ? formatBulan(date) : "-"} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={spring}
                          className="tabular text-[36px] font-semibold leading-[48px] text-mint">{date ? formatBulan(date) : "—"}</motion.p>
                      </AnimatePresence>
                    </div>
                    {date && <p className="text-xs text-primary-foreground/70">Usiamu saat itu: <span className="font-semibold text-primary-foreground">{ageThen} tahun</span></p>}
                  </div>

                  <AnimatePresence>
                    {suggestion && (
                      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={spring}
                        className="mt-4 rounded-3xl bg-profit p-4 text-mint-foreground">
                        <div className="flex gap-2 text-sm"><Lightbulb size={20} strokeWidth={1.75} className="shrink-0" />
                          <p>Dengan {formatRp(weekly)}/minggu, target tercapai {date?.getFullYear()}. Coba {formatRp(suggestion.y)}/minggu → siap daftar {suggestion.date.getFullYear()}.</p>
                        </div>
                        <motion.button {...press} onClick={() => setWeekly(suggestion.y)} className="mt-3 h-11 w-full rounded-full bg-navy text-sm font-semibold text-primary-foreground">Pakai saran ini</motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="card-soft mt-4 p-5 text-card-foreground">
                    <div className="flex flex-wrap gap-2">
                      {CHIPS.map((c) => (
                        <motion.button key={c} {...press} onClick={() => setWeekly(c)}
                          className={`tabular h-11 rounded-full px-4 text-xs font-medium ${weekly === c ? "bg-primary text-primary-foreground" : "bg-surface"}`}>{formatRp(c)}</motion.button>
                      ))}
                    </div>
                    <label className="mt-4 block text-xs font-medium text-muted-foreground">Nominal lain (min. Rp10.000)
                      <input inputMode="numeric" value={weekly ? weekly.toLocaleString("id-ID") : ""} placeholder="Rp0"
                        onChange={(e) => setWeekly(+e.target.value.replace(/\D/g, "") || 0)} className="tabular mt-1 h-12 w-full rounded-2xl border bg-surface px-4 text-sm text-foreground" />
                    </label>
                    <label className="mt-3 block text-xs font-medium text-muted-foreground">Tabungan haji yang sudah ada (opsional)
                      <input inputMode="numeric" value={existing ? existing.toLocaleString("id-ID") : ""} placeholder="Rp0"
                        onChange={(e) => setExisting(+e.target.value.replace(/\D/g, "") || 0)} className="tabular mt-1 h-12 w-full rounded-2xl border bg-surface px-4 text-sm text-foreground" />
                    </label>
                  </div>
                  <p className="mt-4 text-xs text-primary-foreground/70">Antrean haji dimulai saat setoran awalmu masuk dan kamu mendaftar. Makin cepat siap, makin cepat antre.</p>
                </>
              )}

              {step === 3 && (
                <>
                  <h1 className="text-xl font-semibold">Langkah pertamamu</h1>
                  <div className="card-soft mt-6 divide-y p-5 text-sm text-card-foreground">
                    {[["Untuk", whoObj?.label ?? "-"], ["Setoran per minggu", formatRp(weekly)], ["Estimasi siap daftar", date ? formatBulan(date) : "-"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2.5 first:pt-0 last:pb-0"><span className="text-muted-foreground">{k}</span><span className="tabular font-semibold">{v}</span></div>
                    ))}
                  </div>
                  <div className="card-soft mt-3 space-y-4 p-5 text-card-foreground">
                    <Toggle on={auto} set={setAuto} label="Jadwalkan setoran otomatis tiap Jumat" />
                    <Toggle on={lock} set={setLock} label="Kunci Ala Impian" note="Dana dikunci khusus untuk haji, tidak bisa terpakai untuk jajan." />
                  </div>
                  <div className="card-soft mt-3 p-5 text-card-foreground">
                    <p className="text-sm font-medium">Setoran pertama</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {FIRST.map((f) => (
                        <motion.button key={f} {...press} onClick={() => setFirst(f)} className={`tabular h-11 rounded-full text-xs font-medium ${first === f ? "bg-primary text-primary-foreground" : "bg-surface"}`}>{formatRp(f)}</motion.button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Sumber dana: Ala Dompet</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center">
          {step < 3 ? (
            <motion.button {...press} disabled={!valid} onClick={() => go(1)}
              className="h-12 w-full rounded-full bg-mint text-sm font-semibold text-mint-foreground transition-opacity disabled:opacity-40">Lanjut</motion.button>
          ) : (
            <motion.button layout {...press} disabled={phase !== "idle"} onClick={finish} transition={spring}
              className={`flex h-12 items-center justify-center rounded-full bg-mint text-sm font-semibold text-mint-foreground ${phase === "idle" ? "w-full" : "w-12"}`}>
              {phase === "idle" && "Ambil STEP Pertamaku"}
              {phase === "loading" && <motion.span className="h-5 w-5 rounded-full border-2 border-mint-foreground border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: reduced ? 0 : dur.loading, ease: linear }} />}
              {(phase === "done" || phase === "celebrate") && <Check size={22} strokeWidth={2.5} />}
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {phase === "celebrate" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy-deep/90 px-8 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <motion.span className="absolute h-6 w-6 rounded-full bg-mint" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: dur.celebrate, ease: easeOut }} />
              <motion.span className="h-6 w-6 rounded-full bg-mint shadow-[var(--shadow-glow)]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring} />
            </div>
            <Money value={existing + first} className="mt-4 text-[36px] font-semibold" />
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay.roll, duration: dur.standard, ease: easeOut }} className="mt-3 text-base">
              Langkah pertama tercatat. Kamu sudah di jalur.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ on, set, label, note }: { on: boolean; set: (v: boolean) => void; label: string; note?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="flex min-h-11 w-full items-start justify-between gap-4 text-left">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {note && <span className="mt-1 block text-xs text-muted-foreground">{note}</span>}
      </span>
      <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${on ? "justify-end bg-mint" : "justify-start bg-muted"}`}>
        <motion.span layout transition={spring} className="h-5 w-5 rounded-full bg-card shadow-[var(--shadow-card)]" />
      </span>
    </button>
  );
}
