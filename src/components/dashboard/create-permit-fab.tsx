import Link from "next/link";

export function CreatePermitFab() {
  return (
    <Link
      href="/permits/new"
      aria-label="Create new permit"
      className="fixed bottom-[88px] right-margin-mobile z-30 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-white shadow-lg transition-all hover:scale-105 active:scale-95 md:bottom-margin-desktop md:right-margin-desktop"
    >
      <span className="material-symbols-outlined !text-3xl">add</span>
    </Link>
  );
}
