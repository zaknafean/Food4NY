import { Injectable, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { FavoritehelperService } from './favoritehelper.service';

@Injectable({
  providedIn: 'root'
})

export class ActionhelperService {


  options: InAppBrowserOptions = {
    location: 'yes', // Or 'no'
    hidden: 'no', // Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes', // Android only ,shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', // Android only
    closebuttoncaption: 'Close', // iOS only
    disallowoverscroll: 'no', // iOS only
    toolbar: 'yes', // iOS only
    enableViewportScale: 'no', // iOS only
    allowInlineMediaPlayback: 'no', // iOS only
    presentationstyle: 'pagesheet', // iOS only
    fullscreen: 'yes', // Windows only
  };

  public favoritesList: any = []; // This array is full of just numbers

  constructor(private callNumber: CallNumber, private iab: InAppBrowser, private favoriteService: FavoritehelperService) { }


  getActionMapping(selectedItem, isThisaFavorite): Array<any> {

    const actionSheetOptions = [];

    // Everything has an address
    actionSheetOptions.push({
      text: 'Get Directions',
      icon: 'map',
      handler: () => {
        console.log('Action Item: Directions');
        const addresss = selectedItem.line_1 + ' ' + selectedItem.city + ' ' + selectedItem.state + ' ' + selectedItem.zip;
        this.openWithSystemBrowser('https://maps.google.com/maps?q=' + addresss);
      }
    });

    // cancel is mandatory for ios
    actionSheetOptions.push({
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Action Item: Cancel');
      }
    });

    // Handle Favorite functionality
    if (!isThisaFavorite) {
      actionSheetOptions.push({
        text: 'Favorite',
        icon: 'heart-outline',
        handler: () => {
          console.log('Action Item: Save');
          this.favoriteService.favoriteOrganization(selectedItem.id);
        }
      });
    }

    // Handle Favorite functionality
    if (isThisaFavorite) {
      actionSheetOptions.push({
        text: 'Unfavorite',
        icon: 'heart',
        handler: () => {
          console.log('Action Item: Unsave');
          this.favoriteService.unfavoriteOrganization(selectedItem.id);
        }
      });
    }

    // If there is a phone number, add a call option
    if (selectedItem.phone != null && selectedItem.phone !== '') {
      actionSheetOptions.push({
        text: 'Call ' + selectedItem.phone,
        icon: 'call',
        handler: () => {
          console.log('Action Item: Call');
          this.callNumber.callNumber(selectedItem.phone, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
        }
      });
    }

    // If there is a website, add a link to it
    if (selectedItem.website != null && selectedItem.website !== '' && selectedItem.website !== 'N/A') {
      actionSheetOptions.push({
        text: 'Visit Website',
        icon: 'document',
        handler: () => {
          console.log('Action Item: Visit');
          this.openWithSystemBrowser(selectedItem.website);
        }
      });
    }

    return actionSheetOptions;
  }

  public openWithInAppBrowser(url: string) {
    const target = '_blank';
    this.iab.create(url, target, this.options);
  }

  public openWithSystemBrowser(url: string) {
    const target = '_system';
    this.iab.create(url, target, this.options);
  }

}
