import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovimentacoesEstoque } from './movimentacoes-estoque';

describe('MovimentacoesEstoque', () => {
  let component: MovimentacoesEstoque;
  let fixture: ComponentFixture<MovimentacoesEstoque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimentacoesEstoque],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimentacoesEstoque);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
