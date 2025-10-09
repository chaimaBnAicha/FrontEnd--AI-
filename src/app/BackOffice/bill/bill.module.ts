import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { BillRoutingModule } from './bill-routing.module';
import { BillComponent } from './bill.component';
import { BillListComponent } from './bill-list/bill-list.component';
import { BillFormComponent } from './bill-form/bill-form.component';
import { BillViewComponent } from './bill-view/bill-view.component';
import { PaymentCallbackComponent } from './payment-callback/payment-callback.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';

@NgModule({
  declarations: [
    BillComponent,
    BillListComponent,
    BillFormComponent,
    BillViewComponent,
    PaymentCallbackComponent,
    PaymentHistoryComponent
  ],
  imports: [
    CommonModule,
    BillRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ]
})
export class BillModule { }
