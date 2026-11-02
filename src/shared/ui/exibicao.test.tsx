import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Alerta } from "./alerta/Alerta";
import { Avatar } from "./avatar/Avatar";
import { CabecalhoPagina } from "./cabecalho-pagina/CabecalhoPagina";
import { Cartao } from "./cartao/Cartao";
import { Etiqueta } from "./etiqueta/Etiqueta";
import { SeloStatus } from "./selo-status/SeloStatus";
import { TextoTruncado } from "./texto-truncado/TextoTruncado";

describe("Etiqueta e SeloStatus", () => {
  it("aplicam o tom escolhido", () => {
    render(
      <>
        <Etiqueta tom="aqua">Educação</Etiqueta>
        <SeloStatus tom="sucesso">Publicado</SeloStatus>
      </>,
    );

    expect(screen.getByText("Educação")).toHaveClass("bg-aqua-50");
    expect(screen.getByText("Publicado")).toHaveClass("bg-sucesso-50");
  });
});

describe("Avatar", () => {
  it("mostra as iniciais com nome acessível quando não há imagem", () => {
    render(<Avatar nome="Camila Lopes" />);

    expect(screen.getByRole("img", { name: "Camila Lopes" })).toHaveTextContent("CL");
  });

  it("mostra a imagem com texto alternativo", () => {
    render(<Avatar nome="Ana Cardoso" imagem="https://cdn.pmidf.org/ana.png" tamanho="lg" />);

    expect(screen.getByRole("img", { name: "Ana Cardoso" })).toHaveAttribute(
      "src",
      "https://cdn.pmidf.org/ana.png",
    );
  });
});

describe("Alerta", () => {
  it("usa role alert para erro e status para os demais tons", () => {
    render(
      <>
        <Alerta tom="erro" titulo="Os dados não conferem">
          Verifique o PMI ID.
        </Alerta>
        <Alerta tom="sucesso" titulo="Filiação confirmada" acao={<button>Entrar</button>} />
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Os dados não conferemVerifique o PMI ID.");
    expect(screen.getByRole("status")).toHaveTextContent("Filiação confirmada");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("oferece o botão de dispensar quando recebe aoFechar", async () => {
    const aoFechar = vi.fn();
    render(<Alerta titulo="Sua filiação vence em breve" aoFechar={aoFechar} />);

    await userEvent.click(screen.getByRole("button", { name: "Dispensar aviso" }));

    expect(aoFechar).toHaveBeenCalledOnce();
  });
});

describe("Cartao, CabecalhoPagina e TextoTruncado", () => {
  it("renderizam o conteúdo com a semântica esperada", () => {
    render(
      <Cartao interativo data-testid="cartao">
        <CabecalhoPagina
          titulo="Benefícios"
          subtitulo="Vantagens do capítulo"
          acoes={<button>Novo</button>}
        />
        <TextoTruncado texto="Um texto bem longo" linhas={1} />
      </Cartao>,
    );

    expect(screen.getByTestId("cartao")).toHaveClass("hover:shadow-md");
    expect(screen.getByRole("heading", { level: 1, name: "Benefícios" })).toBeInTheDocument();
    expect(screen.getByText("Um texto bem longo")).toHaveAttribute("title", "Um texto bem longo");
  });
});
