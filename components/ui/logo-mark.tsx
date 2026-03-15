export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-2xl border border-(--line-strong) bg-[radial-gradient(circle_at_30%_30%,rgba(205,146,77,0.42),rgba(43,54,50,0.96))] text-sm font-semibold text-(--surface) shadow-[0_16px_40px_rgba(56,44,18,0.2)]">
        SY
      </div>
      <div>
        <p className="font-(family-name:--font-display) text-xl leading-none text-(--ink)">Stock-Yard</p>
        <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Research Deck</p>
      </div>
    </div>
  );
}
