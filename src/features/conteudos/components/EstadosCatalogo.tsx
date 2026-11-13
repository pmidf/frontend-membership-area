import { EstadoErro, Esqueleto } from "@/shared/ui";

type PropsEstadosCatalogo = {
  carregando: boolean;
  falhou: boolean;
  aoTentarNovamente: () => void;
};

export function EstadosCatalogo({ carregando, falhou, aoTentarNovamente }: PropsEstadosCatalogo) {
  return (
    <>
      {carregando && (
        <Esqueleto
          variante="cartao"
          quantidade={6}
          rotulo="Carregando os conteúdos…"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        />
      )}
      {falhou && (
        <EstadoErro
          mensagem="Não foi possível carregar os conteúdos."
          aoTentarNovamente={aoTentarNovamente}
        />
      )}
    </>
  );
}
