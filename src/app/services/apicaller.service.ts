import { Injectable } from '@angular/core';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Storage } from '@ionic/storage-angular';
import { FilterhelperService } from 'src/app/services/filterhelper.service';


const API_STORAGE_KEY = 'pantryEntries';
const REFRESH_TIME_KEY = 'lastRefresh';
const CHECKSUM_KEY = 'resourceCount';
const API_URL_MASTER = 'https://map.thefoodpantries.org/api/entities';
const API_URL_DELTA = 'https://tearcell.com/api/food/resources/?format=json&last_updated_after=';
const API_URL_COUNT = 'https://tearcell.com/api/food/resources/count';
const API_URL_CATEGORY = 'https://tearcell.com/api/food/subcategories/';


@Injectable({
  providedIn: 'root'
})

export class ApicallerService {

  /**
   * Constructor of the Service with Dependency Injection
   */
  constructor(private nativeHttp: HTTP, private storage: Storage, private filterhelper: FilterhelperService) { }

  /**
   * Primary retrival, called on page load. It does the following
   * 1) Are we online? If so lets get the delta since last update ran
   *  a) Call out to the end point
   *  b) Check if we recieved a response
   *  c) If no, return null and giv eup
   *  d) If yes, parse the data, store it, and return it
   * 2) Otherwise, return the data
   * @returns Promise of an array of parsed JSON data
   */
  async retrieveData(amOnline: boolean): Promise<any> {
    // Get the local data for later manipulation
    let results = await this.getLocalData();
    //console.log("Getting data...")
    const countReponse = await this.nativeHttp
      .get(API_URL_COUNT, {}, {})
      .catch(error => {
        console.log('Error retrieving fresh data. Will try offline cache, ErrorMsg: ' + error);
        return null;
      });
    
    let checksumCount = JSON.parse(countReponse.data);
    checksumCount = Number.parseInt(checksumCount.count, 10);

    const pullFreshData = !( results && results.length === checksumCount);

    if (results === null || results === undefined || pullFreshData) {
      console.log('Error no local data found. Please go on line and refresh to get map data.');
      this.removeRefreshTime();
    }

    const lastRefreshTime = await this.getLastRefreshTime();

    let finalUrl = API_URL_DELTA;
    let hasPulledToday = false;

    // Verify the last refresh time, and see if we pulled today already
    if (lastRefreshTime != null) {
      const newDate = new Date(lastRefreshTime);
      const lastRefreshDateString = newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate();

      const todayDate = new Date();
      const todayDateString = todayDate.getFullYear() + '-' + (todayDate.getMonth() + 1) + '-' + todayDate.getDate();

      if (lastRefreshDateString === todayDateString) {
        // console.log('We have already checked for new data today');
        hasPulledToday = true;
      }

      finalUrl = API_URL_DELTA + lastRefreshDateString;
    }

    // If we are online, see if there have been updates since last we were on
    //console.log('If test: ' + amOnline, ' and (' + !hasPulledToday + ' or ' + pullFreshData + ')');
    if (amOnline && (!hasPulledToday || pullFreshData)) {

      // console.log('Retrieving new data from: ' + finalUrl);

      const apiResponse = await this.nativeHttp
        .get(finalUrl, {}, {})
        .catch(error => {
          console.log('Error retrieving fresh data. Will try offline cache, ErrorMsg: ' + error);
          return null;
        });

      if (apiResponse === null || apiResponse === undefined) {
        console.log('Error response recieved from server, but it was null data. Trying offline cache');
      } else {

        const responseData = JSON.parse(apiResponse.data);
        //console.log(responseData);

        if (pullFreshData) {
          console.log('Refreshing Data');
          results = responseData;
        } else {
          console.log('Merging Data');
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < responseData.length; i++) {
            let found = false;
            for (let j = 0; j < results.length; j++) {
              if (results[j].id === responseData[i].id) {
                found = true;
                results[j] = responseData[i];
                break;
              }
            }
            if (!found) {
              results.push(responseData[i]);
            }
          }
        }

        results = results.map(item => {
          const returnArray = {
            id: -1, line_1: '', city: '', state: 'NY', zip: '', phone: '5555555',
            name: 'n/a', hours_of_operation: 'n/a', lat: 0.000000, lng: 0.000000,
            subcategory: '1', website: 'n/a', info: '', last_updated: 'n/a',
            organization: 'n/a', distance: ''
          };

          returnArray.id = item.id;
          returnArray.line_1 = item.line_1;
          returnArray.city = item.city;
          returnArray.state = item.line_1;
          returnArray.zip = item.zip;
          returnArray.phone = item.phone;
          returnArray.name = item.name;
          returnArray.hours_of_operation = item.hours_of_operation;
          returnArray.lat = item.lat;
          returnArray.lng = item.lng;
          returnArray.subcategory = item.subcategory;
          returnArray.website = item.website;
          returnArray.info = item.info;
          returnArray.last_updated = item.last_updated;
          returnArray.organization = item.organization;

          returnArray.distance = this.calcDistance(returnArray);

          return returnArray;
        });

        this.storage.set(API_STORAGE_KEY, results).then((setResponse) => {
          this.setLastRefreshTime();
          console.log('setLocalData: Local Data set, entry count: ' + setResponse.length);
          return setResponse;
        }).catch((error) => {
          console.log('setLocalData Error: ' + API_STORAGE_KEY + ' ', error);
        });
        console.log('Refreshed Data! Returning new data.');
        return results;
      }
    }
    else {
      results = results.map(item => {
        const returnArray = {
          id: -1, line_1: '', city: '', state: 'NY', zip: '', phone: '5555555',
          name: 'n/a', hours_of_operation: 'n/a', lat: 0.000000, lng: 0.000000,
          subcategory: '1', website: 'n/a', info: '', last_updated: 'n/a',
          organization: 'n/a', distance: ''
        };

        returnArray.id = item.id;
        returnArray.line_1 = item.line_1;
        returnArray.city = item.city;
        returnArray.state = item.line_1;
        returnArray.zip = item.zip;
        returnArray.phone = item.phone;
        returnArray.name = item.name;
        returnArray.hours_of_operation = item.hours_of_operation;
        returnArray.lat = item.lat;
        returnArray.lng = item.lng;
        returnArray.subcategory = item.subcategory;
        returnArray.website = item.website;
        returnArray.info = item.info;
        returnArray.last_updated = item.last_updated;
        returnArray.organization = item.organization;

        returnArray.distance = this.calcDistance(returnArray);

        return returnArray;
      });
    }

