import Link from "next/link";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function PermitsPage() {
  return (
    <div>
      <ComingSoon
        title="Permits Directory"
        phase="Phase 7"
        icon="assignment"
      />
      <div className="flex justify-center pb-stack-lg">
        <Link
          href="/permits/new"
          className="inline-flex items-center gap-2 rounded-lg bg-secondary-container px-stack-lg py-3 text-label-lg font-bold text-on-secondary-container transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create a New Permit
        </Link>
      </div>
    </div>
  );
}
