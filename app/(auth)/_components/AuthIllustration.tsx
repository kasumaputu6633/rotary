import Image from "next/image";

interface AuthIllustrationProps {
  src: string;
}

export default function AuthIllustration({ src }: AuthIllustrationProps) {
  return (
    <div className="hidden md:flex flex-col gap-[10px] items-center justify-center">
      <div className="relative w-[220px] h-[220px] lg:w-[362px] lg:h-[362px]">
        <Image
          src={src}
          alt="Illustration"
          fill
          sizes="(max-width: 1024px) 220px, 362px"
          loading="eager"
          className="object-cover"
        />
      </div>
      <p className="font-open-sauce font-semibold text-[12px] lg:text-[14px] text-black whitespace-nowrap">
        Solusi Cerdas untuk Barang Bekas &amp; Sampahmu
      </p>
      <p className="font-open-sauce text-[11px] lg:text-[12px] text-black text-center w-[220px] lg:w-[357px]">
        Jual beli barang bekas dan setor sampah jadi jauh lebih praktis.
        Yuk, gabung bersama kami!
      </p>
    </div>
  );
}
