import {
  LIMITE_PARA_DESCONTO,
  PERCENTUAL_DESCONTO,
  aplicarDesconto,
  arredondar,
  calcularDesconto,
  temDireitoADesconto,
} from '../src/desconto';

describe('RN03 — Desconto', () => {
  describe('calcularDesconto', () => {
    it('não deve conceder desconto para subtotal abaixo de R$ 100,00', () => {
      expect(calcularDesconto(99.99)).toBe(0);
    });

    it('não deve conceder desconto para subtotal exatamente igual a R$ 100,00 (fronteira)', () => {
      expect(calcularDesconto(LIMITE_PARA_DESCONTO)).toBe(0);
    });

    it('deve conceder 10% de desconto para subtotal de R$ 100,01 (fronteira)', () => {
      expect(calcularDesconto(100.01)).toBe(10);
    });

    it('deve conceder 10% de desconto para subtotal acima de R$ 100,00', () => {
      expect(calcularDesconto(200)).toBe(20);
      expect(calcularDesconto(150)).toBe(15);
    });

    it('deve retornar 0 para subtotal igual a zero', () => {
      expect(calcularDesconto(0)).toBe(0);
    });

    it('o percentual de desconto configurado deve ser de 10%', () => {
      expect(PERCENTUAL_DESCONTO).toBe(0.1);
    });
  });

  describe('aplicarDesconto', () => {
    it.each([
      [50, 50],
      [100, 100],
      [101, 90.9],
      [120, 108],
      [250, 225],
    ])('subtotal de R$ %s deve resultar em R$ %s', (subtotal, esperado) => {
      expect(aplicarDesconto(subtotal)).toBe(esperado);
    });

    it('deve arredondar o valor final para 2 casas decimais', () => {
      expect(aplicarDesconto(133.33)).toBe(120);
    });
  });

  describe('temDireitoADesconto', () => {
    it.each([
      [99.99, false],
      [100, false],
      [100.01, true],
      [500, true],
    ])('subtotal de R$ %s → %s', (subtotal, esperado) => {
      expect(temDireitoADesconto(subtotal)).toBe(esperado);
    });
  });

  describe('RN04 — valores negativos', () => {
    it('não deve aceitar subtotal negativo em calcularDesconto', () => {
      expect(() => calcularDesconto(-1)).toThrow('O subtotal não pode ser menor que zero.');
    });

    it('não deve aceitar subtotal negativo em aplicarDesconto', () => {
      expect(() => aplicarDesconto(-0.01)).toThrow('O subtotal não pode ser menor que zero.');
    });

    it('não deve aceitar valores que não sejam números', () => {
      expect(() => calcularDesconto(NaN)).toThrow('O subtotal deve ser um número válido.');
      expect(() => calcularDesconto('100' as unknown as number)).toThrow(
        'O subtotal deve ser um número válido.',
      );
    });
  });

  describe('arredondar', () => {
    it('deve arredondar corretamente valores com muitas casas decimais', () => {
      expect(arredondar(10.005)).toBe(10.01);
      expect(arredondar(0.1 + 0.2)).toBe(0.3);
    });
  });
});
