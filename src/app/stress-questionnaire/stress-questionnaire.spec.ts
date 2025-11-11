import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StressQuestionnaireComponent } from './stress-questionnaire';

describe('StressQuestionnaire', () => {
  let component: StressQuestionnaireComponent;
  let fixture: ComponentFixture<StressQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StressQuestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StressQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
