import { Component } from '@angular/core';

@Component({
  selector: 'app-leave-charts',
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-md-4">
          <app-leave-pie-chart></app-leave-pie-chart>
        </div>
        <div class="col-md-8">
          <app-leave-bar-chart></app-leave-bar-chart>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12">
          <app-leave-sinusoidal></app-leave-sinusoidal>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./leave-charts.component.css']
})
export class LeaveChartsComponent { } 