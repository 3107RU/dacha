import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ApiService, ApiEvent } from '../api.service'

@Component({
  selector: 'app-discovery',
  templateUrl: './discovery.component.html',
  styleUrls: ['./discovery.component.css']
})
export class DiscoveryComponent implements OnInit, OnDestroy {
  devices = [] as string[]
  selected = -1
  loading = false
  @Output() deviceSelected = new EventEmitter<string>()

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.on(ApiEvent.OnvifDiscoveryResult, this.onOnvifDiscoveryResult, this)
  }

  ngOnDestroy(): void {
    this.apiService.off(ApiEvent.OnvifDiscoveryResult, this.onOnvifDiscoveryResult, this)
  }

  startOnvifDiscovery() {
    this.devices = []
    this.loading = true
    this.selected = -1
    this.deviceSelected.emit(undefined)
    this.apiService.startOnvifDiscovery()
  }

  onOnvifDiscoveryResult(data: any) {
    if (!this.loading) return
    this.devices = data.deviceList
    this.loading = false
  }

  selectDevice(i: number, host: any) {
    this.selected = i
    this.deviceSelected.emit(host)
  }

  getHostName(device: string) {
    const url = new URL(device)
    return url.hostname
  }

}
