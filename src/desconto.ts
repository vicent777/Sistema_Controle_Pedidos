/**
 * RN03 — Desconto
 * Pedidos ACIMA de R$ 100,00 recebem 10% de desconto.
 * Pedidos de R$ 100,00 ou menos não recebem desconto.
 *
 * RN04 — Valor negativo
 * Não são aceitos valores menores que zero.
 */

export const LIMITE_PARA_DESCONTO = 100;
export const PERCENTUAL_DESCONTO = 0.1;

/** Arredonda para 2 casas decimais, evitando problemas de ponto flutuante. */
export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function validarSubtotal(subtotal: number): void {
  if (typeof subtotal !== 'number' || Number.isNaN(subtotal)) {
    throw new Error('O subtotal deve ser um número válido.');
  }

  if (subtotal < 0) {
    throw new Error('O subtotal não pode ser menor que zero.');
  }
}

/** Retorna o valor do desconto (em reais) para um determinado subtotal. */
export function calcularDesconto(subtotal: number): number {
  validarSubtotal(subtotal);

  if (subtotal > LIMITE_PARA_DESCONTO) {
    return arredondar(subtotal * PERCENTUAL_DESCONTO);
  }

  return 0;
}

/** Retorna o valor final já com o desconto aplicado. */
export function aplicarDesconto(subtotal: number): number {
  return arredondar(subtotal - calcularDesconto(subtotal));
}

/** Indica se o subtotal tem direito a desconto. */
export function temDireitoADesconto(subtotal: number): boolean {
  validarSubtotal(subtotal);
  return subtotal > LIMITE_PARA_DESCONTO;
}
