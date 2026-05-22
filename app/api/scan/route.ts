import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import foods from "@/data/foods.json";

// Extend Vercel serverless function timeout (default 10s → 60s)
export const maxDuration = 60;

type DbFood = (typeof foods)[0];

export type AnyFood = {
  slug: string;
  nama: string;
  daerah: string;
  tagline: string;
  deskripsi_singkat: string;
  sejarah: string;
  gambar: string;
  maps_embed_url: string;
};

type ScanResponse =
  | { status: "found"; food: AnyFood; source: "database" | "ai" }
  | { status: "fallback"; food: DbFood }
  | { status: "notFound"; suggestedName: string }
  | { status: "error"; message: string };

function randomFood(): DbFood {
  return foods[Math.floor(Math.random() * foods.length)];
}

function matchFood(raw: string): DbFood | undefined {
  const q = raw.trim().toLowerCase();
  return (
    foods.find((f) => f.slug === q) ||
    foods.find((f) => f.nama.toLowerCase() === q) ||
    foods.find((f) => f.nama.toLowerCase().includes(q)) ||
    foods.find((f) => q.includes(f.nama.toLowerCase())) ||
    foods.find((f) => q.includes(f.slug))
  );
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest): Promise<NextResponse<ScanResponse>> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    console.log("[scan] No API key → fallback");
    return NextResponse.json({ status: "fallback", food: randomFood() });
  }

  let imageBase64: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    if (!imageBase64 || typeof imageBase64 !== "string") throw new Error("no image");
  } catch {
    return NextResponse.json({ status: "error", message: "Request tidak valid" });
  }

  const base64Data = imageBase64.replace(/^data:image\/[a-z+]+;base64,/, "");
  const genAI = new GoogleGenerativeAI(apiKey);

  async function generateWithRetry(prompt: any, isImage = false, _maxRetries = 2) {
    // Try each model in order — quota is per-model, so fallback helps on rate limit
    const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    let lastErr: any;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        if (isImage) {
          return await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          ]);
        } else {
          return await model.generateContent(prompt);
        }
      } catch (err: any) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[scan] Model ${modelName} failed: ${msg.slice(0, 120)}`);

        // On rate limit, try next model (quota is tracked per-model)
        if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) continue;

        // Other errors (invalid key, network) — no point trying other models
        throw err;
      }
    }
    throw lastErr;
  }

  // ── Phase 1: Identifikasi nama makanan dari foto ──────────────────────────
  const identifyPrompt = `Kamu adalah sistem identifikasi makanan Indonesia seperti Google Lens.
Lihat foto ini dan tentukan nama makanan yang terlihat.
Jawab HANYA nama makanannya, huruf kecil, maksimal 3 kata. Contoh:
- "rendang"
- "nasi goreng"
- "soto betawi"
- "gado-gado"
- "pempek kapal selam"
- "es teler"
Jika bukan makanan Indonesia atau tidak yakin sama sekali, jawab: tidak dikenal
JANGAN tambahkan kalimat lain.`;

  let foodName: string;
  try {
    const r = await generateWithRetry(identifyPrompt, true, 3);
    if (!r) throw new Error("No response from Gemini");
    foodName = r.response.text().trim().toLowerCase();
    console.log(`[scan] Phase 1 — identified: "${foodName}"`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[scan] Phase 1 error:", msg);

    if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
      return NextResponse.json({ status: "error", message: "API key tidak valid. Cek kembali key di Vercel Environment Variables." });
    }
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      const isPerMinute = msg.toLowerCase().includes("per minute") || msg.toLowerCase().includes("rate") || msg.includes("429");
      const errMsg = isPerMinute
        ? "Batas permintaan per menit tercapai. Tunggu 60 detik lalu coba lagi."
        : "Kuota harian API Gemini habis. Tunggu besok atau upgrade ke paket berbayar.";
      return NextResponse.json({ status: "error", message: errMsg });
    }
    return NextResponse.json({ status: "error", message: `AI gagal memproses gambar: ${msg}` });
  }

  if (!foodName || foodName === "tidak dikenal") {
    return NextResponse.json({ status: "notFound", suggestedName: "tidak dikenal" });
  }

  // ── Phase 2a: Cek database lokal ─────────────────────────────────────────
  const dbMatch = matchFood(foodName);
  if (dbMatch) {
    console.log(`[scan] Phase 2 — database hit: ${dbMatch.nama}`);
    return NextResponse.json({ status: "found", food: dbMatch, source: "database" });
  }

  // ── Phase 2b: Generate info via Gemini (makanan di luar database) ─────────
  console.log(`[scan] Phase 2 — "${foodName}" not in DB, generating info...`);

  const infoPrompt = `Kamu adalah ensiklopedia kuliner Nusantara yang sangat akurat dan detail.
Tulis informasi lengkap tentang makanan Indonesia bernama "${foodName}".
Kembalikan HANYA objek JSON valid — tidak ada teks lain, tidak ada markdown, tidak ada komentar:

{
  "nama": "Nama resmi makanan dengan huruf kapital yang benar",
  "daerah": "Kota atau provinsi asal di Indonesia",
  "tagline": "Slogan pendek dan menarik, 5-10 kata",
  "deskripsi_singkat": "Deskripsi bahan utama dan cita rasa dalam 1-2 kalimat",
  "sejarah": "Tiga paragraf tentang sejarah, asal-usul, dan nilai budaya makanan ini. Pisahkan setiap paragraf dengan \\n\\n"
}`;

  try {
    const infoResult = await generateWithRetry(infoPrompt, false, 3);
    if (!infoResult) throw new Error("No response from Gemini");
    let raw = infoResult.response.text().trim();
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let info: Record<string, string>;
    try {
      info = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("no JSON found in response");
      info = JSON.parse(match[0]);
    }

    const food: AnyFood = {
      slug: toSlug(String(info.nama || foodName)),
      nama: String(info.nama || foodName),
      daerah: String(info.daerah || "Indonesia"),
      tagline: String(info.tagline || ""),
      deskripsi_singkat: String(info.deskripsi_singkat || ""),
      sejarah: String(info.sejarah || ""),
      gambar: "",
      maps_embed_url: `https://maps.google.com/maps?q=${encodeURIComponent(
        String(info.daerah || "Indonesia") + ", Indonesia"
      )}&output=embed`,
    };

    console.log(`[scan] Phase 2 — AI generated: ${food.nama} (${food.daerah})`);
    return NextResponse.json({ status: "found", food, source: "ai" });
  } catch (err) {
    console.error("[scan] Phase 2 gen error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ status: "notFound", suggestedName: foodName });
  }
}
