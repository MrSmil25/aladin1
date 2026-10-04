// Single source of all mock numbers & copy for the prototype.
export type UserState = "baru" | "aktif";

export const SETORAN_AWAL = 25_000_000;

export const mock = {
  userState: "baru" as UserState,
  today: new Date(2026, 9, 1), // Oktober 2026
  dompet: { saldo: 2_450_000 },
  haji: {
    saldo: 6_250_000,
    target: SETORAN_AWAL,
    setoranPerMinggu: 150_000,
    bagiHasil: "8%",
    milestones: [
      { name: "Niat", amount: 0, motivasi: "Semua berawal dari niat yang lurus." },
      { name: "Langkah Pertama", amount: 1_000_000, motivasi: "Satu juta pertama selalu yang paling berarti." },
      { name: "Membangun Kebiasaan", amount: 5_000_000, motivasi: "Menabung sudah jadi bagian dari minggumu." },
      { name: "Istiqamah", amount: 10_000_000, motivasi: "Konsisten, sedikit demi sedikit, tidak berhenti." },
      { name: "Setengah Jalan", amount: 12_500_000, motivasi: "Separuh perjalanan sudah kamu lewati." },
      { name: "Hampir Sampai", amount: 20_000_000, motivasi: "Tinggal beberapa langkah lagi." },
      { name: "Siap Daftar SISKOHAT", amount: SETORAN_AWAL, motivasi: "Setoran awal lengkap, saatnya mendaftar." },
    ],
    bagiHasilBulanIni: 41_600,
    nisbah: "80%",
    streakJumat: 4,
    challengeDay: 18,
  },
  riwayat: [
    { label: "Setoran otomatis Jumat", date: "2 Okt 2026", amount: 150_000 },
    { label: "Bagi hasil", date: "30 Sep 2026", amount: 39_800 },
    { label: "Setoran otomatis Jumat", date: "25 Sep 2026", amount: 150_000 },
    { label: "Setor tunai Alfamart", date: "21 Sep 2026", amount: 100_000 },
    { label: "Setoran otomatis Jumat", date: "18 Sep 2026", amount: 150_000 },
  ],
  stories: [
    { name: "Nadia, 26", day: 64, total: 1_920_000, quote: "Gue kira harus nunggu gaji gede buat mulai." },
    { name: "Raka, 28", day: 120, total: 4_350_000, quote: "Setor tiap Jumat, sekarang udah kebiasaan." },
    { name: "Alya & Farhan, 29", day: 210, total: 9_800_000, quote: "Nabung berdua bikin makin semangat." },
  ],
  },
  trust: "Bank Penerima Setoran BPIH · Terhubung SISKOHAT",
  products: [
    { id: "haji", label: "Impian Haji", badge: "8%" },
    { id: "deposito", label: "Ala Deposito", badge: "8,5%" },
    { id: "impian", label: "Ala Impian" },
    { id: "donasi", label: "Donasi" },
    { id: "ewallet", label: "E-Wallet" },
    { id: "pulsa", label: "Pulsa" },
    { id: "listrik", label: "Token Listrik" },
    { id: "anak", label: "Tabungan Anak" },
    { id: "kuota", label: "Kuota Gratis" },
    { id: "bayar", label: "Bayar & Beli" },
  ],
  campaign: {
    title: "Langkah pertamamu ke Baitullah bisa dimulai hari ini.",
    tag: "#MyFirstSTEP · Mulai dari Rp10.000",
  },
  notInPrototype: "Tidak termasuk dalam prototipe",
};
