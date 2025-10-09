import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './FrontOffice/about/about.component';

import { IndexComponent } from './FrontOffice/index/index.component';
import { ContactComponent } from './FrontOffice/contact/contact.component';
import { PortfolioComponent } from './FrontOffice/portfolio/portfolio.component';
import { ServiceComponent } from './FrontOffice/service/service.component';

import { TeamComponent } from './FrontOffice/team/team.component';
import { AdminLayoutComponent } from './BackOffice/layouts/admin-layout/admin-layout.component';

import { NavbarModule } from './BackOffice/shared/navbar/navbar.module';
import { FooterModule } from './BackOffice/shared/footer/footer.module';
import { SidebarModule } from './BackOffice/sidebar/sidebar.module';
import { AdminLayoutModule } from './BackOffice/layouts/admin-layout/admin-layout.module';
import { TestComponent } from './BackOffice/test/test.component';
import { PostRequestComponent } from './projects/post-request/post-request.component';
import { GetAllRequestComponent } from './projects/get-all-request/get-all-request.component';
import { UpdateRequestComponent } from './projects/update-request/update-request.component';
import { RequestManagementComponent } from './BackOffice/request-management/request-management.component';
import { RequestDetailsComponent } from './BackOffice/request-details/request-details.component';
import { ToastrModule } from 'ngx-toastr';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import{ ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';  
import { DatePipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TacheComponent } from './tache/tache.component';
import { PostTacheComponent } from './tache/post-tache/post-tache.component';
import { DeleteTacheComponent } from './tache/delete-tache/delete-tache.component';
import { UpdateTacheComponent } from './tache/update-tache/update-tache.component';
import { GetAllTacheComponent } from './tache/get-all-tache/get-all-tache.component';
import { KanbanComponent } from './tache/kanban/kanban.component';
import { AddEtapeComponent } from './etape/add-etape/add-etape.component';
import { EditEtapeComponent } from './etape/edit-etape/edit-etape.component';
import { EtapeFilterComponent } from './etape/etape-filter/etape-filter.component';
import { ListEtapeComponent } from './etape/list-etape/list-etape.component';
import { CreateMeetingComponent } from './meeting/create-meeting/create-meeting.component';
import { MeetingCalendarComponent } from './meeting/meeting-calendar/meeting-calendar.component';
import { MeetingDetailsDialog } from './meeting/meeting-details/meeting-details.dialog';
import { CreateMeetingDialog } from './meeting/create-meeting/create-meeting.dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
// Removed duplicate import of FullCalendarModule
import { AdvanceComponent } from './FrontOffice/advance/advance/advance.component';
import { AddAdvanceComponent } from './FrontOffice/advance/add-advance/add-advance.component';
import { UpdateAdvanceComponent } from './FrontOffice/advance/update-advance/update-advance.component';
import { AdvanceBackComponent } from './BackOffice/Advance/advance-back/advance-back.component';
import { SafeHtmlPipe } from './FrontOffice/pipes/safe-html.pipe';
import { DashboardComponent } from './BackOffice/dashboard/dashboard.component';
import { PieChartComponent } from './BackOffice/AdvanceCharts/pie-chart/pie-chart.component';
import { BarChartComponent } from './BackOffice/AdvanceCharts/bar-chart/bar-chart.component';
import { SinusoidalComponent } from './BackOffice/AdvanceCharts/sinusoidal/sinusoidal.component';
import { GetleavesComponent } from './FrontOffice/leave/getleaves/getleaves.component';
import { AddleaveComponent } from './FrontOffice/leave/addleave/addleave.component';
import { UpdateleaveComponent } from './FrontOffice/leave/updateleave/updateleave.component';
import { LeaveBackComponent } from './BackOffice/Leave/leave-back/leave-back.component';
import { LeaveCalendarComponent } from './BackOffice/Leave/leave-calendar/leave-calendar.component';
import { LeaveDetailsModalComponent } from './BackOffice/Leave/leave-details-modal/leave-details-modal.component';
import { LeavePieChartComponent } from './BackOffice/Leave/leave-charts/leave-pie-chart/leave-pie-chart.component';
import { LeaveBarChartComponent } from './BackOffice/Leave/leave-charts/leave-bar-chart/leave-bar-chart.component';
import { LeaveSinusoidalComponent } from './BackOffice/Leave/leave-charts/leave-sinusoidal/leave-sinusoidal.component';
import { LeaveChartsComponent } from './BackOffice/Leave/leave-charts/leave-charts.component';
import { LeaveStatisticsService } from './service/leave-statistics.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from './shared/shared.module';
import { StockComponent } from './BackOffice/stock/stock.component';
import { StockEditComponent } from './BackOffice/stock/stock-edit/stock-edit.component';
import { InsuranceComponent } from './BackOffice/insurance/insurance.component';
import { InsuranceChartsComponent } from './BackOffice/insurance/insurance-charts/insurance-charts.component';
import { AddInsuranceComponent } from './BackOffice/insurance/add-insurance/add-insurance.component';
import { UpdateInsuranceComponent } from './BackOffice/insurance/update-insurance/update-insurance.component';
import { ViewInsuranceComponent } from './FrontOffice/insurance/view-insurance/view-insurance.component';
import { ViewOffersComponent } from './FrontOffice/Offer/view-offers/view-offers.component';
import { UpdateofferComponent } from './FrontOffice/Offer/updateoffer/updateoffer.component';
import { GetofferComponent } from './FrontOffice/Offer/getoffer/getoffer.component';
import { AddofferComponent } from './FrontOffice/Offer/addoffer/addoffer.component';
import { ChartsComponent } from './BackOffice/OfferCharts/charts/charts.component';



@NgModule({
  schemas: [ NO_ERRORS_SCHEMA ],
  declarations: [
    
    AppComponent,
    AboutComponent,
    ChartsComponent,
    AddInsuranceComponent,
   
    IndexComponent,
    ContactComponent,
    PortfolioComponent,
    ServiceComponent,
    GetofferComponent,
    AddofferComponent,
    
    TeamComponent,
    AdminLayoutComponent,
    TestComponent,
    PostRequestComponent,
    GetAllRequestComponent,
    UpdateRequestComponent,
    RequestManagementComponent,
    RequestDetailsComponent,
    UserComponent,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,

    ResetPasswordComponent,
    TacheComponent,
    PostTacheComponent,
    DeleteTacheComponent,
    UpdateTacheComponent,
    GetAllTacheComponent,
    KanbanComponent,
    AddEtapeComponent,
    EditEtapeComponent,
    EtapeFilterComponent,
    ListEtapeComponent,
    CreateMeetingComponent,
    MeetingCalendarComponent,
    MeetingDetailsDialog,
    CreateMeetingDialog,
    AdvanceComponent,
    AddAdvanceComponent,
    UpdateAdvanceComponent,
    AdvanceBackComponent,
    SafeHtmlPipe,
    DashboardComponent,
    PieChartComponent,
    BarChartComponent,
    SinusoidalComponent,
    GetleavesComponent,
    AddleaveComponent,
    UpdateleaveComponent,
    LeaveBackComponent,
    LeaveCalendarComponent,
    LeaveDetailsModalComponent,
    LeavePieChartComponent,
    LeaveBarChartComponent,
    LeaveSinusoidalComponent,
    LeaveChartsComponent,
    StockComponent,
    StockEditComponent,
    UpdateTacheComponent,
    InsuranceComponent,
    InsuranceChartsComponent,
    AddInsuranceComponent,
    UpdateInsuranceComponent,
    ViewInsuranceComponent,
    ViewOffersComponent,
    UpdateofferComponent
  
     

  ],
  imports: [
    BrowserModule,
    CommonModule ,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    AppRoutingModule,
    NavbarModule,
    FooterModule,
    SidebarModule,
    BrowserAnimationsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    DragDropModule,
    MatDialogModule,
    NgbModule,
    FullCalendarModule, // This should now work correctly
    MatIconModule,
    NgxPaginationModule,
    NgChartsModule,
    EditorModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 50000,
      closeButton: true,
      progressBar: true,
    }),
    SharedModule, // Moved to the end as it likely contains other modules
  ],
  providers: [
    DatePipe,
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
    LeaveStatisticsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }