import { TestBed } from '@angular/core/testing';

import { ApicallerService } from './apicaller.service';


describe('ApicallerService', () => {
  let service: ApicallerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApicallerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});