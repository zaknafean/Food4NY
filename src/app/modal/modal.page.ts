import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FilterhelperService } from '../services/filterhelper.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  categoryData = [];

  constructor(private modalController: ModalController, private filterhelper: FilterhelperService,
              private navParams: NavParams) {  }

  ngOnInit() {
    this.categoryData = this.filterhelper.getCategoryData();
  }

  async closeModal() {
    let retVal = '';

    this.filterhelper.setCategoryData(this.categoryData);

    this.categoryData.forEach(element => {
      if (element.check === true) {
        retVal = retVal + ',' + element.type;
      }
    });

    const onClosedData: string = retVal;
    await this.modalController.dismiss(onClosedData);
  }
}
