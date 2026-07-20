import Link from "next/link";

export function CreatePermitFab({ isDemo = false }: { isDemo?: boolean }) {
  return (
    <Link
      href={isDemo ? "/register?intent=create-permit" : "/permits/new"}
      aria-label={
        isDemo
          ? "Create a real account to submit a permit"
          : "Create new permit"
      }
      title={
        isDemo
          ? "The demo account can't submit real permits — create an account"
          : undefined
      }
      className="fixed bottom-[88px] right-margin-mobile z-30 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-white shadow-lg transition-all hover:scale-105 active:scale-95 md:bottom-margin-desktop md:right-margin-desktop"
    >
      <span className="material-symbols-outlined !text-3xl">
        {isDemo ? "person_add" : "add"}
      </span>
    </Link>
  );
}
