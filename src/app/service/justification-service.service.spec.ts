import { TestBed } from '@angular/core/testing';

import { JustificationServiceService } from './justification-service.service';

describe('JustificationServiceService', () => {
  let service: JustificationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JustificationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
