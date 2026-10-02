import { redirect } from "next/navigation";

/** Product pages are now a sheet over the gallery; old links land on it. */
export default async function ProductRedirect({
  params,
}: {
  params: Promise<{ area: string; product: string }>;
}) {
  const { area, product } = await params;
  redirect(`/store/market/${area}?item=${encodeURIComponent(product)}`);
}
