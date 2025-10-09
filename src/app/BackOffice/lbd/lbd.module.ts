
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LbdChartComponent } from './lbd-chart/lbd-chart.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [

    LbdChartComponent,

  ],
  exports: [
    LbdChartComponent,
  ]
})
export class LbdModule { }
