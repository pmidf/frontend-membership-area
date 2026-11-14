export function camposDiferentes<T extends object>(antes: T, depois: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(depois).filter(([campo, valor]) => valor !== antes[campo as keyof T]),
  ) as Partial<T>;
}
