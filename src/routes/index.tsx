import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Flame,
  Sparkles,
  Pencil,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Check,
} from "lucide-react";

import nasiGulaiImg from "@/assets/nasi-gulai.jpg";
import pisangGorengImg from "@/assets/pisang-goreng.jpg";
import icedTeaImg from "@/assets/iced-tea.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pola — Snap your meal, keep the memory" },
      {
        name: "description",
        content:
          "Pola turns a photo of your meal into a calorie estimate and a collectible sticker — then deletes the photo.",
      },
      { property: "og:title", content: "Pola — Snap your meal, keep the memory" },
      {
        property: "og:description",
        content: "A calm, delightful food journal. Photograph, estimate, save a sticker.",
      },
    ],
  }),
  component: PolaApp,
});

/* ---------------- data model ---------------- */

type Serving = "Small" | "Regular" | "Large";
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

interface FoodItem {
  id: string;
  name: string;
  serving: Serving;
  kcal: number; // kcal at current serving
}

interface Meal {
  id: string;
  title: string;
  mealType: MealType;
  date: string; // display string
  image: string; // sticker art (tight crop)
  bg: "leaf" | "honey" | "peach" | "tomato";
  items: FoodItem[];
  seeded?: boolean;
}

const SERVING_FACTOR: Record<Serving, number> = { Small: 0.7, Regular: 1, Large: 1.4 };

function rescale(kcal: number, from: Serving, to: Serving) {
  const base = kcal / SERVING_FACTOR[from];
  return Math.round((base * SERVING_FACTOR[to]) / 5) * 5;
}

const STORAGE_KEY = "pola-meals-v1";

const SEED_MEALS: Meal[] = [
  {
    id: "seed-gulai",
    title: "Nasi Gulai Lunch",
    mealType: "Lunch",
    date: "Today, 12:40",
    image: nasiGulaiImg,
    bg: "honey",
    seeded: true,
    items: [
      { id: "i1", name: "White rice", serving: "Regular", kcal: 220 },
      { id: "i2", name: "Chicken curry", serving: "Regular", kcal: 320 },
      { id: "i3", name: "Boiled vegetables", serving: "Small", kcal: 70 },
      { id: "i4", name: "Sambal", serving: "Small", kcal: 40 },
    ],
  },
  {
    id: "seed-tea",
    title: "Iced Tea",
    mealType: "Snack",
    date: "Today, 10:15",
    image: icedTeaImg,
    bg: "leaf",
    seeded: true,
    items: [{ id: "i5", name: "Iced tea (sweetened)", serving: "Regular", kcal: 130 }],
  },
  {
    id: "seed-pisang",
    title: "Pisang Goreng",
    mealType: "Snack",
    date: "Today, 08:05",
    image: pisangGorengImg,
    bg: "peach",
    seeded: true,
    items: [{ id: "i6", name: "Pisang goreng (3 pcs)", serving: "Regular", kcal: 180 }],
  },
];

const STICKER_BG: Record<Meal["bg"], string> = {
  leaf: "bg-leaf-soft",
  honey: "bg-honey-soft",
  peach: "bg-peach",
  tomato: "bg-tomato-soft",
};

const DAILY_GOAL = 2000;

const REVIEW_TEMPLATE: FoodItem[] = [
  { id: "r1", name: "White rice", serving: "Regular", kcal: 220 },
  { id: "r2", name: "Chicken curry", serving: "Regular", kcal: 320 },
  { id: "r3", name: "Boiled vegetables", serving: "Small", kcal: 70 },
  { id: "r4", name: "Sambal", serving: "Small", kcal: 40 },
];

const EXTRA_ITEMS: { name: string; kcal: number }[] = [
  { name: "Iced tea (sweetened)", kcal: 130 },
  { name: "Fried tempeh", kcal: 90 },
  { name: "Krupuk crackers", kcal: 60 },
  { name: "Fresh orange juice", kcal: 110 },
];

/* ---------------- shared bits ---------------- */

