import { Component } from '@angular/core';
import { User } from '../models/user.model';
import { UserService } from '../services/userService';
import { StorageService } from '../services/storage';
import { UserDetails } from '../user-details/user-details';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TypeaheadSearchComponent, TypeaheadOption } from '../components/typeahead-search/typeahead-search';

@Component({
  selector: 'app-user-list',
  imports: [UserDetails, FormsModule, CommonModule, TypeaheadSearchComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList {
  users: User[] = [];
  username = '';
  conditions = { };
  currentUser: User = {}; 
  currentIndex = -1;

  page = 0;
  size = 10;
  totalPages = 0;

  typeaheadOptions: TypeaheadOption[] = [];

  constructor(private userService: UserService, private storageService: StorageService) { }
  
  ngOnInit(): void {
    this.retrieveUsers();
  }

  retrieveUsers(): void {
    this.userService.getAll({ ...this.conditions, page: this.page, size: this.size })
      .subscribe({
        next: (data) => {
          this.users = data.users;
          this.totalPages = data.totalPages;
          this.updateTypeaheadOptions();
        },
        error: (e) => console.error(e)
      });
  }

  updateTypeaheadOptions(): void {
    this.typeaheadOptions = this.users.map(user => ({
      id: user._id || '',
      label: user.username || '',
      subtitle: user.email || '',
      icon: user.isAdmin ? 'fas fa-shield-alt' : 'fas fa-user'
    }));
  }

  searchUsername(): void {
    this.page = 0; 
    this.retrieveUsers();
  }

  onTypeaheadSearch(searchTerm: string): void {
    this.username = searchTerm;
    this.searchUsername();
  }

  onTypeaheadOptionSelected(option: TypeaheadOption): void {
    this.username = option.label;
    this.searchUsername();
  }

  setActiveUser(user: User, index: number): void {
    this.currentUser = user;
    this.currentIndex = index;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.retrieveUsers();
    }
  }

  deleteUser(user: User, event: Event): void {
    event.stopPropagation(); 
    
    const currentUser = this.storageService.getUser();
    if (user._id === currentUser.id) {
      alert('You cannot delete your own account!');
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone and will affect all messages sent by or to this user.`);
    
    if (confirmed) {
      this.userService.delete(user._id).subscribe({
        next: (response) => {
          alert('User deleted successfully!');
          this.retrieveUsers();
          if (this.currentUser._id === user._id) {
            this.currentUser = {};
            this.currentIndex = -1;
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  canDeleteUser(user: User): boolean {
    const currentUser = this.storageService.getUser();
    return user._id !== currentUser.id; 
  }

  onUserUpdated(updatedUser: User): void {
    const currentUser = this.storageService.getUser();
    if (updatedUser._id === currentUser.id) {
      this.storageService.refreshUserData().subscribe({
        next: (refreshedUser) => {
          console.log('Current user data refreshed after update');
        },
        error: (error) => {
          console.error('Error refreshing current user data:', error);
        }
      });
    }
    
    this.retrieveUsers();
  }
}