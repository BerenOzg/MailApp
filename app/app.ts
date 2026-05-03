import { Component } from '@angular/core';
import { StorageService } from './services/storage';
import { AuthService } from './services/auth';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, CommonModule]
})
export class App {
  private isAdmin = false;
  isLoggedIn = false;
  showAdminBoard = false;
  username?: string;

  constructor(private storageService: StorageService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();

    if (this.isLoggedIn) {
      this.storageService.refreshUserData().subscribe({
        next: (refreshedUser) => {
          this.updateUserInfo(refreshedUser);
        },
        error: (error) => {
          console.error('Error refreshing user data:', error);
          const user = this.storageService.getUser();
          this.updateUserInfo(user);
        }
      });
    }
  }

  private updateUserInfo(user: any): void {
    this.isAdmin = user.isAdmin;
    this.showAdminBoard = this.isAdmin;
    this.username = user.username;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: res => {
        console.log(res);
        this.storageService.clean();

        window.location.reload();
      },
      error: err => {
        console.log(err);
      }
    });
  }
}

