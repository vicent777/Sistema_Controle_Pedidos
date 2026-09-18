# Sistema de Controle de Pedidos — Lanchonete

Pequeno sistema em TypeScript para controle de pedidos de uma lanchonete, com suíte de testes unitários em Jest.

## Como executar

```bash
npm install
npm test              # executa todos os testes
npm run test:coverage # executa com relatório de cobertura
npm run test:watch    # modo observador
```

## Estrutura

```
projeto-testes/
├── src/
│   ├── cliente.ts     # RN01 — validação do cliente
│   ├── pedido.ts      # RN02, RN04, RN05, RN06, RN07
│   └── desconto.ts    # RN03, RN04
├── tests/
│   ├── cliente.test.ts
│   ├── pedido.test.ts
│   └── desconto.test.ts
├── jest.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Cardápio

| Produto      | Preço     |
| ------------ | --------- |
| Hambúrguer   | R$ 20,00  |
| Batata       | R$ 10,00  |
| Refrigerante | R$ 7,00   |
| Sobremesa    | R$ 8,00   |

## Regras de negócio e onde elas são testadas

| Regra | Descrição | Implementação | Testes |
| ----- | --------- | ------------- | ------ |
| RN01 | Nome não vazio e com no mínimo 3 caracteres | `Cliente` | `cliente.test.ts` |
| RN02 | Pedido precisa ter ao menos um produto | `Pedido.calcularSubtotal` / `alterarStatus` | `pedido.test.ts` |
| RN03 | Desconto de 10% acima de R$ 100,00 | `desconto.ts` | `desconto.test.ts`, `pedido.test.ts` |
| RN04 | Não aceita preço ou quantidade negativos | `Pedido.adicionarProduto`, `desconto.ts` | `pedido.test.ts`, `desconto.test.ts` |
| RN05 | Status: CRIADO, EM_PREPARACAO, PRONTO, ENTREGUE, CANCELADO | `StatusPedido` | `pedido.test.ts` |
| RN06 | Pedido entregue não pode ser cancelado | `Pedido.cancelar` | `pedido.test.ts` |
| RN07 | Só é ENTREGUE quem já está PRONTO | `Pedido.alterarStatus` | `pedido.test.ts` |

## Máquina de estados

```
CRIADO ──────────► EM_PREPARACAO ──────► PRONTO ──────► ENTREGUE (final)
   │                    │                   │
   └────────────────────┴───────────────────┴──────────► CANCELADO (final)
```

- `ENTREGUE` e `CANCELADO` são estados finais: não admitem nova transição.
- `ENTREGUE` só é alcançável a partir de `PRONTO` (RN07).
- Um pedido `ENTREGUE` nunca pode ser cancelado (RN06).
- Produtos só podem ser adicionados enquanto o pedido está em `CRIADO`.

## Exemplo de uso

```ts
import { Cliente } from './src/cliente';
import { CARDAPIO, Pedido, StatusPedido } from './src/pedido';

const cliente = new Cliente('Ana Beatriz');
const pedido = new Pedido(cliente);

pedido.adicionarProduto(CARDAPIO.HAMBURGUER, 4); // R$ 80,00
pedido.adicionarProduto(CARDAPIO.BATATA, 2);     // R$ 20,00
pedido.adicionarProduto(CARDAPIO.REFRIGERANTE, 2); // R$ 14,00

pedido.calcularSubtotal(); // 114
pedido.calcularDesconto(); // 11.4
pedido.calcularTotal();    // 102.6

pedido.alterarStatus(StatusPedido.EM_PREPARACAO);
pedido.alterarStatus(StatusPedido.PRONTO);
pedido.alterarStatus(StatusPedido.ENTREGUE);

pedido.consultarStatus(); // 'ENTREGUE'
pedido.cancelar();        // lança erro: pedido entregue não pode ser cancelado
```

Resultado atual: **73 testes, 100% de cobertura** (statements, branches, functions e lines).
