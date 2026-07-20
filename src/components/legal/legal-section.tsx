export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-stack-sm text-headline-sm text-primary">{title}</h2>
      <div className="space-y-stack-sm">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-6">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-container-high px-1 py-0.5 text-label-sm text-secondary">
      [{children}]
    </code>
  );
}
