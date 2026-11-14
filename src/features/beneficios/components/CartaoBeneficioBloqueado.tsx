import { Cartao } from "@/shared/ui";

import { ImagemBeneficio } from "./ImagemBeneficio";

export function CartaoBeneficioBloqueado({ imagem }: { imagem: string }) {
  return (
    <Cartao className="flex flex-col gap-3 p-4">
      <ImagemBeneficio src={imagem} />
      <span className="h-5 w-20 rounded-pill bg-violeta-50" />
      <span className="h-4 w-4/5 rounded-sm bg-borda-padrao" />
      <span className="h-3 w-1/2 rounded-sm bg-borda-padrao/60" />
      <span className="h-3 w-2/3 rounded-sm bg-borda-padrao/60" />
    </Cartao>
  );
}
