import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BillComponent } from './bill.component';
import { BillListComponent } from './bill-list/bill-list.component';
import { BillFormComponent } from './bill-form/bill-form.component';
import { BillViewComponent } from './bill-view/bill-view.component';
import { PaymentCallbackComponent } from './payment-callback/payment-callback.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';

const routes: Routes = [
  {
    path: '',
    component: BillComponent,
    children: [
      { path: '', component: BillListComponent },
      { path: 'create', component: BillFormComponent },
      { path: 'edit/:id', component: BillFormComponent },
      { path: 'view/:id', component: BillViewComponent },
      { path: 'payment-callback', component: PaymentCallbackComponent },
      { path: 'payment-history', component: PaymentHistoryComponent },
      { path: 'payment-callback/confirm', component: PaymentCallbackComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillRoutingModule { }
