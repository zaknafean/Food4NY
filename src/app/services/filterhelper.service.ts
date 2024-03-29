import { Injectable } from '@angular/core';
//import { ILatLng, Spherical } from '@ionic-native/google-maps/ngx';
//import { GoogleMap,  } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
//import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Storage } from '@ionic/storage-angular';


const PREF_DISTANCE_KEY = 'distancePref';
const PREF_CATEGORY_KEY = 'categoryPref';
const PREF_CATEGORY_DATA_KEY = 'categoryData';

@Injectable({
  providedIn: 'root'
})

export class FilterhelperService {

  categoryData = [];
  distanceChoices = [];
  startingLatLng = { lat: 42.65155, lng: -73.75521 };

  public defaultCategoryValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

  //constructor(private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder, public storage: Storage,) {
  constructor(public storage: Storage) {
    // TODO get data dynamically
    this.categoryData = [
      {
        id: 1,
        check: true,
        type: 'Children and Youth Programs',
        value: 'Children and Youth Programs'
      },
      {
        id: 2,
        check: true,
        type: 'Community Meal/Soup Kitchen',
        value: 'Community Meal/Soup Kitchen'
      },
      {
        id: 3,
        check: true,
        type: 'Food Pantries for the Capital District',
        value: 'Food Pantries for the Capital District'
      },
      {
        id: 4,
        check: true,
        type: 'All Other - Capital District Food Pantries',
        value: 'All Other - Capital District Food Pantries'
      },
      {
        id: 5,
        check: true,
        type: 'Holiday Meal',
        value: 'Holiday Meal'
      },
      {
        id: 6,
        check: true,
        type: 'Child Care',
        value: 'Child Care'
      },
      {
        id: 7,
        check: true,
        type: 'Clothing',
        value: 'Clothing'
      },
      {
        id: 8,
        check: true,
        type: 'Disability Services',
        value: 'Disability Services'
      },
      {
        id: 9,
        check: true,
        type: 'Emergency Housing',
        value: 'Emergency Housing'
      },
      {
        id: 10,
        check: true,
        type: 'Family Support',
        value: 'Family Support'
      },
      {
        id: 11,
        check: true,
        type: 'Furniture',
        value: 'Furniture'
      },
      {
        id: 12,
        check: true,
        type: 'Housing Assistance',
        value: 'Housing Assistance'
      },
      {
        id: 13,
        check: true,
        type: 'Legal Aid',
        value: 'Legal Aid'
      },
      {
        id: 14,
        check: true,
        type: 'Self Help & Support',
        value: 'Self Help & Support'
      },
      {
        id: 15,
        check: true,
        type: 'Social Services',
        value: 'Social Services'
      },
      {
        id: 16,
        check: true,
        type: 'Medical Assistance',
        value: 'Medical Assistance'
      },
      {
        id: 17,
        check: true,
        type: 'Senior Center/Meal Service',
        value: 'Senior Center/Meal Service'
      },
      {
        id: 18,
        check: true,
        type: 'Senior Services',
        value: 'Senior Services'
      },
      {
        id: 19,
        check: true,
        type: 'Veggie Mobile Sprout®',
        value: 'Veggie Mobile Sprout®'
      },
      {
        id: 20,
        check: true,
        type: 'Veggie Mobile®',
        value: 'Veggie Mobile®'
      },
      {
        id: 21,
        check: true,
        type: 'SNAP Registration Assistance',
        value: 'SNAP Registration Assistance'
      },
      {
        id: 22,
        check: true,
        type: 'WIC Office/Sign Up Locations',
        value: 'WIC Office/Sign Up Locations'
      },
      {
        id: 23,
        check: true,
        type: 'Pet Food Pantry',
        value: 'Pet Food Pantry'
      },
      {
        id: 24,
        check: true,
        type: 'All Other - NYS Food Pantries',
        value: 'All Other - NYS Food Pantries'
      }
    ];

    this.distanceChoices = [
      {
        check: false,
        type: 'Show All',
        value: 9999
      },
      {
        check: false,
        type: '5 miles',
        value: 5
      },
      {
        check: false,
        type: '10 miles',
        value: 10
      },
      {
        check: true,
        type: '20 miles',
        value: 20
      },
      {
        check: false,
        type: '30 miles',
        value: 30
      },
      {
        check: false,
        type: '40 miles',
        value: 40
      },
      {
        check: false,
        type: '50 miles',
        value: 50
      },
      {
        check: false,
        type: '100 miles',
        value: 100
      }
    ];

  }

  async getMyLatLng() {

    const coordinates = await Geolocation.getCurrentPosition().then((resp) => {
      console.log('Setting Current Location - Lat:' + resp.coords.latitude + 'Lat:' + resp.coords.longitude);
      this.startingLatLng = { lat: resp.coords.latitude, lng: resp.coords.longitude };
    }).catch((error) => {
      console.log('Error getting location, defaulting to Albany: ' + JSON.stringify(error));
      this.startingLatLng = { lat: 42.65155, lng: -73.75521 };
    });
  }


  getDistanceFromLatLonInMiles(markerLat, markerLng) {

    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(this.startingLatLng.lat - markerLat);  // deg2rad below
    const dLon = this.deg2rad(this.startingLatLng.lng - markerLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(markerLat)) * Math.cos(this.deg2rad(this.startingLatLng.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km

    const f = (d * 0.621371); // Distance in miles

    return f;
  }

  deg2rad(deg): number {
    return deg * (Math.PI / 180);
  }

  getCategoryData(): Array<any> {
    return this.categoryData;
  }

  setCategoryData(categoryData: any) {
    this.categoryData = categoryData;
  }

  getDistanceData(): Array<any> {
    return this.distanceChoices;
  }

  setChosenDistance(newDistance: number) {
    return this.storage.set(PREF_DISTANCE_KEY, newDistance);
  }

  getChosenDistance() {
    return this.storage.get(PREF_DISTANCE_KEY);
  }

  setChosenCategories(newDistance: Array<number>) {
    return this.storage.set(PREF_CATEGORY_KEY, newDistance);
  }

  getChosenCategories() {
    return this.storage.get(PREF_CATEGORY_KEY);
  }
}