    if (results === null || results === undefined) {
      // console.log('Error no local data found. Please go on line and refresh to get map data.');
      this.removeRefreshTime();
      return null;
    } else {
      console.log('Found data! No need to retrieve fresh data');
      //console.log(results);
      return results;
    }

  }


  public calcDistance(item) {
    let returnValue = this.filterhelper.getDistanceFromLatLonInMiles(item.lat, item.lng);
    //const returnValue = 22.222
    //console.log(item.name, ' recalced to ', returnValue)
    return returnValue.toFixed(2);
  }

  public async getLastRefreshTime() {
    const result = await this.storage.get(REFRESH_TIME_KEY);
    return result;
  }

  private async setLastRefreshTime() {
    // console.log('Calling setLastRefreshTime in apicaller.service');
    const curDate: Date = new Date();

    this.storage.set(REFRESH_TIME_KEY, curDate.getTime()).then(() => {
      // console.log('setLastRefreshTime: Local Data set at ' + REFRESH_TIME_KEY + ':' + curDate.getTime());
    }).catch((error) => {
      // console.log('setLastRefreshTime Error: ' + REFRESH_TIME_KEY + ' ', error);
    });
  }

  private removeRefreshTime() {
    // console.log('Calling removeRefreshTime in apicaller.service');
    const curDate: Date = new Date();

    this.storage.remove(REFRESH_TIME_KEY).then(() => {
      // console.log('removeRefreshTime: Local Data set at ' + REFRESH_TIME_KEY);
    }).catch((error) => {
      // console.log('removeRefreshTime Error: ' + REFRESH_TIME_KEY + ' ', error);
    });
  }


  // Save result of API requests
  public setLocalData(data: any) {
    // console.log('Calling setLocalData in apicaller.service');

    this.storage.set(API_STORAGE_KEY, data).then(() => {
      // console.log('setLocalData: Local Data set at ' + API_STORAGE_KEY);
    }).catch((error) => {
      // console.log('setLocalData B: ' + API_STORAGE_KEY + ' ', error);
    });
  }

  // Get existing data
  public getLocalData(): Promise<any> {
    // console.log('Calling getLocalData in apicaller.service');

    return this.storage.get(API_STORAGE_KEY).then((storageResponse) => {
      // Null is possible on a first run. Account for it'
      if (storageResponse === null || storageResponse === undefined) {
        return null;
      }

      return storageResponse;
    });
  }

  public async getFreshCategoryData(): Promise<any> {
    //console.log('Getting Fresh Category Data');
    const apiResponse = await this.nativeHttp
      .get(API_URL_CATEGORY, {}, {})
      .catch(error => {
        // console.log('Error retrieving fresh data. Will try offline cache, ErrorMsg: ' + error);
        return null;
      });

    if (apiResponse === null || apiResponse === undefined) {
      // console.log('Error response recieved from server, but it was null data. Trying offline cache');
      return null;
    } else {

      const responseData = JSON.parse(apiResponse.data);
      const freshCategoryData = [];

      responseData.forEach(element => {
        const newCategory = {
          id: 1,
          check: true,
          type: 'Children and Youth Programs',
          value: 'Children and Youth Programs'
        };
        newCategory.id = element.id;
        newCategory.type = element.name;
        newCategory.value = element.name;
        newCategory.check = true;

        freshCategoryData.push(newCategory);
      });
      
      return freshCategoryData;
    }
  }

}
