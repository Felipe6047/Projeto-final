import { ResgatarPresentePage } from "@/components/pages/ResgatarPresentePage";

export default function Page({
  params,
}: {
  params: { codigo: string };
}) {
  return <ResgatarPresentePage codigo={params.codigo} />;
}
