import PricingSectionClient from "./PricingSectionClient";
import { PackageFeature } from "@/actions/packageFeature";
import { Package } from "@/actions/package";

const API_URL = process.env.API_URL;

async function fetchPricingData() {
  try {
    const pkgRes = await fetch(`${API_URL}/package/public`, {
      next: { revalidate: 60 },
    });
    console.log("pkgRes status:", pkgRes.status);
    console.log("pkgRes url:", `${API_URL}/package/public`);
    if (!pkgRes.ok) return [];

    const allPackages: Package[] = await pkgRes.json();
    const activePackages = allPackages.sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    const packagesWithFeatures = await Promise.all(
      activePackages.map(async (pkg) => {
        const featRes = await fetch(
          `${API_URL}/package/public/${pkg.id}/features`,
          {
            next: { revalidate: 60 },
          },
        );
        const features: PackageFeature[] = featRes.ok
          ? await featRes.json()
          : [];
        return {
          ...pkg,
          features: features.sort((a, b) => a.sortOrder - b.sortOrder),
        };
      }),
    );

    return packagesWithFeatures;
  } catch (error) {
    console.error("fetchPricingData error:", error);
    return [];
  }
}

export async function PricingSection() {
  const packages = await fetchPricingData();
  return <PricingSectionClient packages={packages} />;
}
