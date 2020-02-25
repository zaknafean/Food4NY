import { Component, OnInit } from '@angular/core';
import { FavoritehelperService } from '../services/favoritehelper.service';
import { ApicallerService } from '../services/apicaller.service';
import { LoadingController, ActionSheetController } from '@ionic/angular';
import { ActionhelperService } from '../services/actionhelper.service';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.page.html',
  styleUrls: ['./saved.page.scss'],
})
export class SavedPage implements OnInit {

  noSavedData: boolean;
  noFavoriteData: boolean;
  loading: any;

  private masterDataList: any = []; // This array never changes
  public dataList: any = []; // This array is the one thats displayed

  constructor(private favoriteService: FavoritehelperService, private apiService: ApicallerService,
    // tslint:disable-next-line:align
    private actionhelper: ActionhelperService, public actionSheetController: ActionSheetController,
    // tslint:disable-next-line:align
    public loadingController: LoadingController) { }

  ngOnInit() {
    this.presentInformation();
  }

  async presentInformation() {
    await this.presentLoading();

    // First lets get your current location
    this.favoriteService.getAllFavorites().then((favoriteResponse) => {

      if (!favoriteResponse) {
        console.log('No favorites data exists!');
        this.noFavoriteData = true;
      } else {
        console.log(favoriteResponse);
        console.log('Savedview: Initializing data ' + favoriteResponse.length);

        this.apiService.retrieveData().then(async (res) => {

          if (!res) {
            console.log('Error retrieving fresh data!');
            await this.loading.dismiss();
            this.noSavedData = true;
          } else {

            console.log('Savedview: Initializing data ' + res.length);

            this.masterDataList = res;

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
    console.log('ActionSheet: ' + selectedItem.name);

    if (selectedItem == null) {
      console.log('Error: No item selected to show options for');
      return;
    }
    this.favoriteService.isFavorite(selectedItem.id).then(async (favoriteResponse) => {

      const actionSheet = await this.actionSheetController.create({
        header: selectedItem.name,
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

}
