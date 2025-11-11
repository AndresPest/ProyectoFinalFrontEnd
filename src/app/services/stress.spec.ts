import { TestBed } from '@angular/core/testing';

import { StressService } from './stress.service';

describe('Stress', () => {
  let service: StressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
