import {
  Component,
  OnInit
} from '@angular/core';
import {
  Platform
} from '@ionic/angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  GoogleMapOptions,
  GoogleMapsMapTypeId
} from '@ionic-native/google-maps/ngx';
import { ApicallerService } from './../services/apicaller.service';
import { ModalController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { ActionhelperService } from '../services/actionhelper.service';
import { NgZone } from '@angular/core';
import { FilterhelperService } from '../services/filterhelper.service';
import { Network } from '@ionic-native/network/ngx';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage implements OnInit {

  map: GoogleMap;

  private masterDataList: any = [];
  private filterData: any = [];

  private searchFilter = '';
  private categoryFilter = '';
  private distanceFilter = 20;

  zone: NgZone;

  private categoryData = [];
  private distanceData = [];
  private categoryFilterCount: number;

  public noSavedData = false;
  loading: any;

  customAlertOptionsCat: any = {
    header: 'Categories',
    subHeader: 'Select categories to view',
    translucent: true
  };

  customAlertOptionsDistance: any = {
    header: 'Distance',
    subHeader: 'Select how far away from you to search',
    translucent: true
  };

  constructor(private platform: Platform, private apiService: ApicallerService, private actionhelper: ActionhelperService,
    // tslint:disable-next-line:align
    public modalController: ModalController, public actionSheetController: ActionSheetController,
    // tslint:disable-next-line:align
    private filterhelper: FilterhelperService, private network: Network, public loadingController: LoadingController) {

    // https://ionicallyspeaking.com/2017/01/17/ionic-2-ui-not-updating-after-change-to-model/
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  ngOnInit() {
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
    });

    // Ensure device is ready to do stuff
    this.platform.ready().then(() => {
      console.log('Platform ready...');
      this.presentInformation();
    });
  }

  async presentInformation() {
    await this.presentLoading();

    // First lets get your current location
    this.filterhelper.getMyLatLng().then((resp) => {
      console.log('Got Lat/LNG...');
      this.categoryData = this.filterhelper.getCategoryData();
      this.categoryFilterCount = this.filterhelper.getCategoryCounter();
      this.distanceData = this.filterhelper.getDistanceData();

      this.apiService.retrieveData().then(async (res) => {

        if (!res) {
          console.log('Error retrieving fresh data!');

          this.apiService.getLocalData('specialkey-food').then(async (val) => {

            if (!val) {
              console.log('Error retreiving local data!');
              await this.loading.dismiss();
              this.noSavedData = true;
            } else {
              console.log(val);
              console.log('Listview: Initializing data ' + val.length);

              this.masterDataList = val;

              // tslint:disable-next-line:prefer-for-of
              for (let i = 0; i < this.masterDataList.length; i++) {
                const curItem = this.masterDataList[i];
                this.calcDistance(curItem);
              }

              this.finalFilterPass();
              this.loadMap();
            }
          }).catch(async (error) => {
            console.log('get error for specialkey-food ', error);
            await this.loading.dismiss();
            this.noSavedData = true;
          });

        } else {
          console.log(res.data);
          console.log('Listview: Initializing data ' + res.data.length);

          this.masterDataList = res.data;

          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < this.masterDataList.length; i++) {
            const curItem = this.masterDataList[i];
            this.calcDistance(curItem);
          }

          this.finalFilterPass();
          this.loadMap();
        }
      });
    });

  }

  async presentLoading() {
    // Prepare a loading controller
    this.loading = await this.loadingController.create({
      message: 'Loading...'
    });
    // Present the loading controller
    await this.loading.present();
  }

  calcDistance(item) {
    const returnValue = this.filterhelper.getDistanceFromLatLonInMiles(item.lat, item.lng);
    item.distance = returnValue.toFixed(2);

    return returnValue.toFixed(2);
  }

  finalFilterPass() {
    console.log('Checking Filter: ' + this.masterDataList.length);
    console.log('Distance Filter=' + this.distanceFilter);
    console.log('Category Filter=' + this.categoryFilter);
    console.log('Search Filter=' + this.searchFilter);

    this.filterData = this.masterDataList.filter(curItem => {
      // Organization is required. This is a sanity check if it doesn't show up
      if (curItem.name) {

        // console.log('2' + curItem.distance);
        if (curItem.distance && curItem.distance < this.distanceFilter) {

          const jsonString = JSON.stringify(curItem).toLowerCase();

          if (this.searchFilter === '' || jsonString.indexOf(this.searchFilter.toLowerCase()) > -1) {

            if (this.categoryFilter === '' || this.categoryFilter.indexOf(curItem.subcategory.name.toLowerCase()) > -1) {

              return true;
            }
          }
        }

        return false;
      }
    });

    console.log('Local Arrays filtered by. Count: ' + this.filterData.length);

    this.populateMapMakers();
  }

  filterBySearchBar(evt?) {

    if (evt) {
      this.searchFilter = evt.srcElement.value;
    }

    this.finalFilterPass();
  }

  filterByCategory(evt?) {

    if (evt) {
      this.categoryFilterCount = evt.srcElement.value.length;
      this.categoryFilter = (evt.srcElement.value).toString().toLowerCase();
    }

    this.finalFilterPass();
  }

  filterByDistance(evt?) {

    if (evt) {

      this.distanceFilter = Number(evt.srcElement.value);
      console.log(this.distanceFilter + ' has changed distance filter value');
    }

    this.finalFilterPass();
  }

  loadMap() {

    const mapOptions: GoogleMapOptions = {
      mapType: GoogleMapsMapTypeId.ROADMAP,

      controls: {
        compass: true,
        myLocationButton: true,
        myLocation: true,   // (blue dot)
        zoom: true,          // android only
      },
      camera: {
        target: {
          lat: this.filterhelper.startingLatLng.lat,
          lng: this.filterhelper.startingLatLng.lng
        },
        zoom: 18,
        tilt: 30,
      },
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);
    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(
      (data) => {
        console.log('Map Ready');
        this.populateMapMakers();
      }
    );

  }

  async populateMapMakers() {
    if (this.map == null) {
      console.log('Map not ready yet!');
      await this.loading.dismiss();
      return;
    }

    this.map.clear();
    console.log('Populating Markers. Total Markers: ' + this.filterData.length);

    for (const curLocation of this.filterData) {

      const curLatLng: any = {
        lat: curLocation.lat,
        lng: curLocation.lng
      };

      let myIcon = 'red';

      if (curLocation.Category === 'Food Pantries') {
        myIcon = 'blue';
      } else if (curLocation.Category === 'Community Meals') {
        myIcon = 'orange';
      } else if (curLocation.Category === 'SNAP') {
        myIcon = 'yellow';
      } else if (curLocation.Category === 'Medical Assistance') {
        myIcon = 'cyan';
      } else if (curLocation.Category === 'Veggie Mobile') {
        myIcon = 'green';
      } else if (curLocation.Category === 'Misc') {
        myIcon = 'magenta';
      }

      // add a marker
      const marker: Marker = this.map.addMarkerSync({
        title: curLocation.name,
        snippet: curLocation.line_1 + ' ' + curLocation.city + ' ' + curLocation.state + ' ' + curLocation.zip,

        position: curLatLng,
        // animation: GoogleMapsAnimation.DROP, // https://github.com/mapsplugin/cordova-plugin-googlemaps/issues/853
        icon: myIcon
      });

      // show the infoWindow, this causes the last loaded marker to become the starting point
      // marker.showInfoWindow();

      // If clicked it, display the alert
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {

        // This zone thing makes sure the UI keeps up with changes to the model somehow
        this.zone.run(() => {

          // Move the map camera to the location with animation
          this.map.animateCamera({
            target: curLatLng,
            zoom: 18,
            duration: 1000
          });

          this.presentActionSheet(curLocation);
        });

      });

    }
    await this.loading.dismiss();
  }

  async presentActionSheet(selectedItem) {
    console.log('ActionSheet: ' + selectedItem.name);

    if (selectedItem == null) {
      console.log('Error: No item selected to show options for');
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: selectedItem.name,
      subHeader: selectedItem.hours_of_operation,
      buttons: this.actionhelper.getActionMapping(selectedItem)
    });

    await actionSheet.present();
  }

}
