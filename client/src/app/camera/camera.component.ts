import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService, ApiEvent } from '../api.service'

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit, OnDestroy, OnChanges {

  @Input() device: any
  login = ''
  password = ''
  loading = false
  settings: any

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.on(ApiEvent.OnvifCameraSettingsResult, this.OnvifCameraSettingsResult, this)
  }

  ngOnDestroy(): void {
    this.apiService.off(ApiEvent.OnvifCameraSettingsResult, this.OnvifCameraSettingsResult, this)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['device']) {
      this.loading = false
      this.settings = undefined
    }
  }

  loadOnvifCameraSettings() {
    this.loading = true
    this.apiService.loadOnvifCameraSettings(this.device, this.login, this.password)
  }

  OnvifCameraSettingsResult(data: any) {
    if (!this.device || !this.loading || data.device !== this.device) return
    this.loading = false
    this.settings = data
    console.log(this.settings)
  }

  getHostName(device: string) {
    const url = new URL(device)
    return url.hostname
  }
}
