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
} from '@ionic-native/google-maps';
import { ApicallerService } from './../services/apicaller.service';
import { ModalController } from '@ionic/angular';
import { ModalPage } from '../modal/modal.page';
import { ActionSheetController } from '@ionic/angular';
import { ActionhelperService } from '../services/actionhelper.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  map: GoogleMap;

  allData = [];
  curData = [];

  searchTerm = '';
  categoryTerm = '';
  selectedItem: any;

  constructor(private platform: Platform, private apiService: ApicallerService, private actionhelper: ActionhelperService,
              public modalController: ModalController, public actionSheetController: ActionSheetController) {

    this.selectedItem = {
      Category: '',
      Organization: 'Select a marker for more details',
      Info: '',
      County: '',
      Address: '',
      Street: '',
      City: '',
      State: '',
      Zip: '',
      Phone: '',
      Hours: '',
      Notes: '',
      Coalition: 'yes', // yes or no
      Website: '',
      Cost: 'N/A', // pantries don't have this. Community meals might
      Latitude: 42.7978143,
      Longitude: -73.9644236,
      Updated: '7/10/2019'
    };

  }

  ngOnInit() {
    this.platform.ready().then(() => {

      // this.getValue('specialkey-food');
      this.getValueDemoData();

    });
  }

  // Attempts to get a key/value pair
  getValue(key: string) {

    this.apiService.getLocalData(key).then((val) => {
      console.log('Verifying data ' + key + ' ', val);
      this.allData[key] = '';
      this.allData[key] = val;
      this.resyncArrays();
    }).catch((error) => {
      console.log('get error for ' + key + '', error);
    }).finally(() => {
      this.loadData();
    });

  }

  getValueDemoData() {

    const test: any = [{
      Category: 'Food Pantry',
      Organization: 'The Tearcell Studio',
      Info: 'Do not call. Just show up.',
      County: 'Schenectady',
      Address: '2000 Broadway, bev NY, 90210',
      Street: '2000 Broadway',
      City: 'bev',
      State: 'NY',
      Zip: '90210',
      Phone: '555-555-5555',
      Hours: 'Open 7/11',
      Notes: 'A note place holder',
      Coalition: 'yes',
      Website: 'https://tearcell.com/demo',
      Cost: 'N/A',
      Latitude: 42.7978143,
      Longitude: -73.9644236,
      Updated: '7/10/2019'
    },
    {
      Category: 'Food Pantry',
      Organization: 'Bellvue Reformed Church Little Free Food Pantry',
      Info: 'Please come take whatever food you need from the cabinet; no ID/paperwork.',
      County: 'Schenectady',
      Address: '2000 Broadway, Schenectady,NY, 12306',
      Street: '2000 Broadway',
      City: 'Schenectady',
      State: 'NY',
      Zip: '12306',
      Phone: '',
      Hours: 'Open 24/7',
      Notes: 'A note place holder',
      Coalition: 'yes',
      Website: 'http://bellevuereformed.org/',
      Cost: 'N/A',
      Latitude: 42.8061850,
      Longitude: -73.9338490,
      Updated: '7/10/2019'
    },
    {
      Category: 'Food Pantry',
      Organization: 'Braman Hall',
      Info: '',
      County: 'Schenectady',
      Address: '7967 Route 30, Duanesburg NY, 12056',
      Street: '7967 Route 30',
      City: 'Duanesburg',
      State: 'NY',
      Zip: '12056',
      Phone: '518-956-1758',
      Hours: 'Thursdays 1-3 PM; Wednesdays 5-7 PM; call for other appointments',
      Notes: 'Limit of once per month',
      Coalition: 'yes',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.8184851,
      Longitude: -74.1991839,
      Updated: '7/10/2019'
    },
    {
      Category: 'Food Pantry',
      Organization: 'Lighthouse',
      Info: 'Need proof of address',
      County: 'Schenectady',
      Address: '4780 Duanesburg Rd., Princetown NY, 12056',
      Street: '4780 Duanesburg Rd.',
      City: 'Princetown',
      State: 'NY',
      Zip: '12056',
      Phone: '518-355-2277',
      Hours: 'Call for an appointment',
      Notes: 'A note place holder',
      Coalition: 'yes',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.7728294,
      Longitude: -74.0966285,
      Updated: '7/10/2019'
    },
    {
      Category: 'Food Pantry',
      Organization: 'Our Lady of Fatima',
      Info: '',
      County: 'Schenectady',
      Address: '1735 Alexander Rd, Delanson NY, 90210',
      Street: '1735 Alexander Rd',
      City: 'Delanson',
      State: 'NY',
      Zip: '12053',
      Phone: '518-895-2788',
      Hours: 'By appointment only',
      Notes: 'Can visit once a month Duanesburg, Delanson, QuakerStreet, Esperance and Mariaville areas only',
      Coalition: 'yes',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.7498046,
      Longitude: -74.1869729,
      Updated: '7/10/2019'
    },
    {
      Category: 'Food Pantry',
      Organization: 'Trinity Baptist Church',
      Info: '',
      County: 'Schenectady',
      Address: '2635 Balltown Road, Schenectady NY, 12309',
      Street: '2635 Balltown Road',
      City: 'Schenectady',
      State: 'NY',
      Zip: '12309',
      Phone: '518-393-2506',
      Hours: '1st and 3rd Thursday 7-8 pm',
      Notes: 'Please use back entrance of the building',
      Coalition: 'yes',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.8355924,
      Longitude: -73.8927505,
      Updated: '7/10/2019'
    },
    {
      Category: 'Community Meals',
      Organization: 'Christ Centered Unity Missionary Baptist',
      Info: '',
      County: 'Schenectady',
      Address: '113 South Brandwine Ave, Schenectady NY, 12307',
      Street: '113 South Brandwine Ave',
      City: 'Schenectady',
      State: 'NY',
      Zip: '12307',
      Phone: 'Call 2-1-1 to find the site closest to you',
      Hours: '07/05-8/19/2016 Lunch: 11:30 am -12:45 pm',
      Notes: 'SICM Summer Meal site; children 18 and under; no sign up necessary',
      Coalition: 'yes',
      Website: 'http://www.sicm.us/Programs%20Summer%20Lunch.html',
      Cost: 'N/A',
      Latitude: 42.7998010,
      Longitude: -73.9284880,
      Updated: '7/10/2019'
    },
    {
      Category: 'Misc',
      Organization: 'CVS PHARMACY 5045*',
      Info: '',
      County: 'Schenectady',
      Address: '2617 Hamburg Street, Schenectady NY, 12303',
      Street: '2617 Hamburg Street',
      City: 'Schenectady',
      State: 'NY',
      Zip: '12303',
      Phone: '',
      Hours: '',
      Notes: '',
      Coalition: 'no',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.7770170,
      Longitude: -73.9333660,
      Updated: '7/10/2019'
    },
    {
      Category: 'Community Meals',
      Organization: 'Freihofer\'s Bakery Outlet',
      Info: '',
      County: 'Schenectady',
      Address: '1874 State St, Schenectady NY, 12304',
      Street: '1874 State St',
      City: 'Schenectady',
      State: 'NY',
      Zip: '12304',
      Phone: '',
      Hours: '',
      Notes: 'Bakery',
      Coalition: 'no',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.7778348,
      Longitude: -73.9011379,
      Updated: '7/10/2019'
    },
    {
      Category: 'SNAP',
      Organization: 'Ocean State Job Lot 502*',
      Info: 'Do not call. Just show up.',
      County: 'Schenectady',
      Address: '2330 Watt Street, Schenectady NY, 12304',
      Street: '2330 Watt Street',
      City: 'Schenectady',
      State: 'NY',
      Zip: '12304',
      Phone: '',
      Hours: '',
      Notes: '',
      Coalition: 'yes',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.7841153,
      Longitude: -73.9184434,
      Updated: '7/10/2019'
    },
    {
      Category: 'Veggie Mobile',
      Organization: 'Concerned for the Hungry',
      Info: '',
      County: 'Schenectady',
      Address: '1252 Albany Street, Schenectady NY, 12304',
      Street: '1252 Albany Street',
      City: 'Schenectady',
      State: 'NY',
      Zip: '12304',
      Phone: '',
      Hours: '',
      Notes: 'Thanksgiving',
      Coalition: 'yes',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.7966870,
      Longitude: -73.9248190,
      Updated: '7/10/2019'
    },
    {
      Category: 'Community Meals',
      Organization: 'Scotia-Glenville',
      Info: '',
      County: 'Schenectady',
      Address: '132 Mohawk Ave., Scotia NY, 12302',
      Street: '132 Mohawk Ave.',
      City: 'Scotia',
      State: 'NY',
      Zip: '12302',
      Phone: 'Office: 518-399-9426, Tim Horn 518-423-4132, Kelly Gibbons 518-588-82',
      Hours: 'Tuesday , 5:30p.m.-7p.m. Friday ,9a.m.-11a.m.',
      Notes: 'For residents of Scotia and Glenville only, once/month ',
      Coalition: 'yes',
      Website: '',
      Cost: 'N/A',
      Latitude: 42.8263140,
      Longitude: -73.9630940,
      Updated: '7/10/2019'
    }
    ];

    this.apiService.setLocalData('food', test);
    this.allData['specialkey-food'] = '';
    this.allData['specialkey-food'] = test;
    this.resyncArrays();
    this.loadData();
  }

  loadData(refresh = false) {
    if (this.allData['specialkey-food'] == null || this.allData['specialkey-food'].length < 1 || refresh === true) {
      console.log('Local Data Not found. Retrieving New Data');

      this.apiService.retrieveData().subscribe((res) => {

        this.apiService.getLocalData('specialkey-food').then((val) => {
          this.allData['specialkey-food'] = '';
          this.allData['specialkey-food'] = val;
          this.resyncArrays();
          this.loadMap();
        }).catch((error) => {
          console.log('get error for specialkey-food ', error);
        });
      });
    } else {
      console.log('Local data already loaded- count: ' + this.allData['specialkey-food'].length + '.');
      this.loadMap();
    }

  }

  resyncArrays(): void {
    console.log('Resynching Local Arrays');
    this.curData = this.allData['specialkey-food'];
  }

  filterList(evt?) {
    this.resyncArrays();

    if (evt) {
      this.searchTerm = evt.srcElement.value;
    }

    const categories = this.categoryTerm.toLowerCase();

    if (!this.searchTerm && !categories) {
      console.log('Nothing to filter. Repopulating Map: ' + this.curData.length);
      this.populateMapMakers();
      return;
    }

    this.curData = this.curData.filter(curItem => {
      // Organization is required. This is a sanity check if it doesn't show up
      if (curItem.Organization) {

        if (this.searchTerm === '' || curItem.Organization.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1) {

          if (categories === '' || categories.indexOf(curItem.Category.toLowerCase()) > -1) {

            return true;
          }
        }

        return false;
      }
    });
    console.log('Local Arrays filtered. Count: ' + this.curData.length);
    this.populateMapMakers();
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
          lat: this.curData[0].Latitude,
          lng: this.curData[0].Longitude
        },
        zoom: 18,
        tilt: 30,
      },
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);
    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(
      (data) => {
        console.log('Map Ready', data);
        this.populateMapMakers();
      }
    );

  }


  populateMapMakers() {
    this.map.clear();
    console.log('Populating Markers. Total Markers: ' + this.curData.length);

    for (const curLocation of this.curData) {

      const curLatLng: any = {
        lat: curLocation.Latitude,
        lng: curLocation.Longitude
      };

      let myIcon = 'red';

      if (curLocation.Cat === 'Food Pantries') {
        myIcon = 'blue';
      } else if (curLocation.Cat === 'Community Meals') {
        myIcon = 'orange';
      } else if (curLocation.Cat === 'SNAP') {
        myIcon = 'yellow';
      } else if (curLocation.Org === 'Medical Assistance') {
        myIcon = 'cyan';
      } else if (curLocation.Cat === 'Veggie Mobile') {
        myIcon = 'green';
      } else if (curLocation.Cat === 'Misc') {
        myIcon = 'magenta';
      }

      // add a marker
      const marker: Marker = this.map.addMarkerSync({
        // title: curLocation.Org,
        // snippet: 'You are here.',

        position: curLatLng,
        animation: GoogleMapsAnimation.BOUNCE,
        icon: myIcon
      });

      // If clicked it, display the alert
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {

        // Move the map camera to the location with animation
        this.map.animateCamera({
          target: curLatLng,
          zoom: 18,
          duration: 5000

        });

        this.selectedItem = curLocation;
      });

    }
  }


  async openModal() {

    const modal = await this.modalController.create({
      component: ModalPage
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.categoryTerm = dataReturned.data;
        this.filterList();
      }
    });

    return await modal.present();
  }

  async presentActionSheet(selectedItem) {
    console.log('ActionSheet: ' + selectedItem.Organization);

    if (selectedItem == null) {
      console.log('Error: No item selected to show options for');
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: selectedItem.Organization,
      buttons: this.actionhelper.getActionMapping(selectedItem)
    });

    await actionSheet.present();
  }

}