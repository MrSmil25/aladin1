import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowDownToLine, ArrowUpFromLine, Bell, Eye, EyeOff, Gift, Heart, Landmark, Receipt, Send,
  Smartphone, Sparkles, Star, User, Wallet, Wifi, Zap, Baby, ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { mock } from "@/data/mock";
import { useAppState } from "@/lib/store";
import { firstVisit, press, staggerChild, staggerParent } from "@/lib/motion";
import { HajjCard } from "@/components/app/HajjCard";
import { Kaaba, Money, Skeleton, notInPrototype, useFirstLoad } from "@/components/app/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beranda · Aladin Impian Haji" },
      { name: "description", content: "Beranda app Aladin dengan kartu Perjalanan Hajimu dan program STEP." },
      { property: "og:title", content: "Beranda · Aladin Impian Haji" },
      { property: "og:description", content: "Satu Langkah, Lebih Dekat. Prototipe Ala Impian Haji STEP." },
    ],
  }),
  component: Beranda,
});

const icons: Record<string, typeof Star> = {
  deposito: Landmark, impian: Star, donasi: Heart, ewallet: Wallet, pulsa: Smartphone,
  listrik: Zap, anak: Baby, kuota: Wifi, bayar: ShoppingBag,
};

const stars = Array.from({ length: 18 }, (_, i) => ({ l: (i * 37) % 100, t: (i * 53) % 70, d: (i % 6) * 0.9 }));

