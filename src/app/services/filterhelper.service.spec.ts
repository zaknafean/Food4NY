import { TestBed } from '@angular/core/testing';

import { FilterhelperService } from './filterhelper.service';


describe('FilterhelperService', () => {
  let service: FilterhelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterhelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});