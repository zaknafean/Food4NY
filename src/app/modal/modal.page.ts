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
    let counter = 0;

    // this.filterhelper.setCategoryData(this.categoryData);

    this.categoryData.forEach(element => {
      if (element.check === true) {
        counter++;
      }
    });

    const onClosedData: string = counter.toString();
    await this.modalController.dismiss(onClosedData);
  }
}
