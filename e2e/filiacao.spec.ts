import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import type { MinhaFiliacao } from "../src/features/filiacao/api/filiacao.api";
import {
  CODIGO_PMI_CORRETO,
  EMAIL_PMI_MASCARADO,
  minhaFiliacaoAguardandoCodigo,
  minhaFiliacaoPendente,
  PMI_ID_COM_OUTRO_EMAIL,
} from "../src/features/filiacao/mocks/filiacao.handlers";
import { preferenciasTeste } from "../src/features/perfil/mocks/perfil.handlers";
import { sessoesTeste } from "../src/features/seguranca/mocks/seguranca.handlers";
import type { Perfil } from "../src/shared/sessao/tipos";
import { perfilFiliado, perfilPendente, perfilSemVinculo } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

type Estado = { perfil: Perfil; filiacao: MinhaFiliacao };

async function semViolacoesGraves(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

async function prepararPerfil(page: Page, estado: Estado) {
  await simularSessao(page, estado.perfil);
  await page.route("**/api/me", (rota) => rota.fulfill({ json: estado.perfil }));
  await page.route("**/api/me/filiacao", (rota) => rota.fulfill({ json: estado.filiacao }));
  await page.route("**/api/me/sessoes**", (rota) => rota.fulfill({ json: sessoesTeste }));
  await page.route("**/api/me/preferencias", (rota) => rota.fulfill({ json: preferenciasTeste }));
}

test("quem não tinha vínculo informa o PMI ID e confirma o código do e-mail do PMI", async ({
  page,
}, info) => {
  const estado: Estado = {
    perfil: perfilSemVinculo,
    filiacao: {
      ...perfilSemVinculo.filiacao!,
      email_pmi_mascarado: null,
      proxima_atualizacao_em: null,
    },
  };
  await prepararPerfil(page, estado);
  await page.route("**/api/me/filiacao/vincular", (rota) => {
    const { pmi_id } = rota.request().postDataJSON() as { pmi_id: string };
    estado.filiacao = { ...minhaFiliacaoAguardandoCodigo, pmi_id };
    return rota.fulfill({
      json: {
        situacao: "AGUARDANDO_CODIGO",
        resultado: "CODIGO_ENVIADO",
        email_pmi_mascarado: EMAIL_PMI_MASCARADO,
        proxima_atualizacao_em: null,
      },
    });
  });
  await page.route("**/api/me/filiacao/codigo/confirmar", (rota) => {
    const { codigo } = rota.request().postDataJSON() as { codigo: string };
    if (codigo !== CODIGO_PMI_CORRETO) {
      return rota.fulfill({ status: 422, json: { codigo: "CODIGO_INVALIDO" } });
    }
    estado.perfil = perfilFiliado;
    estado.filiacao = {
      ...perfilFiliado.filiacao!,
      email_pmi_mascarado: null,
      proxima_atualizacao_em: null,
    };
    return rota.fulfill({ json: { situacao: "APROVADO", resultado: "APROVADO" } });
  });

  await page.goto("/perfil#filiacao");
  const secao = page.getByRole("region", { name: "Filiação PMI" });
  await expect(secao.getByText("Não vinculado", { exact: true })).toBeVisible();
  await secao.getByRole("link", { name: "Informar PMI ID" }).click();

  await expect(page.getByRole("heading", { name: "Vincular minha filiação" })).toBeVisible();
  await semViolacoesGraves(page);
  await page.getByLabel("PMI ID").fill(PMI_ID_COM_OUTRO_EMAIL);
  await page.getByRole("button", { name: "Consultar o PMI" }).click();

  await expect(page).toHaveURL(/\/perfil\/filiacao\/codigo$/);
  await expect(page.getByText(EMAIL_PMI_MASCARADO)).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/filiacao-codigo-pmi-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);

  await page.getByRole("textbox", { name: "Dígito 1 de 6" }).click();
  await page.keyboard.type(CODIGO_PMI_CORRETO);

  await expect(page).toHaveURL(/\/perfil#filiacao$/);
  await expect(
    page.getByText("Filiação confirmada. Seu acesso de filiado está liberado."),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Filiação PMI" }).getByText("Filiado PMI-DF", { exact: true }),
  ).toBeVisible();
});

test("pendente usa Atualizar situação e vê quando pode consultar de novo", async ({
  page,
}, info) => {
  await prepararPerfil(page, { perfil: perfilPendente, filiacao: minhaFiliacaoPendente });
  await page.route("**/api/me/filiacao/atualizar", (rota) =>
    rota.fulfill({
      status: 429,
      json: { codigo: "AGUARDE_PARA_ATUALIZAR", segundos_restantes: 540 },
    }),
  );

  await page.goto("/perfil#filiacao");
  const secao = page.getByRole("region", { name: "Filiação PMI" });
  await secao.getByRole("button", { name: "Atualizar situação" }).click();

  await expect(page.getByText("Você pode consultar o PMI de novo em 9:00.")).toBeVisible();
  await expect(
    secao.getByRole("button", { name: /Atualizar situação \(disponível em [89]:\d\d\)/ }),
  ).toBeDisabled();
  await secao.screenshot({
    path: `test-results/capturas/filiacao-atualizar-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);
});
