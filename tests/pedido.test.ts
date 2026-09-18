import { Cliente } from '../src/cliente';
import { CARDAPIO, Pedido, StatusPedido } from '../src/pedido';

const { HAMBURGUER, BATATA, REFRIGERANTE, SOBREMESA } = CARDAPIO;

function novoPedido(nome = 'Maria Silva'): Pedido {
  return new Pedido(new Cliente(nome));
}

/** Leva o pedido até o status desejado passando pelas transições válidas. */
function avancarAte(pedido: Pedido, destino: StatusPedido): Pedido {
  const caminho = [StatusPedido.EM_PREPARACAO, StatusPedido.PRONTO, StatusPedido.ENTREGUE];
  for (const status of caminho) {
    pedido.alterarStatus(status);
    if (status === destino) break;
  }
  return pedido;
}

describe('Pedido', () => {
  describe('criação', () => {
    it('deve criar um pedido associado a um cliente com status CRIADO', () => {
      const pedido = novoPedido('João Pedro');
      expect(pedido.cliente.nome).toBe('João Pedro');
      expect(pedido.consultarStatus()).toBe(StatusPedido.CRIADO);
      expect(pedido.estaVazio()).toBe(true);
    });

    it('não deve criar um pedido sem cliente válido', () => {
      expect(() => new Pedido(null as unknown as Cliente)).toThrow(
        'O pedido precisa estar associado a um cliente válido.',
      );
      expect(() => new Pedido({ nome: 'Maria' } as unknown as Cliente)).toThrow(
        'O pedido precisa estar associado a um cliente válido.',
      );
    });
  });

  describe('adicionar produtos', () => {
    it('deve adicionar um produto ao pedido', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      expect(pedido.listarItens()).toHaveLength(1);
      expect(pedido.quantidadeDeItens).toBe(1);
    });

    it('deve adicionar um produto com quantidade maior que 1', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(BATATA, 3);
      expect(pedido.quantidadeDeItens).toBe(3);
    });

    it('deve agrupar a quantidade ao adicionar o mesmo produto duas vezes', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(REFRIGERANTE, 2);
      pedido.adicionarProduto(REFRIGERANTE, 1);
      expect(pedido.listarItens()).toHaveLength(1);
      expect(pedido.quantidadeDeItens).toBe(3);
    });

    it('não deve permitir adicionar produtos a um pedido já em preparação', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      pedido.alterarStatus(StatusPedido.EM_PREPARACAO);
      expect(() => pedido.adicionarProduto(BATATA)).toThrow(
        'Só é possível adicionar produtos a um pedido com status CRIADO.',
      );
    });

    it('não deve aceitar produto inválido', () => {
      const pedido = novoPedido();
      expect(() => pedido.adicionarProduto(null as never)).toThrow('Produto inválido.');
      expect(() => pedido.adicionarProduto({ nome: '  ', preco: 10 })).toThrow('Produto inválido.');
    });
  });

  describe('RN04 — preço e quantidade negativos', () => {
    it('não deve aceitar produto com preço negativo', () => {
      const pedido = novoPedido();
      expect(() => pedido.adicionarProduto({ nome: 'Suco', preco: -1 })).toThrow(
        'O preço do produto não pode ser menor que zero.',
      );
    });

    it('deve aceitar produto com preço igual a zero (fronteira)', () => {
      const pedido = novoPedido();
      expect(() => pedido.adicionarProduto({ nome: 'Brinde', preco: 0 })).not.toThrow();
    });

    it('não deve aceitar quantidade negativa', () => {
      const pedido = novoPedido();
      expect(() => pedido.adicionarProduto(HAMBURGUER, -2)).toThrow(
        'A quantidade não pode ser menor que zero.',
      );
    });

    it('não deve aceitar quantidade igual a zero', () => {
      const pedido = novoPedido();
      expect(() => pedido.adicionarProduto(HAMBURGUER, 0)).toThrow(
        'A quantidade deve ser maior que zero.',
      );
    });

    it('não deve aceitar quantidade fracionada', () => {
      const pedido = novoPedido();
      expect(() => pedido.adicionarProduto(HAMBURGUER, 1.5)).toThrow(
        'A quantidade deve ser um número inteiro.',
      );
    });

    it('não deve aceitar preço inválido', () => {
      const pedido = novoPedido();
      expect(() => pedido.adicionarProduto({ nome: 'Suco', preco: NaN })).toThrow(
        'O preço do produto deve ser um número válido.',
      );
    });
  });

  describe('RN02 — pedido precisa possuir pelo menos um produto', () => {
    it('não deve calcular o subtotal de um pedido vazio', () => {
      expect(() => novoPedido().calcularSubtotal()).toThrow(
        'O pedido precisa possuir pelo menos um produto.',
      );
    });

    it('não deve calcular o total de um pedido vazio', () => {
      expect(() => novoPedido().calcularTotal()).toThrow(
        'O pedido precisa possuir pelo menos um produto.',
      );
    });

    it('não deve avançar o status de um pedido vazio', () => {
      expect(() => novoPedido().alterarStatus(StatusPedido.EM_PREPARACAO)).toThrow(
        'O pedido precisa possuir pelo menos um produto.',
      );
    });

    it('deve permitir cancelar um pedido vazio', () => {
      const pedido = novoPedido();
      pedido.cancelar();
      expect(pedido.consultarStatus()).toBe(StatusPedido.CANCELADO);
    });
  });

  describe('cálculo do subtotal', () => {
    it('deve somar o valor de um único produto', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      expect(pedido.calcularSubtotal()).toBe(20);
    });

    it('deve somar produtos diferentes', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER); // 20
      pedido.adicionarProduto(BATATA); // 10
      pedido.adicionarProduto(REFRIGERANTE); // 7
      pedido.adicionarProduto(SOBREMESA); // 8
      expect(pedido.calcularSubtotal()).toBe(45);
    });

    it('deve multiplicar preço por quantidade', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER, 3); // 60
      pedido.adicionarProduto(REFRIGERANTE, 2); // 14
      expect(pedido.calcularSubtotal()).toBe(74);
    });
  });

  describe('RN03 — desconto aplicado ao pedido', () => {
    it('não deve aplicar desconto em pedido de R$ 100,00 (fronteira)', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER, 5); // 100
      expect(pedido.calcularSubtotal()).toBe(100);
      expect(pedido.calcularDesconto()).toBe(0);
      expect(pedido.calcularTotal()).toBe(100);
    });

    it('deve aplicar 10% de desconto em pedido acima de R$ 100,00', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER, 5); // 100
      pedido.adicionarProduto(REFRIGERANTE); // 7 → 107
      expect(pedido.calcularSubtotal()).toBe(107);
      expect(pedido.calcularDesconto()).toBe(10.7);
      expect(pedido.calcularTotal()).toBe(96.3);
    });

    it('não deve aplicar desconto em pedido pequeno', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(BATATA, 2); // 20
      expect(pedido.calcularTotal()).toBe(20);
    });
  });

  describe('RN05 — consulta e alteração de status', () => {
    it('deve possuir exatamente os cinco status previstos', () => {
      expect(Object.values(StatusPedido)).toEqual([
        'CRIADO',
        'EM_PREPARACAO',
        'PRONTO',
        'ENTREGUE',
        'CANCELADO',
      ]);
    });

    it('deve percorrer o fluxo completo CRIADO → EM_PREPARACAO → PRONTO → ENTREGUE', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);

      expect(pedido.consultarStatus()).toBe(StatusPedido.CRIADO);
      pedido.alterarStatus(StatusPedido.EM_PREPARACAO);
      expect(pedido.consultarStatus()).toBe(StatusPedido.EM_PREPARACAO);
      pedido.alterarStatus(StatusPedido.PRONTO);
      expect(pedido.consultarStatus()).toBe(StatusPedido.PRONTO);
      pedido.alterarStatus(StatusPedido.ENTREGUE);
      expect(pedido.consultarStatus()).toBe(StatusPedido.ENTREGUE);
    });

    it('o getter status deve refletir o mesmo valor de consultarStatus()', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      expect(pedido.status).toBe(pedido.consultarStatus());
      pedido.alterarStatus(StatusPedido.EM_PREPARACAO);
      expect(pedido.status).toBe(StatusPedido.EM_PREPARACAO);
    });

    it('não deve aceitar um status inexistente', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      expect(() => pedido.alterarStatus('DEVOLVIDO' as StatusPedido)).toThrow(
        'Status inválido: DEVOLVIDO',
      );
    });

    it('não deve alterar para o mesmo status atual', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      expect(() => pedido.alterarStatus(StatusPedido.CRIADO)).toThrow(
        'O pedido já está com o status CRIADO.',
      );
    });

    it('não deve voltar de PRONTO para EM_PREPARACAO', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      avancarAte(pedido, StatusPedido.PRONTO);
      expect(() => pedido.alterarStatus(StatusPedido.EM_PREPARACAO)).toThrow(
        'Transição inválida: não é possível ir de PRONTO para EM_PREPARACAO.',
      );
    });

    it('não deve alterar o status de um pedido cancelado', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      pedido.cancelar();
      expect(() => pedido.alterarStatus(StatusPedido.EM_PREPARACAO)).toThrow(
        'Um pedido cancelado não pode ter seu status alterado.',
      );
    });
  });

  describe('RN06 — cancelamento', () => {
    it('deve cancelar um pedido recém-criado', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      pedido.cancelar();
      expect(pedido.consultarStatus()).toBe(StatusPedido.CANCELADO);
    });

    it('deve cancelar um pedido em preparação', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      pedido.alterarStatus(StatusPedido.EM_PREPARACAO);
      pedido.cancelar();
      expect(pedido.consultarStatus()).toBe(StatusPedido.CANCELADO);
    });

    it('deve cancelar um pedido pronto', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      avancarAte(pedido, StatusPedido.PRONTO);
      pedido.cancelar();
      expect(pedido.consultarStatus()).toBe(StatusPedido.CANCELADO);
    });

    it('NÃO deve cancelar um pedido entregue', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      avancarAte(pedido, StatusPedido.ENTREGUE);
      expect(() => pedido.cancelar()).toThrow('Um pedido entregue não pode ser cancelado.');
      expect(pedido.consultarStatus()).toBe(StatusPedido.ENTREGUE);
    });

    it('NÃO deve cancelar um pedido entregue nem via alterarStatus', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      avancarAte(pedido, StatusPedido.ENTREGUE);
      expect(() => pedido.alterarStatus(StatusPedido.CANCELADO)).toThrow(
        'Um pedido entregue não pode ter seu status alterado.',
      );
    });
  });

  describe('RN07 — só entrega o que está pronto', () => {
    it('não deve entregar um pedido com status CRIADO', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      expect(() => pedido.alterarStatus(StatusPedido.ENTREGUE)).toThrow(
        'Um pedido só pode ser marcado como ENTREGUE depois de estar PRONTO.',
      );
    });

    it('não deve entregar um pedido em preparação', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      pedido.alterarStatus(StatusPedido.EM_PREPARACAO);
      expect(() => pedido.alterarStatus(StatusPedido.ENTREGUE)).toThrow(
        'Um pedido só pode ser marcado como ENTREGUE depois de estar PRONTO.',
      );
    });

    it('não deve entregar um pedido cancelado', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      pedido.cancelar();
      expect(() => pedido.alterarStatus(StatusPedido.ENTREGUE)).toThrow(
        'Um pedido cancelado não pode ter seu status alterado.',
      );
    });

    it('deve entregar um pedido que está PRONTO', () => {
      const pedido = novoPedido();
      pedido.adicionarProduto(HAMBURGUER);
      avancarAte(pedido, StatusPedido.PRONTO);
      pedido.alterarStatus(StatusPedido.ENTREGUE);
      expect(pedido.consultarStatus()).toBe(StatusPedido.ENTREGUE);
    });
  });

  describe('fluxo de ponta a ponta', () => {
    it('deve atender um cliente do cadastro até a entrega com desconto', () => {
      const cliente = new Cliente('Ana Beatriz');
      const pedido = new Pedido(cliente);

      pedido.adicionarProduto(HAMBURGUER, 4); // 80
      pedido.adicionarProduto(BATATA, 2); // 20
      pedido.adicionarProduto(REFRIGERANTE, 2); // 14 → subtotal 114

      expect(pedido.calcularSubtotal()).toBe(114);
      expect(pedido.calcularDesconto()).toBe(11.4);
      expect(pedido.calcularTotal()).toBe(102.6);

      pedido.alterarStatus(StatusPedido.EM_PREPARACAO);
      pedido.alterarStatus(StatusPedido.PRONTO);
      pedido.alterarStatus(StatusPedido.ENTREGUE);

      expect(pedido.consultarStatus()).toBe(StatusPedido.ENTREGUE);
      expect(() => pedido.cancelar()).toThrow('Um pedido entregue não pode ser cancelado.');
    });
  });
});
