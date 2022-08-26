import { TestBed } from '@angular/core/testing';

import { FavoritehelperService } from './favoritehelper.service';


describe('FavoritehelperService', () => {
  let service: FavoritehelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritehelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});