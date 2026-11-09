import React from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Right-aligned actions, e.g. a primary button. */
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ca-fade-up">
      <div className="min-w-0">
        <span className="ca-eyebrow">{eyebrow}</span>
        <h1
          className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: '"Sora", sans-serif' }}
        >
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
