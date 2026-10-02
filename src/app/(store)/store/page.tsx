import { AboutContent } from "@/components/store/AboutContent";
import { StoreHeader } from "@/components/store/StoreHeader";

export default function StoreAboutPage() {
  return (
    <div className="storePage">
      <StoreHeader />

      <main className="storeMain">
        <AboutContent />
      </main>
    </div>
  );
}
