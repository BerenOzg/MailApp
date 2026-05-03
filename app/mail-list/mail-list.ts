import { Component, Input } from '@angular/core';
import { Message, getFromUsername } from '../models/message.model';
import { MessageService } from '../services/messageService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FilterMenu } from '../filter-menu/filter-menu';
import { MailDetails } from '../mail-details/mail-details';

@Component({
  selector: 'app-mail-list',
  imports: [FormsModule, CommonModule, FilterMenu, MailDetails],
  templateUrl: './mail-list.html',
  styleUrl: './mail-list.css'
})
export class MailList {

  @Input() messages?: Message[];
  @Input() page = 0;
  @Input() size = 10;
  @Input() totalPages = 0;
  @Input() fetchPage: (page: number) => void = () => {};

  currentMessage: Message = {};
  currentIndex = -1;

  constructor(private messageService: MessageService) { };

  ngOnInit(): void {
  }

  ngOnChanges(): void {
  }

  setActiveMessage(message: Message, index: number): void {
    this.currentMessage = message;
    this.currentIndex = index;
  }

  trackByFn(index: number, message: Message): string {
    return message._id || index.toString();
  }

  getFromUsername(message: Message): string {
    return getFromUsername(message);
  }
}
