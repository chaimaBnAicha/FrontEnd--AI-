import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './BackOffice/layouts/admin-layout/admin-layout.component';
import { IndexComponent } from './FrontOffice/index/index.component';

import { ContactComponent } from './FrontOffice/contact/contact.component';
import { PortfolioComponent } from './FrontOffice/portfolio/portfolio.component';
import { ServiceComponent } from './FrontOffice/service/service.component';

import { TeamComponent } from './FrontOffice/team/team.component';
import { AboutComponent } from './FrontOffice/about/about.component';
import { HomeComponent } from './BackOffice/home/home.component';
import { UserComponent } from './BackOffice/user/user.component';
import { TestComponent } from './BackOffice/test/test.component';
import { MapsComponent } from './BackOffice/maps/maps.component';
import { TablesComponent } from './BackOffice/tables/tables.component';
import { TypographyComponent } from './BackOffice/typography/typography.component';
import { IconsComponent } from './BackOffice/icons/icons.component';
import { NotificationsComponent } from './BackOffice/notifications/notifications.component';
import { UpgradeComponent } from './BackOffice/upgrade/upgrade.component';
import { PostRequestComponent } from './projects/post-request/post-request.component';
import { GetAllRequestComponent } from './projects/get-all-request/get-all-request.component';
import { UpdateRequestComponent } from './projects/update-request/update-request.component';
import { RequestManagementComponent } from './BackOffice/request-management/request-management.component';
import { RequestDetailsComponent } from './BackOffice/request-details/request-details.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { verifyHostBindings } from '@angular/compiler';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { PostTacheComponent } from './tache/post-tache/post-tache.component';
import { GetAllTacheComponent } from './tache/get-all-tache/get-all-tache.component';
import { UpdateTacheComponent } from './tache/update-tache/update-tache.component';
import { KanbanComponent } from './tache/kanban/kanban.component';
import { AddEtapeComponent } from './etape/add-etape/add-etape.component';
import { MeetingCalendarComponent } from './meeting/meeting-calendar/meeting-calendar.component';
import { ListEtapeComponent } from './etape/list-etape/list-etape.component';
import { CreateMeetingComponent } from './meeting/create-meeting/create-meeting.component';
import { EditEtapeComponent } from './etape/edit-etape/edit-etape.component';
import { EtapeFilterComponent } from './etape/etape-filter/etape-filter.component';
import { TacheResponseComponent } from './tache/tache-response/tache-response.component';
import { AdvanceComponent } from './FrontOffice/advance/advance/advance.component';
import { AddAdvanceComponent } from './FrontOffice/advance/add-advance/add-advance.component';
import { UpdateAdvanceComponent } from './FrontOffice/advance/update-advance/update-advance.component';
import { GetleavesComponent } from './FrontOffice/leave/getleaves/getleaves.component';
import { AddleaveComponent } from './FrontOffice/leave/addleave/addleave.component';
import { UpdateleaveComponent } from './FrontOffice/leave/updateleave/updateleave.component';
import { AdvanceBackComponent } from './BackOffice/Advance/advance-back/advance-back.component';
import { PieChartComponent } from './BackOffice/AdvanceCharts/pie-chart/pie-chart.component';
import { DashboardComponent } from './BackOffice/dashboard/dashboard.component';
import { BarChartComponent } from './BackOffice/AdvanceCharts/bar-chart/bar-chart.component';
import { SinusoidalComponent } from './BackOffice/AdvanceCharts/sinusoidal/sinusoidal.component';
import { LeaveBackComponent } from './BackOffice/Leave/leave-back/leave-back.component';
import { LeaveCalendarComponent } from './BackOffice/Leave/leave-calendar/leave-calendar.component';
import { StockComponent } from './BackOffice/stock/stock.component';
import { StockEditComponent } from './BackOffice/stock/stock-edit/stock-edit.component';
import { ViewOffersComponent } from './FrontOffice/Offer/view-offers/view-offers.component';
import { ViewInsuranceComponent } from './FrontOffice/insurance/view-insurance/view-insurance.component';
import { AddofferComponent } from './FrontOffice/Offer/addoffer/addoffer.component';
import { UpdateofferComponent } from './FrontOffice/Offer/updateoffer/updateoffer.component';
import { GetofferComponent } from './FrontOffice/Offer/getoffer/getoffer.component';
import { ChartsComponent } from './BackOffice/OfferCharts/charts/charts.component';
import { AddInsuranceComponent } from './BackOffice/insurance/add-insurance/add-insurance.component';
import { UpdateInsuranceComponent } from './BackOffice/insurance/update-insurance/update-insurance.component';
import { InsuranceChartsComponent } from './BackOffice/insurance/insurance-charts/insurance-charts.component';
import { InsuranceComponent } from './BackOffice/insurance/insurance.component';

