import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { Footer } from "@/components/ui/modem-animated-footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapBite — Wisata Kuliner Nusantara",
  description: "Temukan makanan tradisional Indonesia dari foto yang kamu ambil.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-[#1a1a1a]">
        {/* Navbar */}
        <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50 px-4 md:px-[60px] h-[60px] flex items-center justify-between">
          <Link href="/" className="text-[17px] font-extrabold text-[#0D0D0D] tracking-tight leading-none">
            Snap<span className="text-[#FF4D00]">Bite</span>
          </Link>
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/" className="text-[#888] text-[13px] font-medium hover:text-[#0D0D0D] transition-colors hidden md:block">Beranda</Link>
            <Link href="/scan" className="text-[#888] text-[13px] font-medium hover:text-[#0D0D0D] transition-colors hidden md:block">Scan</Link>
            <Link href="/tentang" className="text-[#888] text-[13px] font-medium hover:text-[#0D0D0D] transition-colors hidden md:block">Tentang</Link>
            <Link href="/scan" className="bg-[#FF4D00] text-white px-5 py-2 text-[13px] font-bold rounded-[2px] hover:bg-[#e64400] transition-colors">
              Mulai Scan →
            </Link>
          </div>
        </nav>

        <main className="flex-1">{children}</main>

        <Footer
          brandName="SnapBite"
          brandDescription="Mengenal kuliner nusantara lebih dekat melalui teknologi AI — dari foto hingga cerita budaya."
          socialLinks={[
            {
              icon: <MessageCircle className="w-6 h-6" />,
              href: "https://wa.me/6289877986690",
              label: "WhatsApp",
            },
            {
              icon: <Mail className="w-6 h-6" />,
              href: "mailto:snapbite@email.com",
              label: "Email",
            },
          ]}
          navLinks={[
            { label: "Beranda", href: "/" },
            { label: "Scan", href: "/scan" },
            { label: "Tentang", href: "/tentang" },
            { label: "Rendang", href: "/makanan/rendang" },
            { label: "Gudeg", href: "/makanan/gudeg" },
            { label: "Pempek", href: "/makanan/pempek" },
          ]}
          creatorName="Tim SnapBite"
          creatorUrl="/tentang"
        />
      </body>
    </html>
  );
}
