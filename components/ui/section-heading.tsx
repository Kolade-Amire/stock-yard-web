import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.32em] text-(--ink-soft)">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h2 className="font-(family-name:--font-display) text-3xl leading-none text-(--ink) md:text-4xl">{title}</h2>
          {description ? <p className="max-w-2xl text-sm text-(--ink-muted) md:text-base">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
