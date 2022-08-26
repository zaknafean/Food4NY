import { Component, OnInit } from '@angular/core';
import { FavoritehelperService } from '../services/favoritehelper.service';
import { ApicallerService } from '../services/apicaller.service';
import { LoadingController, ActionSheetController } from '@ionic/angular';
import { ActionhelperService } from '../services/actionhelper.service';
import { Network } from '@awesome-cordova-plugins/network/ngx';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.page.html',
  styleUrls: ['./saved.page.scss'],
})
export class SavedPage implements OnInit {

  public noSavedData: boolean;
  public noFavoriteData: boolean;
  public loading: any;
  public amOnline = true;

  public masterDataList: any = []; // This array never changes
  public dataList: any = []; // This array is the one thats displayed

  constructor(
    private favoriteService: FavoritehelperService, private apiService: ApicallerService,
    private actionhelper: ActionhelperService, public actionSheetController: ActionSheetController,
    public loadingController: LoadingController, private network: Network
  ) { }

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
    this.favoriteService.getAllFavorites().then((favoriteResponse) => {

      if (!favoriteResponse) {
        this.noFavoriteData = true;
      } else {

        this.apiService.retrieveData(this.amOnline).then((res) => {

          if (!res) {
            this.noSavedData = true;
          } else {

            this.masterDataList = res;

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < this.masterDataList.length; i++) {
              const curItem = this.masterDataList[i];

              if (favoriteResponse.includes(curItem.id)) {
                this.dataList.push(this.masterDataList[i]);
              }

            }
          }
        });

      }
    }).finally(async () => {
      await this.loading.dismiss();
    });
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

  async presentLoading() {
    // Prepare a loading controller
    this.loading = await this.loadingController.create({
      message: 'Loading...'
    });
    // Present the loading controller
    await this.loading.present();
  }

  doRefresh(event) {

    setTimeout(() => {
      this.presentInformation();
      event.target.complete();
    }, 2000);
  }

}
