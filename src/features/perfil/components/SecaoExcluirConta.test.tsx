import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ExigeLogin } from "@/shared/sessao/ExigeLogin";
import { chavesSessao } from "@/shared/sessao/sessao.api";
import { perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersPerfil, SENHA_EXCLUSAO_TESTE } from "../mocks/perfil.handlers";
import { SecaoExcluirConta } from "./SecaoExcluirConta";

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: string[];
let corpos: unknown[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  corpos = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (request.method === "DELETE") corpos.push(await request.clone().json());
    if (request.url.endsWith("/api/auth/logout")) chamadas.push("logout");
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrirDialogo() {
  const resultado = renderizar(
    <ExigeLogin>
      <SecaoExcluirConta />
    </ExigeLogin>,
    { sessao: perfilNaoFiliado },
  );
  servidor.use(...handlersPerfil(perfilNaoFiliado));
  await usuario.click(await screen.findByRole("button", { name: "Excluir minha conta" }));
  const dialogo = screen.getByRole("dialog", { name: "Excluir sua conta?" });
  return { ...resultado, dialogo: within(dialogo) };
}

const botaoConfirmar = { name: "Excluir definitivamente" };

function responderDelete(status: number, corpo: object) {
  servidor.use(http.delete("*/api/me", () => HttpResponse.json(corpo, { status })));
}

async function confirmarCom(
  dialogo: Awaited<ReturnType<typeof abrirDialogo>>["dialogo"],
  senha: string,
) {
  await usuario.type(dialogo.getByLabelText("Confirme com sua senha"), senha);
  await usuario.click(dialogo.getByRole("button", botaoConfirmar));
}

describe("Excluir minha conta", () => {
  it("avisa que a ação é definitiva e só habilita com a senha preenchida", async () => {
    const { dialogo } = await abrirDialogo();

    expect(dialogo.getByText(/serão apagados de forma definitiva/)).toBeInTheDocument();
    expect(dialogo.getByRole("button", botaoConfirmar)).toBeDisabled();
    await usuario.type(dialogo.getByLabelText("Confirme com sua senha"), "x");
    expect(dialogo.getByRole("button", botaoConfirmar)).toBeEnabled();
  });

  it("mantém o diálogo aberto e mostra o erro no campo com a senha errada", async () => {
    const { dialogo } = await abrirDialogo();

    await confirmarCom(dialogo, "senha-errada");

    expect(await dialogo.findByText("Senha incorreta.")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Excluir sua conta?" })).toBeInTheDocument();
    expect(corpos).toEqual([{ senha: "senha-errada" }]);

    await usuario.type(dialogo.getByLabelText("Confirme com sua senha"), "x");
    expect(dialogo.queryByText("Senha incorreta.")).not.toBeInTheDocument();
  });

  it.each([
    ["ULTIMO_ADMIN", /Você é o único administrador ativo/],
    ["CONTA_COM_PUBLICACOES", /Sua conta publicou conteúdos ou vagas/],
  ])("explica o bloqueio %s no diálogo", async (codigo, mensagem) => {
    const { dialogo } = await abrirDialogo();
    responderDelete(409, { codigo });

    await confirmarCom(dialogo, SENHA_EXCLUSAO_TESTE);

    expect(await dialogo.findByText(mensagem)).toBeInTheDocument();
  });

  it("mostra a validação do backend no campo e o erro genérico no diálogo", async () => {
    const { dialogo } = await abrirDialogo();
    responderDelete(422, { codigo: "DADOS_INVALIDOS", campos: { senha: ["Senha longa demais"] } });
    await confirmarCom(dialogo, "x");
    expect(await dialogo.findByText("Senha longa demais")).toBeInTheDocument();

    responderDelete(500, {});
    await usuario.click(dialogo.getByRole("button", botaoConfirmar));
    expect(
      await dialogo.findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("limpa a sessão sem chamar o logout e vai para o login, sem redirecionamento", async () => {
    const { dialogo, clienteConsultas } = await abrirDialogo();

    await confirmarCom(dialogo, SENHA_EXCLUSAO_TESTE);

    expect(
      await within(screen.getByRole("region", { name: "Avisos" })).findByText(
        "Sua conta foi excluída.",
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/login"));
    expect(chamadas).toEqual([]);
    expect(clienteConsultas.getQueryData(chavesSessao.perfil)).toBeUndefined();
  });

  it.each([
    ["Esc", () => usuario.keyboard("{Escape}")],
    ["Cancelar", () => usuario.click(screen.getByRole("button", { name: "Cancelar" }))],
  ])("não envia nada ao fechar com %s", async (_, fechar) => {
    await abrirDialogo();

    await fechar();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(corpos).toEqual([]);
  });

  it("não envia com Enter e a senha vazia", async () => {
    const { dialogo } = await abrirDialogo();

    await usuario.type(dialogo.getByLabelText("Confirme com sua senha"), "{Enter}");

    expect(corpos).toEqual([]);
  });
});
