import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ApicallerService } from './../services/apicaller.service';
import { ActionhelperService } from '../services/actionhelper.service';
import { Network } from '@ionic-native/network/ngx';
import { FilterhelperService } from '../services/filterhelper.service';
import { LoadingController } from '@ionic/angular';
import { FavoritehelperService } from '../services/favoritehelper.service';


@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  public filterData: any = []; // This array changes constantly
  public masterDataList: any = []; // This array never changes
  public dataList: any = []; // This array is the one thats displayed

  public searchFilter = '';
  public categoryFilter = '';
  public distanceFilter = 20;

  private infiniteScrollCounter = 25;

  public categoryData = [];
  public distanceData = [];
  public currentCategoryValues = [];
  public categoryFilterCount: number;

  public categoryFilterString = '';

  public noSavedData = false;
  public loading: any;
  public amOnline = true;

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
    private actionhelper: ActionhelperService, public modalController: ModalController, private favoriteService: FavoritehelperService,
    // tslint:disable-next-line:align
    private filterhelper: FilterhelperService, private network: Network, public loadingController: LoadingController) {

  }

  ngOnInit() {
    const disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.amOnline = false;
    });

    const connectSubscription = this.network.onConnect().subscribe(() => {
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        this.amOnline = true;
      }, 3000);
    });

    this.presentInformation();
  }

  async presentInformation() {
    await this.presentLoading();

    // First lets get your current location
    await this.filterhelper.getMyLatLng();


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

    this.apiService.retrieveData(this.amOnline).then((res) => {

      if (!res) {
        // console.log('Error retrieving fresh data!');
        this.noSavedData = true;
      } else {
        this.noSavedData = false;
        // console.log('Listview: Initializing data ' + res.length + ' results total');

        this.masterDataList = res;

        for (let i = 0; i < this.masterDataList.length; i++) {
          const curItem = this.masterDataList[i];
          // this.calcDistance(curItem);

          // Infinite load means we are moving data around more
          if (i < 25) {
            this.dataList.push(this.masterDataList[i]);
          }
          this.filterData.push(this.masterDataList[i]);
        }

        this.finalFilterPass();
      }
    }).catch((error) => {
      console.log('ListPage Retrieval Error: ', error);
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

  async finalFilterPass() {

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
    // console.log('sync complete=Total:' + this.filterData.length + ' -> ' + this.dataList.length);
    console.log('Local Arrays filtered. Count: ' + this.filterData.length);
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
          this.categoryFilterString = this.categoryFilterString + ',' + curCategory.value.toLowerCase();
        }
      }
    }
  }

  filterByDistance(evt?) {

    if (evt) {
      this.distanceFilter = Number(evt.srcElement.value);
    }

    this.finalFilterPass();
  }

  async presentActionSheet(selectedItem) {

    if (selectedItem == null) {
      return;
    }
    this.favoriteService.isFavorite(selectedItem.id).then(async (favoriteResponse) => {

      const actionSheet = await this.actionSheetController.create({
        header: selectedItem.name,
        mode: 'ios',
        cssClass: 'list-action-sheet',
        subHeader: selectedItem.hours_of_operation,
        buttons: this.actionhelper.getActionMapping(selectedItem, favoriteResponse)
      });

      await actionSheet.present();

    });

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

  doRefresh(event) {

    setTimeout(() => {
      this.presentInformation();
      event.target.complete();
    }, 2000);
  }
}
