import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { DiscoveryComponent } from './discovery/discovery.component';
import { CameraComponent } from './camera/camera.component';
import { AddCameraComponent } from './add-camera/add-camera.component';

const socketioConfig: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    DiscoveryComponent,
    CameraComponent,
    AddCameraComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(socketioConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
