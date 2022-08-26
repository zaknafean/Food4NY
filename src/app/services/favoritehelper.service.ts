import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

const STORAGE_KEY = 'savedOrganizations';


@Injectable({
  providedIn: 'root'
})
export class FavoritehelperService {

  constructor(public storage: Storage) { }

  async isFavorite(organizationId: number) {
    const result = await this.getAllFavorites();

    let indexResult = result && result.indexOf(organizationId) !== -1;
    if (indexResult === null) {
      indexResult = false;
    }
    console.log('Checking Favorites... ' + indexResult);
    return indexResult;
  }

  favoriteOrganization(organizationId) {
    return this.getAllFavorites().then(result => {
      if (result) {
        result.push(organizationId);
        return this.storage.set(STORAGE_KEY, result);
      } else {
        return this.storage.set(STORAGE_KEY, [organizationId]);
      }
    });
  }

  unfavoriteOrganization(organizationId) {
    return this.getAllFavorites().then(result => {
      if (result) {
        const index = result.indexOf(organizationId);
        result.splice(index, 1);
        return this.storage.set(STORAGE_KEY, result);
      }
    });
  }

  getAllFavorites() {
    return this.storage.get(STORAGE_KEY);
  }

}