function Sticker({ meal, size = "md" }: { meal: Meal; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-64 w-64" : "h-24 w-24";
  return (
    <div
      className={`${dims} ${STICKER_BG[meal.bg]} relative flex shrink-0 items-center justify-center rounded-[2rem]`}
    >
      <img
        src={meal.image}
        alt={meal.title}
        loading="lazy"
        width={1024}
        height={1024}
        className={`${size === "lg" ? "h-52 w-52 border-8" : "h-16 w-16 border-4"} rounded-full border-card object-cover shadow-[0_10px_24px_-8px_rgba(60,45,30,0.45)]`}
      />
      <Sparkles
        className={`absolute ${size === "lg" ? "right-5 top-5 h-5 w-5" : "right-2.5 top-2.5 h-3 w-3"} text-tomato/70`}
      />
    </div>
  );
}

function mealKcal(meal: Meal) {
  return meal.items.reduce((s, i) => s + i.kcal, 0);
}

/* ---------------- app ---------------- */

type Screen =
  | { name: "today" }
  | { name: "capture" }
  | { name: "analyzing"; mealType: MealType }
  | { name: "review"; mealType: MealType }
  | { name: "detail"; mealId: string };

function loadMeals(): Meal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Meal[];
  } catch {
    /* ignore */
  }
  return SEED_MEALS;
}

function PolaApp() {
  const [meals, setMeals] = useState<Meal[]>(loadMeals);
  const [screen, setScreen] = useState<Screen>({ name: "today" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  }, [meals]);

  const openMeal = (id: string) => setScreen({ name: "detail", mealId: id });

  const saveMeal = (mealType: MealType, items: FoodItem[]) => {
    const meal: Meal = {
      id: `meal-${Date.now()}`,
      title: mealType === "Lunch" ? "Nasi Gulai Lunch" : `Homemade ${mealType}`,
      mealType,
      date: "Today, just now",
      image: nasiGulaiImg,
      bg: "honey",
      items,
    };
    setMeals((m) => [meal, ...m]);
    setScreen({ name: "detail", mealId: meal.id });
  };

  const deleteMeal = (id: string) => {
    setMeals((m) => m.filter((x) => x.id !== id));
    setScreen({ name: "today" });
  };

  const updateMealItems = (id: string, items: FoodItem[]) =>
    setMeals((m) => m.map((x) => (x.id === id ? { ...x, items } : x)));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {screen.name === "today" && (
        <TodayScreen
          meals={meals}
          onCapture={() => setScreen({ name: "capture" })}
          onOpen={openMeal}
        />
      )}
      {screen.name === "capture" && (
        <CaptureScreen
          onBack={() => setScreen({ name: "today" })}
          onCaptured={(mealType) => setScreen({ name: "analyzing", mealType })}
        />
      )}
      {screen.name === "analyzing" && (
        <AnalyzingScreen onDone={() => setScreen({ name: "review", mealType: screen.mealType })} />
      )}
      {screen.name === "review" && (
        <ReviewScreen
          mealType={screen.mealType}
          onBack={() => setScreen({ name: "capture" })}
          onSave={saveMeal}
        />
      )}
      {screen.name === "detail" &&
        (() => {
          const meal = meals.find((m) => m.id === screen.mealId);
          if (!meal) return null;
          return (
            <DetailScreen
              meal={meal}
              onBack={() => setScreen({ name: "today" })}
              onDelete={() => deleteMeal(meal.id)}
              onUpdateItems={(items) => updateMealItems(meal.id, items)}
            />
          );
        })()}
    </div>
  );
}

/* ---------------- Today ---------------- */

