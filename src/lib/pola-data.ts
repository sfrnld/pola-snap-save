import nasiGulaiImg from "@/assets/nasi-gulai.jpg";
import pisangGorengImg from "@/assets/pisang-goreng.jpg";
import icedTeaImg from "@/assets/iced-tea.jpg";
import nasiGulaiCutout from "@/assets/nasi-gulai-cutout.png";
import pisangGorengCutout from "@/assets/pisang-goreng-cutout.png";
import icedTeaCutout from "@/assets/iced-tea-cutout.png";

export const IMAGES = { nasiGulaiImg, pisangGorengImg, icedTeaImg };

export const CUTOUTS: Record<string, string> = {
  [nasiGulaiImg]: nasiGulaiCutout,
  [pisangGorengImg]: pisangGorengCutout,
  [icedTeaImg]: icedTeaCutout,
};

export type Serving = "Small" | "Regular" | "Large";
export type MealType = "Breakfast" | "Brunch" | "Lunch" | "Dinner" | "Snack";
export type StickerBg = "leaf" | "honey" | "peach" | "tomato";

export interface FoodItem {
  id: string;
  name: string;
  serving: Serving;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  cooking?: string;
  drink?: boolean;
}

export interface Meal {
  id: string;
  title: string;
  mealType: MealType;
  date: string;
  /** 0 = today, 1 = yesterday, ... */
  dayOffset: number;
  time: string;
  image: string;
  bg: StickerBg;
  items: FoodItem[];
  note?: string | undefined;
  place?: string | undefined;
}

export interface Budget {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
}

export const SERVING_FACTOR: Record<Serving, number> = {
  Small: 0.7,
  Regular: 1,
  Large: 1.4,
};

export function rescale(value: number, from: Serving, to: Serving) {
  const base = value / SERVING_FACTOR[from];
  return Math.round(base * SERVING_FACTOR[to]);
}

export function rescaleItem(item: FoodItem, to: Serving): FoodItem {
  return {
    ...item,
    kcal: Math.round(rescale(item.kcal, item.serving, to) / 5) * 5,
    carbs: rescale(item.carbs, item.serving, to),
    protein: rescale(item.protein, item.serving, to),
    fat: rescale(item.fat, item.serving, to),
    serving: to,
  };
}

export function mealKcal(meal: Meal) {
  return meal.items.reduce((s, i) => s + i.kcal, 0);
}

export function macrosOf(items: FoodItem[]) {
  return items.reduce(
    (a, i) => ({
      carbs: a.carbs + i.carbs,
      protein: a.protein + i.protein,
      fat: a.fat + i.fat,
    }),
    { carbs: 0, protein: 0, fat: 0 },
  );
}

const f = (
  id: string,
  name: string,
  kcal: number,
  carbs: number,
  protein: number,
  fat: number,
  extra: Partial<FoodItem> = {},
): FoodItem => ({ id, name, serving: "Regular", kcal, carbs, protein, fat, ...extra });

export const SEED_MEALS: Meal[] = [
  {
    id: "seed-gulai",
    title: "Nasi Gulai Lunch",
    mealType: "Lunch",
    dayOffset: 0,
    date: "Today",
    time: "12:40",
    image: nasiGulaiImg,
    bg: "honey",
    place: "Rumah Makan Sederhana",
    items: [
      f("i1", "White rice", 220, 48, 4, 1, { cooking: "Steamed" }),
      f("i2", "Chicken curry", 320, 8, 26, 21, { cooking: "Simmered in coconut curry" }),
      f("i3", "Boiled vegetables", 70, 9, 3, 2, { serving: "Small", cooking: "Boiled" }),
      f("i4", "Sambal", 40, 4, 1, 2, { serving: "Small", cooking: "Ground & fried" }),
    ],
  },
  {
    id: "seed-tea",
    title: "Iced Tea",
    mealType: "Snack",
    dayOffset: 0,
    date: "Today",
    time: "10:15",
    image: icedTeaImg,
    bg: "leaf",
    items: [f("i5", "Iced tea (sweetened)", 130, 33, 0, 0, { drink: true })],
  },
  {
    id: "seed-pisang",
    title: "Pisang Goreng",
    mealType: "Snack",
    dayOffset: 0,
    date: "Today",
    time: "08:05",
    image: pisangGorengImg,
    bg: "peach",
    items: [f("i6", "Pisang goreng (3 pcs)", 180, 26, 2, 8, { cooking: "Deep fried" })],
  },
  {
    id: "seed-y1",
    title: "Nasi Padang Dinner",
    mealType: "Dinner",
    dayOffset: 1,
    date: "Yesterday",
    time: "19:20",
    image: nasiGulaiImg,
    bg: "tomato",
    place: "Padang Raya",
    items: [
      f("y1", "White rice", 240, 52, 4, 1, { cooking: "Steamed" }),
      f("y2", "Beef rendang", 380, 6, 28, 27, { cooking: "Slow cooked" }),
      f("y3", "Cassava leaves", 60, 7, 4, 2, { serving: "Small", cooking: "Boiled" }),
    ],
  },
  {
    id: "seed-y2",
    title: "Es Teh Manis",
    mealType: "Snack",
    dayOffset: 1,
    date: "Yesterday",
    time: "15:10",
    image: icedTeaImg,
    bg: "leaf",
    items: [f("y4", "Iced tea (sweetened)", 130, 33, 0, 0, { drink: true })],
  },
];

