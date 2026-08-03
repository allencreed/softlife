"use client";

import Link from "next/link";
import { MetalFx } from "metal-fx";

export function HeroShopButton() {
  return (
    <MetalFx variant="button" preset="gold" theme="dark">
      <Link
        href="/products"
        className="inline-flex items-center justify-center rounded-full bg-black px-[28px] py-[14px] text-[18px] font-light text-white hover:brightness-125 active:scale-[0.96] transition-all"
      >
        Shop All
      </Link>
    </MetalFx>
  );
}
