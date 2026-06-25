"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

interface ProductImageZoomProps {
  src: string;
  alt: string;
  /**
   * The zoom scale level. Defaults to 2.5
   */
  zoomLevel?: number;
}

export function ProductImageZoom({ src, alt, zoomLevel = 2.5 }: ProductImageZoomProps) {
  const [position, setPosition] = useState({ x: "50%", y: "50%" });
  const [isHovered, setIsHovered] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();

    // Hitung posisi mouse relatif terhadap container (0 - 1)
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    // Ubah ke persentase untuk transform-origin
    setPosition({
      x: `${x * 100}%`,
      y: `${y * 100}%`
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={imageContainerRef}
      className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-crosshair group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 ease-out will-change-transform"
        style={{
          transformOrigin: `${position.x} ${position.y}`,
          transform: isHovered ? `scale(${zoomLevel})` : "scale(1)",
        }}
        priority
        draggable={false}
      />
    </div>
  );
}
