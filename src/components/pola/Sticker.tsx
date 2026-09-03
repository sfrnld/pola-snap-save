import { Sparkles } from "lucide-react";
import { CUTOUTS, STICKER_BG, type Meal, type StickerBg } from "@/lib/pola-data";

export function StickerArt({
  image,
  bg,
  alt,
  size = "md",
}: {
  image: string;
  bg: StickerBg;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "h-64 w-64" : size === "sm" ? "h-16 w-16" : "h-24 w-24";
  const imgDims =
    size === "lg" ? "max-h-52 max-w-52" : size === "sm" ? "max-h-12 max-w-12" : "max-h-[4.5rem] max-w-[4.5rem]";
  return (
    <div
      className={`${dims} ${STICKER_BG[bg]} relative flex shrink-0 items-center justify-center rounded-[2rem]`}
    >
      <img
        src={CUTOUTS[image] ?? image}
        alt={alt}
        loading="lazy"
        width={804}
        height={746}
        className={`${imgDims} object-contain sticker-die-cut`}
      />
      {size !== "sm" && (
        <Sparkles
          className={`absolute ${size === "lg" ? "right-5 top-5 h-5 w-5" : "right-2.5 top-2.5 h-3 w-3"} text-tomato/70`}
        />
      )}
    </div>
  );
}

export function Sticker({ meal, size = "md" }: { meal: Meal; size?: "sm" | "md" | "lg" }) {
  return <StickerArt image={meal.image} bg={meal.bg} alt={meal.title} size={size} />;
}
