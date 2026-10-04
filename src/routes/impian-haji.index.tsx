import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, Banknote, Check, ChevronRight, Copy, Flame, MoreVertical, Play, Share2, ShieldCheck, Sparkles, Store, Users, Wallet,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { DEPOSIT_MIN, mock } from "@/data/mock";
import { useAppState, useAppActions } from "@/lib/store";
import { estimasiSiapDaftar, formatBulan, formatRp } from "@/lib/estimate";
import { delay, dur, easeOut, press, spring } from "@/lib/motion";
import { Kaaba, Money, Progress, notInPrototype } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Portal, Sheet } from "@/components/app/Sheet";

export const Route = createFileRoute("/impian-haji/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Impian Haji · Aladin" },
      { name: "description", content: "Pusat Ala Impian Haji: jalur STEP, nabung rutin, bagi hasil, dan progresmu." },
      { property: "og:title", content: "Impian Haji · Aladin" },
      { property: "og:description", content: "Satu Langkah, Lebih Dekat." },
    ],
  }),
  component: ImpianHaji,
});

const ROW = 68;
let coachShown = false;
const inView = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: dur.standard, ease: easeOut },
};

function ImpianHaji() {
  const reduced = useReducedMotion();
  const app = useAppState();
  const { openStep } = useAppActions();
  const nav = useNavigate();
  const h = { ...mock.haji, ...app.haji };
  const ms = mock.haji.milestones;
  const pct = Math.min(100, (h.saldo / h.target) * 100);
  const est = (target: number) => formatBulan(estimasiSiapDaftar(h.saldo, target, h.setoranPerMinggu, mock.today));
  const title = h.name === "Setoran Awal Haji" ? "Haji Saya" : h.name;

  // current position on the path
  const reached = ms.filter((m) => m.amount <= h.saldo).length - 1;
  const nextM = ms[reached + 1];
  const currentM = ms[Math.max(0, reached)];
  const frac = nextM && currentM ? (h.saldo - currentM.amount) / (nextM.amount - currentM.amount) : 0;
  const posY = (reached + frac) * ROW;
  const total = (ms.length - 1) * ROW;

  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState<null | "save" | "transact" | "earn" | number>(null);
  const weekly = h.setoranPerMinggu;
  const { autoOn, lockOn } = app;
  const [coach, setCoach] = useState(-1);
  const [joined, setJoined] = useState(false);
  const selectedM = typeof sheet === "number" ? ms[sheet] : undefined;

  // parallax pattern
  const py = useMotionValue(0);
  useEffect(() => {
    const el = document.getElementById("app-scroll");
    if (!el) return;
    const on = () => py.set(reduced ? 0 : el.scrollTop * 0.3);
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, [py, reduced]);

  useEffect(() => {
    if (coachShown) return;
    coachShown = true;
    const t = setTimeout(() => setCoach(0), 1400);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" });
  const coaches = [
    { id: "jalur", text: "Ini jalur hajimu" },
    { id: "next-step", text: "Ambil langkah di sini" },
    { id: "earn-card", text: "Bagi hasilmu tumbuh di sini" },
  ];
  useEffect(() => { if (coach >= 0) scrollTo(coaches[coach]?.id ?? "jalur"); }, [coach]); // eslint-disable-line react-hooks/exhaustive-deps

  const extra = h.setoranPerMinggu * 2;
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Yuk ikut setor ke ${title} di Aladin`;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else { await navigator.clipboard.writeText(url); toast.success("Tautan undangan disalin"); }
    } catch { /* dismissed */ }
  };

  return (
    <div className="pb-32">
      {/* 1) HEADER */}
      <motion.div layoutId="hajj-card" transition={spring} className="card-navy rounded-t-none px-5 pb-7 pt-10">
        <div className="islamic-pattern absolute inset-0" />
        <div className="corner-light pointer-events-none absolute inset-0" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="Kembali ke Beranda" className="-ml-2 flex h-11 w-11 items-center justify-center"><ArrowLeft size={24} strokeWidth={1.75} /></Link>
            <div className="relative">
              <motion.button {...press} aria-label="Menu" onClick={() => setMenu(!menu)} className="-mr-2 flex h-11 w-11 items-center justify-center"><MoreVertical size={24} strokeWidth={1.75} /></motion.button>
              <AnimatePresence>
                {menu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: dur.micro }}
                    className="card-soft absolute right-0 top-12 z-20 w-48 origin-top-right overflow-hidden py-1 text-sm text-card-foreground">
                    <button onClick={() => nav({ to: "/impian-haji/rencana" })} className="block h-11 w-full px-4 text-left hover:bg-muted">Ubah rencana</button>
                    <button onClick={() => { setMenu(false); toast("Rincian rekening: " + mock.notInPrototype); }} className="block h-11 w-full px-4 text-left hover:bg-muted">Rincian rekening</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            <span className="rounded-full bg-primary-foreground/10 px-2 py-0.5 text-xs font-medium text-primary-foreground/80">Dengan Mitra BPKH</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <motion.div layoutId="hajj-saldo"><Money value={h.saldo} className="text-[38px] font-semibold leading-tight" /></motion.div>
              <p className="tabular text-xs text-primary-foreground/60">dari {formatRp(h.target)} setoran awal</p>
            </div>
            <motion.div layoutId="hajj-kaaba"><Kaaba className="h-16 w-16" /></motion.div>
          </div>
          <Button onClick={() => openStep()} className="mt-4 h-11 w-full rounded-full bg-mint text-mint-foreground hover:bg-mint/90">Ambil STEP</Button>
          <div className="mt-5"><Progress pct={pct} layoutId="hajj-progress" track="bg-primary-foreground/15" /></div>
          <div className="mt-3 flex justify-between text-xs">
            <span className="tabular font-medium text-mint">{Math.floor(pct)}% lebih dekat</span>
            <span className="text-primary-foreground/70">Estimasi siap daftar: <b className="text-primary-foreground">{est(h.target)}</b></span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-7 px-5 pt-7">
        {/* 2) JALUR STEP */}
        <section id="jalur" className="relative overflow-hidden rounded-3xl bg-surface p-5">
          <motion.div style={{ y: py }} className="islamic-pattern pointer-events-none absolute -inset-y-40 inset-x-0 [filter:invert(1)]" />
          <div className="relative">
            <p className="text-xs font-medium text-muted-foreground">JALUR STEP</p>
            <h2 className="text-xl font-semibold">Perjalanan menuju setoran awal</h2>
            <div className="relative mt-5" style={{ height: total + 40 }}>
              <svg className="absolute left-0 top-0" width="40" height={total + 40} aria-hidden>
                <line x1="20" y1="20" x2="20" y2={total + 20} stroke="var(--border)" strokeWidth="4" strokeLinecap="round"  />
                <motion.line x1="20" y1="20" x2="20" animate={{ y2: 20 + posY }} stroke="var(--mint)" strokeWidth="4" strokeLinecap="round"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: dur.emphasis * 2, ease: easeOut }} />
              </svg>
              {ms.map((m, i) => {
                const done = i <= reached;
                const last = i === ms.length - 1;
                return (
                  <motion.button key={m.name} {...press}
                    onClick={() => (last ? nav({ to: "/impian-haji/siap-daftar" }) : setSheet(i))}
                    className="absolute left-0 flex w-full items-center gap-4 text-left" style={{ top: i * ROW, height: 44 }}>
                    <motion.span initial={{ scale: 0.6, opacity: 0.4 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: delay.first + i * delay.short, ...spring }}
                      className={`relative z-10 ml-[8px] flex h-6 w-6 items-center justify-center rounded-full border-2 ${done ? "border-mint bg-mint text-mint-foreground" : "border-muted-foreground/30 bg-background"}`}>
                      {done && <Check size={14} strokeWidth={3} />}
                      {last && !done && <Kaaba className="h-4 w-4 text-navy" />}
                    </motion.span>
                    <span className="flex-1">
                      <span className={`block text-sm font-semibold ${done ? "" : "text-muted-foreground"}`}>{m.name}</span>
                      <span className="tabular block text-xs text-muted-foreground">{formatRp(m.amount)}</span>
                    </span>
                    <ChevronRight size={20} strokeWidth={1.75} className="text-muted-foreground" />
                  </motion.button>
                );
              })}
              {nextM && (
                <motion.div className="pointer-events-none absolute left-0 z-20 flex items-center" style={{ top: posY + 20 - 8 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur.celebrate }}>
                  <span className="relative ml-[12px] flex h-4 w-4">
                    <motion.span className="absolute inset-0 rounded-full bg-primary" animate={reduced ? {} : { scale: [1, 2.2], opacity: [0.5, 0] }} transition={{ delay: dur.shimmer, duration: dur.pulse, repeat: Infinity, ease: easeOut }} />
                    <span className="relative h-4 w-4 rounded-full border-2 border-background bg-primary" />
                  </span>
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground" style={{ position: "relative", left: 210 }}>Kamu di sini</span>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* 3) STEP BERIKUTNYA */}
        {nextM && (
          <motion.section id="next-step" {...inView} className="card-soft flex flex-wrap items-center gap-4 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><Sparkles size={24} strokeWidth={1.75} /></span>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">STEP berikutnya</p>
              <p className="text-sm font-semibold">Setor {formatRp(extra)} hari ini → {nextM.name} 2 minggu lebih cepat</p>
            </div>
            <Button onClick={() => openStep()} className="h-11 shrink-0 rounded-full px-4">Ambil STEP</Button>
          </motion.section>
        )}

        {/* 4) EMPAT KARTU STEP */}
        <div className="grid grid-cols-2 gap-3">
          <StepCard tag="S · Save" title="Nabung Rutin" onClick={() => openStep("save")}>
            <p className="tabular">Otomatis tiap Jumat · {formatRp(weekly)} · <span className="text-mint-foreground">{autoOn ? "Aktif" : "Nonaktif"}</span></p>
            <p className="mt-1">Kunci Ala Impian · {lockOn ? "Aktif" : "Nonaktif"}</p>
          </StepCard>
          <StepCard tag="T · Transact" title="Cara Setor" onClick={() => openStep("transact")}>
            <p>Dari Ala Dompet (gratis)</p>
            <p className="mt-1">Tunai di kasir Alfamart/Alfamidi</p>
          </StepCard>
          <StepCard id="earn-card" tag="E · Earn" title="Bagi Hasil" onClick={() => setSheet("earn")}>
            <p>Bulan ini ≈ <Money value={mock.haji.bagiHasilBulanIni} className="font-semibold text-profit-ink" /></p>
            <span className="mt-1 inline-block rounded-full bg-muted px-1.5 text-[11px]">indikatif</span>
            <p className="mt-1">Nisbah {mock.haji.nisbah} · Indikasi {mock.haji.bagiHasil} per tahun</p>
          </StepCard>
          <StepCard tag="P · Progress" title="Progresmu" onClick={() => scrollTo("jalur")}>
            <div className="flex gap-1">
              {Array.from({ length: mock.haji.streakJumat }).map((_, i) => (
                <motion.span key={i} initial={{ opacity: 0.2, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: dur.micro + i * dur.micro, ...spring }}>
                  <Flame size={16} strokeWidth={1.75} className="fill-profit/40 text-profit-ink" />
                </motion.span>
              ))}
            </div>
            <p className="mt-1">{mock.haji.streakJumat} Jumat berturut-turut menabung</p>
            {nextM && <p className="mt-1">Tonggak berikutnya: {nextM.name}</p>}
          </StepCard>
        </div>

        {/* 5) BERSAMA */}
        <motion.section {...inView} className="card-soft p-5">
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary"><Users size={20} strokeWidth={1.75} /></span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Usulan pengembangan</span>
          </div>
          <h2 className="mt-3 text-base font-semibold">Ajak keluarga ikut menabung</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ayah dan Sarah bisa ikut setor ke {title === "Haji Saya" ? "Haji untuk Ibu" : title}.</p>
          <motion.button {...press} onClick={share} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/20 text-sm font-semibold text-primary">
            <Share2 size={18} strokeWidth={1.75} />Bagikan tautan undangan
          </motion.button>
        </motion.section>

        {/* 6) CAMPAIGN */}
        <section id="campaign" className="scroll-mt-6 space-y-4">
          <h2 className="text-xl font-semibold">STEP Bersama</h2>
          <motion.div {...inView} className="card-navy p-5">
            <div className="islamic-pattern absolute inset-0" />
            <div className="relative">
              <p className="text-xs font-medium text-mint">TANTANGAN</p>
              <h3 className="text-base font-semibold">30 Hari Lebih Dekat</h3>
              <div className="mt-4 grid grid-cols-10 gap-1.5">
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1, done = day < mock.haji.challengeDay, now = day === mock.haji.challengeDay;
                  return (
                    <motion.span key={i} initial={{ opacity: 0.15 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                      transition={{ delay: day <= mock.haji.challengeDay ? i * delay.stagger : 0 }}
                      className={`aspect-square rounded-md ${done ? "bg-mint" : now ? "bg-primary-foreground ring-2 ring-mint" : "bg-primary-foreground/10"}`} />
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-primary-foreground/70">Hari ke-{mock.haji.challengeDay}. Nabung sedikit tiap hari, konsistensi lebih penting dari nominal.</p>
              <motion.button {...press} disabled={joined} onClick={() => { setJoined(true); toast.success("Kamu ikut tantangan 30 Hari Lebih Dekat!"); }}
                className="mt-4 h-11 w-full rounded-full bg-mint text-sm font-semibold text-mint-foreground disabled:opacity-60">{joined ? "Sudah ikut" : "Ikut Tantangan"}</motion.button>
            </div>
          </motion.div>

          <motion.div {...inView}>
            <h3 className="mb-3 text-base font-semibold">Cerita STEP</h3>
            <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5">
              {mock.stories.map((s, i) => (
                <div key={s.name} className="card-soft w-[78%] shrink-0 snap-start overflow-hidden">
                  <div className="h-28" style={{ background: `linear-gradient(${120 + i * 40}deg, var(--accent), var(--mint))` }} />
                  <div className="p-4">
                    <div className="flex justify-between text-xs text-muted-foreground"><span className="font-semibold text-foreground">{s.name}</span><span>Hari ke-{s.day}</span></div>
                    <p className="tabular mt-1 text-sm font-semibold">{formatRp(s.total)} terkumpul</p>
                    <p className="mt-2 text-sm italic text-muted-foreground">"{s.quote}"</p>
                  </div>
                </div>
              ))}
              <button onClick={notInPrototype} className="relative flex aspect-[9/16] w-[46%] shrink-0 snap-start flex-col items-center justify-center rounded-3xl bg-navy p-4 text-center text-primary-foreground">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15"><Play size={24} strokeWidth={1.75} className="fill-primary-foreground" /></span>
                <span className="mt-3 text-xs text-primary-foreground/70">Konten kampanye ilustrasi</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Cerita dan nama bersifat ilustrasi.</p>
          </motion.div>
        </section>

        {/* 7) KEPERCAYAAN */}
        <motion.section {...inView} className="card-soft p-5">
          <div className="flex items-center gap-2"><ShieldCheck size={20} strokeWidth={1.75} className="text-primary" /><h2 className="text-base font-semibold">Kenapa aman di Aladin?</h2></div>
          <ul className="mt-3 space-y-2.5 text-sm">
            {["Bank Penerima Setoran BPIH resmi (BPKH)", "Terhubung SISKOHAT", "Diawasi OJK & dijamin LPS", "Diawasi Dewan Pengawas Syariah", "Gratis biaya admin"].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-mint-foreground"><Check size={12} strokeWidth={3} /></span>{t}</li>
            ))}
          </ul>
          <Link to="/impian-haji/siap-daftar" className="mt-4 flex min-h-11 items-center text-sm font-semibold text-primary">Apa yang terjadi saat {formatRp(mock.haji.target)}? <ChevronRight size={18} strokeWidth={1.75} /></Link>
        </motion.section>

        {/* 8) RIWAYAT */}
        <section>
          <h2 className="mb-3 text-xl font-semibold">Riwayat Menabung</h2>
          {h.saldo === 0 ? (
            <div className="card-soft p-6 text-center">
              <p className="text-sm font-semibold">Langkah pertama cukup {formatRp(DEPOSIT_MIN)}.</p>
              <motion.button {...press} onClick={() => openStep("deposit")} className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground">Setor sekarang</motion.button>
            </div>
          ) : (
            <div className="card-soft divide-y px-5">
              {[...app.deposits, ...mock.riwayat].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-3.5">
                  <div><p className="text-sm font-medium">{r.label}</p><p className="text-xs text-muted-foreground">{r.date}</p></div>
                  <span className={`tabular text-sm font-semibold ${r.label === "Bagi hasil" ? "text-profit-ink" : ""}`}>+{formatRp(r.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 9) SEGERA HADIR */}
        <div className="flex items-center justify-between rounded-2xl border border-dashed p-4 text-xs text-muted-foreground">
          <span>Pembulatan: pembulatan transaksi masuk tabungan haji</span>
          <span className="ml-3 shrink-0 rounded-full bg-muted px-2 py-0.5 font-medium">Usulan fitur</span>
        </div>
      </div>

      {/* Sheets */}
      <Sheet open={typeof sheet === "number"} onClose={() => setSheet(null)} title={selectedM?.name ?? ""}>
        {selectedM && (
          <>
            <p className="tabular text-[32px] font-semibold">{formatRp(selectedM.amount)}</p>
            <p className="mt-2 text-sm text-muted-foreground">{selectedM.motivasi}</p>
            <div className="mt-4 rounded-2xl bg-surface p-4 text-sm">
              {selectedM.amount <= h.saldo ? <span className="font-medium text-foreground">Sudah tercapai. Alhamdulillah!</span>
                : <>Estimasi tercapai: <b>{est(selectedM.amount)}</b></>}
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={sheet === "earn"} onClose={() => setSheet(null)} title="Bagi hasil syariah">
        <p className="text-sm">Danamu dikelola bank dengan akad mudharabah, bukan bunga.</p>
        <p className="mt-2 text-sm">Keuntungan usaha dibagi sesuai nisbah: kamu mendapat {mock.haji.nisbah}, bank {100 - parseInt(mock.haji.nisbah)}%.</p>
        <p className="mt-2 text-sm">Hasilnya masuk setiap akhir bulan dan ikut menambah tabungan hajimu.</p>
        <div className="mt-4 rounded-2xl bg-surface p-4">
          <p className="text-xs text-muted-foreground">Perkiraan bulan ini</p>
          <Money value={mock.haji.bagiHasilBulanIni} className="text-[32px] font-semibold text-profit-ink" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Indikasi {mock.haji.bagiHasil} per tahun bersifat indikatif dan tidak dijamin.</p>
      </Sheet>

      {/* Coach marks */}
      <Portal>
        <AnimatePresence>
          {coach >= 0 && (
            <motion.div key="coach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-end bg-navy-deep/40 p-5 pb-28">
              <motion.div key={coach} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring} className="card-soft w-full p-5">
                <p className="text-xs font-medium text-muted-foreground">{coach + 1} / 3</p>
                <p className="mt-1 text-base font-semibold">{coaches[coach]?.text}</p>
                <div className="mt-4 flex justify-between">
                  <button onClick={() => setCoach(-1)} className="h-11 px-2 text-sm text-muted-foreground">Lewati</button>
                  <motion.button {...press} onClick={() => setCoach(coach < 2 ? coach + 1 : -1)} className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">{coach < 2 ? "Lanjut" : "Mengerti"}</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

function StepCard({ tag, title, children, onClick, id }: { tag: string; title: string; children: ReactNode; onClick: () => void; id?: string }) {
  return (
    <motion.button id={id} {...inView} whileTap={{ scale: 0.97 }} onClick={onClick} className="card-soft relative flex min-h-40 flex-col p-4 text-left">
      <span className="mb-2 text-[11px] font-medium text-muted-foreground">{tag}</span>
      <span className="text-base font-semibold">{title}</span>
      <div className="mt-2 text-xs text-muted-foreground">{children}</div>
    </motion.button>
  );
}

