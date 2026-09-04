import { CUTOUTS, STICKER_BG, type Meal, type StickerBg } from "@/lib/pola-data";

/** Die-cut outline filter (white band + thin dark keyline), rendered once per app. */
export function StickerFilterDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        {[
          ["pola-cut-sm", 3, 4],
          ["pola-cut-md", 5, 6.5],
          ["pola-cut-lg", 9, 11],
        ].map(([id, white, dark]) => (
          <filter key={id as string} id={id as string} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={1.4} result="soft" />
            <feComponentTransfer in="soft" result="alpha">
              <feFuncA type="linear" slope={12} intercept={-2} />
            </feComponentTransfer>
            <feMorphology in="alpha" operator="dilate" radius={dark as number} result="outerRaw" />
            <feGaussianBlur in="outerRaw" stdDeviation={1.2} result="outerSoft" />
            <feComponentTransfer in="outerSoft" result="outer">
              <feFuncA type="linear" slope={12} intercept={-4} />
            </feComponentTransfer>
            <feFlood floodColor="#15171a" result="darkFill" />
            <feComposite in="darkFill" in2="outer" operator="in" result="darkBand" />
            <feMorphology in="alpha" operator="dilate" radius={white as number} result="innerRaw" />
            <feGaussianBlur in="innerRaw" stdDeviation={1.2} result="innerSoft" />
            <feComponentTransfer in="innerSoft" result="inner">
              <feFuncA type="linear" slope={12} intercept={-4} />
            </feComponentTransfer>
            <feFlood floodColor="#ffffff" result="whiteFill" />
            <feComposite in="whiteFill" in2="inner" operator="in" result="whiteBand" />
            <feMerge>
              <feMergeNode in="darkBand" />
              <feMergeNode in="whiteBand" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
    </svg>
  );
}

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
        className={`${imgDims} object-contain drop-shadow-[0_10px_12px_rgba(20,22,18,0.28)]`}
        style={{ filter: `url(#pola-cut-${size}) drop-shadow(0 10px 12px rgba(20,22,18,0.28))` }}
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
