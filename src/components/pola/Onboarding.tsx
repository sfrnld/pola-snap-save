import { useState } from "react";
import { Camera, Sparkles, Album, ChevronRight } from "lucide-react";
import { IMAGES } from "@/lib/pola-data";
import { StickerArt } from "./Sticker";

const STEPS = [
  {
    icon: Camera,
    title: "Snap your meal",
    body: "Point at your plate, glass, or bowl. One quick photo is enough — no forms, no barcodes.",
  },
  {
    icon: Sparkles,
    title: "Pola reads the plate",
    body: "We estimate the foods, portions, and how they were cooked. Friendly guidance, never a lab result.",
  },
  {
    icon: Album,
    title: "Keep the sticker, not the photo",
    body: "Your meal becomes a little collectible sticker. The original photo is deleted right after.",
  },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const Icon = current.icon;
  const last = step === STEPS.length - 1;

  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-14 animate-pola-fade">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-leaf">Pola</p>

      <div className="mt-10 flex justify-center animate-pola-pop" key={step}>
        <StickerArt
          image={[IMAGES.nasiGulaiImg, IMAGES.icedTeaImg, IMAGES.pisangGorengImg][step]!}
          bg={(["honey", "leaf", "peach"] as const)[step]!}
          alt="Pola sticker example"
          size="lg"
        />
      </div>

      <div className="mt-10 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-lime-soft">
          <Icon className="h-5 w-5 text-tomato" />
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          {current.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
          {current.body}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.title}
            className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-tomato" : "w-1.5 bg-muted"}`}
          />
        ))}
      </div>

      <div className="mt-auto pt-10">
        <button
          onClick={() => (last ? onDone() : setStep((s) => s + 1))}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-tomato py-4 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] transition-transform active:scale-95"
        >
          {last ? "Start with a photo" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </button>
        {!last && (
          <button
            onClick={onDone}
            className="mt-3 w-full text-center text-sm font-medium text-muted-foreground"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
