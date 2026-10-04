import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, FileCheck2, Landmark, Sparkles, Wallet, BadgeCheck } from "lucide-react";
import { mock } from "@/data/mock";
import { estimasiSiapDaftar, formatBulan, formatRp } from "@/lib/estimate";
import { dur, easeOut, press, spring } from "@/lib/motion";
import { useAppState, useAppActions } from "@/lib/store";

export const Route = createFileRoute("/impian-haji/siap-daftar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Setelah Setoran Awal Terkumpul · Aladin" },
      { name: "description", content: "Empat langkah dari setoran awal hingga nomor porsi tercatat di SISKOHAT." },
      { property: "og:title", content: "Setelah Setoran Awal Terkumpul · Aladin" },
      { property: "og:description", content: "Jalur pendaftaran haji setelah setoran awalmu lengkap." },
    ],
  }),
  component: SiapDaftar,
});

const STEPS = [
  { icon: Wallet, title: "Saldo mencapai setoran awal", desc: `Saldo Ala Impian Haji mencapai setoran awal ${formatRp(25_000_000)}.` },
  { icon: FileCheck2, title: "Siapkan dokumen", desc: "Siapkan dokumen sesuai ketentuan Kemenag." },
  { icon: Landmark, title: "Datang ke Kantor Kemenag", desc: "Datang ke Kantor Kemenag kabupaten/kota sesuai domisili untuk mendaftar." },
  { icon: BadgeCheck, title: "Dapatkan nomor porsi", desc: "Nomor porsi tercatat di SISKOHAT. Antreanmu dimulai." },
];

function SiapDaftar() {
  const app = useAppState();
  const { openStep } = useAppActions();
  const reduced = useReducedMotion();
  const h = { ...mock.haji, ...app.haji };
  const estDate = estimasiSiapDaftar(h.saldo, h.target, h.setoranPerMinggu, mock.today);
  // user is at step 1 while saldo < setoran awal
  const current = h.saldo >= h.target ? 3 : 0;

  return (
    <div className="min-h-full bg-background pb-28">
      <div className="px-5 pt-10">
        <Link to="/impian-haji" aria-label="Kembali" className="-ml-2 flex h-11 w-11 items-center justify-center">
          <ArrowLeft size={24} strokeWidth={1.75} />
        </Link>
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.standard, ease: easeOut }}
          className="mt-4 text-xl font-semibold"
        >
          Setelah setoran awal terkumpul
        </motion.h1>

        {/* Status card */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.standard, ease: easeOut, delay: 0.08 }}
          className="card-navy mt-5 overflow-hidden p-5 text-primary-foreground"
        >
          <div className="islamic-pattern pointer-events-none absolute inset-0" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint/15">
              <Sparkles size={20} strokeWidth={1.75} className="text-mint" />
            </span>
            <div>
              <p className="text-sm font-semibold">Kamu di tahap Langkah Pertama</p>
              <p className="mt-0.5 text-xs text-primary-foreground/70">
                Estimasi siap daftar <b className="tabular text-mint">{formatBulan(estDate)}</b>
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <p className="text-xs text-primary-foreground/70">Saldo hari ini</p>
            <p className="tabular text-lg font-semibold">{formatRp(h.saldo)} <span className="text-xs font-normal text-primary-foreground/60">dari {formatRp(h.target)}</span></p>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.ol
          initial={reduced ? false : "hidden"}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.28, delayChildren: 0.25 } } }}
          className="relative mt-8"
          aria-label="Timeline 4 langkah setelah setoran awal"
        >
          {/* vertical path drawn top → bottom */}
          <svg aria-hidden className="pointer-events-none absolute left-[27px] top-2 h-[calc(100%-16px)] w-[3px]" preserveAspectRatio="none" viewBox="0 0 3 100">
            <line x1="1.5" y1="0" x2="1.5" y2="100" stroke="var(--border)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            {!reduced && (
              <motion.line
                x1="1.5" y1="0" x2="1.5" y2="100"
                stroke="var(--mint)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: easeOut, delay: 0.3 }}
              />
            )}
            {reduced && <line x1="1.5" y1="0" x2="1.5" y2="100" stroke="var(--mint)" strokeWidth="3" />}
          </svg>

          {STEPS.map((s, i) => {
            const isCurrent = i === current;
            const done = i < current;
            const Icon = s.icon;
            return (
              <motion.li
                key={s.title}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: dur.standard, ease: easeOut } } }}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                <span
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isCurrent ? "border-mint bg-mint/10 shadow-[var(--shadow-glow)]" : done ? "border-mint bg-mint text-mint-foreground" : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Icon size={22} strokeWidth={1.75} />
                  {isCurrent && !reduced && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full border-2 border-mint"
                      animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </span>
                <div className={`flex-1 rounded-3xl px-4 py-3.5 ${isCurrent ? "bg-mint/10 ring-1 ring-mint/30" : ""}`}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Langkah {i + 1}</p>
                  <p className={`mt-0.5 text-sm font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>{s.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: dur.standard }}
          className="mt-2 rounded-2xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground"
        >
          Persyaratan dan alur dapat berubah. Selalu cek ketentuan terbaru di Kemenag.
        </motion.p>
      </div>

      {/* CTA */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/90 px-5 pb-5 pt-3 backdrop-blur">
        <motion.button
          {...press}
          onClick={() => openStep()}
          transition={spring}
          className="h-12 w-full rounded-full bg-mint text-sm font-semibold text-mint-foreground shadow-[var(--shadow-glow)]"
        >
          Percepat langkahku
        </motion.button>
      </div>
    </div>
  );
}
