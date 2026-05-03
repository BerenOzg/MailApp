import { RouterModule, Routes, Router } from '@angular/router';
import { HomeAuth } from './home_auth/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { BoardAdmin } from './board-admin/board-admin';
import { Profile } from './profile/profile';
import { NgModule } from '@angular/core';
import { Home } from './home/home';
import { MailDraft } from './mail-draft/mail-draft';
import { Inbox } from './inbox/inbox';
import { Outbox } from './outbox/outbox';
import { UserList } from './user-list/user-list';
import { UserAdd } from './user-add/user-add';
import { AdminBox } from './admin-box/admin-box';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { 
    path: 'home',
    component: Home,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'inbox', pathMatch: 'full' },
      { path: 'inbox', component: Inbox },
      { path: 'outbox', component: Outbox },
      { path: 'draft', component: MailDraft }
    ]
  },
  { 
    path: 'admin',
    component: BoardAdmin,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserList },
      { path: 'add', component: UserAdd},
      { path: 'messages', component: AdminBox}
    ]
  },
  { 
    path: 'homeAuth', 
    component: HomeAuth,
    canActivate: [AuthGuard]
  },
  { 
    path: 'login', 
    component: Login,
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    component: Register,
    canActivate: [GuestGuard]
  },
  { 
    path: 'profile', 
    component: Profile,
    canActivate: [AuthGuard]
  },
  { 
    path: '**', 
    redirectTo: 'home', 
    pathMatch: "full"
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }