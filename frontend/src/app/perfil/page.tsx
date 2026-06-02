import { RequireAuth } from "@/components/RequireAuth";
import { PerfilPage } from "@/components/pages/PerfilPage";

export default function Page() {
  return (
    <RequireAuth>
      <PerfilPage />
    </RequireAuth>
  );
}
