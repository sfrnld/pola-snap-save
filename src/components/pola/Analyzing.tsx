import { useEffect, useState } from "react";
import { IMAGES } from "@/lib/pola-data";

const STEPS = ["Scanning your photo", "Identifying ingredients", "Calculating calories"];

export function AnalyzingScreen({
  source,
  onDone,
}: {
  source: "photo" | "describe";
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 850);
    const doneTimer = setTimeout(onDone, 2600);
    return () => {
      clearInterval(stepTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className="flex flex-1 flex-col animate-pola-fade">
      {/* scanning viewfinder */}
      <div className="relative overflow-hidden">
        <img
          src={IMAGES.nasiGulaiImg}
          alt="Captured meal being analyzed"
          width={1024}
          height={1024}
          className="aspect-square w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-8 inset-y-10">
          {[
            "left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl",
            "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl",
            "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-3xl",
            "right-0 bottom-0 border-r-4 border-b-4 rounded-br-3xl",
          ].map((c) => (
            <span key={c} className={`absolute h-12 w-12 border-white/85 ${c}`} />
          ))}
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-1 w-full bg-lime shadow-[0_0_24px_6px_var(--color-lime)] animate-pola-scan" />
          </div>
        </div>
      </div>

      <div className="-mt-8 flex flex-1 flex-col items-center rounded-t-[2.5rem] bg-background px-8 pb-10 pt-10">
        <p className="text-sm text-muted-foreground">{STEPS[step]}</p>
        <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink">
          Preparing result
        </h2>
        <p className="mt-2 max-w-[280px] text-center text-sm text-muted-foreground">
          {source === "describe"
            ? "Reading your description and estimating portions — a friendly guess, not a lab result."
            : "Identifying foods, sizes, and how they're cooked — a friendly guess, not a lab result."}
        </p>
        <div className="mt-6 flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${i <= step ? "w-8 bg-lime" : "w-4 bg-muted"}`}
            />
          ))}
        </div>
        <p className="mt-auto rounded-full bg-muted px-5 py-3 text-center text-[13px] text-muted-foreground">
          Please keep Pola open while we finish
        </p>
      </div>
    </div>
  );
}
