import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IonicStorageModule } from '@ionic/storage';
// import { CacheModule } from 'ionic-cache-observable';
// import { HttpClientModule } from '@angular/common/http';
import { HttpBackend, HttpXhrBackend } from '@angular/common/http';
import { NativeHttpModule, NativeHttpBackend, NativeHttpFallback } from 'ionic-native-http-connection-backend';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { ModalPageModule } from './modal/modal.module';
import { Platform } from '@ionic/angular';



@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // HttpClientModule,
    NativeHttpModule,
    // CacheModule,
    ModalPageModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot()
  ],
  providers: [
    StatusBar,
    Geolocation,
    NativeGeocoder,
    CallNumber,
    InAppBrowser,
    Network,
    SplashScreen,
    { provide: HttpBackend, useClass: NativeHttpFallback, deps: [Platform, NativeHttpBackend, HttpXhrBackend] },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
