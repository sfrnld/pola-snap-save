import { useState } from "react";
import { Check, ChevronLeft, MapPin, Plus, Search, X } from "lucide-react";
import {
  EXTRA_ITEMS,
  IMAGES,
  PLACES,
  REVIEW_TEMPLATE,
  macrosOf,
  rescaleItem,
  type FoodItem,
  type MealType,
  type Serving,
} from "@/lib/pola-data";

export interface ReviewResult {
  mealType: MealType;
  items: FoodItem[];
  note: string;
  place: string | null;
}

export function ReviewScreen({
  mealType,
  onBack,
  onSave,
}: {
  mealType: MealType;
  onBack: () => void;
  onSave: (result: ReviewResult) => void;
}) {
  const [items, setItems] = useState<FoodItem[]>(REVIEW_TEMPLATE);
  const [extraIdx, setExtraIdx] = useState(0);
  const [note, setNote] = useState("");
  const [place, setPlace] = useState<string | null>(null);
  const [placeSearch, setPlaceSearch] = useState(false);
  const [query, setQuery] = useState("");

  const total = items.reduce((s, i) => s + i.kcal, 0);
  const low = Math.round((total * 0.9) / 10) * 10;
  const high = Math.round((total * 1.1) / 10) * 10;
  const macros = macrosOf(items);
  const macroTotal = Math.max(1, macros.carbs + macros.protein + macros.fat);
  const macroPct = (v: number) => Math.round((v / macroTotal) * 100);

  const changeServing = (id: string, serving: Serving) =>
    setItems((list) => list.map((i) => (i.id === id ? rescaleItem(i, serving) : i)));

  const addExtra = () => {
    const extra = EXTRA_ITEMS[extraIdx % EXTRA_ITEMS.length]!;
    setExtraIdx((n) => n + 1);
    setItems((list) => [...list, { ...extra, id: `extra-${Date.now()}` }]);
  };

  const places = PLACES.filter((p) => p.toLowerCase().includes(query.toLowerCase()));

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
          src={IMAGES.nasiGulaiImg}
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
              <p className="truncate text-sm font-semibold text-ink">
                {item.name}{" "}
                <span className="font-normal text-muted-foreground">· {item.serving}</span>
              </p>
              {item.cooking && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.cooking}</p>
              )}
              <div className="mt-1.5 flex gap-1">
                {(["Small", "Regular", "Large"] as Serving[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeServing(item.id, s)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      item.serving === s
                        ? "bg-lime text-ink"
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

      {/* macros */}
      <div className="mt-5 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        <h2 className="text-sm font-semibold text-ink">Macros</h2>
        <div className="mt-3 space-y-2.5">
          {(
            [
              ["Carbs", macros.carbs, "bg-honey"],
              ["Protein", macros.protein, "bg-lime"],
              ["Fat", macros.fat, "bg-tomato"],
            ] as const
          ).map(([label, grams, color]) => (
            <div key={label} className="flex items-center gap-3">
              <p className="w-14 text-xs font-semibold text-muted-foreground">{label}</p>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${macroPct(grams)}%` }} />
              </div>
              <p className="w-16 text-right text-xs font-bold text-ink">
                {macroPct(grams)}% · {grams}g
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* total */}
      <div className="mt-5 rounded-3xl bg-lime-soft p-5 text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          Estimated total: {total.toLocaleString()} kcal
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Likely range: {low.toLocaleString()}–{high.toLocaleString()} kcal
        </p>
      </div>

      {/* meal details: note + location */}
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl bg-card p-3.5 shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]">
          <label htmlFor="pola-note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Note
          </label>
          <input
            id="pola-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything to remember? (optional)"
            className="mt-1.5 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={() => setPlaceSearch(true)}
          className="flex w-full items-center gap-2 rounded-2xl bg-card p-3.5 text-sm font-semibold text-ink shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]"
        >
          <MapPin className="h-4 w-4 text-tomato" />
          {place ?? "Add a place"}
        </button>
      </div>

      <button
        onClick={() => onSave({ mealType, items, note, place })}
        className="mt-5 w-full rounded-full bg-tomato py-4 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] transition-transform active:scale-95"
      >
        Create my Pola
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Estimates are for everyday guidance, not medical use.
      </p>

      {/* place search sheet */}
      {placeSearch && (
        <div className="fixed inset-0 z-30 mx-auto flex max-w-md flex-col justify-end bg-ink/40 backdrop-blur-sm">
          <div className="rounded-t-[2rem] bg-background px-5 pb-8 pt-5 animate-pola-fade">
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a restaurant or place"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setPlaceSearch(false)} aria-label="Close place search">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-3 space-y-1">
              {places.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlace(p);
                    setPlaceSearch(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-ink transition-colors active:bg-muted"
                >
                  {p}
                  {place === p && <Check className="h-4 w-4 text-leaf" />}
                </button>
              ))}
              {places.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matching places</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
