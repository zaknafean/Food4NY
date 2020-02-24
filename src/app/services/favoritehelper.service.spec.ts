import { TestBed } from '@angular/core/testing';

import { FavoritehelperService } from './favoritehelper.service';

describe('FavoritehelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FavoritehelperService = TestBed.get(FavoritehelperService);
    expect(service).toBeTruthy();
  });
});
