export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-[18px] border border-(--line-heavy) bg-[linear-gradient(160deg,rgba(205,146,77,0.8),rgba(43,54,50,0.92))] text-xs font-semibold uppercase tracking-[0.2em] text-(--surface) shadow-[0_14px_34px_rgba(56,44,18,0.16)]">
        SY
      </div>
      <div>
        <p className="font-(family-name:--font-display) text-xl leading-none text-(--ink)">Stock-Yard</p>
        <p className="text-[11px] uppercase tracking-[0.26em] text-(--ink-soft)">Editorial Terminal</p>
      </div>
    </div>
  );
}
