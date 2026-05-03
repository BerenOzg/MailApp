import { Component } from '@angular/core';
import { UserForm } from '../user-form/user-form';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-add',
  imports: [UserForm, FormsModule, CommonModule],
  templateUrl: './user-add.html',
  styleUrl: './user-add.css'
})
export class UserAdd {
  showForm = false;

  onAddComplete() {
    this.showForm = false;
  }
}
