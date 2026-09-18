import { Cliente, nomeEhValido } from '../src/cliente';

describe('RN01 — Cliente', () => {
  describe('cenários válidos', () => {
    it('deve cadastrar um cliente com nome válido', () => {
      const cliente = new Cliente('Maria Silva');
      expect(cliente.nome).toBe('Maria Silva');
    });

    it('deve aceitar um nome com exatamente 3 caracteres (valor de fronteira)', () => {
      expect(new Cliente('Ana').nome).toBe('Ana');
    });

    it('deve remover espaços em branco nas extremidades do nome', () => {
      expect(new Cliente('   João   ').nome).toBe('João');
    });
  });

  describe('cenários inválidos', () => {
    it('não deve aceitar nome vazio', () => {
      expect(() => new Cliente('')).toThrow('O nome do cliente não pode estar vazio.');
    });

    it('não deve aceitar nome composto apenas por espaços', () => {
      expect(() => new Cliente('     ')).toThrow('O nome do cliente não pode estar vazio.');
    });

    it('não deve aceitar nome com menos de 3 caracteres', () => {
      expect(() => new Cliente('Jo')).toThrow(
        'O nome do cliente deve possuir pelo menos 3 caracteres.',
      );
    });

    it('não deve aceitar nome com 1 caractere (valor de fronteira)', () => {
      expect(() => new Cliente('A')).toThrow(
        'O nome do cliente deve possuir pelo menos 3 caracteres.',
      );
    });

    it('não deve aceitar valores que não sejam texto', () => {
      expect(() => new Cliente(null as unknown as string)).toThrow(
        'O nome do cliente não pode estar vazio.',
      );
      expect(() => new Cliente(undefined as unknown as string)).toThrow(
        'O nome do cliente não pode estar vazio.',
      );
    });
  });

  describe('nomeEhValido', () => {
    it.each([
      ['Ana', true],
      ['Carlos Eduardo', true],
      ['Jo', false],
      ['', false],
      ['  ', false],
    ])('nomeEhValido("%s") deve retornar %s', (nome, esperado) => {
      expect(nomeEhValido(nome as string)).toBe(esperado);
    });
  });
});
