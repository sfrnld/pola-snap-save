import { useState } from "react";
import { ChevronLeft, MapPin, Pencil, Trash2 } from "lucide-react";
import { macrosOf, mealKcal, rescaleItem, type Meal, type Serving } from "@/lib/pola-data";
import { Sticker } from "./Sticker";

export function DetailScreen({
  meal,
  onBack,
  onDelete,
  onUpdateItems,
}: {
  meal: Meal;
  onBack: () => void;
  onDelete: () => void;
  onUpdateItems: (items: Meal["items"]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const total = mealKcal(meal);
  const macros = macrosOf(meal.items);

  const changeServing = (id: string, serving: Serving) =>
    onUpdateItems(meal.items.map((i) => (i.id === id ? rescaleItem(i, serving) : i)));

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-6 animate-pola-fade">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-ink shadow"
          aria-label="Back"
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
          {meal.date}, {meal.time} · {meal.mealType}
        </p>
        {meal.place && (
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {meal.place}
          </p>
        )}
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-tomato">
          {total.toLocaleString()} kcal
        </p>
        {meal.note && (
          <p className="mx-auto mt-2 max-w-[280px] text-sm italic text-muted-foreground">
            “{meal.note}”
          </p>
        )}
      </div>

      <h2 className="mt-7 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Calories &amp; macros
      </h2>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(
          [
            ["Calories", `${total}`, "text-ink"],
            ["Carbs", `${macros.carbs} g`, "text-honey"],
            ["Protein", `${macros.protein} g`, "text-leaf"],
          ] as const
        ).map(([label, value, color]) => (
          <div key={label} className="rounded-2xl bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-card p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fat</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold text-ink">
            {macros.fat} g
          </p>
        </div>
        <div className="rounded-2xl bg-card p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Items</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold text-ink">
            {meal.items.length}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-3xl bg-card p-4">
        <h2 className="px-1 text-sm font-bold text-ink">Ingredients</h2>
        <div className="mt-2 divide-y divide-border">
          {meal.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                {editing ? (
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
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {item.serving}
                    {item.cooking ? ` · ${item.cooking}` : ""}
                  </p>
                )}
              </div>
              <p className="text-sm font-bold text-tomato">{item.kcal} kcal</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Original photo was deleted after this Pola was created.
      </p>

      <div className="mt-auto flex gap-3 pt-6">
        <button
          onClick={() => setEditing((e) => !e)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-3.5 text-sm font-semibold transition-colors ${
            editing ? "bg-lime text-ink" : "bg-card text-ink shadow"
          }`}
        >
          <Pencil className="h-4 w-4" /> {editing ? "Done editing" : "Edit foods"}
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-card py-3.5 text-sm font-semibold text-destructive shadow"
        >
          <Trash2 className="h-4 w-4" /> Delete meal
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-30 mx-auto flex max-w-md items-center justify-center bg-ink/40 p-6 backdrop-blur-sm">
          <div className="w-full rounded-3xl bg-card p-6 text-center animate-pola-pop">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
              Delete this Pola?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              “{meal.title}” will be removed from your collection.
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
                className="flex-1 rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground"
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
