import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';


const API_STORAGE_KEY = 'pantryEntries';
const REFRESH_TIME_KEY = 'lastRefresh';
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
    const forceRefresh = await this.isRefreshTime();
    console.log('ForceRefresh time? ' + forceRefresh);

    // See if we have local data first
    const results = await this.getLocalData().then(async (respose) => {
      // Case 1: No fresh data
      if (respose === null || forceRefresh) {
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
            this.setRefreshTime();
            console.log('setLocalData: Local Data set, entry count: ' + setResponse.data.length);
            return setResponse.data;
          }).catch((error) => {
            console.log('setLocalData Error: ' + API_STORAGE_KEY + ' ', error);
          });

          // Fail safe return in case set fails somehow
          return responseData.data;
        }

      } else {
        // Case 2: Local Data
        console.log('Found data! No need to retrieve fresh data');
        return respose;
      }

    });

    return results;
  }

  public setRefreshTime() {
    console.log('Calling setRefreshTime in apicaller.service');
    const curDate: Date = new Date();

    this.storage.set(REFRESH_TIME_KEY, curDate.getTime()).then(() => {
      console.log('setRefreshTime: Local Data set at ' + REFRESH_TIME_KEY + curDate.getTime());
    }).catch((error) => {
      console.log('setRefreshTime Error: ' + REFRESH_TIME_KEY + ' ', error);
    });
  }

  public removeRefreshTime() {
    console.log('Calling removeRefreshTime in apicaller.service');
    const curDate: Date = new Date();

    this.storage.remove(REFRESH_TIME_KEY).then(() => {
      console.log('removeRefreshTime: Local Data set at ' + REFRESH_TIME_KEY);
    }).catch((error) => {
      console.log('removeRefreshTime Error: ' + REFRESH_TIME_KEY + ' ', error);
    });
  }

  async isRefreshTime() {
    const result = await this.storage.get(REFRESH_TIME_KEY);
    let retVal = false;
    const curDate: Date = new Date();
    const timeDiff = curDate.getTime() - result;
    // console.log('Comparing time to ' + result + ' = ' + timeDiff);

    if (timeDiff > 86400000 || result === null) {
      retVal = true;
    }

    return retVal;
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
  public getLocalData(): Promise<any> {
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
