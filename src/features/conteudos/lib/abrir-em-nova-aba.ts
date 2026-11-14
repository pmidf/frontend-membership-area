const PROTOCOLO_PERMITIDO = /^https?:\/\//i;

export function abrirAbaVazia(): Window | null {
  const aba = window.open("", "_blank");
  if (aba) aba.opener = null;
  return aba;
}

export function levarAba(aba: Window | null, url: string): void {
  if (!PROTOCOLO_PERMITIDO.test(url)) throw new Error("Endereço do material inválido");
  if (aba) aba.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
}
