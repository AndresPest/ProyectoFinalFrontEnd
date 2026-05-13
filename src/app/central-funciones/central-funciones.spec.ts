import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralFunciones } from './central-funciones';

describe('CentralFunciones', () => {
  let component: CentralFunciones;
  let fixture: ComponentFixture<CentralFunciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralFunciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentralFunciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
