import { requireUser } from "@/lib/session";
import { hasPermission } from "@/lib/permissions";
import { getAllAssets } from "@/lib/queries/assets";
import { AssetRow } from "@/components/assets/asset-row";
import { CreateAssetForm } from "@/components/assets/create-asset-form";
import type { Asset } from "@prisma/client";

export default async function AssetsPage() {
  const user = await requireUser();

  // The real gate — not the sidebar's static allowedRoles list, which
  // is only a UI hint (see the comment on the Assets nav entry in
  // lib/config/nav.ts). Someone whose role can't view this module gets
  // turned away here even if they type the URL directly.
  const [canView, canCreate, canDelete] = await Promise.all([
    hasPermission(user.role, "ASSET_REGISTRY", "canView"),
    hasPermission(user.role, "ASSET_REGISTRY", "canCreate"),
    hasPermission(user.role, "ASSET_REGISTRY", "canDelete"),
  ]);

  if (!canView) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-stack-md flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-error">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h1 className="mb-stack-sm text-headline-lg-mobile text-primary md:text-headline-lg">
            Access restricted
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Your role doesn&rsquo;t have permission to view the Asset
            Registry. Contact a System Admin if you believe this is
            wrong — permissions are managed under Administration →
            Role &amp; Permissions.
          </p>
        </div>
      </div>
    );
  }

  const assets = await getAllAssets();

  return (
    <div className="p-margin-mobile pb-24 md:p-margin-desktop">
      <section className="mb-stack-lg">
        <h2 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Asset Registry
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Pumps, valves, pipeline segments, and other physical
          infrastructure across KPC sites.
        </p>
      </section>

      <div className="mb-stack-md flex flex-wrap items-center justify-between gap-stack-sm">
        <p className="text-label-md text-on-surface-variant">
          {assets.length} asset{assets.length === 1 ? "" : "s"}
        </p>
        {canCreate && <CreateAssetForm />}
      </div>

      <div className="overflow-x-auto border border-outline-variant bg-surface">
        {assets.length === 0 ? (
          <p className="p-stack-md text-body-sm text-on-surface-variant">
            No assets registered yet.
          </p>
        ) : (
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant text-left text-label-sm uppercase text-on-surface-variant">
                <th className="px-stack-md py-stack-sm font-bold">Asset</th>
                <th className="px-stack-md py-stack-sm font-bold">Category</th>
                <th className="px-stack-md py-stack-sm font-bold">Location</th>
                <th className="px-stack-md py-stack-sm font-bold">Status</th>
                <th className="px-stack-md py-stack-sm font-bold text-right"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset: Asset) => (
                <AssetRow
                  key={asset.id}
                  id={asset.id}
                  name={asset.name}
                  assetTag={asset.assetTag}
                  category={asset.category}
                  location={asset.location}
                  status={asset.status}
                  canEdit={canCreate}
                  canDelete={canDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
