import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Faturas } from './faturas';

describe('Faturas', () => {
  let component: Faturas;
  let fixture: ComponentFixture<Faturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faturas],
    }).compileComponents();

    fixture = TestBed.createComponent(Faturas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
