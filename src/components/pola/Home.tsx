import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Plus, Target } from "lucide-react";
import {
  DAY_LABELS,
  macrosOf,
  mealKcal,
  type Budget,
  type Meal,
} from "@/lib/pola-data";
import { STICKER_BG } from "@/lib/pola-data";
import { Sticker } from "./Sticker";

function MacroBar({
  label,
  used,
  budget,
  color,
}: {
  label: string;
  used: number;
  budget: number | null;
  color: string;
}) {
  const pct = budget ? Math.min(100, Math.round((used / budget) * 100)) : 0;
  return (
    <div className="flex-1">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] font-bold text-ink">
        {budget ? `${Math.max(0, budget - used)}g left` : `${used}g`}
      </p>
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
  const pct = budget ? Math.min(100, Math.round((total / budget.kcal) * 100)) : 0;
  const recent = meals.slice(0, 3);

  return (
    <div className="flex flex-1 flex-col px-5 pb-40 pt-8 animate-pola-fade">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-leaf">Pola</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink">
            {DAY_LABELS[day]}
          </h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-soft">
          <Flame className="h-5 w-5 text-tomato" />
        </div>
      </header>

      {/* day slider */}
      <div className="mt-4 flex items-center justify-between rounded-full bg-card p-1.5 shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)]">
        <button
          onClick={() => setDay((d) => Math.min(DAY_LABELS.length - 1, d + 1))}
          aria-label="Previous day"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-xs font-semibold text-ink">
          {DAY_LABELS[day]} · {dayMeals.length} meal{dayMeals.length === 1 ? "" : "s"} logged
        </p>
        <button
          onClick={() => setDay((d) => Math.max(0, d - 1))}
          aria-label="Next day"
          disabled={day === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* budget card */}
      <div className="mt-4 rounded-3xl bg-card p-5 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)]">
        {budget ? (
          <>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-ink">
                {total.toLocaleString()}{" "}
                <span className="font-normal text-muted-foreground">
                  / {budget.kcal.toLocaleString()} kcal
                </span>
              </p>
              <p className="text-xs font-semibold text-leaf">
                {Math.max(0, budget.kcal - total).toLocaleString()} kcal left
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime to-leaf transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        ) : (
          <button onClick={onOpenSurvey} className="w-full text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-soft">
                <Target className="h-5 w-5 text-tomato" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Set your calorie budget</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Six quick taps — do it whenever you're ready.
                </p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">
              {total.toLocaleString()} kcal <span className="font-normal text-muted-foreground">logged today</span>
            </p>
          </button>
        )}

        <div className="mt-4 flex gap-3 border-t border-border pt-4">
          <MacroBar label="Carbs" used={macros.carbs} budget={budget?.carbs ?? null} color="bg-honey" />
          <MacroBar label="Protein" used={macros.protein} budget={budget?.protein ?? null} color="bg-lime" />
          <MacroBar label="Fat" used={macros.fat} budget={budget?.fat ?? null} color="bg-tomato" />
        </div>
      </div>

      {/* recent quick log */}
      {recent.length > 0 && (
        <div className="mt-7">
          <h2 className="text-sm font-semibold text-ink">Log again</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {recent.map((m) => (
              <button
                key={`quick-${m.id}`}
                onClick={() => onQuickLog(m)}
                className="flex w-32 shrink-0 flex-col items-center rounded-2xl bg-card p-3 text-center shadow-[0_4px_16px_-10px_rgba(60,45,30,0.3)] transition-transform active:scale-95"
              >
                <Sticker meal={m} size="sm" />
                <p className="mt-2 line-clamp-1 text-xs font-semibold text-ink">{m.title}</p>
                <span className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-leaf">
                  <Plus className="h-3 w-3" /> {mealKcal(m)} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* collection */}
      <div className="mt-7">
        <h2 className="text-sm font-semibold text-ink">Your Pola collection</h2>
        {dayMeals.length === 0 ? (
          <p className="mt-3 rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground">
            Nothing logged on this day yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {dayMeals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => onOpen(meal.id)}
                className="rounded-3xl bg-card p-2 shadow-[0_6px_24px_-12px_rgba(60,45,30,0.25)] transition-transform active:scale-95"
              >
                <div className={`${STICKER_BG[meal.bg]} rounded-[1.35rem] px-3 pb-2 pt-3 text-left`}>
                  <div className="flex items-start justify-between gap-1">
                    <p className="line-clamp-1 text-sm font-extrabold leading-tight text-ink">{meal.title}</p>
                    <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {meal.mealType}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-ink/60">{mealKcal(meal)} kcal</p>
                  <div className="mt-1 flex justify-center">
                    <Sticker meal={meal} plain />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
