import { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type StatusBlockProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function StatusBlock({ title, description, action }: StatusBlockProps) {
  return (
    <Card className="px-5 py-6">
      <div className="space-y-3">
        <h3 className="font-(family-name:--font-display) text-2xl text-(--ink)">{title}</h3>
        <p className="max-w-xl text-sm text-(--ink-muted)">{description}</p>
        {action}
      </div>
    </Card>
  );
}
