import { useMemo, useState } from "react";
import { Album, List, Map as MapIcon, MapPin, Plus } from "lucide-react";
import { mealKcal, type Meal } from "@/lib/pola-data";
import { Sticker } from "./Sticker";

const PIN_POS = [
  { top: "18%", left: "22%" },
  { top: "34%", left: "64%" },
  { top: "52%", left: "40%" },
  { top: "66%", left: "70%" },
  { top: "42%", left: "15%" },
  { top: "74%", left: "30%" },
];

export function LibraryScreen({
  meals,
  onOpen,
  onQuickLog,
}: {
  meals: Meal[];
  onOpen: (id: string) => void;
  onQuickLog: (meal: Meal) => void;
}) {
  const [view, setView] = useState<"list" | "map">("list");
  const [selected, setSelected] = useState<Meal | null>(null);
  const placed = useMemo(() => meals.filter((m) => m.place), [meals]);

  return (
    <div className="flex flex-1 flex-col px-5 pb-40 pt-8 animate-pola-fade">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-leaf">My Food Library</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink">
            Stickers
          </h1>
        </div>
        <div className="flex gap-1 rounded-full bg-card p-1 shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]">
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              view === "list" ? "bg-lime text-ink" : "text-muted-foreground"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("map")}
            aria-label="Map view"
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              view === "map" ? "bg-lime text-ink" : "text-muted-foreground"
            }`}
          >
            <MapIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      {view === "list" ? (
        meals.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-soft">
              <Album className="h-6 w-6 text-tomato" />
            </span>
            <p className="mt-4 max-w-[240px] text-sm text-muted-foreground">
              No stickers yet — capture your first meal to start the collection.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]"
              >
                <button onClick={() => onOpen(meal.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Sticker meal={meal} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{meal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {mealKcal(meal)} kcal · {meal.date}, {meal.time}
                    </p>
                    {meal.place && (
                      <p className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {meal.place}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => onQuickLog(meal)}
                  aria-label={`Log ${meal.title} again`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition-transform active:scale-90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-lime-soft shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]" style={{ height: 420 }}>
            {/* mock map streets */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute left-0 right-0 top-[30%] h-2 bg-card" />
              <div className="absolute left-0 right-0 top-[62%] h-2 bg-card" />
              <div className="absolute bottom-0 left-[35%] top-0 w-2 bg-card" />
              <div className="absolute bottom-0 left-[72%] top-0 w-2 bg-card" />
              <div className="absolute right-[12%] top-[48%] h-16 w-16 rounded-full bg-lime/40" />
            </div>
            {placed.map((m, i) => {
              const pos = PIN_POS[i % PIN_POS.length]!;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  style={pos}
                  aria-label={m.title}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-90"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-card bg-card shadow-lg">
                    <Sticker meal={m} size="sm" />
                  </span>
                </button>
              );
            })}
            {placed.length === 0 && (
              <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground">
                Tag a place when saving a meal to see it on the map.
              </p>
            )}
          </div>

          {selected && (
            <button
              onClick={() => onOpen(selected.id)}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)] animate-pola-fade"
            >
              <Sticker meal={selected} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{selected.title}</p>
                <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {selected.place} · {mealKcal(selected)} kcal
                </p>
              </div>
              <span className="text-xs font-semibold text-leaf">Open</span>
            </button>
          )}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {placed.length} sticker{placed.length === 1 ? "" : "s"} with a place tag
          </p>
        </div>
      )}
    </div>
  );
}
