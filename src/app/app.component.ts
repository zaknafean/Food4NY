import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Environment } from '@ionic-native/google-maps/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {
  public appPages = [
    {
      title: 'Map',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Directory',
      url: '/list',
      icon: 'list'
    },
    {
      title: 'Settings',
      url: '/stub',
      icon: 'settings'
    },
    {
      title: 'Help',
      url: '/stub',
      icon: 'help-circle'
    },
    {
      title: 'About',
      url: '/stub',
      icon: 'information-circle'
    }
  ];


  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      Environment.setEnv({
        // Api key for your server
        // (Make sure the api key should have Website restrictions for your website domain only)
        API_KEY_FOR_BROWSER_RELEASE: 'AIzaSyAajY7ixSZ0sxYMg38bbn8xb6JRZROYasQ',

        // Api key for local development
        // (Make sure the api key should have Website restrictions for 'http://localhost' only)
        API_KEY_FOR_BROWSER_DEBUG: 'AIzaSyAajY7ixSZ0sxYMg38bbn8xb6JRZROYasQ'
      });


      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

}
