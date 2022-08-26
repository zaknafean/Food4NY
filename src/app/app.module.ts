import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
//import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClientModule, HttpBackend, HttpXhrBackend } from '@angular/common/http';
import { NativeHttpModule, NativeHttpBackend, NativeHttpFallback } from 'ionic-native-http-connection-backend';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';

//import { Geolocation } from '@capacitor/geolocation';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { ModalPageModule } from './modal/modal.module';
import { Platform } from '@ionic/angular';



@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NativeHttpModule,
    HttpClientModule,
    ModalPageModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot()
  ],
  providers: [
    StatusBar,
    //Geolocation,
    HTTP,
    NativeGeocoder,
    CallNumber,
    InAppBrowser,
    Network,
    { provide: HttpBackend, useClass: NativeHttpFallback, deps: [Platform, NativeHttpBackend, HttpXhrBackend] },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }