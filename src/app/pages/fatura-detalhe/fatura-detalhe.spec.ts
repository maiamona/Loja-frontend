import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaturaDetalhe } from './fatura-detalhe';

describe('FaturaDetalhe', () => {
  let component: FaturaDetalhe;
  let fixture: ComponentFixture<FaturaDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaturaDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(FaturaDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
