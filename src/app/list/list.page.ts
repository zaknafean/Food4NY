import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ApicallerService } from './../services/apicaller.service';
import { ActionhelperService } from '../services/actionhelper.service';
import { Network } from '@ionic-native/network/ngx';
import { FilterhelperService } from '../services/filterhelper.service';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  public filterData: any = []; // This array changes constantly
  private masterDataList: any = []; // This array never changes
  public dataList: any = []; // This array is the one thats displayed

  private searchFilter = '';
  private categoryFilter = '';
  private distanceFilter = 20;

  private infiniteScrollCounter = 25;

  private categoryData = [];
  private distanceData = [];
  private currentCategoryValues = [];
  private categoryFilterCount: number;

  private categoryFilterString = '';

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

  constructor(private apiService: ApicallerService, public actionSheetController: ActionSheetController,
    // tslint:disable-next-line:align
    private actionhelper: ActionhelperService, public modalController: ModalController,
    // tslint:disable-next-line:align
    private filterhelper: FilterhelperService, private network: Network, public loadingController: LoadingController) {

  }

  ngOnInit() {
    const disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
    });

    this.presentInformation();
  }

  async presentInformation() {
    await this.presentLoading();

    // First lets get your current location
    this.filterhelper.getMyLatLng().then((resp) => {
      // console.log('Got Lat/LNG...');
      this.categoryData = this.filterhelper.getCategoryData();
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

      this.apiService.retrieveData().then(async (res) => {

        if (!res) {
          console.log('Error retrieving fresh data!');
          await this.loading.dismiss();
          this.noSavedData = true;
        } else {
          console.log(res);
          console.log('Listview: Initializing data ' + res.length);

          this.masterDataList = res;

          for (let i = 0; i < this.masterDataList.length; i++) {
            const curItem = this.masterDataList[i];
            this.calcDistance(curItem);

            // Infinite load means we are moving data around more
            if (i < 25) {
              this.dataList.push(this.masterDataList[i]);
            }
            this.filterData.push(this.masterDataList[i]);
          }

          this.finalFilterPass().then(async () => { await this.loading.dismiss(); });
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

  async finalFilterPass() {
    console.log('Checking Filter: ' + this.masterDataList.length);
    console.log('Distance Filter=' + this.distanceFilter);
    console.log('Category Filter=' + this.categoryFilter);
    console.log(' Search  Filter=' + this.searchFilter);

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

    // Save max length of loaded data
    const j = Math.max(this.dataList.length, this.infiniteScrollCounter);
    this.dataList = [];

    let i = 0;

    for (i = 0; i < j; i++) {
      if (i >= this.filterData.length) {
        break;
      }

      this.dataList.push(this.filterData[i]);
    }

    // await this.loading.dismiss();
    console.log('sync complete=Total:' + this.filterData.length + ' ->' + this.dataList.length);
    console.log('Local Arrays filtered by search. Count: ' + this.filterData.length);
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

      const categoryArray = this.categoryFilter.split(',');

      for (const curCategory of this.categoryData) {
        if (categoryArray.includes(curCategory.id.toString())) {
          // console.log('Found Category: ' + curCategory.type);
          this.categoryFilterString = this.categoryFilterString + ',' + curCategory.value.toLowerCase();
        }
      }
    }
  }

  filterByDistance(evt?) {

    if (evt) {
      this.distanceFilter = Number(evt.srcElement.value);
      console.log(this.distanceFilter + ' has changed distance filter value');
    }

    this.finalFilterPass();
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

  doInfinite(event) {
    setTimeout(() => {

      for (let i = 0; i < 25; i++) {
        if (this.dataList.length >= this.filterData.length) {
          break;
        }

        this.dataList.push(this.filterData[this.dataList.length]);
      }
      event.target.complete();

      if (this.dataList.length === this.masterDataList.length) {
        event.target.disabled = true;
      }
    }, 500);
  }
}
