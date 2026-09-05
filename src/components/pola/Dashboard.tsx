import { Coffee, TrendingDown, UtensilsCrossed } from "lucide-react";
import { TREND_BASE, macrosOf, mealKcal, type Budget, type Meal } from "@/lib/pola-data";

export function DashboardScreen({
  meals,
  budget,
}: {
  meals: Meal[];
  budget: Budget | null;
}) {
  const todayTotal = meals.filter((m) => m.dayOffset === 0).reduce((s, m) => s + mealKcal(m), 0);
  const trend = [...TREND_BASE, todayTotal];
  const max = Math.max(...trend, budget?.kcal ?? 0, 1);
  const avg = Math.round(trend.reduce((a, b) => a + b, 0) / trend.length);

  const mealCount = meals.filter((m) => m.dayOffset === 0).length;
  const drinkCount = meals
    .filter((m) => m.dayOffset === 0)
    .flatMap((m) => m.items)
    .filter((i) => i.drink).length;
  const weekItems = meals.flatMap((m) => m.items);
  const macros = macrosOf(weekItems);
  const macroTotal = Math.max(1, macros.carbs + macros.protein + macros.fat);
  const weekDrinks = weekItems.filter((i) => i.drink);
  const drinkKcal = weekDrinks.reduce((s, i) => s + i.kcal, 0);
  const weekKcal = weekItems.reduce((s, i) => s + i.kcal, 0);
  const waterGlasses = meals
    .filter((m) => m.mealType === "Water")
    .reduce((s, m) => s + m.items.length, 0);

  return (
    <div className="flex flex-1 flex-col px-5 pb-40 pt-8 animate-pola-fade">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-leaf">Intake Dashboard</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink">
          Stats
        </h1>
      </header>

      {/* 7-day chart */}
      <div className="mt-6 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Calories — last 7 days</h2>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 text-leaf" /> avg {avg.toLocaleString()}
          </p>
        </div>
        <div className="relative mt-4 flex h-36 items-end gap-2">
          {budget && (
            <div
              className="absolute inset-x-0 border-t-2 border-dashed border-tomato/50"
              style={{ bottom: `${(budget.kcal / max) * 100}%` }}
            />
          )}
          {trend.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground">
                {v.toLocaleString()}
              </p>
              <div
                className={`w-full rounded-t-lg ${i === trend.length - 1 ? "bg-tomato" : "bg-lime"}`}
                style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"].map((d, i) => (
            <p key={d + i} className={`flex-1 text-center text-[10px] ${i === 6 ? "font-bold text-ink" : "text-muted-foreground"}`}>
              {d}
            </p>
          ))}
        </div>
      </div>

      {/* counts */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-card p-4 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-soft">
            <UtensilsCrossed className="h-4 w-4 text-tomato" />
          </span>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
            {mealCount}
          </p>
          <p className="text-xs text-muted-foreground">meals logged today</p>
        </div>
        <div className="rounded-3xl bg-card p-4 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-soft">
            <Coffee className="h-4 w-4 text-leaf" />
          </span>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
            {drinkCount}
          </p>
          <p className="text-xs text-muted-foreground">drinks today</p>
        </div>
      </div>

      {/* calories per meal time */}
      <div className="mt-4 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        <h2 className="text-sm font-semibold text-ink">Calories by meal time — today</h2>
        <div className="mt-3 space-y-2.5">
          {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((t) => {
            const kcal = meals
              .filter((m) => m.dayOffset === 0 && m.mealType === t)
              .reduce((s, m) => s + mealKcal(m), 0);
            const slotMax = Math.max(
              1,
              ...(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((x) =>
                meals
                  .filter((m) => m.dayOffset === 0 && m.mealType === x)
                  .reduce((s, m) => s + mealKcal(m), 0),
              ),
            );
            return (
              <div key={t} className="flex items-center gap-3">
                <p className="w-20 shrink-0 text-xs font-bold text-ink">{t}</p>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-lime transition-all duration-700"
                    style={{ width: `${(kcal / slotMax) * 100}%` }}
                  />
                </div>
                <p className="w-16 shrink-0 text-right text-xs text-muted-foreground">{kcal} kcal</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* drinks */}
      <div className="mt-4 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        <h2 className="text-sm font-semibold text-ink">Drinks</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {(
            [
              ["Drinks logged", String(weekDrinks.length)],
              ["Drink calories", `${drinkKcal}`],
              ["Water glasses", String(waterGlasses)],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-muted/60 p-3">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                {value}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Sweet drinks are {Math.round((drinkKcal / Math.max(1, weekKcal)) * 100)}% of the calories
          you logged.
        </p>
      </div>

      {/* macros */}
      <div className="mt-4 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        <h2 className="text-sm font-semibold text-ink">Macro split — your log</h2>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full">
          <div className="bg-honey" style={{ width: `${(macros.carbs / macroTotal) * 100}%` }} />
          <div className="bg-lime" style={{ width: `${(macros.protein / macroTotal) * 100}%` }} />
          <div className="bg-tomato" style={{ width: `${(macros.fat / macroTotal) * 100}%` }} />
        </div>
        <div className="mt-3 flex justify-between">
          {(
            [
              ["Carbs", macros.carbs, "text-honey"],
              ["Protein", macros.protein, "text-leaf"],
              ["Fat", macros.fat, "text-tomato"],
            ] as const
          ).map(([label, grams, color]) => (
            <p key={label} className={`text-xs font-bold ${color}`}>
              {label} {Math.round((grams / macroTotal) * 100)}% · {grams}g
            </p>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Estimates are for everyday guidance, not medical use.
      </p>
    </div>
  );
}
