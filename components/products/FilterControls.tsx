"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function SortSelector({
  currentSortBy,
  getQueryUrl,
}: {
  currentSortBy: string;
  getQueryUrl: (updates: any) => string;
}) {
  const router = useRouter();
  const [val, setVal] = useState("");

  useEffect(() => {
    setVal(getQueryUrl({ sortBy: currentSortBy }));
  }, [currentSortBy, getQueryUrl]);

  return (
    <select
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        router.push(e.target.value);
      }}
      className="bg-transparent border-0 text-xs font-bold text-white focus:outline-none cursor-pointer"
    >
      <option value={getQueryUrl({ sortBy: "newest" })} className="bg-zinc-900 text-white">
        Newest Arrivals
      </option>
      <option value={getQueryUrl({ sortBy: "price_asc" })} className="bg-zinc-900 text-white">
        Price: Low to High
      </option>
      <option value={getQueryUrl({ sortBy: "price_desc" })} className="bg-zinc-900 text-white">
        Price: High to Low
      </option>
      <option value={getQueryUrl({ sortBy: "popular" })} className="bg-zinc-900 text-white">
        Bestseller / Popular
      </option>
    </select>
  );
}

export function PriceRangeFilter({
  priceMin,
  priceMax,
  getQueryUrl,
}: {
  priceMin?: number;
  priceMax?: number;
  getQueryUrl: (updates: any) => string;
}) {
  const router = useRouter();
  const [minVal, setMinVal] = useState("");
  const [maxVal, setMaxVal] = useState("");

  useEffect(() => {
    setMinVal(priceMin?.toString() || "");
  }, [priceMin]);

  useEffect(() => {
    setMaxVal(priceMax?.toString() || "");
  }, [priceMax]);

  const handleMinBlur = () => {
    router.push(getQueryUrl({ priceMin: minVal || undefined }));
  };

  const handleMaxBlur = () => {
    router.push(getQueryUrl({ priceMax: maxVal || undefined }));
  };

  return (
    <div className="flex gap-2">
      <input
        type="number"
        placeholder="Min"
        value={minVal}
        onChange={(e) => setMinVal(e.target.value)}
        onBlur={handleMinBlur}
        onKeyDown={(e) => e.key === "Enter" && handleMinBlur()}
        className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/30 transition-colors"
      />
      <input
        type="number"
        placeholder="Max"
        value={maxVal}
        onChange={(e) => setMaxVal(e.target.value)}
        onBlur={handleMaxBlur}
        onKeyDown={(e) => e.key === "Enter" && handleMaxBlur()}
        className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/30 transition-colors"
      />
    </div>
  );
}
