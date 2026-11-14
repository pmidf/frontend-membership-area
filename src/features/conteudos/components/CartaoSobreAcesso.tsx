import { Alerta, Cartao } from "@/shared/ui";

export function CartaoSobreAcesso({ exclusivo }: { exclusivo: boolean }) {
  return (
    <Cartao className="flex flex-col gap-3 p-5.5">
      <h2 className="text-h3">Sobre o acesso</h2>
      <Alerta titulo={exclusivo ? "Conteúdo restrito a filiados" : "Conteúdo aberto"}>
        {exclusivo
          ? "Conteúdo exclusivo para filiados do PMI-DF. Uso pessoal; a redistribuição do link é vedada."
          : "Disponível para todos os membros da plataforma."}
      </Alerta>
      <p className="text-legenda text-texto-secundario">
        Sua visualização fica registrada para as métricas do capítulo.
      </p>
    </Cartao>
  );
}
