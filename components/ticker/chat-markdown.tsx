"use client";

import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type ChatMarkdownProps = {
  content: string;
  className?: string;
};

const components: Components = {
  p({ className, ...props }) {
    return <p className={cn("mt-4 leading-8 first:mt-0", className)} {...props} />;
  },
  ul({ className, ...props }) {
    return <ul className={cn("mt-4 list-disc pl-6 leading-8 first:mt-0", className)} {...props} />;
  },
  ol({ className, ...props }) {
    return <ol className={cn("mt-4 list-decimal pl-6 leading-8 first:mt-0", className)} {...props} />;
  },
  li({ className, ...props }) {
    return <li className={cn("pl-1 marker:text-(--ink-soft)", className)} {...props} />;
  },
  a({ className, ...props }) {
    return <a className={cn("font-medium text-(--accent) underline decoration-(--line-heavy) underline-offset-4", className)} target="_blank" rel="noreferrer" {...props} />;
  },
  blockquote({ className, ...props }) {
    return <blockquote className={cn("mt-4 border-l-2 border-(--line-heavy) pl-4 text-(--ink-muted) first:mt-0", className)} {...props} />;
  },
  code({ className, ...props }) {
    const isBlockCode = Boolean(className && className.includes("language-"));

    return (
      <code
        className={cn(
          isBlockCode
            ? "block font-mono text-[13px] leading-6"
            : "rounded-md bg-(--surface) px-1.5 py-0.5 font-mono text-[13px] text-(--ink-strong)",
          className,
        )}
        {...props}
      />
    );
  },
  pre({ className, ...props }) {
    return <pre className={cn("mt-4 overflow-x-auto rounded-[1rem] border border-(--line) bg-(--surface) p-4 text-sm first:mt-0", className)} {...props} />;
  },
  table({ className, ...props }) {
    return (
      <div className="mt-4 overflow-x-auto first:mt-0">
        <table className={cn("min-w-full border-collapse text-sm", className)} {...props} />
      </div>
    );
  },
  thead({ className, ...props }) {
    return <thead className={cn("border-b border-(--line)", className)} {...props} />;
  },
  tbody({ className, ...props }) {
    return <tbody className={cn("divide-y divide-(--line)", className)} {...props} />;
  },
  th({ className, ...props }) {
    return <th className={cn("px-3 py-2 text-left font-semibold text-(--ink-strong)", className)} {...props} />;
  },
  td({ className, ...props }) {
    return <td className={cn("px-3 py-2 align-top text-(--ink-muted)", className)} {...props} />;
  },
  strong({ className, ...props }) {
    return <strong className={cn("font-semibold text-(--ink-strong)", className)} {...props} />;
  },
  em({ className, ...props }) {
    return <em className={cn("italic text-(--ink)", className)} {...props} />;
  },
};

export function ChatMarkdown({ content, className }: ChatMarkdownProps) {
  return (
    <div className={cn("text-[15px] text-(--ink)", className)}>
      <Markdown
        components={components}
        remarkPlugins={[remarkGfm]}
        skipHtml
      >
        {content}
      </Markdown>
    </div>
  );
}
