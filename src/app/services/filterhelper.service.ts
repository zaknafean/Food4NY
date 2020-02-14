import { Injectable } from '@angular/core';
import { ILatLng, Spherical } from '@ionic-native/google-maps/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

@Injectable({
  providedIn: 'root'
})
export class FilterhelperService {

  categoryData = [];
  distanceChoices = [];
  startingLatLng: ILatLng;
  categoryCounter: number;

  constructor(private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder) {

    this.categoryData = [
      {
        check: true,
        type: 'Children and Youth Programs'
      },
      {
        check: true,
        type: 'Community Meal/Soup Kitchen'
      },
      {
        check: true,
        type: 'Coalition Member'
      },
      {
        check: true,
        type: 'Food Pantry'
      },
      {
        check: true,
        type: 'Holiday Meal'
      },
      {
        check: true,
        type: 'Child Care'
      },
      {
        check: true,
        type: 'Clothing'
      },
      {
        check: true,
        type: 'Disability Services'
      },
      {
        check: true,
        type: 'Emergency Housing'
      },
      {
        check: true,
        type: 'Family Support'
      },
      {
        check: true,
        type: 'Furniture'
      },
      {
        check: true,
        type: 'Housing Assistance'
      },
      {
        check: true,
        type: 'Legal Aid'
      },
      {
        check: true,
        type: 'Self Help & Support'
      },
      {
        check: true,
        type: 'Social Services'
      },
      {
        check: true,
        type: 'Medical Assistance'
      },
      {
        check: true,
        type: 'Senior Center/Meal Service'
      },
      {
        check: true,
        type: 'Senior Services'
      },
      {
        check: true,
        type: 'Veggie Mobile Sprout®'
      },
      {
        check: true,
        type: 'Veggie Mobile®'
      },
      {
        check: true,
        type: 'SNAP (food stamp) Registration Assistance'
      },
      {
        check: true,
        type: 'WIC Office/Sign Up Locations'
      }
    ];

    this.categoryCounter = this.categoryData.length;

    this.distanceChoices = [
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

  getMyLatLng(): Promise<Geoposition> {

    const retVal = this.geolocation.getCurrentPosition({ timeout: 3000 }).then((resp) => {
      console.log('Setting Current Location - Lat:' + resp.coords.latitude + 'Lat:' + resp.coords.longitude);
      this.startingLatLng = { lat: resp.coords.latitude, lng: resp.coords.longitude };
      return resp;
    });

    return retVal;
  }

  // TODO Spherical nulls out and I cant' figure out why, using getDistanceFromLatLonInMiles for now
  computeDistance(markerLat, markerLng) {
    if (this.startingLatLng) {
      const destinationCoord: ILatLng = { lat: markerLat, lng: markerLng };
      const distanceInMeters = Spherical.computeDistanceBetween(this.startingLatLng, destinationCoord);
      return (distanceInMeters * 0.000621371192);
    } else {
      console.log('Error: Location unknown');
      return 'Error';
    }
  }

  getDistanceFromLatLonInMiles(markerLat, markerLng) {
    // console.log('1=' + this.startingLatLng.lat + ',' + this.startingLatLng.lng);
    // console.log('2=' + markerLat + ',' + markerLng);

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

  getCategoryCounter(): number {
    return this.categoryCounter;
  }

  getCategoryData(): Array<any> {
    return this.categoryData;
  }

  getDistanceData(): Array<any> {
    return this.distanceChoices;
  }
}
