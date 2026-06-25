"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { ListingCardData } from "@/lib/listing-format";
import ProductActionCard from "./ProductActionCard";
import ProductGallery from "./ProductGallery";

type ProductDetailExperienceProps = {
  children: ReactNode;
  imageUrls: string[];
  product: ListingCardData;
  publicLocation: string;
  sellerWhatsapp?: string | null;
  isOwner?: boolean;
};

export default function ProductDetailExperience({
  children,
  imageUrls,
  product,
  publicLocation,
  sellerWhatsapp,
  isOwner,
}: ProductDetailExperienceProps) {
  const galleryImages = useMemo(() => {
    if (imageUrls.length > 0) return imageUrls;
    return product.imageUrl ? [product.imageUrl] : [];
  }, [imageUrls, product.imageUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImageUrl = galleryImages[activeIndex] ?? product.imageUrl ?? null;

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_300px]">
      <ProductGallery
        activeIndex={activeIndex}
        images={galleryImages}
        onActiveIndexChange={setActiveIndex}
        product={product}
      />

      {children}

      <aside data-product-action-sticky className="lg:col-span-2 xl:sticky xl:top-[196px] xl:col-span-1 xl:self-start">
        <div className="xl:max-h-[calc(100vh-212px)] xl:overflow-y-auto xl:rounded-lg xl:[scrollbar-width:thin]">
          <ProductActionCard
            imageUrl={product.imageUrl}
            product={product}
            publicLocation={publicLocation}
            sellerWhatsapp={sellerWhatsapp}
            isOwner={isOwner}
          />
        </div>
      </aside>
    </section>
  );
}
