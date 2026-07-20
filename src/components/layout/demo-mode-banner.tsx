import Link from "next/link";

export function DemoModeBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-secondary px-margin-mobile py-2 text-center text-label-sm text-on-secondary md:px-margin-desktop">
      <span className="material-symbols-outlined text-[16px]">
        visibility
      </span>
      <span>
        You&rsquo;re viewing a shared public demo account — data here is
        visible to everyone trying the demo, not private to you.
      </span>
      <Link href="/login" className="font-bold underline">
        Sign in with a real account
      </Link>
    </div>
  );
}
