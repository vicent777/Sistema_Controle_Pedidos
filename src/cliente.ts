/**
 * RN01 — Cliente
 * O nome não pode estar vazio e deve possuir pelo menos 3 caracteres.
 */

export const TAMANHO_MINIMO_NOME = 3;

export class Cliente {
  public readonly nome: string;

  constructor(nome: string) {
    const nomeTratado = typeof nome === 'string' ? nome.trim() : '';

    if (nomeTratado.length === 0) {
      throw new Error('O nome do cliente não pode estar vazio.');
    }

    if (nomeTratado.length < TAMANHO_MINIMO_NOME) {
      throw new Error(
        `O nome do cliente deve possuir pelo menos ${TAMANHO_MINIMO_NOME} caracteres.`,
      );
    }

    this.nome = nomeTratado;
  }
}

/**
 * Função utilitária para validar um nome sem precisar instanciar o cliente.
 */
export function nomeEhValido(nome: string): boolean {
  try {
    new Cliente(nome);
    return true;
  } catch {
    return false;
  }
}
