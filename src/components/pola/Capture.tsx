import { useState } from "react";
import {
  Camera,
  ChevronLeft,
  Image as ImageIcon,
  Info,
  Plus,
  Zap,
  ZapOff,
  X,
  Check,
  PenLine,
  Album,
  Scan,
} from "lucide-react";
import {
  IMAGES,
  POLA_LIBRARY,
  mealTypeForNow,
  type FoodItem,
  type MealType,
} from "@/lib/pola-data";
import { StickerArt } from "./Sticker";

type Mode = "photo" | "describe" | "library";

const MEAL_TYPES: MealType[] = ["Breakfast", "Brunch", "Lunch", "Dinner", "Snack"];
const MIN_WORDS = 8;

export function CaptureScreen({
  onBack,
  onAnalyze,
  onLogFromLibrary,
}: {
  onBack: () => void;
  onAnalyze: (mealType: MealType, source: "photo" | "describe") => void;
  onLogFromLibrary: (item: FoodItem, image: string, bg: "leaf" | "honey" | "peach" | "tomato", title: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("photo");
  const [mealType, setMealType] = useState<MealType>(mealTypeForNow());
  const [flash, setFlash] = useState(false);
  const [tips, setTips] = useState(true);
  const [shots, setShots] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [oldPhoto, setOldPhoto] = useState(false);
  const [description, setDescription] = useState("");

  const words = description.trim().split(/\s+/).filter(Boolean).length;
  const canDescribe = words >= MIN_WORDS;

  const addShot = (img: string) => setShots((s) => (s.length >= 4 ? s : [...s, img]));

  const fromGallery = () => {
    addShot(IMAGES.pisangGorengImg);
    setOldPhoto(true);
  };

  const photoMode = mode === "photo";

  return (
    <div className={`flex flex-1 flex-col animate-pola-fade ${photoMode ? "bg-ink" : ""}`}>
      {/* mode switch */}
      <div className={`flex items-center gap-3 px-5 pt-6 ${photoMode ? "pb-3" : ""}`}>
        <button
          onClick={onBack}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            photoMode ? "bg-white/15 text-white backdrop-blur" : "bg-card text-ink shadow"
          }`}
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          className={`flex flex-1 gap-1 rounded-full p-1 ${
            photoMode ? "bg-white/12 backdrop-blur" : "bg-card shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]"
          }`}
        >
          {(
            [
              ["photo", "Snap", Camera],
              ["describe", "Describe", PenLine],
              ["library", "Library", Album],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-colors ${
                mode === id
                  ? photoMode
                    ? "bg-white text-ink"
                    : "bg-lime text-ink"
                  : photoMode
                    ? "text-white/70"
                    : "text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {!photoMode && (
        <div className="mt-4 px-5">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {MEAL_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setMealType(t)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                  mealType === t ? "bg-ink text-primary-foreground" : "bg-card text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Auto-selected from the time of day — tap to change.
          </p>
        </div>
      )}

      {photoMode && (
        <>
          {/* live camera viewfinder */}
          <div className="relative min-h-[380px] flex-1 overflow-hidden">
            <img
              src={IMAGES.nasiGulaiImg}
              alt="Camera preview showing an Indonesian meal"
              width={1024}
              height={1024}
              className={`absolute inset-0 h-full w-full object-cover ${flash ? "brightness-125" : ""}`}
            />

            {/* top overlay controls */}
            <div className="absolute inset-x-4 top-4 flex items-center gap-2">
              <div className="flex gap-1 overflow-x-auto rounded-full bg-ink/45 p-1 backdrop-blur">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setMealType(t)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                      mealType === t ? "bg-white text-ink" : "text-white/75"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setTips((v) => !v)}
                aria-label="Photo tips"
                className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/45 text-white backdrop-blur"
              >
                <Info className="h-4 w-4" />
              </button>
              <button
                onClick={() => setFlash((f) => !f)}
                aria-label={flash ? "Turn flash off" : "Turn flash on"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/45 text-white backdrop-blur"
              >
                {flash ? <Zap className="h-4 w-4 text-honey" /> : <ZapOff className="h-4 w-4" />}
              </button>
            </div>

            {/* framing brackets */}
            <div className="pointer-events-none absolute inset-x-8 top-24 bottom-24">
              {[
                "left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl",
                "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl",
                "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-3xl",
                "right-0 bottom-0 border-r-4 border-b-4 rounded-br-3xl",
              ].map((c) => (
                <span key={c} className={`absolute h-12 w-12 border-white/85 ${c}`} />
              ))}
            </div>

            {tips && (
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-ink/70 p-3 backdrop-blur">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                  <p className="text-[11px] leading-relaxed text-white/80">
                    Shoot plates and bowls <strong className="text-white">from directly above</strong>; shoot
                    glasses and packaging <strong className="text-white">from the front</strong>. Add another
                    photo for each item in the meal.
                  </p>
                  <button onClick={() => setTips(false)} aria-label="Dismiss tips" className="text-white/70">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* dark control deck */}
          <div className="bg-ink px-5 pb-8 pt-4 text-white">
            {oldPhoto && (
              <div className="mb-4 rounded-2xl bg-white/10 p-3">
                <p className="text-xs font-bold text-white">This photo was taken yesterday, 19:20.</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setMealType("Dinner");
                      setOldPhoto(false);
                    }}
                    className="rounded-full bg-lime px-3 py-1.5 text-[11px] font-bold text-ink"
                  >
                    Log as yesterday's dinner
                  </button>
                  <button
                    onClick={() => setOldPhoto(false)}
                    className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    Log as today
                  </button>
                  <button
                    onClick={() => setOldPhoto(false)}
                    className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white/70"
                  >
                    Pick date manually
                  </button>
                </div>
              </div>
            )}

            {/* photo tray */}
            {shots.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {shots.map((s, i) => (
                    <div key={`${s}-${i}`} className="relative shrink-0">
                      <button onClick={() => setPreview(s)} aria-label={`Review photo ${i + 1}`}>
                        <img
                          src={s}
                          alt={`Captured photo ${i + 1}`}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      </button>
                      <button
                        onClick={() => setShots((list) => list.filter((_, n) => n !== i))}
                        aria-label={`Delete photo ${i + 1}`}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-ink"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addShot(IMAGES.icedTeaImg)}
                    aria-label="Add another photo"
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/35 text-white/70"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-white/55">
                  {shots.length} photo{shots.length === 1 ? "" : "s"} in this meal · tap to review, × to remove
                </p>
              </div>
            )}

            <p className="text-center text-[13px] text-white/70">
              Snap a photo — Pola logs the whole meal in seconds.
            </p>

            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={fromGallery}
                aria-label="Choose from photo library"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => addShot(IMAGES.nasiGulaiImg)}
                className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white/30 bg-white text-ink transition-transform active:scale-90"
                aria-label="Capture photo"
              >
                <Scan className="h-7 w-7" strokeWidth={2.2} />
              </button>
              <div className="h-12 w-12" />
            </div>

            {shots.length > 0 && (
              <button
                onClick={() => onAnalyze(mealType, "photo")}
                className="mt-4 w-full rounded-full bg-lime py-4 text-base font-bold text-ink transition-transform active:scale-95"
              >
                Continue with {shots.length} photo{shots.length === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </>
      )}

      {mode === "describe" && (
        <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
          <div className="rounded-3xl bg-card p-4 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
            <label htmlFor="pola-describe" className="text-sm font-semibold text-ink">
              Describe what you ate
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Include the food name, rough size, other ingredients, and how it was cooked.
            </p>
            <textarea
              id="pola-describe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="A plate of nasi padang with steamed rice, fried chicken, cassava leaves and a spoon of sambal"
              className="mt-3 w-full resize-none rounded-2xl bg-muted p-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-leaf"
            />
            <p className={`mt-2 text-[11px] font-medium ${canDescribe ? "text-leaf" : "text-muted-foreground"}`}>
              {canDescribe ? "Looks detailed enough" : `${words}/${MIN_WORDS} words minimum`}
            </p>
          </div>
          <button
            disabled={!canDescribe}
            onClick={() => onAnalyze(mealType, "describe")}
            className="mt-auto w-full rounded-full bg-tomato py-4 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] transition-transform active:scale-95 disabled:opacity-40"
          >
            Estimate this meal
          </button>
        </div>
      )}

      {mode === "library" && (
        <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
          <p className="text-xs text-muted-foreground">
            Pola Food Library — pre-stored foods you can log in one tap.
          </p>
          <div className="mt-4 space-y-3">
            {POLA_LIBRARY.map((entry) => (
              <button
                key={entry.name}
                onClick={() => onLogFromLibrary(entry.item, entry.image, entry.bg, entry.name)}
                className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)] transition-transform active:scale-95"
              >
                <StickerArt image={entry.image} bg={entry.bg} alt={entry.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.kcal} kcal · Regular</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-soft text-leaf">
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <button
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-40 mx-auto flex max-w-md items-center justify-center bg-ink/70 p-6 backdrop-blur"
          aria-label="Close photo preview"
        >
          <img src={preview} alt="Photo preview" className="w-full rounded-3xl object-cover" />
          <span className="absolute bottom-10 flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold text-ink">
            <Check className="h-4 w-4 text-leaf" /> Looks good
          </span>
        </button>
      )}
    </div>
  );
}
