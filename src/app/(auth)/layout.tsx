/**
 * Shared chrome for the transactional auth screens (login, forgot/reset
 * password). The Stitch mockup uses a photographic refinery background
 * behind a frosted glass card; we approximate that mood with a gradient
 * instead of hot-linking an external image we don't own the rights to.
 * Swap in a real KPC facility photo here later if you have one —
 * `bg-[url('/your-photo.jpg')]` on the outer div is the only change needed.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-br from-primary via-primary-container to-on-surface">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-background/90" />
      <main className="relative z-10 flex flex-grow items-center justify-center p-margin-mobile md:p-margin-desktop">
        {children}
      </main>
      <footer className="relative z-10 flex w-full flex-col items-center justify-center gap-stack-sm px-margin-mobile py-stack-md text-center">
        <p className="text-label-sm text-white/70">
          &copy; {new Date().getFullYear()} Kenya Pipeline Company. All
          Rights Reserved. Operational Safety Systems.
        </p>
      </footer>
    </div>
  );
}
