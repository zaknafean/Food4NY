import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

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

  constructor(private iab: InAppBrowser) { }

  ngOnInit() {
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
