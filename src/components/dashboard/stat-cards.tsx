import { cn } from "@/lib/utils";
import type { StatCard } from "@/lib/queries/dashboard";

const TONE_STYLES: Record<
  StatCard["tone"],
  { icon: string; iconBg: string; value: string }
> = {
  primary: {
    icon: "text-primary",
    iconBg: "bg-primary-fixed",
    value: "text-primary",
  },
  secondary: {
    icon: "text-secondary",
    iconBg: "bg-secondary-fixed",
    value: "text-secondary",
  },
  error: {
    icon: "text-error",
    iconBg: "bg-error-container",
    value: "text-error",
  },
  tertiary: {
    icon: "text-tertiary",
    iconBg: "bg-tertiary-fixed",
    value: "text-tertiary",
  },
};

export function StatCardsGrid({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const tone = TONE_STYLES[card.tone];
        return (
          <div
            key={card.label}
            className="flex flex-col gap-2 border border-outline-variant bg-surface-container-lowest p-stack-md"
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "material-symbols-outlined rounded p-2",
                  tone.icon,
                  tone.iconBg,
                )}
              >
                {card.icon}
              </span>
              {card.trend && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-1 text-label-sm",
                    card.trend.direction === "up"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600",
                  )}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {card.trend.direction === "up"
                      ? "trending_up"
                      : "trending_down"}
                  </span>
                  {card.trend.value}
                </span>
              )}
              {!card.trend && card.caption && (
                <span className="rounded bg-surface-container-low px-2 py-1 text-label-sm text-on-surface-variant">
                  {card.caption}
                </span>
              )}
            </div>
            <div>
              <p className="text-label-md uppercase text-on-surface-variant">
                {card.label}
              </p>
              <h3 className={cn("text-headline-lg", tone.value)}>
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
