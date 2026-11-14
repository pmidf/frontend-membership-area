export type TipoDispositivo = "computador" | "celular";

export type Dispositivo = { tipo: TipoDispositivo; descricao: string };

type Regra = [nome: string, padrao: RegExp];

const navegadores: Regra[] = [
  ["Edge", /Edg(A|iOS)?\//],
  ["Opera", /OPR\/|Opera/],
  ["Samsung Internet", /SamsungBrowser\//],
  ["Firefox", /Firefox\/|FxiOS\//],
  ["Chrome", /Chrome\/|CriOS\//],
  ["Safari", /Version\/[\d.]+.*Safari\//],
];

const sistemas: Regra[] = [
  ["Android", /Android/],
  ["iOS", /iPhone|iPad|iPod/],
  ["Windows", /Windows/],
  ["ChromeOS", /CrOS/],
  ["macOS", /Macintosh|Mac OS X/],
  ["Linux", /Linux/],
];

const MOVEL = /Mobi|Android|iPhone|iPad|iPod/;

function identificar(regras: Regra[], agente: string): string | undefined {
  return regras.find(([, padrao]) => padrao.test(agente))?.[0];
}

export function descreverDispositivo(agente: string | null): Dispositivo {
  if (!agente) return { tipo: "computador", descricao: "Dispositivo desconhecido" };
  const navegador = identificar(navegadores, agente) ?? "Navegador desconhecido";
  const sistema = identificar(sistemas, agente);
  return {
    tipo: MOVEL.test(agente) ? "celular" : "computador",
    descricao: sistema ? `${navegador} no ${sistema}` : navegador,
  };
}

export function formatarIp(ip: string | null): string {
  return ip ? ip.replace(/^::ffff:/i, "") : "IP não informado";
}
