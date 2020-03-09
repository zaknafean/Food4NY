import { Component, OnInit } from '@angular/core';
import { FilterhelperService } from '../services/filterhelper.service';
import { ApicallerService } from '../services/apicaller.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public categoryFilter = '';
  public distanceFilter = 20;

  public categoryData = [];
  public distanceData = [];
  public currentCategoryValues = [];
  public categoryFilterCount: number;

  constructor(private filterhelper: FilterhelperService, public toastController: ToastController) { }

  ngOnInit() {

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

  }

  compareWithFn = (o1, o2) => {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  async updateCategoryPreferences(evt?) {
    if (evt) {
      this.categoryFilterCount = evt.srcElement.value.length;
      console.log('Category Filter has changed: ' + this.categoryFilterCount);

      this.filterhelper.setChosenCategories(evt.srcElement.value);
      this.presentToast();
    }
  }

  updateDistancePreferences(evt?) {
    if (evt) {
      this.distanceFilter = Number(evt.srcElement.value);
      console.log('Distance Filter has changed: ' + this.distanceFilter);

      this.filterhelper.setChosenDistance(this.distanceFilter);
      this.presentToast();
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Your settings have been saved.',
      duration: 2000
    });
    toast.present();
  }

}
