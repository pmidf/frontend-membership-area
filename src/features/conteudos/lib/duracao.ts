const doisDigitos = (valor: number) => String(valor).padStart(2, "0");

export function duracaoNaCapa(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = doisDigitos(segundos % 60);
  return horas > 0 ? `${horas}:${doisDigitos(minutos)}:${resto}` : `${minutos}:${resto}`;
}

export function duracaoEmMinutos(segundos: number): string {
  return `${Math.max(1, Math.floor(segundos / 60))} min`;
}
