import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../services/userService';
import { StorageService } from '../services/storage';
import { User } from '../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  imports: [FormsModule, CommonModule]
})
export class UserForm implements OnInit {
  @Input() user?: User; 
  newValues: User = {};
  isEditMode = false;

  constructor(private userService: UserService, private sessionStorage: StorageService) {}

  ngOnInit() {
    if (this.user) {
      this.newValues = { 
        _id: this.user._id,
        username: this.user.username,
        email: this.user.email,
        isAdmin: this.user.isAdmin
      };
      this.isEditMode = true;
    } else {
      this.newValues = {
        username: '',
        email: '',
        password: '',
        isAdmin: false
      };
      this.isEditMode = false;
    }
  }

  onSubmit() {
    if (this.isEditMode && this.newValues._id) {
      this.userService.update(this.user?._id, this.newValues)
        .subscribe({
          next: (data) => console.log('User updated:', data),
          error: (e) => console.error('Update failed:', e)
        });
    } else {
      this.userService.create(this.newValues)
        .subscribe({
          next: (data) => console.log('User added:', data),
          error: (e) => console.error('Add failed:', e)
        });
    }
  }
}