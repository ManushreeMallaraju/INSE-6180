import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewDashboardComponent } from './review-dashboard/review-dashboard.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'review/:role', component: ReviewDashboardComponent },
  { path: 'login', component: LoginComponent }, 
  { path: '', pathMatch:'full', redirectTo: 'login'}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
