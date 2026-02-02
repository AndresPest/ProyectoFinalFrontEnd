import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioReconocimiento } from './audio-reconocimiento';

describe('AudioReconocimiento', () => {
  let component: AudioReconocimiento;
  let fixture: ComponentFixture<AudioReconocimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioReconocimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioReconocimiento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
