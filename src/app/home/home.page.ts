import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone
} from '@angular/core';
import {
  GoogleMap,
  Marker,
} from '@capacitor/google-maps';
import { Platform } from '@ionic/angular';
import { ApicallerService } from 'src/app/services/apicaller.service';
import { ModalController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { ActionhelperService } from 'src/app/services/actionhelper.service';
import { FilterhelperService } from 'src/app/services/filterhelper.service';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { LoadingController } from '@ionic/angular';
import { FavoritehelperService } from 'src/app/services/favoritehelper.service';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';
import { LatLng } from '@capacitor/google-maps/dist/typings/definitions';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage implements OnInit {
  @ViewChild('mapRef') mapRef: ElementRef;
  map: GoogleMap;

  public masterDataList: any = [];  // This array never changes
  public filterData: any = []; // This array is the one thats displayed

  public searchFilter = '';
  public categoryFilter = '';
  public categoryFilterString = '';
  public distanceFilter = 20;

  public categoryData = [];
  public distanceData = [];
  public currentCategoryValues = [];
  public categoryFilterCount: number;

  public noSavedData = false;
  public loading: any;
  public amOnline = true;
  public markerArray: Marker[];
  public markerStrings: string[];


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
    private network: Network, public loadingController: LoadingController, public ngZone: NgZone
  ) {
    this.markerStrings = [];
    this.markerArray = [];
  }
  
  async refreshMap() {
    await this.filterhelper.getMyLatLng();
    this.presentInformation();
  }

  async createMap() {
    await this.filterhelper.getMyLatLng();

    this.map = await GoogleMap.create({
      id: 'mapRef',
      element: this.mapRef.nativeElement,
      apiKey: environment.mapsKey,
      //forceCreate: true,
      config: {
        center: {
          lat: this.filterhelper.startingLatLng.lat,
          lng: this.filterhelper.startingLatLng.lng,
        },
        zoom: 15,
      },
    });
    
    this.map.enableCurrentLocation(true);

    this.map.setOnMyLocationButtonClickListener(async (marker) => {
      this.refreshMap();
    });

    this.map.setOnMarkerClickListener(async (marker) => {

      await this.map.setCamera({
        coordinate: {
          lat: marker.latitude,
          lng: marker.longitude
        },
        zoom: 15,
        animate: true,
        animationDuration: 1000
      });
      
      this.presentActionSheet(marker);
    });

    console.log("Map Ready");
  }

  ngOnDestroy() {
    console.log("boom")
    this.map.destroy();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
    console.log('Platform ready...');
    });
  }

  ionViewDidEnter () {
    console.log('View ready...');
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
      this.createMap();
      this.presentInformation();
  }
 
  async presentInformation() {
    await this.presentLoading();
    
    this.categoryData = await this.apiService.getFreshCategoryData();
    if (this.categoryData == null || this.categoryData === undefined || !this.amOnline) {
      this.categoryData = this.filterhelper.getCategoryData();
    } else {
      this.filterhelper.setCategoryData(this.categoryData);
    }

    this.distanceData = await this.filterhelper.getDistanceData();

    this.filterhelper.getChosenCategories().then((categoriesResult) => {
      if (!categoriesResult) {
        this.currentCategoryValues = this.filterhelper.defaultCategoryValues;
        this.categoryFilterCount = this.currentCategoryValues.length;
      } else {
        this.currentCategoryValues = categoriesResult;
        this.categoryFilterCount = this.currentCategoryValues.length;
      }
    });

    await this.filterhelper.getChosenDistance().then((distanceResult) => {
      if (!distanceResult) {
        this.distanceFilter = 20;
      } else {
        this.distanceFilter = distanceResult;
      }
    });

    await this.apiService.retrieveData(this.amOnline).then((res) => {

      if (!res) {
        this.noSavedData = true;
      } else {
        this.noSavedData = false;
        this.masterDataList = res;

        this.finalFilterPass();
        //this.createMap();
        //

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

    console.log('Local Arrays filtered. Final Count: ' + this.filterData.length);

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


  async populateMapMakers() {
    if (this.map == null) {
      console.log('Map not ready yet!');
      // await this.loading.dismiss();
      return;
    }

    if (this.markerStrings.length > 0) {
      console.log('removing old ones: ', this.markerStrings.length);
      await this.map.removeMarkers(this.markerStrings);
      this.markerStrings = [];
    }

    await this.map.setCamera({
      zoom: 15,

      coordinate: {
        lat: this.filterhelper.startingLatLng.lat,
        lng: this.filterhelper.startingLatLng.lng,
      }

    });
    console.log('1: ' + this.filterhelper.startingLatLng.lat);
    console.log('2: ' + this.filterhelper.startingLatLng.lng);
    console.log('Populating Markers. Total Markers: ' + this.filterData.length);
    this.markerArray = [];

    for (const curLocation of this.filterData) {
      
      const curLatLng: LatLng = {
        lat: Number(curLocation.lat),
        lng: Number(curLocation.lng),
      };

      // add a marker
      let marker: Marker = {
        title: curLocation.name,
        snippet: curLocation.line_1 + ' ' + curLocation.city + ' ' + curLocation.state + ' ' + curLocation.zip,

        coordinate: { lat: curLatLng.lat, lng: curLatLng.lng, }
      };


      let markerId = await this.map.addMarker(marker);

      (await this.markerStrings).push(markerId);
    }


    await this.loading.dismiss();
  }


  async presentActionSheet(marker) {
    if (marker == null) {
      return;
    }

    let selectedItem;

    for (const curLocation of this.filterData) {
      if (curLocation.lat == marker.latitude) {
        if (curLocation.lng == marker.longitude) {
          selectedItem = curLocation;
          break;
        }
      }
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
