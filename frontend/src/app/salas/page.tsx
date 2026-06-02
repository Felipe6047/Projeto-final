import { RequireAuth } from "@/components/RequireAuth";
import { SalasPage } from "@/components/pages/SalasPage";

export default function Page() {
  return (
    <RequireAuth>
      <SalasPage />
    </RequireAuth>
  );
}
