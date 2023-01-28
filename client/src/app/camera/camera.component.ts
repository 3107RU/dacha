import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ApiService, ApiEvent } from '../api.service'
import { VideoPlayerComponent } from '../video-player/video-player.component'

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

  constructor(private apiService: ApiService, private modalService: NgbModal) { }

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
  }

  getHostName(device: string) {
    const url = new URL(device)
    return url.hostname
  }

  showVideo(profile: any) {
    const modalRef = this.modalService.open(VideoPlayerComponent, { size: 'lg' })
    modalRef.componentInstance.url = profile.url
  }
}
