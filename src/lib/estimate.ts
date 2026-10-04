const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Month when saldo + accumulated deposits >= target. Ignores profit (conservative). */
export function estimasiSiapDaftar(saldo: number, target: number, setoranPerMinggu: number, today: Date): Date {
  const perBulan = (setoranPerMinggu * 52) / 12;
  const sisa = Math.max(0, target - saldo);
  const months = perBulan > 0 ? Math.ceil(sisa / perBulan) : 0;
  return new Date(today.getFullYear(), today.getMonth() + months, 1);
}

export const formatBulan = (d: Date) => `${BULAN[d.getMonth()]} ${d.getFullYear()}`;
export const formatRp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");
