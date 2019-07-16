import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterhelperService {

  categoryData = [];

  constructor() {

    this.categoryData = [{
      check: true,
      type: 'Food Pantry'
    }, {
      check: true,
      type: 'SNAP'
    }, {
      check: true,
      type: 'Veggie Mobile'
    }, {
      check: true,
      type: 'Community Meals'
    }, {
      check: true,
      type: 'Medical Assistance'
    },
    {
      check: true,
      type: 'Misc'
    }];

  }

  getCategoryData(): Array<any> {

    return this.categoryData;

  }

  setCategoryData(newArray) {
    this.categoryData = newArray;
  }
}
