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
import { FavoritehelperService } from '../services/favoritehelper.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage implements OnInit {

  map: GoogleMap;

  public masterDataList: any = [];  // This array never changes
  public filterData: any = []; // This array is the one thats displayed

  public searchFilter = '';
  public categoryFilter = '';
  public categoryFilterString = '';
  public distanceFilter = 20;

  zone: NgZone;

  public categoryData = [];
  public distanceData = [];
  public currentCategoryValues = [];
  public categoryFilterCount: number;

  public noSavedData = false;
  public loading: any;
  public amOnline = true;

  customAlertOptionsCat: any = {
    header: 'Categories',
    subHeader: 'Select categories to view',
    cssClass: 'ion-select-cats',
    translucent: true
  };

  customAlertOptionsDistance: any = {
    header: 'Distance',
    subHeader: 'Select how far away from you to search',
    translucent: true
  };

  constructor(
    private platform: Platform, private apiService: ApicallerService, private actionhelper: ActionhelperService,
    public modalController: ModalController, public actionSheetController: ActionSheetController,
    private favoriteService: FavoritehelperService, private filterhelper: FilterhelperService,
    private network: Network, public loadingController: LoadingController
  ) {

    // https://ionicallyspeaking.com/2017/01/17/ionic-2-ui-not-updating-after-change-to-model/
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  ngOnInit() {
    const disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      this.amOnline = false;
    });

    const connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        this.amOnline = true;
      }, 3000);
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
    await this.filterhelper.getMyLatLng();

    this.categoryData = await this.apiService.getFreshCategoryData();
    if (this.categoryData == null || this.categoryData === undefined || !this.amOnline) {
      this.categoryData = this.filterhelper.getCategoryData();
    } else {
      this.filterhelper.setCategoryData(this.categoryData);
    }

    this.distanceData = this.filterhelper.getDistanceData();


    this.filterhelper.getChosenCategories().then((categoriesResult) => {
      if (!categoriesResult) {
        this.currentCategoryValues = this.filterhelper.defaultCategoryValues;
        this.categoryFilterCount = this.currentCategoryValues.length;
      } else {
        this.currentCategoryValues = categoriesResult;
        this.categoryFilterCount = this.currentCategoryValues.length;
      }
    });

    this.filterhelper.getChosenDistance().then((distanceResult) => {
      if (!distanceResult) {
        this.distanceFilter = 20;
      } else {
        this.distanceFilter = distanceResult;
      }
    });

    this.apiService.retrieveData(this.amOnline).then((res) => {

      if (!res) {
        this.noSavedData = true;
      } else {
        this.noSavedData = false;
        this.masterDataList = res;

        this.finalFilterPass();
        this.loadMap();
      }
    }).catch((error) => {
      // console.log('HomePage Retrieval Error: ', error);
      this.noSavedData = true;
    }).finally(() => {
      this.loading.dismiss();
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

  finalFilterPass() {

    this.filterData = this.masterDataList.filter(curItem => {
      // Organization is required. This is a sanity check if it doesn't show up
      if (curItem.name) {

        if (curItem.distance && curItem.distance < this.distanceFilter) {

          const jsonString = JSON.stringify(curItem).toLowerCase();

          if (this.searchFilter === '' || jsonString.indexOf(this.searchFilter.toLowerCase()) > -1) {

            if (this.categoryFilterString === '' || this.categoryFilterString.indexOf(curItem.subcategory.name.toLowerCase()) > -1) {

              return true;
            }
          }
        }

        return false;
      }
    });

    // console.log('Local Arrays filtered. Final Count: ' + this.filterData.length);

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
      this.categoryFilterString = '';
      const categoryArray = this.categoryFilter.split(',');

      for (const curCategory of this.categoryData) {
        if (categoryArray.includes(curCategory.id.toString())) {
          // console.log('Found Category: ' + curCategory.type);
          this.categoryFilterString = this.categoryFilterString + ',' + curCategory.value.toLowerCase();
        }
      }
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

    this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(
      (data) => {
        console.log('My Location Clicked');
        // this.populateMapMakers();
      }
    );
  }

  async populateMapMakers() {
    if (this.map == null) {
      console.log('Map not ready yet!');
      // await this.loading.dismiss();
      return;
    }

    this.map.clear();
    this.map.setCameraZoom(15);

    console.log('Populating Markers. Total Markers: ' + this.filterData.length);

    for (const curLocation of this.filterData) {

      const curLatLng: any = {
        lat: curLocation.lat,
        lng: curLocation.lng
      };

      let myIcon = 'red';

      if (curLocation.subcategory.name.toLowerCase() === 'food pantry') {
        myIcon = 'blue';
      } else if (curLocation.subcategory.name.toLowerCase() === 'children and youth program') {
        myIcon = 'orange';
      } else if (curLocation.subcategory.name.toLowerCase() === 'community meal/soup kitchen') {
        myIcon = 'yellow';
      } else if (curLocation.subcategory.name.toLowerCase() === 'coalition member') {
        myIcon = 'cyan';
      } else if (curLocation.subcategory.name.toLowerCase() === 'holiday meal') {
        myIcon = 'green';
      } else if (curLocation.subcategory.name.toLowerCase() === 'child care') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'clothing') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'disability services') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'emergency housing') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'family support') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'furniture') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'legal aid') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'self help & support') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'social services') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'medical assistance') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'senior center/meal service') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'senior services') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'veggie mobile sprout®') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'veggie mobile') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'snap (food stamp) registration assistance') {
        myIcon = 'magenta';
      } else if (curLocation.subcategory.name.toLowerCase() === 'wic office/sign up locations') {
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


      this.map.getMyLocation();

      // show the infoWindow, this causes the last loaded marker to become the starting point
      // marker.showInfoWindow();

      marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {

        // This zone thing makes sure the UI keeps up with changes to the model somehow
        this.zone.run(() => {

          // Move the map camera to the location with animation
          this.map.animateCamera({
            target: curLatLng,
            zoom: 20,
            duration: 1000
          });

          this.presentActionSheet(curLocation);
        });

      });

      // If clicked it, display the alert
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {

        // This zone thing makes sure the UI keeps up with changes to the model somehow
        this.zone.run(() => {

          // Move the map camera to the location with animation
          this.map.animateCamera({
            target: curLatLng,
            zoom: 20,
            duration: 1000
          });

          this.presentActionSheet(curLocation);
        });

      });

    }

    await this.loading.dismiss();
  }

  async presentActionSheet(selectedItem) {

    if (selectedItem == null) {
      return;
    }
    this.favoriteService.isFavorite(selectedItem.id).then(async (favoriteResponse) => {

      const actionSheet = await this.actionSheetController.create({
        header: selectedItem.name,
        mode: 'ios',
        subHeader: selectedItem.hours_of_operation,
        cssClass: 'list-action-sheet',
        buttons: this.actionhelper.getActionMapping(selectedItem, favoriteResponse)
      });

      await actionSheet.present();

    });

  }

}