function TodayScreen({
  meals,
  onCapture,
  onOpen,
}: {
  meals: Meal[];
  onCapture: () => void;
  onOpen: (id: string) => void;
}) {
  const total = meals.reduce((s, m) => s + mealKcal(m), 0);
  const pct = Math.min(100, Math.round((total / DAILY_GOAL) * 100));

  return (
    <div className="flex flex-1 flex-col px-5 pb-32 pt-8 animate-pola-fade">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-leaf">Pola</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink">
            Today
          </h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-honey-soft">
          <Flame className="h-5 w-5 text-tomato" />
        </div>
      </header>

      {/* progress */}
      <div className="mt-6 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-ink">
            {total.toLocaleString()}{" "}
            <span className="font-normal text-muted-foreground">/ {DAILY_GOAL.toLocaleString()} kcal</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {meals.length} meal{meals.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-leaf to-honey transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          {pct < 100 ? "A gentle pace — nice and steady." : "Goal reached for today. Lovely."}
        </p>
      </div>

      {/* stickers */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Your Pola collection</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {meals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => onOpen(meal.id)}
              className="group flex flex-col items-center rounded-3xl bg-card p-4 pt-5 text-center shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)] transition-transform active:scale-95"
            >
              <Sticker meal={meal} />
              <p className="mt-3 text-sm font-semibold leading-tight text-ink">{meal.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mealKcal(meal)} kcal · {meal.mealType}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* capture FAB */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md px-5 pb-6">
        <button
          onClick={onCapture}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tomato text-primary-foreground shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] ring-8 ring-background transition-transform active:scale-90"
          aria-label="Capture meal"
        >
          <Camera className="h-7 w-7" />
        </button>
        <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">Capture meal</p>
      </div>
    </div>
  );
}

/* ---------------- Capture ---------------- */

function CaptureScreen({
  onBack,
  onCaptured,
}: {
  onBack: () => void;
  onCaptured: (mealType: MealType) => void;
}) {
  const [mealType, setMealType] = useState<MealType>("Lunch");
  const [captured, setCaptured] = useState(false);

  const mealIcons: Record<MealType, typeof Coffee> = {
    Breakfast: Coffee,
    Lunch: Sun,
    Dinner: Moon,
    Snack: Cookie,
  };

  return (
    <div className="flex flex-1 flex-col animate-pola-fade">
      {/* viewfinder */}
      <div className="relative mx-5 mt-6 overflow-hidden rounded-[2rem]">
        <img
          src={nasiGulaiImg}
          alt="Camera preview showing an Indonesian meal"
          width={1024}
          height={1024}
          className="aspect-[4/5] w-full object-cover"
        />
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-ink backdrop-blur"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {captured && (
          <div className="absolute inset-0 flex items-end justify-center bg-ink/25 pb-6 backdrop-blur-[1px] animate-pola-fade">
            <span className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-ink shadow">
              <Check className="h-4 w-4 text-leaf" /> Photo captured
            </span>
          </div>
        )}
      </div>

      {/* meal selector */}
      <div className="mt-5 px-5">
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(mealIcons) as MealType[]).map((t) => {
            const Icon = mealIcons[t];
            const active = mealType === t;
            return (
              <button
                key={t}
                onClick={() => setMealType(t)}
                className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition-colors ${
                  active ? "bg-leaf text-primary-foreground" : "bg-card text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* controls */}
      <div className="mt-auto flex flex-col items-center gap-4 px-5 pb-8 pt-6">
        {!captured ? (
          <>
            <div className="flex items-center gap-8">
              <button
                onClick={() => setCaptured(true)}
                className="flex flex-col items-center gap-1.5 text-muted-foreground"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium">Library</span>
              </button>
              <button
                onClick={() => setCaptured(true)}
                className="h-20 w-20 rounded-full border-[6px] border-card bg-tomato shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] transition-transform active:scale-90"
                aria-label="Capture photo"
              />
              <span className="w-12" />
            </div>
            <button className="flex items-center gap-1.5 text-sm font-medium text-leaf">
              <Plus className="h-4 w-4" /> Add another item
            </button>
            <p className="max-w-[240px] text-center text-xs text-muted-foreground">
              Drinks or snacks can be added to the same meal after capture.
            </p>
          </>
        ) : (
          <button
            onClick={() => onCaptured(mealType)}
            className="w-full rounded-full bg-leaf py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_24px_-8px_rgba(60,90,60,0.5)] transition-transform active:scale-95"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Analyzing ---------------- */

function AnalyzingScreen({ onDone }: { onDone: () => void }) {
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
          src={nasiGulaiImg}
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
      <p className="mt-2 max-w-[260px] text-center text-sm text-muted-foreground">
        Estimating portions and calories — a friendly guess, not a lab result.
      </p>
    </div>
  );
}

/* ---------------- Review ---------------- */

function ReviewScreen({
  mealType,
  onBack,
  onSave,
}: {
  mealType: MealType;
  onBack: () => void;
  onSave: (mealType: MealType, items: FoodItem[]) => void;
}) {
  const [items, setItems] = useState<FoodItem[]>(REVIEW_TEMPLATE);
  const [extraIdx, setExtraIdx] = useState(0);
  const total = items.reduce((s, i) => s + i.kcal, 0);
  const low = Math.round((total * 0.9) / 10) * 10;
  const high = Math.round((total * 1.1) / 10) * 10;

  const changeServing = (id: string, serving: Serving) =>
    setItems((list) =>
      list.map((i) =>
        i.id === id ? { ...i, kcal: rescale(i.kcal, i.serving, serving), serving } : i,
      ),
    );

  const addExtra = () => {
    const extra = EXTRA_ITEMS[extraIdx % EXTRA_ITEMS.length];
    setExtraIdx((n) => n + 1);
    setItems((list) => [
      ...list,
      { id: `extra-${Date.now()}`, name: extra.name, serving: "Regular", kcal: extra.kcal },
    ]);
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-6 animate-pola-fade">
      <header className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-ink shadow"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
          Your {mealType.toLowerCase()}
        </h1>
      </header>

      {/* temp photo */}
      <div className="relative mt-5 overflow-hidden rounded-3xl">
        <img
          src={nasiGulaiImg}
          alt="Temporary photo of the meal"
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-[16/9] w-full object-cover"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
          Used only to estimate this meal
        </span>
      </div>

      {/* items */}
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
              <div className="mt-1.5 flex gap-1">
                {(["Small", "Regular", "Large"] as Serving[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeServing(item.id, s)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      item.serving === s
                        ? "bg-leaf text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <p className="w-16 shrink-0 text-right text-sm font-bold text-tomato">{item.kcal} kcal</p>
            <button
              onClick={() => setItems((list) => list.filter((i) => i.id !== item.id))}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-label={`Remove ${item.name}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addExtra}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-leaf/40 py-3 text-sm font-semibold text-leaf"
      >
        <Plus className="h-4 w-4" /> Add drink or another item
      </button>

      {/* total */}
      <div className="mt-5 rounded-3xl bg-leaf-soft p-5 text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          Estimated total: {total.toLocaleString()} kcal
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Likely range: {low.toLocaleString()}–{high.toLocaleString()} kcal
        </p>
      </div>

      <button
        onClick={() => onSave(mealType, items)}
        className="mt-5 w-full rounded-full bg-tomato py-4 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] transition-transform active:scale-95"
      >
        Create my Pola
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Estimates are for everyday guidance, not medical use.
      </p>
    </div>
  );
}

/* ---------------- Detail ---------------- */

function DetailScreen({
  meal,
  onBack,
  onDelete,
  onUpdateItems,
}: {
  meal: Meal;
  onBack: () => void;
  onDelete: () => void;
  onUpdateItems: (items: FoodItem[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const total = mealKcal(meal);

  const changeServing = (id: string, serving: Serving) =>
    onUpdateItems(
      meal.items.map((i) =>
        i.id === id ? { ...i, kcal: rescale(i.kcal, i.serving, serving), serving } : i,
      ),
    );

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-6 animate-pola-fade">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-ink shadow"
          aria-label="Back to Today"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {meal.mealType}
        </p>
      </header>

      <div className="mt-6 flex justify-center animate-pola-pop">
        <Sticker meal={meal} size="lg" />
      </div>

      <div className="mt-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          {meal.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {meal.date} · {meal.mealType}
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-tomato">
          {total.toLocaleString()} kcal
        </p>
      </div>

      <div className="mt-6 rounded-3xl bg-card p-4 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        <h2 className="px-1 text-sm font-semibold text-ink">What's inside</h2>
        <div className="mt-2 divide-y divide-border">
          {meal.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                {editing ? (
                  <div className="mt-1 flex gap-1">
                    {(["Small", "Regular", "Large"] as Serving[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => changeServing(item.id, s)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.serving === s
                            ? "bg-leaf text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{item.serving}</p>
                )}
              </div>
              <p className="shrink-0 text-sm font-semibold text-ink">{item.kcal} kcal</p>
              {editing && (
                <button
                  onClick={() => onUpdateItems(meal.items.filter((i) => i.id !== item.id))}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Original photo was deleted after this Pola was created.
      </p>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-leaf py-3.5 text-sm font-semibold text-primary-foreground"
        >
          {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? "Done" : "Edit foods"}
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-tomato-soft text-tomato"
          aria-label="Delete meal"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40 p-5 backdrop-blur-sm animate-pola-fade">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 animate-pola-pop">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
              Delete this Pola?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              “{meal.title}” will be removed from your collection. This can't be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-full bg-muted py-3 text-sm font-semibold text-ink"
              >
                Keep it
              </button>
              <button
                onClick={onDelete}
                className="flex-1 rounded-full bg-tomato py-3 text-sm font-semibold text-primary-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