/** Pre-stored foods shipped with Pola (not user-created). */
export const POLA_LIBRARY: { name: string; kcal: number; item: FoodItem; bg: StickerBg; image: string }[] = [
  {
    name: "Nasi Goreng",
    kcal: 450,
    bg: "honey",
    image: nasiGulaiImg,
    item: f("pl1", "Nasi goreng", 450, 62, 13, 16, { cooking: "Stir fried" }),
  },
  {
    name: "Es Teh Manis",
    kcal: 130,
    bg: "leaf",
    image: icedTeaImg,
    item: f("pl2", "Es teh manis", 130, 33, 0, 0, { drink: true }),
  },
  {
    name: "Pisang Goreng",
    kcal: 180,
    bg: "peach",
    image: pisangGorengImg,
    item: f("pl3", "Pisang goreng", 180, 26, 2, 8, { cooking: "Deep fried" }),
  },
  {
    name: "Soto Ayam",
    kcal: 290,
    bg: "tomato",
    image: nasiGulaiImg,
    item: f("pl4", "Soto ayam", 290, 22, 22, 12, { cooking: "Simmered" }),
  },
];

export const REVIEW_TEMPLATE: FoodItem[] = [
  f("r1", "White rice", 220, 48, 4, 1, { cooking: "Steamed" }),
  f("r2", "Chicken curry", 320, 8, 26, 21, { cooking: "Simmered in coconut curry" }),
  f("r3", "Boiled vegetables", 70, 9, 3, 2, { serving: "Small", cooking: "Boiled" }),
  f("r4", "Sambal", 40, 4, 1, 2, { serving: "Small", cooking: "Ground & fried" }),
];

export const EXTRA_ITEMS: FoodItem[] = [
  f("x1", "Iced tea (sweetened)", 130, 33, 0, 0, { drink: true }),
  f("x2", "Fried tempeh", 90, 6, 8, 5, { cooking: "Fried" }),
  f("x3", "Krupuk crackers", 60, 8, 1, 3, { cooking: "Fried" }),
  f("x4", "Fresh orange juice", 110, 26, 1, 0, { drink: true }),
];

export const PLACES = [
  "Rumah Makan Sederhana",
  "Warung Bu Ratna",
  "Padang Raya",
  "Kopi Kenangan — Senopati",
  "Home kitchen",
];

export const STICKER_BG: Record<StickerBg, string> = {
  leaf: "bg-leaf-soft",
  honey: "bg-honey-soft",
  peach: "bg-peach",
  tomato: "bg-tomato-soft",
};

/* ---------- budget survey ---------- */

export function computeBudget(input: {
  sex: "Female" | "Male";
  age: number;
  heightCm: number;
  weightKg: number;
  activity: "Low" | "Moderate" | "High";
  goal: "Lose" | "Maintain" | "Gain";
}): Budget {
  const bmr =
    10 * input.weightKg +
    6.25 * input.heightCm -
    5 * input.age +
    (input.sex === "Male" ? 5 : -161);
  const act = { Low: 1.35, Moderate: 1.55, High: 1.75 }[input.activity];
  const goal = { Lose: -400, Maintain: 0, Gain: 300 }[input.goal];
  const kcal = Math.round((bmr * act + goal) / 10) * 10;
  return {
    kcal,
    carbs: Math.round((kcal * 0.5) / 4),
    protein: Math.round((kcal * 0.25) / 4),
    fat: Math.round((kcal * 0.25) / 9),
  };
}

/* ---------- storage ---------- */

export const STORAGE_KEY = "pola-state-v2";

export interface PolaState {
  meals: Meal[];
  budget: Budget | null;
  onboarded: boolean;
}

export const DEFAULT_STATE: PolaState = {
  meals: SEED_MEALS,
  budget: null,
  onboarded: false,
};

export function loadState(): PolaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<PolaState>) };
  } catch {
    /* ignore */
  }
  return DEFAULT_STATE;
}

export function mealTypeForNow(hour = new Date().getHours()): MealType {
  if (hour < 10) return "Breakfast";
  if (hour < 12) return "Brunch";
  if (hour < 15) return "Lunch";
  if (hour < 18) return "Snack";
  return "Dinner";
}

export const DAY_LABELS = ["Today", "Yesterday", "2 days ago", "3 days ago"];

/** last 7 days totals for the dashboard (mock trend + live today) */
export const TREND_BASE = [1780, 1920, 1640, 2050, 1870, 1560];
