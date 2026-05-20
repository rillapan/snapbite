import Link from "next/link";
import Image from "next/image";
import foods from "@/data/foods.json";
import { CameraIcon, BotIcon, MapIcon, MapPinIcon } from "@/components/icons";
import { FloatingFoodHero } from "@/components/ui/hero-section-7";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";

export default function HomePage() {
  const heroImages = [
    {
      src: '/images/bakso.png',
      alt: 'Bakso',
      className: 'w-28 sm:w-36 md:w-52 lg:w-64 top-10 left-4 sm:left-10 md:top-20 md:left-20',
    },
    {
      src: '/images/sate.png',
      alt: 'Sate ayam',
      className: 'w-24 sm:w-32 md:w-48 top-10 right-4 sm:right-10 md:top-16 md:right-16',
    },
    {
      src: '/images/gudek.png',
      alt: 'Gudeg',
      className: 'w-24 sm:w-32 md:w-48 bottom-8 right-5 sm:right-10 md:bottom-16 md:right-20',
    },
    {
      src: '/images/pempek.png',
      alt: 'Pempek',
      className: 'w-20 sm:w-28 md:w-40 bottom-20 left-4 sm:left-12 md:bottom-24 md:left-24',
    },
  ];

  return (
    <div>
      <FloatingFoodHero
        title={
          <>
            KENALI <span className="text-[#FF4D00]">KULINER</span><br />
            DARI FOTO
          </>
        }
        description="Upload foto makanan dan SnapBite akan mengidentifikasi nama, asal daerah, sejarah, serta lokasi terbaik untuk menikmatinya."
        images={heroImages}
      />

      {/* Steps */}
      <section className="px-6 md:px-[60px] py-[80px] bg-white border-b border-[#E5E5E5]">
        <div className="flex items-baseline justify-between mb-12 border-b border-[#E5E5E5] pb-6">
          <span className="text-[11px] font-bold text-[#FF4D00] tracking-[2px] uppercase">Cara Kerja</span>
          <span className="font-sans font-extrabold text-[#0D0D0D] text-3xl md:text-4xl" style={{ letterSpacing: '-1.5px' }}>Tiga Langkah</span>
        </div>
        <div className="grid md:grid-cols-3 border border-[#E5E5E5]">
          {[
            { num: "01", icon: <CameraIcon className="w-8 h-8" />, title: "Upload Foto", desc: "Ambil foto makanan yang ingin kamu kenali. Format JPG, PNG diterima." },
            { num: "02", icon: <BotIcon className="w-8 h-8" />, title: "Analisis AI", desc: "Sistem menganalisis foto untuk mengidentifikasi jenis makanan." },
            { num: "03", icon: <MapIcon className="w-8 h-8" />, title: "Temukan Kisahnya", desc: "Baca sejarah, asal daerah, dan lokasi restoran terbaik." },
          ].map((item, i) => (
            <div key={item.num} className={`p-8 md:p-9 ${i < 2 ? 'border-b md:border-b-0 md:border-r' : ''} border-[#E5E5E5]`}>
              <div className="font-black text-[64px] text-[#F0F0F0] leading-none mb-4" style={{ letterSpacing: '-2px' }}>{item.num}</div>
              <div className="text-2xl mb-3 text-[#0D0D0D]">{item.icon}</div>
              <div className="text-[16px] font-bold text-[#0D0D0D] mb-2">{item.title}</div>
              <div className="text-[13px] text-[#888] leading-[1.65]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>



      {/* Kuliner Pilihan Section */}
      <section className="px-6 md:px-[60px] py-[80px] bg-[#F2F2F2] border-b border-[#E5E5E5]">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-[11px] font-bold tracking-[3px] uppercase text-[#FF4D00] mb-3">
            Rekomendasi
          </div>
          <h2 className="font-sans font-black text-[#0D0D0D] text-[40px] md:text-[56px] leading-[1.1]" style={{ letterSpacing: '-2px' }}>
            KULINER PILIHAN
          </h2>
          <p className="mt-4 text-[#888] text-[15px] max-w-md">
            Jelajahi ragam cita rasa autentik dari berbagai daerah di Indonesia yang wajib Anda cicipi.
          </p>
        </div>
        
        <div className="mx-auto w-full max-w-5xl">
          <CardStack
            items={[
              {
                id: 1,
                title: "Gudeg",
                description: "Nangka muda yang dimasak lambat dengan santan dan gula aren.",
                imageSrc: "/images/Kuliner Pilihan/Gudeg.jpeg",
              },
              {
                id: 2,
                title: "Sate Padang",
                description: "Sate daging sapi dengan bumbu kuning kental yang kaya rempah.",
                imageSrc: "/images/Kuliner Pilihan/Sate padang.jpeg",
              },
              {
                id: 3,
                title: "Soto Ayam",
                description: "Sup kaldu ayam kuning khas Indonesia dengan kunyit.",
                imageSrc: "/images/Kuliner Pilihan/Soto Ayam.jpeg",
              },
              {
                id: 4,
                title: "Nasi Megono",
                description: "Nasi dengan cacahan nangka muda khas pesisir utara Jawa.",
                imageSrc: "/images/Kuliner Pilihan/megono.jpeg",
              },
              {
                id: 5,
                title: "Pempek",
                description: "Kue ikan gurih dari Palembang yang disajikan dengan cuko.",
                imageSrc: "/images/Kuliner Pilihan/pempek.jpeg",
              },
            ]}
            initialIndex={0}
            autoAdvance
            intervalMs={2500}
            pauseOnHover
            showDots
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-[60px] py-24 bg-[#FF4D00] text-center">
        <h2 className="font-sans font-black text-white mb-4 leading-none" style={{ fontSize: 'clamp(36px, 6vw, 60px)', letterSpacing: '-2px' }}>
          SCAN MAKANANMU<br />SEKARANG
        </h2>
        <p className="text-white/80 text-[16px] mb-9">
          Upload foto dan biarkan AI mengungkap kisah di balik setiap hidangan.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-white text-[#FF4D00] px-10 py-4 text-[14px] font-extrabold uppercase tracking-[0.5px] hover:bg-[#0D0D0D] hover:text-white transition-colors"
        >
          <CameraIcon className="w-5 h-5" /> Mulai Scan
        </Link>
      </section>
    </div>
  );
}
