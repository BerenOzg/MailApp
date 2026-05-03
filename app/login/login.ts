import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { StorageService } from '../services/storage';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit{
  form = {
    username: '',
    password: ''
  }
  isLoginFailed = false;
  isLoggedIn = false;
  errorMessage = '';
  role = '';

  constructor(private authService: AuthService, private storageService: StorageService) { };

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.role = this.storageService.getUser().role;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    this.authService.login(this.form.username, this.form.password).subscribe({
      next: data => {
        this.storageService.saveUser(data);

        console.log(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.role = this.storageService.getUser().role;
        location.reload;
      },
      error: error => {
        this.errorMessage = error.error.message || "Failed to login.";
        this.isLoginFailed = true;
        this.isLoggedIn = false;
      }
    });
  }
}
