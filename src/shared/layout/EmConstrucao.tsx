import { Construction } from "lucide-react";

import { CabecalhoPagina } from "@/shared/ui/cabecalho-pagina/CabecalhoPagina";
import { EstadoVazio } from "@/shared/ui/estado/EstadoVazio";

export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina titulo={titulo} />
      <EstadoVazio
        icone={Construction}
        titulo="Em construção"
        descricao="Esta área está sendo preparada e chega em breve."
      />
    </div>
  );
}
