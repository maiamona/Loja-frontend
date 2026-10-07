import { TestBed } from '@angular/core/testing';
import { MovimentacaoEstoque } from './movimentacao-estoque';

describe('MovimentacaoEstoque', () => {
  let service: MovimentacaoEstoque;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovimentacaoEstoque);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
