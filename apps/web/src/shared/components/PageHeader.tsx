import React from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
}

export function PageHeader({ eyebrow, title }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <p 
        className="ca-mono text-[0.7rem] uppercase text-primary" 
        style={{ letterSpacing: ".18em" }}
      >
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl" style={{ fontFamily: '"Sora", sans-serif' }}>
        {title}
      </h1>
    </div>
  );
}
