import Image from 'next/image';
import Link from 'next/link';

export default function HomeWasteHighlight() {
  return (
    <section className="bg-white py-5" aria-labelledby="waste-highlight-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-[#f0f7f0] via-[#f5faf5] to-white rounded-2xl px-6 py-8 lg:py-10 lg:pl-12 lg:pr-0 relative overflow-hidden min-h-[220px] lg:min-h-[280px]">
          <div className="flex flex-col items-start z-10 w-full sm:max-w-[80%] lg:max-w-[55%] xl:max-w-[60%]">
            <span className="text-emerald-600 font-semibold text-[13px] mb-1">Direktori Limbah</span>

            <h2 id="waste-highlight-heading" className="text-2xl md:text-[28px] lg:text-[32px] font-bold text-[#1a1a1a] leading-tight mb-3">
              Buang Barang Bekas Tanpa Bingung
            </h2>

            <p className="text-gray-500 text-[14px] lg:text-[15px] mb-4 max-w-lg leading-relaxed">
              Temukan tempat pembuangan atau daur ulang terdekat untuk berbagai jenis barang bekas di kotamu.
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-400 mb-6">
              <span>Plastik</span>
              <span>·</span>
              <span>Organik</span>
              <span>·</span>
              <span>Kertas</span>
              <span>·</span>
              <span>Elektronik</span>
              <span>·</span>
              <span>Logam</span>
              <span>·</span>
              <span className="text-gray-500">dan lainnya</span>
            </div>

            <Link href="/waste" className="inline-flex items-center gap-2 bg-[#17458f] hover:bg-[#123a78] text-white px-5 py-2.5 rounded-lg font-semibold text-[13px] transition-colors">
              Cari Lokasi Terdekat &rarr;
            </Link>
          </div>

          <div className="hidden lg:block absolute top-[-20px] right-[0%] w-[520px] xl:w-[600px] aspect-[4/3] pointer-events-none z-0 [mask-image:linear-gradient(to_right,transparent_0%,black_30%)]">
            <Image
              src="/illustrations/waste-location.png"
              alt="Ilustrasi tempat pembuangan sampah"
              fill
              className="object-contain object-right-top drop-shadow-lg"
              priority
              sizes="(max-width: 1024px) 520px, 600px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
