import { useState } from "react";
import { X } from "lucide-react";
import { computeBudget, type Budget } from "@/lib/pola-data";

type Sex = "Female" | "Male";
type Activity = "Low" | "Moderate" | "High";
type Goal = "Lose" | "Maintain" | "Gain";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-lime text-ink" : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function BudgetSurvey({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (b: Budget) => void;
}) {
  const [sex, setSex] = useState<Sex>("Female");
  const [age, setAge] = useState(29);
  const [heightCm, setHeight] = useState(165);
  const [weightKg, setWeight] = useState(60);
  const [activity, setActivity] = useState<Activity>("Moderate");
  const [goal, setGoal] = useState<Goal>("Maintain");

  const preview = computeBudget({ sex, age, heightCm, weightKg, activity, goal });

  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-md flex-col justify-end bg-ink/40 backdrop-blur-sm">
      <div className="max-h-[92vh] overflow-y-auto rounded-t-[2rem] bg-background px-5 pb-8 pt-5 animate-pola-fade">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
              Your daily budget
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Six quick taps. You can change this any time.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close survey"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-ink shadow"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <Row label="Sex">
            {(["Female", "Male"] as Sex[]).map((s) => (
              <Chip key={s} active={sex === s} onClick={() => setSex(s)}>
                {s}
              </Chip>
            ))}
          </Row>

          {(
            [
              ["Age", age, setAge, 14, 90, "yr"],
              ["Height", heightCm, setHeight, 130, 210, "cm"],
              ["Weight", weightKg, setWeight, 35, 160, "kg"],
            ] as const
          ).map(([label, value, set, min, max, unit]) => (
            <div key={label}>
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="text-sm font-bold text-ink">
                  {value} {unit}
                </p>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                aria-label={label}
                onChange={(e) => set(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--color-tomato)]"
              />
            </div>
          ))}

          <Row label="Activity">
            {(["Low", "Moderate", "High"] as Activity[]).map((a) => (
              <Chip key={a} active={activity === a} onClick={() => setActivity(a)}>
                {a}
              </Chip>
            ))}
          </Row>

          <Row label="Goal">
            {(["Lose", "Maintain", "Gain"] as Goal[]).map((g) => (
              <Chip key={g} active={goal === g} onClick={() => setGoal(g)}>
                {g} weight
              </Chip>
            ))}
          </Row>
        </div>

        <div className="mt-6 rounded-3xl bg-lime-soft p-5 text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
            {preview.kcal.toLocaleString()} kcal
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {preview.carbs}g carbs · {preview.protein}g protein · {preview.fat}g fat
          </p>
        </div>

        <button
          onClick={() => onSave(preview)}
          className="mt-5 w-full rounded-full bg-tomato py-4 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] transition-transform active:scale-95"
        >
          Use this budget
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Estimates are for everyday guidance, not medical use.
        </p>
      </div>
    </div>
  );
}
