import { Component } from '@angular/core';
import { ApiService } from '../app/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Dacha';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.sendMessage('fwefweafaewf')
  }

}
