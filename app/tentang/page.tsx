import type { Metadata } from "next";
import Link from "next/link";
import {
  ScanLine,
  UtensilsCrossed,
  BookOpen,
  MapPin,
  Zap,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang SnapBite",
  description: "Visi, misi, dan tim di balik SnapBite — platform wisata kuliner berbasis AI.",
};

const teamMembers = [
  { name: "Anggota 1", role: "Project Lead & Frontend", avatar: "👨‍💻" },
  { name: "Anggota 2", role: "UI/UX Designer", avatar: "👩‍🎨" },
  { name: "Anggota 3", role: "Data & Research", avatar: "👨‍🔬" },
];

const features = [
  {
    Icon: ScanLine,
    title: "AI Vision Recognition",
    desc: "Foto makanan, AI kenali dalam hitungan detik. Didukung Google Gemini Vision terkini.",
  },
  {
    Icon: UtensilsCrossed,
    title: "500+ Kuliner Nusantara",
    desc: "Database lengkap makanan tradisional dari Sabang sampai Merauke, terus bertambah.",
  },
  {
    Icon: BookOpen,
    title: "Sejarah & Budaya",
    desc: "Setiap makanan hadir lengkap dengan cerita asal-usul, nilai budaya, dan sejarahnya.",
  },
  {
    Icon: MapPin,
    title: "Peta Lokasi",
    desc: "Temukan warung dan restoran penyaji makanan tradisional di sekitar kamu.",
  },
  {
    Icon: Zap,
    title: "Cepat & Akurat",
    desc: "Hasil instan dengan teknologi AI terdepan — tidak perlu daftar atau login.",
  },
  {
    Icon: Globe,
    title: "Untuk Semua Kalangan",
    desc: "Cocok untuk wisatawan lokal, mancanegara, peneliti kuliner, maupun pencinta budaya.",
  },
];

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0D0D0D] text-white px-6 md:px-[60px] py-16 border-b-4 border-[#FF4D00]">
        <div className="text-[11px] font-bold tracking-[3px] uppercase text-[#FF4D00] mb-4">Tentang Kami</div>
        <h1 className="font-sans font-black text-white mb-3 leading-none" style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-2px' }}>
          Tentang Snap<span className="text-[#FF4D00]">Bite</span>
        </h1>
        <p className="text-white/50 text-[15px] max-w-lg">
          Mengenal kuliner nusantara lebih dekat melalui teknologi AI
        </p>
      </div>

      {/* ── Features Section (from about.md) ── */}
      <section className="relative px-6 md:px-[60px] py-16 overflow-hidden border-b border-[#E5E5E5]">
        {/* Soft glow */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full -z-10"
          style={{ background: "#FFF3EC", filter: "blur(280px)" }}
          aria-hidden
        />

        <header className="mx-auto max-w-2xl text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0D0D0D] text-white text-[11px] font-bold tracking-[2px] uppercase px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full" />
            Fitur Utama
          </div>
          <h2
            className="font-sans font-black text-[#0D0D0D] text-3xl md:text-4xl mb-3"
            style={{ letterSpacing: "-1.5px" }}
          >
            Apa yang SnapBite tawarkan?
          </h2>
          <p className="text-[#888] text-[15px]">
            Platform wisata kuliner berbasis AI — dari foto hingga cerita budaya, semua dalam satu genggaman.
          </p>
        </header>

        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group flex items-start gap-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#FF4D00]/40"
            >
              <div className="size-10 shrink-0 rounded border border-[#FF4D00]/25 bg-[#FFF3EC] p-2 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#FF4D00]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#0D0D0D] mb-1">{title}</h3>
                <p className="text-[13px] leading-relaxed text-[#888]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
