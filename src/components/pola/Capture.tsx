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

  return (
    <div className="flex flex-1 flex-col animate-pola-fade">
      {/* mode switch */}
      <div className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-ink shadow"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 gap-1 rounded-full bg-card p-1 shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]">
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
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
                mode === id ? "bg-leaf text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* meal type — auto-selected by time of day */}
      <div className="mt-4 px-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setMealType(t)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
                mealType === t ? "bg-tomato text-primary-foreground" : "bg-card text-muted-foreground"
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

      {mode === "photo" && (
        <>
          <div className="relative mx-5 mt-4 overflow-hidden rounded-[2rem]">
            <img
              src={IMAGES.nasiGulaiImg}
              alt="Camera preview showing an Indonesian meal"
              width={1024}
              height={1024}
              className={`aspect-[4/5] w-full object-cover ${flash ? "brightness-125" : ""}`}
            />
            <button
              onClick={() => setFlash((f) => !f)}
              aria-label={flash ? "Turn flash off" : "Turn flash on"}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-ink backdrop-blur"
            >
              {flash ? <Zap className="h-5 w-5 text-honey" /> : <ZapOff className="h-5 w-5" />}
            </button>

            {tips && (
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-card/95 p-3 backdrop-blur">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Shoot plates and bowls <strong className="text-ink">from directly above</strong>; shoot
                    glasses and packaging <strong className="text-ink">from the front</strong>. One food per
                    photo works best — add more photos for the rest of the meal.
                  </p>
                  <button onClick={() => setTips(false)} aria-label="Dismiss tips" className="text-muted-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* photo tray */}
          {shots.length > 0 && (
            <div className="mt-4 px-5">
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
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-background"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addShot(IMAGES.icedTeaImg)}
                  aria-label="Add another photo"
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-leaf/40 text-leaf"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {shots.length} photo{shots.length === 1 ? "" : "s"} in this meal · tap to review, × to remove
              </p>
            </div>
          )}

          {oldPhoto && (
            <div className="mx-5 mt-4 rounded-2xl bg-honey-soft p-4">
              <p className="text-xs font-semibold text-ink">This photo was taken yesterday, 19:20.</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setMealType("Dinner");
                    setOldPhoto(false);
                  }}
                  className="rounded-full bg-leaf px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
                >
                  Log as yesterday's dinner
                </button>
                <button
                  onClick={() => setOldPhoto(false)}
                  className="rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold text-ink"
                >
                  Log as today
                </button>
                <button
                  onClick={() => setOldPhoto(false)}
                  className="rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
                >
                  Pick date manually
                </button>
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col items-center gap-4 px-5 pb-8 pt-6">
            <div className="flex items-center gap-8">
              <button onClick={fromGallery} className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium">Library</span>
              </button>
              <button
                onClick={() => addShot(IMAGES.nasiGulaiImg)}
                className="h-20 w-20 rounded-full border-[6px] border-card bg-tomato shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] transition-transform active:scale-90"
                aria-label="Capture photo"
              />
              <span className="w-12" />
            </div>

            {shots.length > 0 ? (
              <button
                onClick={() => onAnalyze(mealType, "photo")}
                className="w-full rounded-full bg-leaf py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_24px_-8px_rgba(60,90,60,0.5)] transition-transform active:scale-95"
              >
                Continue with {shots.length} photo{shots.length === 1 ? "" : "s"}
              </button>
            ) : (
              <p className="max-w-[250px] text-center text-xs text-muted-foreground">
                Drinks or snacks can be added to the same meal — just add another photo.
              </p>
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
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-soft text-leaf">
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
