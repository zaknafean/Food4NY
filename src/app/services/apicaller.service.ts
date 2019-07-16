import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Observable, from } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';



const API_STORAGE_KEY = 'specialkey';
const API_URL = '/api';
// const API_URL = 'https://sicmfood.com/foodmap10.php';


@Injectable({
  providedIn: 'root'
})

export class ApicallerService {

  apiKey = ''; // <-- Enter your own key here!

  /**
   * Constructor of the Service with Dependency Injection
   * @param http The standard Angular HttpClient to make requests
   */
  constructor(private http: HttpClient, private storage: Storage ) { }

  /**
   * Get data from the REST Endoint
   * map the result and save it locally
   *
   * @param {string} title Search Term
   * @param {SearchType} type movie, series, episode or empty
   * @returns Observable with the search results
   */
  retrieveData(): Observable<any> {

    console.log('Retrieving new data from: ' + API_URL);

    return this.http.get(`${API_URL}`).pipe(
      map(results => results['Food']),
      tap(results => {
        this.setLocalData('food', results);
      })
    );
  }

  // Save result of API requests
  public setLocalData(key: string, data: any) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data).then((response) => {
      console.log('setLocalData A: ' + `${API_STORAGE_KEY}-${key}` + ' ', response);
    }).catch((error) => {
      console.log('setLocalData B: ' + `${API_STORAGE_KEY}-${key}` + ' ', error);
    });
  }

  // Get cached API result
  public getLocalData(key: string) {
    console.log('getLocalData: ' + key);
    return this.storage.get(key);
  }

  // Remove a key/value pair
  removeKey(key: string) {
    this.storage.remove(key).then(() => {
      console.log('removed ' + key);
    }).catch((error) => {
      console.log('removed error for ' + key + '', error);
    });
  }

  // Get Current Storage Engine Used
  driverUsed() {
    console.log('Driver Used: ' + this.storage.driver);
  }

  // Traverse key/value pairs
  traverseKeys() {
    this.storage.forEach((value: any, key: string, iterationNumber: number) => {
      console.log('key ' + key);
      console.log('iterationNumber ' + iterationNumber);
      console.log('value ' + value);
    });
  }

  // Traverse key/value pairs
  listKeys() {
    this.storage.keys().then((k) => {
      console.table(k);
    });
  }

  // Total Keys Stored
  getKeyLength() {
    this.storage.length().then((keysLength: number) => {
      console.log('Total Keys ' + keysLength);
    });
  }
}
