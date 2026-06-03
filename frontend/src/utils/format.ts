export function formatCurrency(v: number | null): string {
  return v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'
}
