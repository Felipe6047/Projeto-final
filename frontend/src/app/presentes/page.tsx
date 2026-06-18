import { PresentesPage } from "@/components/pages/PresentesPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando loja...</div>}>
      <PresentesPage />
    </Suspense>
  );
}
