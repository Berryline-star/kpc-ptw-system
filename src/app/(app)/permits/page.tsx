import Link from "next/link";
import { getPermitListData } from "@/lib/queries/permits";
import { PermitCard, type PermitCardData } from "@/components/permits/permit-card";
import { PermitSearchBar } from "@/components/permits/permit-search-bar";
import type { PermitStatus, PermitType } from "@prisma/client";

export default async function PermitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const { permits, total, page, totalPages, stats } = await getPermitListData({
    search: params.search,
    status: params.status as PermitStatus | undefined,
    type: params.type as PermitType | undefined,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="mx-auto max-w-screen-max p-margin-mobile pb-24 md:p-margin-desktop">
      <section className="mb-stack-lg">
        <h2 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Permits
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Systematic management of pipeline work permits.
        </p>
      </section>

      <section className="mb-stack-lg grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="col-span-2 flex h-32 flex-col justify-between border border-outline-variant bg-surface-container-lowest p-stack-md md:col-span-1">
          <div className="flex items-start justify-between">
            <span className="material-symbols-outlined text-primary">
              assignment
            </span>
            <span className="text-label-sm text-on-surface-variant">
              Total
            </span>
          </div>
          <div>
            <div className="text-headline-lg text-on-surface">
              {stats.total.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between border border-outline-variant bg-surface-container-lowest p-stack-md">
          <div className="flex items-start justify-between">
            <span className="material-symbols-outlined text-secondary">
              pending_actions
            </span>
            <span className="text-label-sm text-on-surface-variant">
              Pending
            </span>
          </div>
          <div>
            <div className="text-headline-lg text-on-surface">
              {stats.pending.toLocaleString()}
            </div>
            <div className="text-label-md text-secondary">
              Awaiting Review
            </div>
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between border border-outline-variant bg-surface-container-lowest p-stack-md">
          <div className="flex items-start justify-between">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
            <span className="text-label-sm text-on-surface-variant">
              Active
            </span>
          </div>
          <div>
            <div className="text-headline-lg text-on-surface">
              {stats.active.toLocaleString()}
            </div>
            <div className="text-label-md text-on-surface-variant">
              Live in Field
            </div>
          </div>
        </div>
      </section>

      <PermitSearchBar />

      {permits.length === 0 ? (
        <div className="flex flex-col items-center gap-stack-sm border border-dashed border-outline-variant py-stack-lg text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">
            assignment
          </span>
          <p className="text-body-md text-on-surface-variant">
            {params.search
              ? `No permits match "${params.search}".`
              : "No permits yet — create the first one."}
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {permits.map((permit: PermitCardData) => (
            <PermitCard key={permit.id} permit={permit} />
          ))}
        </section>
      )}

      {totalPages > 1 && (
        <div className="mt-stack-lg flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/permits?${new URLSearchParams({
                ...(params.search ? { search: params.search } : {}),
                page: String(p),
              }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-label-md ${
                p === page
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface-variant"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      <p className="mt-stack-sm text-center text-label-sm text-on-surface-variant">
        Showing {permits.length} of {total} result{total === 1 ? "" : "s"}
      </p>

      <Link
        href="/permits/new"
        aria-label="Create new permit"
        className="fixed bottom-[88px] right-margin-mobile z-30 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-on-primary shadow-lg transition-all hover:bg-secondary-container active:scale-90 md:bottom-margin-desktop md:right-margin-desktop"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </Link>
    </div>
  );
}