function Beranda() {
  const [first] = useState(() => firstVisit("/"));
  const loading = useFirstLoad(first);
  const [show, setShow] = useState(false);
  const [slide, setSlide] = useState(0);
  const nav = useNavigate();
  const app = useAppState();
  const hajiTo = app.userState === "baru" ? "/impian-haji/rencana" : "/impian-haji";

  const actions = [
    { l: "Transfer", i: Send }, { l: "Tarik", i: ArrowDownToLine }, { l: "Setor", i: ArrowUpFromLine }, { l: "Bayar & Beli", i: Receipt },
  ];

  return (
    <div className="pb-32">
      {/* Night sky header */}
      <div className="relative h-64 overflow-hidden rounded-b-[48px] bg-[image:var(--gradient-navy)]">
        {stars.map((s, i) => (
          <span key={i} className="star absolute h-0.5 w-0.5 rounded-full bg-primary-foreground" style={{ left: `${s.l}%`, top: `${s.t}%`, animationDelay: `${s.d}s` }} />
        ))}
        <div className="relative flex items-center justify-between px-5 pt-10">
          <span className="text-2xl font-bold italic tracking-tight text-primary-foreground">Aladin</span>
          <div className="flex gap-1 text-primary-foreground">
            <button onClick={notInPrototype} aria-label="Notifikasi" className="flex h-11 w-11 items-center justify-center"><Bell size={24} strokeWidth={1.75} /></button>
            <button onClick={notInPrototype} aria-label="Profil" className="flex h-11 w-11 items-center justify-center"><User size={24} strokeWidth={1.75} /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="-mt-36 space-y-7 px-5">
          <Skeleton className="h-48" /><Skeleton className="h-64" /><Skeleton className="h-20" /><Skeleton className="h-40" />
        </div>
      ) : (
        <motion.div {...staggerParent(first)} className="relative -mt-36 space-y-7 px-5">
          {/* Ala Dompet */}
          <motion.div {...staggerChild} className="card-soft p-4">
            <div className="rounded-2xl bg-surface p-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Ala Dompet</span>
                <button onClick={() => nav({ to: "/keuangan" })} className="text-primary">Detail</button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                {show ? <Money value={mock.dompet.saldo} className="text-xl font-semibold" /> : <span className="text-xl font-semibold tracking-widest">Rp•••••••</span>}
                <button onClick={() => setShow(!show)} aria-label="Tampilkan saldo" className="flex h-11 w-11 items-center justify-center text-muted-foreground">
                  {show ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4">
              {actions.map(({ l, i: I }) => (
                <motion.button key={l} {...press} onClick={notInPrototype} className="flex flex-col items-center gap-2 text-xs font-medium">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><I size={20} strokeWidth={1.75} /></span>
                  {l}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div {...staggerChild}><HajjCard first={first} /></motion.div>

          {/* Products */}
          <motion.div {...staggerChild} className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 pt-3">
            {mock.products.map((p) => {
              const I = icons[p.id] ?? Star;
              return (
                <motion.button key={p.id} {...press} onClick={() => (p.id === "haji" ? nav({ to: hajiTo }) : notInPrototype())} className="flex w-[70px] shrink-0 flex-col items-center gap-2 text-center text-xs font-medium">
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl card-soft">
                    {p.id === "haji" ? <Kaaba className="h-7 w-7 text-navy" /> : <I size={24} strokeWidth={1.75} className="text-primary" />}
                    {p.badge && <span className="tabular absolute -right-2 -top-3 rounded-full bg-badge px-1.5 py-0.5 text-xs font-medium text-primary-foreground">{p.badge}</span>}
                  </span>
                  <span className="leading-tight">{p.label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Temukan Berkah */}
          <motion.section {...staggerChild}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Temukan Berkah</h2>
              <button onClick={notInPrototype} className="text-xs font-medium text-primary">Lihat Semua</button>
            </div>
            <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5"
              onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth * 0.85)))}>
              <motion.button {...press} onClick={() => nav({ to: "/impian-haji", hash: "campaign" })} className="flex h-40 w-[85%] shrink-0 snap-start overflow-hidden rounded-3xl bg-navy text-left">
                <div className="relative w-2/5 bg-[image:var(--gradient-campaign)]">
                  <ShoppingBag className="absolute bottom-4 left-4 text-primary-foreground/80" size={24} strokeWidth={1.75} />
                  <Sparkles className="absolute right-3 top-3 text-primary-foreground/70" size={20} strokeWidth={1.75} />
                </div>
                <div className="flex w-3/5 flex-col justify-center p-4 text-primary-foreground">
                  <p className="text-sm font-semibold leading-snug">{mock.campaign.title}</p>
                  <p className="mt-2 text-xs font-medium text-mint">{mock.campaign.tag}</p>
                </div>
              </motion.button>
              {[1, 2].map((i) => (
                <div key={i} className="flex h-40 w-[85%] shrink-0 snap-start items-center justify-center rounded-3xl bg-muted text-xs font-medium text-muted-foreground">
                  <Gift size={20} strokeWidth={1.75} className="mr-2" />Promo partner
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} animate={{ width: slide === i ? 16 : 6 }} className={`h-1.5 rounded-full ${slide === i ? "bg-mint" : "bg-muted"}`} />
              ))}
            </div>
          </motion.section>

          {/* Banyak cara nabung */}
          <motion.section {...staggerChild}>
            <h2 className="mb-3 text-xl font-semibold">Banyak cara nabung di Aladin</h2>
            <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5">
              <motion.button {...press} onClick={() => nav({ to: "/impian-haji" })} className="w-[80%] shrink-0 snap-start rounded-3xl bg-accent p-5 text-left">
                <div className="flex justify-between">
                  <div>
                    <p className="text-base font-semibold">Ala Impian Haji</p>
                    <p className="mt-2 text-xs font-medium text-profit">Bagi hasil indikatif 8% p.a.*</p>
                    <p className="mt-1 text-xs text-muted-foreground">Terhubung SISKOHAT</p>
                  </div>
                  <Kaaba className="h-12 w-12 text-navy" />
                </div>
              </motion.button>
              <div className="w-[80%] shrink-0 snap-start rounded-3xl bg-accent p-5">
                <div className="flex justify-between">
                  <div>
                    <p className="text-base font-semibold">Ala Deposito</p>
                    <p className="mt-2 text-xs font-medium text-profit">Bagi hasil 8,5% p.a.*</p>
                    <p className="mt-1 text-xs text-muted-foreground">Maksimalkan bagi hasil</p>
                  </div>
                  <Landmark size={40} strokeWidth={1.5} className="text-navy" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">*Indikatif, tidak dijamin. Prototipe — data ilustrasi.</p>
          </motion.section>

          <p className="pt-2 text-center text-xs text-muted-foreground">Prototipe konsep — data ilustrasi</p>
        </motion.div>
      )}
    </div>
  );
}
