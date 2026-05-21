"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Scan", href: "/scan" },
  { label: "Tentang", href: "/tentang" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50 px-4 md:px-[60px] h-[60px] flex items-center justify-between">
        <Link
          href="/"
          className="text-[17px] font-extrabold text-[#0D0D0D] tracking-tight leading-none"
        >
          Snap<span className="text-[#FF4D00]">Bite</span>
        </Link>

        <div className="flex items-center gap-6 md:gap-8">
          {/* Desktop nav links */}
          <Link href="/" className="text-[#888] text-[13px] font-medium hover:text-[#0D0D0D] transition-colors hidden md:block">Beranda</Link>
          <Link href="/scan" className="text-[#888] text-[13px] font-medium hover:text-[#0D0D0D] transition-colors hidden md:block">Scan</Link>
          <Link href="/tentang" className="text-[#888] text-[13px] font-medium hover:text-[#0D0D0D] transition-colors hidden md:block">Tentang</Link>

          <Link
            href="/scan"
            className="bg-[#FF4D00] text-white px-5 py-2 text-[13px] font-bold rounded-[2px] hover:bg-[#e64400] transition-colors hidden md:inline-flex"
          >
            Mulai Scan →
          </Link>

          {/* Mobile: CTA + hamburger */}
          <Link
            href="/scan"
            className="bg-[#FF4D00] text-white px-4 py-2 text-[12px] font-bold rounded-[2px] hover:bg-[#e64400] transition-colors md:hidden"
          >
            Scan →
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="md:hidden p-1 text-[#0D0D0D] hover:text-[#FF4D00] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-[#0D0D0D]/60 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[80%] max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-[#E5E5E5]">
          <span className="text-[17px] font-extrabold text-[#0D0D0D] tracking-tight">
            Snap<span className="text-[#FF4D00]">Bite</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="p-1 text-[#888] hover:text-[#0D0D0D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex-1 flex flex-col px-6 py-8 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-4 text-[22px] font-black tracking-tight border-b border-[#E5E5E5] transition-colors ${
                pathname === link.href
                  ? "text-[#FF4D00]"
                  : "text-[#0D0D0D] hover:text-[#FF4D00]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Drawer CTA */}
        <div className="px-6 pb-8">
          <Link
            href="/scan"
            className="block w-full bg-[#FF4D00] text-white text-center py-4 text-[14px] font-extrabold tracking-[0.5px] uppercase hover:bg-[#e64400] transition-colors"
          >
            📷 Mulai Scan Sekarang
          </Link>
        </div>
      </div>
    </>
  );
}
