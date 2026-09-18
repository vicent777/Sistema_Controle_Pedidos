import { Cliente } from './cliente';
import { aplicarDesconto, arredondar, calcularDesconto } from './desconto';

/** RN05 — Status possíveis de um pedido. */
export enum StatusPedido {
  CRIADO = 'CRIADO',
  EM_PREPARACAO = 'EM_PREPARACAO',
  PRONTO = 'PRONTO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export interface Produto {
  nome: string;
  preco: number;
}

export interface ItemPedido {
  produto: Produto;
  quantidade: number;
}

/** Cardápio da lanchonete. */
export const CARDAPIO: Record<string, Produto> = {
  HAMBURGUER: { nome: 'Hambúrguer', preco: 20 },
  BATATA: { nome: 'Batata', preco: 10 },
  REFRIGERANTE: { nome: 'Refrigerante', preco: 7 },
  SOBREMESA: { nome: 'Sobremesa', preco: 8 },
};

/**
 * Transições válidas de status.
 * RN06 — ENTREGUE não pode ser cancelado (ENTREGUE não transita para nada).
 * RN07 — ENTREGUE só pode vir de PRONTO.
 */
const TRANSICOES_VALIDAS: Record<StatusPedido, StatusPedido[]> = {
  [StatusPedido.CRIADO]: [StatusPedido.EM_PREPARACAO, StatusPedido.CANCELADO],
  [StatusPedido.EM_PREPARACAO]: [StatusPedido.PRONTO, StatusPedido.CANCELADO],
  [StatusPedido.PRONTO]: [StatusPedido.ENTREGUE, StatusPedido.CANCELADO],
  [StatusPedido.ENTREGUE]: [],
  [StatusPedido.CANCELADO]: [],
};

export class Pedido {
  public readonly cliente: Cliente;
  private readonly itens: ItemPedido[] = [];
  private statusAtual: StatusPedido = StatusPedido.CRIADO;

  constructor(cliente: Cliente) {
    if (!(cliente instanceof Cliente)) {
      throw new Error('O pedido precisa estar associado a um cliente válido.');
    }
    this.cliente = cliente;
  }

  // ---------------------------------------------------------------- produtos

  /** RN04 — não aceita preço ou quantidade menor que zero. */
  public adicionarProduto(produto: Produto, quantidade = 1): void {
    if (!produto || typeof produto.nome !== 'string' || produto.nome.trim() === '') {
      throw new Error('Produto inválido.');
    }

    if (typeof produto.preco !== 'number' || Number.isNaN(produto.preco)) {
      throw new Error('O preço do produto deve ser um número válido.');
    }

    if (produto.preco < 0) {
      throw new Error('O preço do produto não pode ser menor que zero.');
    }

    if (!Number.isInteger(quantidade)) {
      throw new Error('A quantidade deve ser um número inteiro.');
    }

    if (quantidade < 0) {
      throw new Error('A quantidade não pode ser menor que zero.');
    }

    if (quantidade === 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }

    if (this.statusAtual !== StatusPedido.CRIADO) {
      throw new Error('Só é possível adicionar produtos a um pedido com status CRIADO.');
    }

    const existente = this.itens.find((item) => item.produto.nome === produto.nome);

    if (existente) {
      existente.quantidade += quantidade;
      return;
    }

    this.itens.push({ produto: { ...produto }, quantidade });
  }

  public listarItens(): ItemPedido[] {
    return this.itens.map((item) => ({ produto: { ...item.produto }, quantidade: item.quantidade }));
  }

  public get quantidadeDeItens(): number {
    return this.itens.reduce((total, item) => total + item.quantidade, 0);
  }

  public estaVazio(): boolean {
    return this.itens.length === 0;
  }

  // ----------------------------------------------------------------- valores

  /** RN02 — um pedido precisa possuir pelo menos um produto. */
  public calcularSubtotal(): number {
    this.garantirQueTemProdutos();

    const subtotal = this.itens.reduce(
      (total, item) => total + item.produto.preco * item.quantidade,
      0,
    );

    return arredondar(subtotal);
  }

  public calcularDesconto(): number {
    return calcularDesconto(this.calcularSubtotal());
  }

  /** Valor final: subtotal menos o desconto (RN03). */
  public calcularTotal(): number {
    return aplicarDesconto(this.calcularSubtotal());
  }

  // ------------------------------------------------------------------ status

  /** Consulta o status atual do pedido. */
  public consultarStatus(): StatusPedido {
    return this.statusAtual;
  }

  public get status(): StatusPedido {
    return this.statusAtual;
  }

  /** Altera o status respeitando RN02, RN05, RN06 e RN07. */
  public alterarStatus(novoStatus: StatusPedido): void {
    if (!Object.values(StatusPedido).includes(novoStatus)) {
      throw new Error(`Status inválido: ${novoStatus}`);
    }

    if (novoStatus === this.statusAtual) {
      throw new Error(`O pedido já está com o status ${novoStatus}.`);
    }

    if (this.statusAtual === StatusPedido.ENTREGUE) {
      throw new Error('Um pedido entregue não pode ter seu status alterado.');
    }

    if (this.statusAtual === StatusPedido.CANCELADO) {
      throw new Error('Um pedido cancelado não pode ter seu status alterado.');
    }

    // RN07 — só é ENTREGUE quem já está PRONTO.
    if (novoStatus === StatusPedido.ENTREGUE && this.statusAtual !== StatusPedido.PRONTO) {
      throw new Error('Um pedido só pode ser marcado como ENTREGUE depois de estar PRONTO.');
    }

    if (!TRANSICOES_VALIDAS[this.statusAtual].includes(novoStatus)) {
      throw new Error(
        `Transição inválida: não é possível ir de ${this.statusAtual} para ${novoStatus}.`,
      );
    }

    // RN02 — não faz sentido avançar um pedido sem produtos.
    if (novoStatus !== StatusPedido.CANCELADO) {
      this.garantirQueTemProdutos();
    }

    this.statusAtual = novoStatus;
  }

  /** RN06 — um pedido entregue não pode ser cancelado. */
  public cancelar(): void {
    if (this.statusAtual === StatusPedido.ENTREGUE) {
      throw new Error('Um pedido entregue não pode ser cancelado.');
    }

    this.alterarStatus(StatusPedido.CANCELADO);
  }

  // ------------------------------------------------------------------ privado

  private garantirQueTemProdutos(): void {
    if (this.estaVazio()) {
      throw new Error('O pedido precisa possuir pelo menos um produto.');
    }
  }
}
