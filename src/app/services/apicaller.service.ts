import { Injectable } from '@angular/core';
// import { HttpClient, HttpClientJsonpModule } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';
import { Observable, from } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';



const API_STORAGE_KEY = 'specialkey';
// const API_URL = '/api';
const API_URL = 'https://map.thefoodpantries.org/api/entities';


@Injectable({
  providedIn: 'root'
})

export class ApicallerService {

  apiKey = ''; // <-- Enter your own key here!

  /**
   * Constructor of the Service with Dependency Injection
   * @param http The standard Angular HttpClient to make requests
   */
  constructor(private platform: Platform, private nativeHttp: HTTP, private storage: Storage, ) { }

  /**
   * Get data from the REST Endoint
   * map the result and save it locally
   *
   * @returns Observable with the search results
   */
  async retrieveData(): Promise<any> {

    console.log('Retrieving new data from: ' + API_URL);

    const results = await this.nativeHttp.get(`${API_URL}`, {}, {})
      .catch(error => {
        // console.log(error.status);
        console.log(error.error); // error message as string
        // console.log(error.headers);
        return null;
      });

    // If this happens it means no network connection, or the API is down.
    // Try to get it locally!
    if (results === null) {
      return null;
    } else {

      const data = JSON.parse(results.data);
      console.log(data);
      this.storage.set(`${API_STORAGE_KEY}-food`, data)
        .then((response) => {
          console.log('setLocalData: Local Data set at ' + `${API_STORAGE_KEY}-food`);
          return response;
        }).catch((error) => {
          console.log('setLocalData B: ' + `${API_STORAGE_KEY}-food` + ' ', error);
        });
      return data;
    }
  }

  // Save result of API requests
  public setLocalData(key: string, data: any) {
    // const key = 'food';
    console.log('trying to set local data');
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data).then((response) => {
      console.log('setLocalData: Local Data set at ' + `${API_STORAGE_KEY}-${key}`);
    }).catch((error) => {
      console.log('setLocalData B: ' + `${API_STORAGE_KEY}-${key}` + ' ', error);
    });
  }

  // Get cached API result
  public getLocalData(key: string): Promise<any> {
    const refreshData = false;
    console.log('trying to get local data=' + key);
    const retVal = this.storage.get(key).then((resp) => {
      // console.log(resp);
      return resp.data;
    });

    return retVal;
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