// Define your routes
const routes: Routes = [
  // FrontOffice routes
  { path: '', component: IndexComponent },
  
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'service', component: ServiceComponent },
  
  { path: 'team', component: TeamComponent },
  { path: 'test', component: TestComponent },
  {path:'request',component:PostRequestComponent},
  {path:'all-request',component:GetAllRequestComponent},
  {path:'request/:id_projet',component:UpdateRequestComponent},
  {path:'user',component:UserComponent},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignupComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify', component:  VerifyEmailComponent},
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  { path: 'tache', component: PostTacheComponent },
  { path: 'get-all-tache', component: GetAllTacheComponent },
  { path: 'tache/:id', component: UpdateTacheComponent },
  { path: 'kanban', component: KanbanComponent },
  { path: 'tasks', component: GetAllTacheComponent },
  { path: 'task/create', component: PostTacheComponent },
  { path: 'task/edit/:id', component: UpdateTacheComponent },
  { path: 'task/kanban', component: KanbanComponent },
  { path: 'etapes', component: AddEtapeComponent },
  {path:'allmeeting',component:MeetingCalendarComponent},
    // Step-related routes
    { path: 'steps', component: ListEtapeComponent },
    { path: 'step/create', component: AddEtapeComponent },
    { path: 'task/:id/steps', component: ListEtapeComponent },
    { path: 'create-meeting', component: CreateMeetingComponent },
   {path: 'etape/tache/:id',component: ListEtapeComponent },
   { path: 'etapes', component: AddEtapeComponent },
  {path:'list-etape',component:ListEtapeComponent},
  { path: 'etape/edit/:id', component: EditEtapeComponent },
  { path: 'steps', component: ListEtapeComponent },
  { path: 'step/create', component: AddEtapeComponent },
  { path: 'step/edit/:id', component: EditEtapeComponent },
  { path: 'step/filter', component: EtapeFilterComponent },
  { path: 'task/:id/steps', component: ListEtapeComponent },
  {path: 'advance', component:AdvanceComponent},
  {path: 'add-advance', component:AddAdvanceComponent},
  {path: 'update-advance/:id', component:UpdateAdvanceComponent},
  {path: 'leave', component:GetleavesComponent},
  {path: 'addleave',component: AddleaveComponent},
  {path: 'updateleave/:id', component:UpdateleaveComponent},
  {path:'app-view-offers', component:ViewOffersComponent},
  {path:'app-view-insurance', component:ViewInsuranceComponent},


  // BackOffice routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
          { path: 'dashboard',      component: HomeComponent },
         {path: 'admin2',          component: AdminLayoutComponent },
         { path: 'user',           component: UserComponent },
         { path: 'table',          component: TablesComponent },
         { path: 'typography',     component: TypographyComponent },
         { path: 'icons',          component: IconsComponent },
         { path: 'maps',           component: MapsComponent },
         { path: 'notifications',  component: NotificationsComponent },
         { path: 'upgrade',        component: UpgradeComponent },
         { path: 'project-manager', component:RequestManagementComponent  },
         { path: 'request-details/:id_projet', component: RequestDetailsComponent },
         {path:'advanceback', component:AdvanceBackComponent},
         {path:'app-pie-chart', component:PieChartComponent},
         {path:'app-dashboard',component: DashboardComponent},
         {path:'app-bar-chart', component:BarChartComponent},
         {path:'app-sinusoidal',component:SinusoidalComponent},
         { path: 'leaves', component: LeaveBackComponent },
         { path: 'leave-calendar', component: LeaveCalendarComponent },
         { path: 'stock',          component: StockComponent },
         { path: 'stock/edit/:id', component: StockEditComponent },
         { path: 'addoffer',component:AddofferComponent},
         { path: 'getoffer',component:GetofferComponent},
         { path: 'updateoffer/:id', component: UpdateofferComponent },
         {path: 'app-charts', component: ChartsComponent},
         {path: 'app-dashboard',component: DashboardComponent},
         {path: 'insurance', component: InsuranceComponent},
         { path: 'insurance/add', component: AddInsuranceComponent },
         { path: 'insurance/update/:id', component: UpdateInsuranceComponent },
         { path: 'insurance-charts', component: InsuranceChartsComponent },
         { path: 'bill',           loadChildren: () => import('./BackOffice/bill/bill.module').then(m => m.BillModule) },
       
      // Add other backoffice child routes here
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default route under admin layout
    ],
  },
  { path: 'reponse/:taskId/:response', component: TacheResponseComponent },
  // Default route for unknown paths
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true, // Use hash-based routing (optional)
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
