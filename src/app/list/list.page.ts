import { Component, OnInit } from '@angular/core';
import { ApicallerService } from './../services/apicaller.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ActionhelperService } from '../services/actionhelper.service';
import { ModalPage } from '../modal/modal.page';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  private selectedItem: any;
  private filterData: any = [];
  private listData: any = [];
  private categoryTerm = '';
  private searchTerm = '';

  public items: Array<{ title: string; note: string; icon: string }> = [];

  constructor(private apiService: ApicallerService, public actionSheetController: ActionSheetController,
              private actionhelper: ActionhelperService, public modalController: ModalController) {


    this.apiService.getLocalData('specialkey-food').then((val) => {
      console.log('Listview: Initializing data');
      this.listData['specialkey-food'] = '';
      this.listData['specialkey-food'] = val;
      this.filterData = '';
      this.filterData = val;
    }).catch((error) => {
      console.log('get error for specialkey-food ', error);
    });
  }

  ngOnInit() {
  }

  resyncArrays(): void {
    console.log('Resynching Local Arrays');
    this.filterData = this.listData['specialkey-food'];
  }

  filterList(evt?) {
    this.resyncArrays();

    if (evt) {
      this.searchTerm = evt.srcElement.value;
    }

    const categories = this.categoryTerm.toLowerCase();

    if (!this.searchTerm && !categories) {
      console.log('Nothing to filter. Repopulating Map: ' + this.filterData.length);
      return;
    }

    this.filterData = this.filterData.filter(curItem => {
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
    console.log('Local Arrays filtered. Count: ' + this.filterData.length);
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


  doInfinite(event) {
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      // TODO Improve logic. This assumes EXACTLY 10 new entries will exist
      if (this.filterData.length === this.listData.length) {
        event.target.disabled = true;
      } else {
        const curLength = this.filterData.length;
        for (let i = curLength; i < curLength + 10; i++) {
          this.filterData.push(this.listData['specialkey-food'][i]);
        }
      }
    }, 500);
  }
}
