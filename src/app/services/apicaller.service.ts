
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage';
import { Observable, from } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';



// Typescript custom enum for search types (optional)
export enum SearchType {
  all = '',
  movie = 'movie',
  series = 'series',
  episode = 'episode'
}

const API_STORAGE_KEY = 'specialkey';
// const API_URL = 'https://reqres.in/api';

// const API_URL = 'https://sicmfood.com/foodmap10.php';
const API_URL = '/goto/foodmap10.php';


@Injectable({
  providedIn: 'root'
})

export class ApicallerService {

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
    return this.http.get(`${API_URL}`).pipe(
      map(results => results['Food']),
      tap(results => {
        this.setLocalData('food', results);
      })
    );
    /*const page = Math.floor(Math.random() * Math.floor(6));

    return this.http.get(`${API_URL}/users?per_page=2&page=${page}`).pipe(
      map(res => res['data']),
      tap(res => {
        this.setLocalData('users', res);
      })
    );*/
  }

  getUsers(forceRefresh: boolean = false): Observable<any[]> {
    // Return the cached data from Storage
    return from(this.getLocalData('users'));
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
