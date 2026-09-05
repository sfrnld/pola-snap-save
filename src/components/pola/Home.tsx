import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Target } from "lucide-react";
import { DAY_LABELS, macrosOf, mealKcal, type Budget, type Meal, type MealType } from "@/lib/pola-data";
import { Sticker } from "./Sticker";
import mascot from "@/assets/pola-mascot.png";

const MEAL_SLOTS: { type: MealType; hint: string }[] = [
  { type: "Breakfast", hint: "410 – 574 kcal" },
  { type: "Lunch", hint: "492 – 656 kcal" },
  { type: "Dinner", hint: "640 – 836 kcal" },
  { type: "Snack", hint: "120 – 260 kcal" },
];

function MacroCard({
  label,
  used,
  budget,
  bar,
}: {
  label: string;
  used: number;
  budget: number | null;
  bar: string;
}) {
  const pct = budget ? Math.min(100, Math.round((used / budget) * 100)) : 0;
  return (
    <div className="flex-1 rounded-2xl bg-card p-3">
      <p className="text-[13px] font-bold text-ink">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {used}
        {budget ? `/${budget}` : ""}g
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function HomeScreen({
  meals,
  budget,
  onOpenSurvey,
  onOpen,
  onQuickLog,
}: {
  meals: Meal[];
  budget: Budget | null;
  onOpenSurvey: () => void;
  onOpen: (id: string) => void;
  onQuickLog: (meal: Meal) => void;
}) {
  const [day, setDay] = useState(0);
  const dayMeals = useMemo(() => meals.filter((m) => m.dayOffset === day), [meals, day]);
  const total = dayMeals.reduce((s, m) => s + mealKcal(m), 0);
  const macros = macrosOf(dayMeals.flatMap((m) => m.items));
  const pct = budget ? Math.min(100, (total / budget.kcal) * 100) : 0;
  const recent = meals.slice(0, 3);
  const ring = `conic-gradient(var(--color-lime) ${pct * 3.6}deg, var(--color-muted) 0deg)`;

  return (
    <div className="flex flex-1 flex-col px-5 pb-40 pt-6 animate-pola-fade">
      {/* brand */}
      <h1 className="text-center text-[26px] font-black tracking-tight text-ink">
        Pola<span className="text-leaf">.</span>
      </h1>
      {/* subtle day slider */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <button
          onClick={() => setDay((d) => Math.min(DAY_LABELS.length - 1, d + 1))}
          aria-label="Previous day"
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink/70">{DAY_LABELS[day]}</p>
        <button
          onClick={() => setDay((d) => Math.max(0, d - 1))}
          aria-label="Next day"
          disabled={day === 0}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors active:bg-muted disabled:opacity-25"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* budget card + mascot */}
      <div className="mt-3 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-14px_rgba(20,22,25,0.25)]">
        {budget ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-5xl font-extrabold leading-none text-ink">
                {Math.max(0, budget.kcal - total).toLocaleString()}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">Calories left</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {total.toLocaleString()} of {budget.kcal.toLocaleString()} kcal
              </p>
            </div>
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ background: ring }} />
              <div className="absolute inset-[8px] rounded-full bg-card" />
              <img
                src={mascot}
                alt="Pola mascot"
                loading="lazy"
                width={816}
                height={816}
                className="relative h-[4.6rem] w-[4.6rem] object-contain animate-pola-bob drop-shadow-[0_6px_10px_rgba(20,22,25,0.18)]"
              />
            </div>
          </div>
        ) : (
          <button onClick={onOpenSurvey} className="flex w-full items-center gap-3 text-left">
            <img
              src={mascot}
              alt="Pola mascot"
              width={816}
              height={816}
              className="h-20 w-20 shrink-0 object-contain animate-pola-bob"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">Set your calorie budget</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Six quick taps — or just keep snapping first.
              </p>
              <p className="mt-2 text-sm font-bold text-ink">
                {total.toLocaleString()} kcal{" "}
                <span className="font-normal text-muted-foreground">logged</span>
              </p>
            </div>
            <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-soft">
              <Target className="h-4 w-4 text-leaf" />
            </span>
          </button>
        )}
      </div>

      {/* macros */}
      <div className="mt-3 flex gap-3">
        <MacroCard label="Carbs" used={macros.carbs} budget={budget?.carbs ?? null} bar="bg-honey" />
        <MacroCard label="Protein" used={macros.protein} budget={budget?.protein ?? null} bar="bg-lime" />
        <MacroCard label="Fat" used={macros.fat} budget={budget?.fat ?? null} bar="bg-leaf" />
      </div>

      {/* quick log */}
      {recent.length > 0 && (
        <div className="mt-7">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Log again
          </h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {recent.map((m) => (
              <button
                key={`quick-${m.id}`}
                onClick={() => onQuickLog(m)}
                className="flex w-32 shrink-0 flex-col items-center rounded-2xl bg-card p-3 text-center transition-transform active:scale-95"
              >
                <Sticker meal={m} size="sm" />
                <p className="mt-2 line-clamp-1 text-xs font-bold text-ink">{m.title}</p>
                <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-leaf">
                  <Plus className="h-3 w-3" /> {mealKcal(m)} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* meals logged, grouped by meal time */}
      <div className="mt-7">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Meals logged
        </h2>
        <div className="mt-3 space-y-3">
          {MEAL_SLOTS.map((slot) => {
            const logged = dayMeals.filter((m) => m.mealType === slot.type);
            return (
              <div key={slot.type} className="rounded-3xl bg-card p-3">
                <div className="flex items-center gap-3 px-1">
                  <p className="text-[15px] font-bold text-ink">{slot.type}</p>
                  <p className="ml-auto text-xs text-muted-foreground">
                    {logged.length
                      ? `${logged.reduce((s, m) => s + mealKcal(m), 0)} kcal`
                      : `Recommended: ${slot.hint}`}
                  </p>
                </div>
                {logged.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {logged.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => onOpen(meal.id)}
                        className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors active:bg-muted"
                      >
                        <Sticker meal={meal} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink">{meal.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {meal.time} · {meal.items.length} item{meal.items.length === 1 ? "" : "s"}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-ink">
                          {mealKcal(meal)} kcal
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
