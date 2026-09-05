import { CUTOUTS, STICKER_BG, type Meal, type StickerBg } from "@/lib/pola-data";

/**
 * Die-cut sticker outline: thick white band that follows the object silhouette
 * with a subtle hand-drawn wobble, a thin black outer contour, and a soft
 * lower-right lift shadow.
 */
export function StickerFilterDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        {[
          ["pola-cut-sm", 1.5, 3, 1.1],
          ["pola-cut-md", 2.5, 4.5, 1.7],
          ["pola-cut-lg", 4.5, 7, 2.8],
        ].map(([id, white, dark, wobble]) => (
          <filter key={id as string} id={id as string} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={1.4} result="soft" />
            <feComponentTransfer in="soft" result="alpha">
              <feFuncA type="linear" slope={12} intercept={-2} />
            </feComponentTransfer>

            {/* thin black outer contour */}
            <feMorphology in="alpha" operator="dilate" radius={dark as number} result="outerRaw" />
            <feGaussianBlur in="outerRaw" stdDeviation={1.2} result="outerSoft" />
            <feComponentTransfer in="outerSoft" result="outer">
              <feFuncA type="linear" slope={12} intercept={-4} />
            </feComponentTransfer>
            <feFlood floodColor="#15171a" result="darkFill" />
            <feComposite in="darkFill" in2="outer" operator="in" result="darkBand" />

            {/* thick white band */}
            <feMorphology in="alpha" operator="dilate" radius={white as number} result="innerRaw" />
            <feGaussianBlur in="innerRaw" stdDeviation={1.2} result="innerSoft" />
            <feComponentTransfer in="innerSoft" result="inner">
              <feFuncA type="linear" slope={12} intercept={-4} />
            </feComponentTransfer>
            <feFlood floodColor="#ffffff" result="whiteFill" />
            <feComposite in="whiteFill" in2="inner" operator="in" result="whiteBand" />

            <feMerge result="cutRaw">
              <feMergeNode in="darkBand" />
              <feMergeNode in="whiteBand" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>

            {/* casual, slightly hand-cut edge */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.022"
              numOctaves={2}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              in="cutRaw"
              in2="noise"
              scale={wobble as number}
              xChannelSelector="R"
              yChannelSelector="G"
              result="cut"
            />

            {/* soft lower-right lift shadow */}
            <feDropShadow
              in="cut"
              dx={(dark as number) * 0.9}
              dy={(dark as number) * 1.1}
              stdDeviation={(dark as number) * 0.9}
              floodColor="#1b1d1a"
              floodOpacity="0.3"
            />
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
  plain = true,
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
        className={`${imgDims} object-contain`}
        style={{ filter: `url(#pola-cut-${size})` }}
      />
    </div>
  );
}

export function Sticker({
  meal,
  size = "md",
  plain = true,
}: {
  meal: Meal;
  size?: "sm" | "md" | "lg";
  plain?: boolean;
}) {
  return <StickerArt image={meal.image} bg={meal.bg} alt={meal.title} size={size} plain={plain} />;
}
