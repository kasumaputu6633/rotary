import Image from "next/image";

interface AuthIllustrationProps {
  src: string;
}

export default function AuthIllustration({ src }: AuthIllustrationProps) {
  return (
    <div className="flex flex-col gap-[10px] items-center justify-center">
      <div className="relative w-[362px] h-[362px]">
        <Image
          src={src}
          alt="Illustration"
          fill
          sizes="362px"
          loading="eager"
          className="object-cover"
        />
      </div>
      <p className="font-open-sauce font-semibold text-[14px] text-black whitespace-nowrap">
        Solusi Cerdas untuk Barang Bekas &amp; Sampahmu
      </p>
      <p className="font-open-sauce text-[12px] text-black text-center w-[357px]">
        Jual beli barang bekas dan setor sampah jadi jauh lebih praktis.
        Yuk, gabung bersama kami!
      </p>
    </div>
  );
}
