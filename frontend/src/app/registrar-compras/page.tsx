import { RegistrarComprasPage } from "@/components/pages/RegistrarComprasPage";
import { RequireAuth } from "@/components/RequireAuth";

export default function Page() {
  return (
    <RequireAuth>
      <RegistrarComprasPage />
    </RequireAuth>
  );
}
