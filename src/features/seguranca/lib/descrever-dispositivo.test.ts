import { describe, expect, it } from "vitest";

import { descreverDispositivo, formatarIp } from "./descrever-dispositivo";

const agentes = {
  chromeWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  edgeWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  firefoxMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:132.0) Gecko/20100101 Firefox/132.0",
  safariMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  safariIphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  chromeIphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1",
  firefoxLinux: "Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0",
};

describe("descreverDispositivo", () => {
  it.each([
    [agentes.chromeWindows, "computador", "Chrome no Windows"],
    [agentes.edgeWindows, "computador", "Edge no Windows"],
    [agentes.firefoxMac, "computador", "Firefox no macOS"],
    [agentes.safariMac, "computador", "Safari no macOS"],
    [agentes.chromeAndroid, "celular", "Chrome no Android"],
    [agentes.safariIphone, "celular", "Safari no iOS"],
    [agentes.chromeIphone, "celular", "Chrome no iOS"],
    [agentes.firefoxLinux, "computador", "Firefox no Linux"],
  ])("reconhece %s", (agente, tipo, descricao) => {
    expect(descreverDispositivo(agente)).toEqual({ tipo, descricao });
  });

  it("descreve agentes desconhecidos ou ausentes", () => {
    expect(descreverDispositivo("curl/8.7.1")).toEqual({
      tipo: "computador",
      descricao: "Navegador desconhecido",
    });
    expect(descreverDispositivo(null)).toEqual({
      tipo: "computador",
      descricao: "Dispositivo desconhecido",
    });
  });
});

describe("formatarIp", () => {
  it("mostra o IPv4 mapeado em IPv6 de forma legível", () => {
    expect(formatarIp("::ffff:172.20.0.1")).toBe("172.20.0.1");
    expect(formatarIp("2804:14c::1")).toBe("2804:14c::1");
    expect(formatarIp(null)).toBe("IP não informado");
  });
});
