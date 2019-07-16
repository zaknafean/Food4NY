import { TestBed } from '@angular/core/testing';

import { FilterhelperService } from './filterhelper.service';

describe('FilterhelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilterhelperService = TestBed.get(FilterhelperService);
    expect(service).toBeTruthy();
  });
});
