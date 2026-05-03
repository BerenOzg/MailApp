import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { TitleCasePipe, CommonModule } from '@angular/common';
import { Box } from '../box/box';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Box, TitleCasePipe, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  selectedTab = '';

  constructor(private router: Router) { };
  
  navigateTo(tab: string) {
    this.selectedTab = tab;
    this.router.navigate(['home/' + tab]);
  }
}
