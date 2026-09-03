import { useEffect, useState } from "react";
import { IMAGES } from "@/lib/pola-data";

export function AnalyzingScreen({
  source,
  onDone,
}: {
  source: "photo" | "describe";
  onDone: () => void;
}) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    const doneTimer = setTimeout(onDone, 2600);
    return () => {
      clearInterval(dotTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 animate-pola-fade">
      <div className="relative overflow-hidden rounded-[2rem] shadow-[0_16px_40px_-16px_rgba(60,45,30,0.4)]">
        <img
          src={IMAGES.nasiGulaiImg}
          alt="Captured meal being analyzed"
          width={1024}
          height={1024}
          className="aspect-square w-64 object-cover"
        />
        <div className="absolute inset-x-6 top-6 bottom-6">
          <div className="h-1.5 w-full rounded-full bg-honey/90 blur-[2px] animate-pola-scan" />
        </div>
      </div>
      <h2 className="mt-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
        Finding the pattern in your meal{".".repeat(dots)}
      </h2>
      <p className="mt-2 max-w-[280px] text-center text-sm text-muted-foreground">
        {source === "describe"
          ? "Reading your description and estimating portions — a friendly guess, not a lab result."
          : "Identifying foods, sizes, and how they're cooked — a friendly guess, not a lab result."}
      </p>
    </div>
  );
}
