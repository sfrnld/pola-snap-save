import { CUTOUTS, STICKER_BG, type Meal, type StickerBg } from "@/lib/pola-data";

export function StickerArt({
  image,
  bg,
  alt,
  size = "md",
  plain = false,
}: {
  image: string;
  bg: StickerBg;
  alt: string;
  size?: "sm" | "md" | "lg";
  plain?: boolean;
}) {
  const dims = size === "lg" ? "h-64 w-64" : size === "sm" ? "h-16 w-16" : "h-24 w-24";
  const imgDims =
    size === "lg" ? "max-h-52 max-w-52" : size === "sm" ? "max-h-12 max-w-12" : "max-h-[4.5rem] max-w-[4.5rem]";
  return (
    <div
      className={`${dims} ${plain ? "" : STICKER_BG[bg]} relative flex shrink-0 items-center justify-center rounded-[2rem]`}
    >
      <img
        src={CUTOUTS[image] ?? image}
        alt={alt}
        loading="lazy"
        width={804}
        height={746}
        className={`${imgDims} object-contain sticker-die-cut`}
      />
    </div>
  );
}

export function Sticker({
  meal,
  size = "md",
  plain = false,
}: {
  meal: Meal;
  size?: "sm" | "md" | "lg";
  plain?: boolean;
}) {
  return <StickerArt image={meal.image} bg={meal.bg} alt={meal.title} size={size} plain={plain} />;
}
