import { Icon } from "@iconify/react";

interface MapPinProps {
  type: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export default function MapPin({ type, isSelected, onClick }: MapPinProps) {
  // Warna untuk state belum terpilih
  const bgColor = type === 'tps' ? 'bg-[#17458f]' : 'bg-green-600';

  // Ukuran hirarki dinamis
  const pinSize = type === 'tps' ? 'w-8 h-8' : 'w-6 h-6'; // 32px vs 24px untuk unselected pin
  const iconSize = type === 'tps' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  if (isSelected) {
    return (
      <div 
        onClick={onClick} 
        className="relative flex justify-center cursor-pointer drop-shadow-lg z-50"
      >
        <div className="relative flex justify-center shrink-0">
          <Icon icon="mdi:map-marker" className="w-12 h-12 text-[#EA4335]" />
          <div className="absolute top-[10px] w-3 h-3 bg-[#a50e0e] rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="relative flex justify-center cursor-pointer hover:scale-110 hover:z-50 transition-transform origin-bottom z-10"
    >
      {/* Bentuk Teardrop Pin GMaps asli via CSS (bundar 3 sudut, 1 sudut runcing diputar 45 derajat) */}
      <div 
        className={`flex items-center justify-center ${pinSize} rounded-t-full rounded-bl-full rounded-br-[3px] rotate-45 border border-white shadow-sm ${bgColor}`}
      >
        {/* Konten ikon diputar balik -45 derajat agar tegak */}
        <div className="-rotate-45 flex items-center justify-center">
          <Icon 
            icon={type === 'tps' ? "mdi:storefront" : "mdi:recycle"} 
            className={`${iconSize} text-white`} 
          />
        </div>
      </div>
    </div>
  );
}
