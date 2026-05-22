"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ImagePlus, Upload, Trash2, X, Camera } from "lucide-react";
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
    capturedFileRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove: hookHandleRemove,
    setFromFile,
  } = useImageUpload();

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<FoodResult | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [resultSource, setResultSource] = useState<ResultSource>("fallback");
  const [notFoundName, setNotFoundName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

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
    // Camera captures land in capturedFileRef; file-input uploads land in fileInputRef
    const file = capturedFileRef.current ?? fileInputRef.current?.files?.[0];
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

  const scannerImages = previewUrl
    ? [previewUrl, ...FOOD_BG_IMAGES]
    : FOOD_BG_IMAGES;

  return (
    <div className="min-h-screen bg-white">
      {/* Camera overlay */}
      {cameraOpen && (
        <CameraOverlay
          onCapture={(file) => {
            setFromFile(file);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Scanner overlay — shown while scanning */}
      {status === "scanning" && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex-1">
            <ScannerCardStream
              cardImages={scannerImages}
              initialSpeed={180}
              repeat={5}
              scanEffect="scramble"
            />
          </div>
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

      <div className="max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 md:px-8 py-12">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload area */}
        {!previewUrl && (
          <div className="md:max-w-xl md:mx-auto">
            <div
              onClick={handleThumbnailClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                "border-2 border-dashed p-10 text-center cursor-pointer transition-all",
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

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-[11px] text-[#bbb] uppercase tracking-[1px]">atau</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            {/* Camera button */}
            <button
              onClick={() => setCameraOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-[#E5E5E5] py-4 text-[13px] font-bold text-[#555] hover:border-[#FF4D00] hover:text-[#FF4D00] transition-colors"
            >
              <Camera className="w-5 h-5" />
              Ambil Foto dengan Kamera
            </button>
          </div>
        )}

        {/* Preview + idle/scanning actions */}
        {previewUrl && status === "idle" && (
          <div className="md:max-w-xl md:mx-auto border border-[#E5E5E5] overflow-hidden">
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
                  onClick={() => setCameraOpen(true)}
                  className="bg-white/90 hover:bg-white text-[#0D0D0D] rounded-full p-3 transition-colors"
                  title="Ambil ulang dari kamera"
                >
                  <Camera className="w-5 h-5" />
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

            {fileName && (
              <div className="flex items-center gap-2 px-4 py-2 border-t border-[#E5E5E5] bg-[#FAFAFA]">
                <CameraIcon className="w-4 h-4 text-[#888] shrink-0" />
                <span className="truncate text-[12px] text-[#888]">{fileName}</span>
                <button onClick={handleReset} className="ml-auto rounded-full p-1 hover:bg-[#E5E5E5]">
                  <X className="w-4 h-4 text-[#888]" />
                </button>
              </div>
            )}

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
          <div className="md:max-w-xl md:mx-auto border border-red-200 overflow-hidden">
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
          <div className="md:max-w-xl md:mx-auto border border-[#E5E5E5] overflow-hidden">
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
            {/* Status bar */}
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

            {/* Body: stacked on mobile, side-by-side on desktop */}
            <div className="md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[380px_1fr]">
              {/* Image column */}
              {(() => {
                const displayImg = result.gambar || previewUrl;
                return displayImg ? (
                  <div className="relative h-56 md:h-full md:min-h-[420px] bg-[#0D0D0D]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImg}
                      alt={result.nama}
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D00]/30 to-transparent" />
                  </div>
                ) : (
                  <div className="h-56 md:h-full md:min-h-[420px] bg-[#0D0D0D] flex flex-col items-center justify-center gap-3">
                    <UtensilsIcon className="w-16 h-16 text-white/20" />
                    <p className="text-white/30 text-[11px] uppercase tracking-[2px]">
                      foto tidak tersedia
                    </p>
                  </div>
                );
              })()}

              {/* Info column */}
              <div className="p-6 md:p-8 md:overflow-y-auto">
                <div className="flex items-center gap-1.5 text-[#FF4D00] text-[10px] font-bold tracking-[2px] uppercase mb-2">
                  <MapPinIcon className="w-3 h-3" /> {result.daerah}
                </div>
                <h2
                  className="font-sans font-black text-[#0D0D0D] text-2xl md:text-3xl mb-1"
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

// ─── Camera Overlay ───────────────────────────────────────────────────────────

function CameraOverlay({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError("Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan di browser.");
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleClose() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !ready) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const file = new File([blob], `snapbite-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 shrink-0 bg-black/60">
        <span className="text-white font-extrabold text-[15px] tracking-tight">
          Snap<span className="text-[#FF4D00]">Bite</span>
        </span>
        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors p-2"
          aria-label="Tutup kamera"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden bg-[#0D0D0D]">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <Camera className="w-14 h-14 text-white/20" />
            <p className="text-white/60 text-[14px] leading-relaxed">{error}</p>
            <button
              onClick={handleClose}
              className="mt-2 px-6 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white text-[13px] transition-colors"
            >
              Kembali
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setReady(true)}
            className="w-full h-full object-cover"
          />
        )}

        {/* Scan guide frame */}
        {!error && ready && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-60 h-60 sm:w-72 sm:h-72">
              {/* Dimmed overlay outside frame — using box-shadow trick */}
              <div className="absolute inset-0 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
              {/* Corner marks */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-[#FF4D00] rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-[#FF4D00] rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-[#FF4D00] rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-[#FF4D00] rounded-br-lg" />
            </div>
            {/* Hint text */}
            <p className="absolute bottom-[calc(50%-160px)] sm:bottom-[calc(50%-176px)] text-white/60 text-[11px] tracking-[1px] uppercase">
              Arahkan kamera ke makanan
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="pb-10 pt-6 flex items-center justify-center gap-12 shrink-0 bg-black/60">
        {/* Cancel */}
        <button
          onClick={handleClose}
          className="text-white/50 text-[12px] font-medium uppercase tracking-[1px] hover:text-white transition-colors w-16 text-center"
        >
          Batal
        </button>

        {/* Shutter */}
        <button
          onClick={capture}
          disabled={!ready || !!error}
          aria-label="Ambil foto"
          className="w-16 h-16 rounded-full bg-white border-[5px] border-[#FF4D00] hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
        />

        {/* Spacer to balance layout */}
        <div className="w-16" />
      </div>
    </div>
  );
}
