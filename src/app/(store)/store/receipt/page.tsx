import { ReceiptView } from "@/components/store/ReceiptView";
import { StoreHeader } from "@/components/store/StoreHeader";

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const failure = status === "budget" || status === "stock" ? status : undefined;

  return (
    <div className="storePage">
      <StoreHeader showCart />
      <main className="storeMain receiptMain">
        <ReceiptView failure={failure} />
      </main>
    </div>
  );
}
