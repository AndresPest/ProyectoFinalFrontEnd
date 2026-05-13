import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyudaGeneral } from './ayuda-general';

describe('AyudaGeneral', () => {
  let component: AyudaGeneral;
  let fixture: ComponentFixture<AyudaGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyudaGeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AyudaGeneral);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
