export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function mascararTelefone(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : "";
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  if (digitos.length <= 6) return `(${ddd}) ${numero}`;
  if (digitos.length <= 10) return `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
  return `(${ddd}) ${numero.slice(0, 1)} ${numero.slice(1, 5)}-${numero.slice(5)}`;
}

export function mascararCep(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}
