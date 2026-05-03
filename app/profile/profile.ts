import { Component, OnInit } from '@angular/core';
import { StorageService } from '../services/storage';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule]
})
export class Profile implements OnInit {
  currentUser: any;
  loading = true;

  constructor(private storageService: StorageService) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.loading = true;
    this.storageService.refreshUserData().subscribe({
      next: (refreshedUser) => {
        this.currentUser = refreshedUser || this.storageService.getUser();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.currentUser = this.storageService.getUser();
        this.loading = false;
      }
    });
  }

  refreshProfile(): void {
    this.loadUserData();
  }
}
