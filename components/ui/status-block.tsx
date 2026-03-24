import { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type StatusBlockProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function StatusBlock({ title, description, action }: StatusBlockProps) {
  return (
    <Card variant="band" className="px-6 py-7 md:px-8">
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-(--ink-strong)">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-(--ink-muted)">{description}</p>
        {action}
      </div>
    </Card>
  );
}
