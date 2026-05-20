"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Upload, Trash2, X } from "lucide-react";
import foodsData from "@/data/foods.json";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { CameraIcon, SearchIcon, RotateCcwIcon, AlertTriangleIcon, UtensilsIcon, MapPinIcon } from "@/components/icons";

const ScannerCardStream = dynamic(
  () => import("@/components/ui/scanner-card-stream").then(m => m.ScannerCardStream),
  { ssr: false }
);

type FoodResult = {
  slug: string;
  nama: string;
  daerah: string;
  tagline: string;
  deskripsi_singkat: string;
  sejarah: string;
  gambar: string;
  maps_embed_url: string;
};

type Status = "idle" | "scanning" | "done" | "notFound" | "error";
type ResultSource = "database" | "ai" | "fallback";

const scanMessages = [
  "Menganalisis warna dan tekstur...",
  "Mengenali pola bumbu dan rempah...",
  "Mengidentifikasi jenis masakan...",
  "Mencari informasi kuliner Nusantara...",
  "Memverifikasi data budaya...",
];

const FOOD_BG_IMAGES = [
  "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=250&fit=crop",
];

function resizeToBase64(file: File, maxPx = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ScanPage() {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove: hookHandleRemove,
  } = useImageUpload();

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<FoodResult | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [resultSource, setResultSource] = useState<ResultSource>("fallback");
  const [notFoundName, setNotFoundName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const fakeEvent = {
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      }
    },
    [handleFileChange],
  );

  async function handleScan() {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !previewUrl) return;

    setStatus("scanning");
    setMsgIdx(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setMsgIdx(idx % scanMessages.length);
    }, 800);

    try {
      const imageBase64 = await resizeToBase64(file);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.status === "found") {
        setResult(data.food);
        setResultSource(data.source === "database" ? "database" : "ai");
        setStatus("done");
      } else if (data.status === "fallback") {
        setResult(data.food);
        setResultSource("fallback");
        setStatus("done");
      } else if (data.status === "notFound") {
        setNotFoundName(data.suggestedName);
        setStatus("notFound");
      } else if (data.status === "error") {
        setErrorMessage(data.message ?? "Terjadi kesalahan");
        setStatus("error");
      } else {
        setErrorMessage(data.message ?? "Gagal menganalisis gambar.");
        setStatus("error");
      }
    } catch (err: unknown) {
      clearInterval(interval);
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan sistem atau koneksi."
      );
      setStatus("error");
    }
  }

  function handleReset() {
    hookHandleRemove();
    setStatus("idle");
    setResult(null);
    setNotFoundName(null);
    setErrorMessage(null);
    setResultSource("fallback");
  }

  const badgeLabel: Record<ResultSource, string> = {
    database: "Data SnapBite",
    ai: "Dianalisis AI",
    fallback: "Mode Demo",
  };

  // Card images for scanner animation: user's photo first, then food backgrounds
  const scannerImages = previewUrl
    ? [previewUrl, ...FOOD_BG_IMAGES]
    : FOOD_BG_IMAGES;

  return (
    <div className="min-h-screen bg-white">
      {/* Scanner overlay — shown while scanning */}
      {status === "scanning" && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Scanner animation fills the screen */}
          <div className="flex-1">
            <ScannerCardStream
              cardImages={scannerImages}
              initialSpeed={180}
              repeat={5}
              scanEffect="scramble"
            />
          </div>

          {/* Scanning status bar pinned at bottom */}
          <div className="relative z-10 px-6 py-8 flex flex-col items-center gap-4 bg-gradient-to-t from-black via-black/90 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-[#FF4D00] rounded-full animate-spin" />
              <span className="text-white text-[13px] font-medium tracking-wide">
                {scanMessages[msgIdx]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
              <span className="text-white/40 text-[11px] uppercase tracking-[2px]">
                AI SnapBite · Analisis Nusantara
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 md:px-[60px] py-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex items-center gap-2 bg-[#0D0D0D] text-white text-[11px] font-bold tracking-[2px] uppercase px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
            AI Vision
          </div>
        </div>
        <h1
          className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl"
          style={{ letterSpacing: "-2px" }}
        >
          Scan Makanan
        </h1>
        <p className="text-[#888] text-[15px] mt-2 max-w-md">
          Upload foto makanan — AI mengidentifikasi dan menggali info budayanya dari seluruh Nusantara.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 md:px-6 py-12">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload area — drag & drop */}
        {!previewUrl && (
          <div
            onClick={handleThumbnailClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "border-2 border-dashed p-14 text-center cursor-pointer transition-all",
              isDragging
                ? "border-[#FF4D00] bg-[#fff8f6] scale-[1.01]"
                : "border-[#E5E5E5] hover:border-[#FF4D00] hover:bg-[#fff8f6]",
            ].join(" ")}
          >
            <div className="flex justify-center mb-4">
              <div
                className={[
                  "rounded-full p-4 transition-colors",
                  isDragging ? "bg-[#FF4D00]/10 text-[#FF4D00]" : "bg-[#F2F2F2] text-[#888]",
                ].join(" ")}
              >
                <ImagePlus className="w-8 h-8" />
              </div>
            </div>
            <p className="font-bold text-[#0D0D0D] text-[15px] mb-1">
              {isDragging ? "Lepas foto di sini" : "Upload foto makanan"}
            </p>
            <p className="text-[#888] text-[13px]">
              {isDragging ? "Kami akan langsung memprosesnya" : "Klik di sini atau seret foto ke area ini"}
            </p>
            <p className="text-[#ccc] text-[11px] mt-2 uppercase tracking-[1px]">
              JPG · PNG · HEIC hingga 10MB
            </p>
          </div>
        )}

        {/* Preview + idle/scanning actions */}
        {previewUrl && status === "idle" && (
          <div className="border border-[#E5E5E5] overflow-hidden">
            {/* Image preview with hover actions */}
            <div className="group relative h-64 bg-[#F2F2F2] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={handleThumbnailClick}
                  className="bg-white/90 hover:bg-white text-[#0D0D0D] rounded-full p-3 transition-colors"
                  title="Ganti foto"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-500/90 hover:bg-red-500 text-white rounded-full p-3 transition-colors"
                  title="Hapus foto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* File name row */}
            {fileName && (
              <div className="flex items-center gap-2 px-4 py-2 border-t border-[#E5E5E5] bg-[#FAFAFA]">
                <CameraIcon className="w-4 h-4 text-[#888] shrink-0" />
                <span className="truncate text-[12px] text-[#888]">{fileName}</span>
                <button onClick={handleReset} className="ml-auto rounded-full p-1 hover:bg-[#E5E5E5]">
                  <X className="w-4 h-4 text-[#888]" />
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="p-5 flex gap-3 border-t border-[#E5E5E5]">
              <button
                onClick={handleScan}
                className="flex flex-1 items-center justify-center gap-2 bg-[#FF4D00] hover:bg-[#e64400] text-white font-bold py-3 text-[13px] tracking-[0.5px] uppercase transition-colors"
              >
                <SearchIcon className="w-4 h-4" /> Scan Sekarang
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-3 border border-[#E5E5E5] text-[#888] hover:bg-[#F2F2F2] transition-colors"
              >
                <RotateCcwIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error panel */}
        {status === "error" && errorMessage && (
          <div className="border border-red-200 overflow-hidden">
            <div className="bg-[#0D0D0D] px-5 py-3 flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-red-400" />
              <span className="text-white text-[12px] font-bold tracking-[1px] uppercase">
                Gagal Terhubung ke AI
              </span>
            </div>
            <div className="p-6">
              <p className="text-[#0D0D0D] font-bold text-[16px] mb-2">Terjadi Kesalahan</p>
              <p className="text-[#888] text-[13px] leading-relaxed mb-2">{errorMessage}</p>
              <p className="text-[#bbb] text-[12px] leading-relaxed mb-6">
                Jika pesan di atas menyebut limit/kuota, tunggu beberapa menit lalu coba lagi — bisa
                jadi batas per-menit tercapai, bukan kuota harian habis.
              </p>
              <button
                onClick={handleReset}
                className="w-full bg-[#0D0D0D] hover:bg-[#FF4D00] text-white font-bold py-3 text-[13px] uppercase tracking-[0.5px] transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Not found */}
        {status === "notFound" && notFoundName && (
          <div className="border border-[#E5E5E5] overflow-hidden">
            <div className="bg-[#0D0D0D] px-5 py-3 flex items-center gap-2">
              <SearchIcon className="w-5 h-5 text-[#FF4D00]" />
              <span className="text-white text-[12px] font-bold tracking-[1px] uppercase">
                Tidak Terdeteksi
              </span>
            </div>
            <div className="p-6">
              <p className="text-[#0D0D0D] font-bold text-[16px] mb-1">
                {notFoundName === "tidak dikenal" ? (
                  "Makanan tidak teridentifikasi"
                ) : (
                  <>
                    Terdeteksi:{" "}
                    <span className="text-[#FF4D00] capitalize">{notFoundName}</span>
                  </>
                )}
              </p>
              <p className="text-[#888] text-[13px] leading-relaxed mb-6">
                AI tidak dapat mengidentifikasi makanan ini. Pastikan foto menampilkan makanan
                Nusantara dengan jelas.
              </p>
              <button
                onClick={handleReset}
                className="w-full bg-[#0D0D0D] hover:bg-[#FF4D00] text-white font-bold py-3 text-[13px] uppercase tracking-[0.5px] transition-colors"
              >
                Coba Foto Lain
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {status === "done" && result && (
          <div className="border border-[#E5E5E5] overflow-hidden">
            <div className="bg-[#0D0D0D] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF4D00] rounded-full animate-pulse" />
                <span className="text-white text-[12px] font-bold tracking-[1px] uppercase">
                  {badgeLabel[resultSource]}
                </span>
              </div>
              {resultSource === "fallback" && (
                <span className="text-white/30 text-[10px] uppercase tracking-[1px]">simulasi</span>
              )}
              {resultSource === "ai" && (
                <span className="text-[#FF4D00]/70 text-[10px] uppercase tracking-[1px]">
                  gemini · info ai
                </span>
              )}
            </div>

            {result.gambar ? (
              <div className="relative h-52 bg-[#0D0D0D]">
                <Image
                  src={result.gambar}
                  alt={result.nama}
                  fill
                  unoptimized
                  className="object-cover opacity-85"
                  sizes="(max-width: 640px) 100vw, 512px"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D00]/30 to-transparent" />
              </div>
            ) : (
              <div className="h-52 bg-[#0D0D0D] flex flex-col items-center justify-center gap-3">
                <UtensilsIcon className="w-16 h-16 text-white/20" />
                <p className="text-white/30 text-[11px] uppercase tracking-[2px]">
                  foto tidak tersedia
                </p>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-1.5 text-[#FF4D00] text-[10px] font-bold tracking-[2px] uppercase mb-2">
                <MapPinIcon className="w-3 h-3" /> {result.daerah}
              </div>
              <h2
                className="font-sans font-black text-[#0D0D0D] text-2xl mb-1"
                style={{ letterSpacing: "-1px" }}
              >
                {result.nama}
              </h2>
              {result.tagline && (
                <p className="text-[#FF4D00] text-[13px] font-medium italic mb-3">
                  &ldquo;{result.tagline}&rdquo;
                </p>
              )}
              <p className="text-[#888] text-[13px] leading-relaxed mb-6">{result.deskripsi_singkat}</p>

              {resultSource === "ai" && result.sejarah && (
                <div className="border-t border-[#E5E5E5] pt-5 mb-6">
                  <p className="text-[11px] font-bold text-[#FF4D00] tracking-[2px] uppercase mb-3">
                    Sejarah &amp; Budaya
                  </p>
                  <div className="space-y-3">
                    {result.sejarah.split("\n\n").map((para, i) => (
                      <p key={i} className="text-[#555] text-[13px] leading-[1.75]">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {resultSource === "ai" && result.maps_embed_url && (
                <div className="border border-[#E5E5E5] overflow-hidden h-48 mb-6">
                  <iframe
                    src={result.maps_embed_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Peta ${result.daerah}`}
                  />
                </div>
              )}

              {resultSource === "ai" && (
                <p className="text-[#bbb] text-[11px] mb-5 leading-relaxed">
                  * Info dihasilkan oleh Gemini AI — mungkin tidak 100% akurat.
                </p>
              )}

              <div className="flex gap-3">
                {resultSource === "database" ? (
                  <Link
                    href={`/makanan/${result.slug}`}
                    className="flex-1 bg-[#FF4D00] hover:bg-[#e64400] text-white font-bold py-3 text-center text-[13px] uppercase tracking-[0.5px] transition-colors"
                  >
                    Lihat Detail Lengkap →
                  </Link>
                ) : (
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(result.nama + " makanan Indonesia")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#FF4D00] hover:bg-[#e64400] text-white font-bold py-3 text-center text-[13px] uppercase tracking-[0.5px] transition-colors"
                  >
                    Cari di Google →
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="px-5 py-3 border border-[#E5E5E5] text-[#888] hover:bg-[#F2F2F2] text-[13px] transition-colors"
                >
                  Scan Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {status === "idle" && !previewUrl && (
          <p className="text-center text-[#ccc] text-[11px] mt-6 uppercase tracking-[1px]">
            Didukung Google Gemini Vision · Deteksi 500+ masakan Nusantara
          </p>
        )}
      </div>
    </div>
  );
}
