export function ComingSoon({
  title,
  phase,
  icon,
}: {
  title: string;
  phase: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-stack-sm p-margin-mobile py-stack-lg text-center md:p-margin-desktop">
      <div className="mb-stack-sm flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h1 className="text-headline-md text-on-surface">{title}</h1>
      <p className="text-body-md text-on-surface-variant">
        Coming in {phase}.
      </p>
    </div>
  );
}
