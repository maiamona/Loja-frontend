import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Caixa } from './caixa';

describe('Caixa', () => {
  let component: Caixa;
  let fixture: ComponentFixture<Caixa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Caixa],
    }).compileComponents();

    fixture = TestBed.createComponent(Caixa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
