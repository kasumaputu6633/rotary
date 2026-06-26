import Image from 'next/image';
import Link from 'next/link';

export default function HomeWasteHighlight() {
  return (
    <section className="bg-white py-5" aria-labelledby="waste-highlight-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        
        {/* Clipped Container Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-[#fff9f0] border border-[#f5e1c8] rounded-[20px] px-6 py-8 lg:py-10 lg:pl-12 lg:pr-0 relative overflow-hidden shadow-sm min-h-[220px] lg:min-h-[280px]">
          
          {/* Subtle Background Decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-50px] right-[10%] w-[300px] h-[300px] bg-orange-200/30 blur-[60px] rounded-full"></div>
            <div className="absolute bottom-[-50px] right-[30%] w-[250px] h-[250px] bg-yellow-200/30 blur-[50px] rounded-full"></div>
          </div>

          {/* Left Content Area */}
          <div className="flex flex-col items-start z-10 w-full sm:max-w-[80%] lg:max-w-[55%] xl:max-w-[60%]">
            {/* Top Label */}
            <div className="flex items-center gap-1.5 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#f5a623]">
                <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
                <circle cx="12" cy="8" r="2" />
                <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
              </svg>
              <span className="text-[#c78b32] font-bold text-[11px] uppercase tracking-widest">Direktori Limbah</span>
            </div>

            {/* Heading */}
            <h2 id="waste-highlight-heading" className="text-2xl md:text-[28px] lg:text-[34px] font-extrabold text-[#9c6a1e] leading-tight mb-3">
              Buang Barang Bekas Tanpa Bingung
            </h2>

            {/* Description */}
            <p className="text-[#7a6449] text-[14px] lg:text-[15px] mb-6 max-w-xl leading-relaxed">
              Temukan tempat pembuangan atau daur ulang terdekat untuk berbagai jenis barang bekas di kotamu. Kami pastikan limbah tidak berakhir di tempat yang salah.
            </p>

            {/* Badges Container */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {/* Organik */}
              <div className="flex items-center gap-1.5 bg-white text-[#2b7a3b] px-2.5 py-1.5 rounded-lg font-semibold text-[11px] border border-green-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C12 20 20 15 20 8c0-4-3-6-3-6S17 4 17 8z"/>
                </svg>
                Organik
              </div>
              {/* Residu */}
              <div className="flex items-center gap-1.5 bg-white text-[#2a6cb5] px-2.5 py-1.5 rounded-lg font-semibold text-[11px] border border-blue-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M7 19h10a2 2 0 0 0 2-2V7H5v10a2 2 0 0 0 2 2z"/>
                  <path d="M9 3v1H4v2h16V4h-5V3H9z"/>
                </svg>
                Residu
              </div>
              {/* Plastik */}
              <div className="flex items-center gap-1.5 bg-white text-[#9c7a3c] px-2.5 py-1.5 rounded-lg font-semibold text-[11px] border border-orange-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2h6M10 2v4M14 2v4M7 6h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
                </svg>
                Plastik
              </div>
              {/* Lainnya */}
              <div className="flex items-center gap-1.5 bg-white text-[#4b5563] px-2.5 py-1.5 rounded-lg font-semibold text-[11px] border border-gray-200 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="5" cy="12" r="2.5"/>
                  <circle cx="12" cy="12" r="2.5"/>
                  <circle cx="19" cy="12" r="2.5"/>
                </svg>
                Lainnya
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/waste" className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e0961b] text-white px-5 py-2.5 rounded-lg font-bold text-[13px] transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Cari Lokasi Terdekat &rarr;
            </Link>
          </div>

          {/* Right Image (Massive, Clipped, Masked on Desktop, Hidden on Mobile/Tablet) */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-[0%] w-[520px] xl:w-[600px] aspect-[4/3] pointer-events-none z-0 [mask-image:linear-gradient(to_right,transparent_0%,black_30%)]">
            <Image 
              src="/illustrations/waste-location.png" 
              alt="Ilustrasi tempat pembuangan sampah" 
              fill 
              className="object-contain object-right drop-shadow-lg"
              priority
              sizes="(max-width: 1024px) 520px, 600px"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
