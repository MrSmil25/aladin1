import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/impian-haji/siap-daftar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Siap Daftar SISKOHAT · Aladin" },
      { name: "description", content: "Apa yang terjadi saat tabungan hajimu mencapai Rp25 juta." },
      { property: "og:title", content: "Siap Daftar SISKOHAT · Aladin" },
      { property: "og:description", content: "Langkah setelah setoran awal haji lengkap." },
    ],
  }),
  component: () => (
    <div className="px-5 pt-10">
      <Link to="/impian-haji" aria-label="Kembali" className="-ml-2 flex h-11 w-11 items-center justify-center"><ArrowLeft size={24} strokeWidth={1.75} /></Link>
      <h1 className="mt-4 text-xl font-semibold">Siap Daftar SISKOHAT</h1>
      <p className="mt-2 text-sm text-muted-foreground">Halaman ini akan ditambahkan berikutnya.</p>
    </div>
  ),
});
