import { Component, Input } from '@angular/core';
import { User } from '../models/user.model';
import { UserService } from '../services/userService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserForm } from '../user-form/user-form';

@Component({
  selector: 'app-user-details',
  imports: [FormsModule, CommonModule, UserForm],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css'
})
export class UserDetails {
  @Input() viewMode = false;

  @Input() currentUser: User = {
    _id: '',
    username: '',
    email: '',
  };

  showEditForm = false;

  constructor(private UserService: UserService) { }

  ngOnInit(): void {
    if(!this.viewMode) {
      //this.getTutorial(this.route.snapshot.params["id"]);
    }
  }

  getUser(id: any): void {
    this.UserService.get(this.currentUser._id)
      .subscribe({
        next: (data) => {
          this.currentUser = data;
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

  onEditComplete() {
    this.showEditForm = false;
  }

  canDeleteUser(user: User): boolean {
    return user && user._id && user._id !== '';
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.UserService.delete(user._id)
        .subscribe({
          next: (response) => {
            console.log('User deleted successfully');
          },
          error: (e) => console.error(e)
        });
    }
  }
}
