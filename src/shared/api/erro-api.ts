type DadosErroApi = {
  status: number;
  codigo: string;
  campos?: Record<string, string[]>;
  dados?: Record<string, unknown>;
};

export class ErroApi extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly campos?: Record<string, string[]>;
  readonly dados: Record<string, unknown>;

  constructor({ status, codigo, campos, dados = {} }: DadosErroApi) {
    super(codigo);
    this.name = "ErroApi";
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
    this.dados = dados;
  }
}

export function ehErroApi(erro: unknown): erro is ErroApi {
  return erro instanceof ErroApi;
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function codigoPadrao(status: number): string {
  return status === 429 ? "MUITAS_REQUISICOES" : `HTTP_${status}`;
}

export async function erroDaResposta(resposta: Response): Promise<ErroApi> {
  const texto = await resposta.text();
  let corpo: unknown;
  try {
    corpo = texto ? JSON.parse(texto) : undefined;
  } catch {
    corpo = undefined;
  }
  const dados = ehObjeto(corpo) ? corpo : {};

  return new ErroApi({
    status: resposta.status,
    codigo: typeof dados.codigo === "string" ? dados.codigo : codigoPadrao(resposta.status),
    campos: ehObjeto(dados.campos) ? (dados.campos as Record<string, string[]>) : undefined,
    dados,
  });
}

export function erroSemConexao(): ErroApi {
  return new ErroApi({ status: 0, codigo: "SEM_CONEXAO" });
}
