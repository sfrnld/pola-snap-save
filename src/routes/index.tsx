import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Album, Camera, House, ChartColumn } from "lucide-react";

import {
  IMAGES,
  loadState,
  STORAGE_KEY,
  type Budget,
  type FoodItem,
  type Meal,
  type MealType,
  type PolaState,
  type StickerBg,
} from "@/lib/pola-data";
import { OnboardingScreen } from "@/components/pola/Onboarding";
import { BudgetSurvey } from "@/components/pola/BudgetSurvey";
import { HomeScreen } from "@/components/pola/Home";
import { CaptureScreen } from "@/components/pola/Capture";
import { AnalyzingScreen } from "@/components/pola/Analyzing";
import { ReviewScreen, type ReviewResult } from "@/components/pola/Review";
import { DetailScreen } from "@/components/pola/Detail";
import { LibraryScreen } from "@/components/pola/Library";
import { DashboardScreen } from "@/components/pola/Dashboard";

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

type Tab = "home" | "library" | "trends";
type Screen =
  | { name: "onboarding" }
  | { name: "capture" }
  | { name: "analyzing"; mealType: MealType; source: "photo" | "describe" }
  | { name: "review"; mealType: MealType; source: "photo" | "describe" }
  | { name: "detail"; mealId: string };

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function PolaApp() {
  const [state, setState] = useState<PolaState>(loadState);
  const [tab, setTab] = useState<Tab>("home");
  const [screen, setScreen] = useState<Screen>(() =>
    loadState().onboarded ? { name: "detail", mealId: "" } && ({ name: "home" } as never) : { name: "onboarding" },
  );
  const [surveyOpen, setSurveyOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setMeals = useCallback(
    (fn: (m: Meal[]) => Meal[]) => setState((s) => ({ ...s, meals: fn(s.meals) })),
    [],
  );

  const addMeal = useCallback(
    (meal: Meal) => {
      setMeals((m) => [meal, ...m]);
      return meal;
    },
    [setMeals],
  );

  const saveReview = (result: ReviewResult) => {
    const meal = addMeal({
      id: `meal-${Date.now()}`,
      title: result.mealType === "Lunch" ? "Nasi Gulai Lunch" : `My ${result.mealType}`,
      mealType: result.mealType,
      date: "Today",
      time: nowTime(),
      dayOffset: 0,
      image: IMAGES.nasiGulaiImg,
      bg: "honey",
      items: result.items,
      note: result.note || undefined,
      place: result.place ?? undefined,
    });
    setScreen({ name: "detail", mealId: meal.id });
  };

  const quickLog = (source: Meal) => {
    const meal = addMeal({
      ...source,
      id: `meal-${Date.now()}`,
      date: "Today",
      time: nowTime(),
      dayOffset: 0,
    });
    setScreen({ name: "detail", mealId: meal.id });
  };

  const logFromLibrary = (item: FoodItem, image: string, bg: StickerBg, title: string) => {
    const meal = addMeal({
      id: `meal-${Date.now()}`,
      title,
      mealType: "Snack",
      date: "Today",
      time: nowTime(),
      dayOffset: 0,
      image,
      bg,
      items: [{ ...item, id: `item-${Date.now()}` }],
    });
    setScreen({ name: "detail", mealId: meal.id });
  };

  const inFlow = screen.name !== "detail" && screen.name !== "onboarding";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {screen.name === "onboarding" ? (
        <OnboardingScreen
          onDone={() => {
            setState((s) => ({ ...s, onboarded: true }));
            setScreen({ name: "detail", mealId: "" });
          }}
        />
      ) : inFlow ? (
        <>
          {screen.name === "capture" && (
            <CaptureScreen
              onBack={() => setScreen({ name: "detail", mealId: "" })}
              onAnalyze={(mealType, source) => setScreen({ name: "analyzing", mealType, source })}
              onLogFromLibrary={logFromLibrary}
            />
          )}
          {screen.name === "analyzing" && (
            <AnalyzingScreen
              source={screen.source}
              onDone={() =>
                setScreen({ name: "review", mealType: screen.mealType, source: screen.source })
              }
            />
          )}
          {screen.name === "review" && (
            <ReviewScreen
              mealType={screen.mealType}
              onBack={() => setScreen({ name: "capture" })}
              onSave={saveReview}
            />
          )}
        </>
      ) : screen.mealId ? (
        (() => {
          const meal = state.meals.find((m) => m.id === (screen as { mealId: string }).mealId);
          if (!meal)
            return (
              <MainTabs
                tab={tab}
                setTab={setTab}
                state={state}
                budget={state.budget}
                onOpenSurvey={() => setSurveyOpen(true)}
                onOpen={(id) => setScreen({ name: "detail", mealId: id })}
                onQuickLog={quickLog}
              />
            );
          return (
            <DetailScreen
              meal={meal}
              onBack={() => setScreen({ name: "detail", mealId: "" })}
              onDelete={() => {
                setMeals((m) => m.filter((x) => x.id !== meal.id));
                setScreen({ name: "detail", mealId: "" });
              }}
              onUpdateItems={(items) =>
                setMeals((m) => m.map((x) => (x.id === meal.id ? { ...x, items } : x)))
              }
            />
          );
        })()
      ) : (
        <MainTabs
          tab={tab}
          setTab={setTab}
          state={state}
          budget={state.budget}
          onOpenSurvey={() => setSurveyOpen(true)}
          onOpen={(id) => setScreen({ name: "detail", mealId: id })}
          onQuickLog={quickLog}
        />
      )}

      {surveyOpen && (
        <BudgetSurvey
          onClose={() => setSurveyOpen(false)}
          onSave={(b: Budget) => {
            setState((s) => ({ ...s, budget: b }));
            setSurveyOpen(false);
          }}
        />
      )}

      {/* bottom navigation with capture CTA */}
      {!inFlow && screen.name !== "onboarding" && !(screen.name === "detail" && screen.mealId) && (
        <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md">
          <div className="flex items-end justify-between bg-card px-10 pb-5 pt-3 shadow-[0_-8px_24px_-16px_rgba(60,45,30,0.4)]">
            <button
              onClick={() => setTab("home")}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${tab === "home" ? "text-leaf" : "text-muted-foreground"}`}
            >
              <House className="h-5 w-5" /> Home
            </button>
            <div className="flex flex-col items-center -mt-8">
              <button
                onClick={() => setScreen({ name: "capture" })}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-tomato text-primary-foreground shadow-[0_12px_30px_-6px_rgba(190,80,40,0.55)] ring-8 ring-background transition-transform active:scale-90"
                aria-label="Capture meal"
              >
                <Camera className="h-7 w-7" />
              </button>
              <span className="mt-1 text-[10px] font-semibold text-muted-foreground">Record</span>
            </div>
            <button
              onClick={() => setTab("library")}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${tab === "library" ? "text-leaf" : "text-muted-foreground"}`}
            >
              <Album className="h-5 w-5" /> Library
            </button>
            <button
              onClick={() => setTab("trends")}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${tab === "trends" ? "text-leaf" : "text-muted-foreground"}`}
            >
              <ChartColumn className="h-5 w-5" /> Trends
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

function MainTabs({
  tab,
  setTab: _setTab,
  state,
  budget,
  onOpenSurvey,
  onOpen,
  onQuickLog,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  state: PolaState;
  budget: Budget | null;
  onOpenSurvey: () => void;
  onOpen: (id: string) => void;
  onQuickLog: (m: Meal) => void;
}) {
  if (tab === "library")
    return <LibraryScreen meals={state.meals} onOpen={onOpen} onQuickLog={onQuickLog} />;
  if (tab === "trends") return <DashboardScreen meals={state.meals} budget={budget} />;
  return (
    <HomeScreen
      meals={state.meals}
      budget={budget}
      onOpenSurvey={onOpenSurvey}
      onOpen={onOpen}
      onQuickLog={onQuickLog}
    />
  );
}
