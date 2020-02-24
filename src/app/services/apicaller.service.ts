import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';


const API_STORAGE_KEY = 'pantryEntries';
const API_URL = 'https://map.thefoodpantries.org/api/entities';


@Injectable({
  providedIn: 'root'
})

export class ApicallerService {

  /**
   * Constructor of the Service with Dependency Injection
   */
  constructor(private nativeHttp: HTTP, private storage: Storage, ) { }

  /**
   * Primary retrival, called on page load. It does the following
   * 1) Checks if there is local data. If not or it is 'stale'...
   *  a) Call out to ther end point
   *  b) Check if we recieved a response
   *  c) If no, return null and giv eup
   *  d) If yes, parse the data, store it, and return it
   * 2) Otherwise, return the data
   * @returns Promise of an array of parsed JSON data
   */
  async retrieveData(): Promise<any> {
    console.log('Calling retrieveData in apicaller.service');

    // See if we have local data first
    const results = await this.getLocalData('moo').then(async (respose) => {
      // Case 1: No fresh data
      if (respose === null) {
        console.log('Retrieving new data from: ' + API_URL);
        const apiResponse = await this.nativeHttp.get(`${API_URL}`, {}, {}).catch(error => {
          console.log('Error retrieving fresh data. Cant recover: ' + error);
          return null;
        });
        if (apiResponse === null || apiResponse === undefined) {
          console.log('Error response recieved from server, but it was null data');
          return null;
        } else {

          const responseData = JSON.parse(apiResponse.data);
          this.storage.set(API_STORAGE_KEY, responseData).then((setResponse) => {
            console.log('setLocalData: Local Data set at ' + API_STORAGE_KEY);
            return setResponse;
          }).catch((error) => {
            console.log('setLocalData B: ' + API_STORAGE_KEY + ' ', error);
          });
          // Fail safe return in case set fails somehow
          return responseData;
        }

      } else {
        // Case 2: Local Data
        console.log('Found data, no need to get fresh data: ');
        return respose;
      }

    });

    return results;
  }

  // Save result of API requests
  public setLocalData(data: any) {
    console.log('Calling setLocalData in apicaller.service');

    this.storage.set(API_STORAGE_KEY, data).then(() => {
      console.log('setLocalData: Local Data set at ' + API_STORAGE_KEY);
    }).catch((error) => {
      console.log('setLocalData B: ' + API_STORAGE_KEY + ' ', error);
    });
  }

  // Get existing data
  public getLocalData(key: string): Promise<any> {
    console.log('Calling getLocalData in apicaller.service');

    return this.storage.get(API_STORAGE_KEY).then((storageResponse) => {
      // Null is possible on a first run. Account for it'
      if (storageResponse === null || storageResponse === undefined) {
        return null;
      }

      return storageResponse.data;
    });
  }

}
