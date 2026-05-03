import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean {
    if (this.storageService.isLoggedIn()) {
      const user = this.storageService.getUser();
      if (user.isAdmin) {
        return true;
      }
    }
    
    this.router.navigate(['/home']);
    return false;
  }
} 