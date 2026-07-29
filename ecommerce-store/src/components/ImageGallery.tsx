"use client";

import { useState } from "react";
import { parseImages } from "@/lib/images";

export function ImageGallery({ images, alt }: { images: string; alt: string }) {
  const allImages = parseImages(images);
  const [selected, setSelected] = useState(0);

  if (allImages.length === 0) return null;

  return (
    <div>
      <div className="aspect-square bg-muted rounded-[18px] overflow-hidden">
        <img
          src={allImages[selected]}
          alt={alt}
          width={1024}
          height={1024}
          className="h-full w-full object-cover"
        />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected ? "border-primary" : "border-transparent hover:border-hairline"
              }`}
            >
              <img
                src={img}
                alt={`${alt} ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
