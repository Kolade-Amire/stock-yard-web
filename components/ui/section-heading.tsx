import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-(--ink-soft)">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h2 className="font-(family-name:--font-display) text-[2rem] leading-none text-(--ink) md:text-[2.4rem]">{title}</h2>
          {description ? <p className="max-w-2xl text-sm leading-6 text-(--ink-muted)">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
