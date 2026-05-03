import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.html',
  styleUrls: ['./board-admin.css'],
  imports: [CommonModule, RouterOutlet, TitleCasePipe]
})
export class BoardAdmin implements OnInit {
  selectedTab = '';

  constructor(private router: Router) { };
  
  navigateTo(tab: string) {
    this.selectedTab = tab;
    this.router.navigate(['admin/' + tab]);
  }

  ngOnInit(): void {
    
  }





  /*
  content?: string;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getAdminBoard().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {console.log(err)
        if (err.error) {
          this.content = JSON.parse(err.error).message;
        } else {
          this.content = "Error with status: " + err.status;
        }
      }
    });
  }*/
}