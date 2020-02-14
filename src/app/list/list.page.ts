import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ApicallerService } from './../services/apicaller.service';
import { ActionhelperService } from '../services/actionhelper.service';
import { Network } from '@ionic-native/network/ngx';
import { FilterhelperService } from '../services/filterhelper.service';
import { LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

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

  private categoryFilterCount: number;
  private categoryData = [];
  private distanceData = [];

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

    this.filterhelper.getMyLatLng().then((resp) => {

      this.categoryData = this.filterhelper.getCategoryData();
      this.categoryFilterCount = this.filterhelper.getCategoryCounter();
      this.distanceData = this.filterhelper.getDistanceData();

      this.apiService.getLocalData('specialkey-food').then(async (val) => {

        if (!val) {
          console.log('Error retreiving local data!');
          await this.loading.dismiss();
          this.noSavedData = true;
        } else {
          console.log('Listview: Initializing data' + val.length);
          this.noSavedData = false;
          this.masterDataList = val;

          for (let i = 0; i < this.masterDataList.length; i++) {
            const curItem = this.masterDataList[i];
            this.calcDistance(curItem);


            if (i < 25) {
              this.dataList.push(this.masterDataList[i]);
            }
            this.filterData.push(this.masterDataList[i]);
          }

          this.finalFilterPass();
        }
      }).catch(async (error) => {
        console.log('get error for specialkey-food ', error);
        await this.loading.dismiss();
        this.noSavedData = true;
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
    console.log('Distance Filter=' + this.distanceFilter);
    console.log('Category Filter=' + this.categoryFilter);
    console.log(' Search  Filter=' + this.searchFilter);

    this.filterData = this.masterDataList.filter(async curItem => {
      // Organization is required. This is a sanity check if it doesn't show up
      if (curItem.name) {

        if (curItem.distance && curItem.distance < this.distanceFilter) {

          const jsonString = JSON.stringify(curItem).toLowerCase();

          if (this.searchFilter === '' || jsonString.indexOf(this.searchFilter.toLowerCase()) > -1) {

            if (this.categoryFilter === '' || this.categoryFilter.indexOf(curItem.subcategory.name.toLowerCase()) > -1) {
              await this.loading.dismiss();
              return true;
            }
          }
        }
        await this.loading.dismiss();
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
