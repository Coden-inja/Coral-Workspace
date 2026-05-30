import type { AiRootCauseCard } from "@/contracts/ai-analysis";

import { aiPageInnerCardClass } from "@/components/ai-analysis/styles";

type AiRootCauseSectionProps = {
  cards: AiRootCauseCard[];
};

export function AiRootCauseSection({ cards }: AiRootCauseSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Root Cause Analysis</h2>
        <p className="mt-1 text-sm text-zinc-400">Primary cause, impact scope, and blast radius.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className={[aiPageInnerCardClass, "p-5 transition-colors hover:border-zinc-600"].join(" ")}
          >
            <p className="text-base font-semibold text-zinc-100">{card.title}</p>
            <ul className="mt-5 space-y-2.5">
              {card.lines.map((line) => (
                <li key={line} className="text-sm leading-snug text-zinc-400">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
