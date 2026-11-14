import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it, vi } from "vitest";

import { servidor } from "@/test/servidor";

import { configurarOuvintesSessao, iniciarSessao, obterToken } from "./token-sessao";

describe("token de sessão", () => {
  afterEach(() => vi.useRealTimers());

  it("renova o token um minuto antes de expirar", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    servidor.use(
      http.post("*/api/auth/refresh", () =>
        HttpResponse.json({ access_token: "renovado", expira_em_segundos: 900 }),
      ),
    );

    iniciarSessao({ access_token: "atual", expira_em_segundos: 900 });
    await vi.advanceTimersByTimeAsync(839_000);
    expect(obterToken()).toBe("atual");

    await vi.advanceTimersByTimeAsync(1_000);
    await vi.waitFor(() => expect(obterToken()).toBe("renovado"));
  });

  it("expira a sessão quando a renovação agendada falha", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const aoExpirar = vi.fn();
    configurarOuvintesSessao({ aoExpirar });
    servidor.use(http.post("*/api/auth/refresh", () => new HttpResponse(null, { status: 401 })));

    iniciarSessao({ access_token: "atual", expira_em_segundos: 60 });
    await vi.advanceTimersByTimeAsync(0);

    await vi.waitFor(() => expect(aoExpirar).toHaveBeenCalledOnce());
    expect(obterToken()).toBeNull();
  });
});
