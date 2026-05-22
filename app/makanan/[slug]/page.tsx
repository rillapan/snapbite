import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import foods from "@/data/foods.json";
import { MapPinIcon, CameraIcon } from "@/components/icons";

type Food = (typeof foods)[0];

export function generateStaticParams() {
  return foods.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const food = foods.find((f) => f.slug === slug);
  if (!food) return {};
  return { title: `${food.nama} — SnapBite`, description: food.deskripsi_singkat };
}

export default async function FoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const food: Food | undefined = foods.find((f) => f.slug === slug);
  if (!food) notFound();

  const paragraphs = food.sejarah.split("\n\n");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-64 md:h-[420px] bg-[#0D0D0D]">
        <Image
          src={food.gambar}
          alt={food.nama}
          fill
          unoptimized
          className="object-cover opacity-70"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/80 via-[#0D0D0D]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D00]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-[60px] pb-8">
          <div className="flex items-center gap-2 text-[#FF4D00] text-[11px] font-bold tracking-[2px] uppercase mb-3">
            <MapPinIcon className="w-4 h-4" /> {food.daerah}
          </div>
          <h1 className="font-sans font-black text-white mb-2 leading-none" style={{ fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '-2px' }}>
            {food.nama.toUpperCase()}
          </h1>
          <p className="text-white/70 text-[15px] italic">&ldquo;{food.tagline}&rdquo;</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-[#E5E5E5] px-6 md:px-[60px] py-3 flex items-center gap-2 text-[12px] text-[#888]">
        <Link href="/" className="hover:text-[#0D0D0D] transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/scan" className="hover:text-[#0D0D0D] transition-colors">Scan</Link>
        <span>/</span>
        <span className="text-[#FF4D00] font-semibold">{food.nama}</span>
      </div>

      <div className="px-4 md:px-[60px] py-8 md:py-12 max-w-5xl">
        {/* Highlight */}
        <div className="border-l-4 border-[#FF4D00] pl-5 mb-12 bg-[#F2F2F2] py-4 pr-5">
          <p className="text-[#0D0D0D] text-[15px] leading-relaxed font-medium">{food.deskripsi_singkat}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Sejarah */}
          <div>
            <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-[#E5E5E5]">
              <span className="text-[11px] font-bold text-[#FF4D00] tracking-[2px] uppercase">01</span>
              <h2 className="font-sans font-extrabold text-[#0D0D0D] text-2xl" style={{ letterSpacing: '-1px' }}>Sejarah &amp; Budaya</h2>
            </div>
            <div className="space-y-4">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-[#555] leading-[1.75] text-[14px]">{para}</p>
              ))}
            </div>
          </div>

          {/* Peta */}
          <div>
            <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-[#E5E5E5]">
              <span className="text-[11px] font-bold text-[#FF4D00] tracking-[2px] uppercase">02</span>
              <h2 className="font-sans font-extrabold text-[#0D0D0D] text-2xl" style={{ letterSpacing: '-1px' }}>Asal Daerah</h2>
            </div>
            <div className="border border-[#E5E5E5] overflow-hidden h-64 md:h-72 mb-3">
              <iframe
                src={food.maps_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta ${food.daerah}`}
              />
            </div>
            <p className="flex items-center gap-1.5 text-[#888] text-[12px] uppercase tracking-[1px]"><MapPinIcon className="w-3.5 h-3.5" /> {food.daerah}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mt-14 pt-8 border-t border-[#E5E5E5]">
          <Link
            href="/scan"
            className="flex flex-1 items-center justify-center gap-2 bg-[#FF4D00] hover:bg-[#e64400] text-white font-bold py-3.5 px-6 text-center text-[13px] uppercase tracking-[0.5px] transition-colors"
          >
            <CameraIcon className="w-4 h-4" /> Scan Makanan Lain
          </Link>
          <Link
            href="/"
            className="flex-1 border border-[#E5E5E5] hover:bg-[#F2F2F2] text-[#0D0D0D] font-bold py-3.5 px-6 text-center text-[13px] uppercase tracking-[0.5px] transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
