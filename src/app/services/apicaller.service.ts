import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';


import { tap, map, catchError } from 'rxjs/operators';



// Typescript custom enum for search types (optional)
export enum SearchType {
  all = '',
  movie = 'movie',
  series = 'series',
  episode = 'episode'
}

const API_STORAGE_KEY = 'specialkey';

@Injectable({
  providedIn: 'root'
})

export class ApicallerService {

  url = 'https://sicmfood.com/foodmap10.php';
  apiKey = ''; // <-- Enter your own key here!

  /**
   * Constructor of the Service with Dependency Injection
   * @param http The standard Angular HttpClient to make requests
   */
  constructor(private http: HttpClient, private storage: Storage) { }

  /**
   * Get data from the OmdbApi
   * map the result to return only the results that we need
   *
   * @param {string} title Search Term
   * @param {SearchType} type movie, series, episode or empty
   * @returns Observable with the search results
   */
  retrieveData(): Observable<any> {
    return this.http.get(`${this.url}`).pipe(
      map(results => results['Food']),
      tap(results => {
        this.setLocalData('Food', results);
      })
    );
  }

  // Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  // Get cached API result
  private getLocalData(key) {
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }
}
