import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";

import { servidor } from "@/test/servidor";

import { buscarEndereco } from "./cep.api";

describe("buscarEndereco", () => {
  it("devolve o endereço do ViaCEP", async () => {
    expect(await buscarEndereco("70040-010")).toEqual({
      logradouro: "SBS Quadra 2",
      bairro: "Asa Sul",
      cidade: "Brasília",
      uf: "DF",
    });
  });

  it("devolve null quando o CEP não existe", async () => {
    expect(await buscarEndereco("99999-999")).toBeNull();
  });

  it("devolve null quando o serviço falha", async () => {
    servidor.use(http.get("https://viacep.com.br/ws/:cep/json/", () => HttpResponse.error()));
    expect(await buscarEndereco("70040010")).toBeNull();

    servidor.use(
      http.get(
        "https://viacep.com.br/ws/:cep/json/",
        () => new HttpResponse(null, { status: 400 }),
      ),
    );
    expect(await buscarEndereco("70040010")).toBeNull();
  });
});
