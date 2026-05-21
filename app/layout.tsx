import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MessageCircle, Mail } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
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
        <Navbar />

        <main className="flex-1">{children}</main>

        <Footer
          brandName="SnapBite"
          brandDescription="Mengenal kuliner nusantara lebih dekat melalui teknologi AI, dari foto hingga cerita budaya."
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
