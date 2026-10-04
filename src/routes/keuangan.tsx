import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Eye, EyeOff, FileText, Landmark, Star, Wallet } from "lucide-react";
import { useState } from "react";
import { mock } from "@/data/mock";
import { useAppState } from "@/lib/store";
import { estimasiSiapDaftar, formatBulan, formatRp } from "@/lib/estimate";
import { firstVisit, press, staggerChild, staggerParent } from "@/lib/motion";
import { Kaaba, Money, Progress, Skeleton, notInPrototype, useFirstLoad } from "@/components/app/primitives";

export const Route = createFileRoute("/keuangan")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Keuangan Saya · Aladin" },
      { name: "description", content: "Ringkasan simpanan: Ala Dompet dan Ala Impian Haji." },
      { property: "og:title", content: "Keuangan Saya · Aladin" },
      { property: "og:description", content: "Lihat total simpanan dan progres tabungan hajimu." },
    ],
  }),
  component: Keuangan,
});

const Hidden = () => <span className="text-base font-semibold tracking-widest">Rp•••••••</span>;

function Keuangan() {
  const [first] = useState(() => firstVisit("/keuangan"));
  const loading = useFirstLoad(first);
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  const app = useAppState();
  const h = { ...mock.haji, ...app.haji };
  const est = formatBulan(estimasiSiapDaftar(h.saldo, h.target, h.setoranPerMinggu, mock.today));

  return (
    <div className="min-h-full bg-accent pb-32">
      <div className="flex items-center justify-between px-5 pb-6 pt-12">
        <h1 className="text-xl font-semibold">Keuangan Saya</h1>
        <button onClick={notInPrototype} aria-label="Laporan" className="flex h-11 w-11 items-center justify-center"><FileText size={24} strokeWidth={1.75} /></button>
      </div>
      <div className="min-h-[700px] rounded-t-[32px] bg-background px-5 pt-2">
        <div className="relative flex">
          <button className="h-12 flex-1 text-sm font-semibold">Simpanan</button>
          <button onClick={notInPrototype} className="h-12 flex-1 text-sm text-muted-foreground">Pembiayaan</button>
          <span className="absolute bottom-0 left-0 h-0.5 w-1/2 rounded-full bg-primary" />
        </div>

        {loading ? (
          <div className="mt-7 space-y-7"><Skeleton className="h-16" /><Skeleton className="h-28" /><Skeleton className="h-44" /></div>
        ) : (
          <motion.div {...staggerParent(first)} className="mt-7 space-y-7">
            <motion.div {...staggerChild}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">Total Simpanan</h2>
                <button onClick={() => setShow(!show)} aria-label="Tampilkan saldo" className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {show ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                </button>
              </div>
              <div className="card-soft flex items-center justify-between p-5">
                <span className="text-sm text-muted-foreground">Total saldo (IDR)</span>
                {show ? <Money value={app.dompet.saldo + h.saldo} className="text-base font-semibold" /> : <Hidden />}
              </div>
            </motion.div>

            <motion.div {...staggerChild} className="card-soft p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary"><Wallet size={20} strokeWidth={1.75} /></span>
                <span className="text-base font-semibold">Ala Dompet</span>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="text-sm text-muted-foreground">Saldo aktif</span>
                {show ? <Money value={app.dompet.saldo} className="text-base font-semibold" /> : <Hidden />}
              </div>
            </motion.div>

            <motion.button {...staggerChild} {...press} onClick={() => nav({ to: "/impian-haji" })} className="card-soft block w-full p-5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-primary-foreground"><Kaaba className="h-7 w-7" /></span>
                <div className="flex-1">
                  <p className="text-base font-semibold">Ala Impian Haji</p>
                  <p className="text-xs text-muted-foreground">Dengan Mitra BPKH</p>
                </div>
                <ChevronRight size={20} strokeWidth={1.75} className="text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm">
                <Money value={h.saldo} className="text-base font-semibold" />
                <span className="tabular text-muted-foreground"> / {formatRp(h.target)}</span>
              </p>
              <div className="mt-3"><Progress pct={(h.saldo / h.target) * 100} /></div>
              <p className="mt-3 text-xs text-muted-foreground">Estimasi siap daftar: <span className="font-semibold text-foreground">{est}</span></p>
            </motion.button>

            <motion.div {...staggerChild} className="card-soft flex items-center gap-3 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary"><Star size={20} strokeWidth={1.75} /></span>
              <div>
                <p className="text-base font-semibold">Ala Impian lainnya</p>
                <p className="text-xs text-muted-foreground">Belum ada impian lain</p>
              </div>
            </motion.div>

            <motion.button {...staggerChild} {...press} onClick={notInPrototype} className="flex w-full items-center justify-between rounded-3xl bg-accent p-5 text-left">
              <div>
                <p className="text-base font-semibold">Ala Deposito</p>
                <p className="mt-1 text-xs font-medium text-profit-ink">Bagi hasil {mock.products.find(p => p.id === "deposito")?.badge} per tahun*</p>
              </div>
              <Landmark size={32} strokeWidth={1.5} className="text-navy" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
