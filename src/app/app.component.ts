import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public selectedIndex = 0;
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
      title: 'Favorites',
      url: '/saved',
      icon: 'save'
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: 'settings'
    },
    {
      title: 'Help',
      url: '/help',
      icon: 'help-circle'
    },
    {
      title: 'About',
      url: '/about',
      icon: 'information-circle'
    }
  ];


  constructor(
    //private platform: Platform,
    //private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage
  ) {

  }

  async ngOnInit() {
    // If using a custom driver:
    // await this.storage.defineDriver(MyCustomDriver)
    await this.storage.create();

    // Fixes cutting off of header by android status 
    this.statusBar.hide();
    this.statusBar.show();
    this.statusBar.overlaysWebView(false);
  }
}
