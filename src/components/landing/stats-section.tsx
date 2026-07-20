const STATS = [
  { value: "1,240", label: "Active Permits" },
  { value: "99.8%", label: "Safety Compliance" },
  { value: "15 mins", label: "Avg Approval Time" },
  { value: "45,000+", label: "Closed Permits" },
];

export function StatsSection() {
  return (
    <section className="bg-primary py-stack-lg">
      <div className="mx-auto max-w-screen-max px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={
                i < STATS.length - 1
                  ? "border-r border-white/10 text-center last:border-0"
                  : "text-center"
              }
            >
              <div className="mb-1 text-[40px] font-bold leading-none text-on-primary">
                {stat.value}
              </div>
              <div className="text-label-md uppercase text-on-primary-container">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
