import { Component, OnInit, OnDestroy } from '@angular/core'
import { ApiService, ApiEvent } from './api.service'

const APP_VERSION = '1.0.0'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = `Dacha ${APP_VERSION}`
  version = 'connecting...'

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.on(ApiEvent.Connect, this.onConnect, this)
    this.apiService.on(ApiEvent.Disconnect, this.onDisconnect, this)
    this.apiService.on(ApiEvent.Welcome, this.onWelcome, this)
  }

  ngOnDestroy(): void {
    this.apiService.off(ApiEvent.Connect, this.onConnect, this)
    this.apiService.off(ApiEvent.Disconnect, this.onDisconnect, this)
    this.apiService.off(ApiEvent.Welcome, this.onWelcome, this)
  }

  onConnect() {
    this.version = 'connected'
    this.apiService.sendHello(APP_VERSION)
  }

  onDisconnect() {
    this.version = 'connecting...'
  }

  onWelcome(data: any) {
    this.version = `Server version: ${data.version}`
  }
}
