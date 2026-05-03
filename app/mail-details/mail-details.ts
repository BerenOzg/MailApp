import { Component, Input } from '@angular/core';
import { Message, isDeletedUser, User } from '../models/message.model';
import { MessageService } from '../services/messageService';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mail-details',
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './mail-details.html',
  styleUrl: './mail-details.css'
})
export class MailDetails {
  @Input() viewMode = false;

  @Input() currentMessage: Message = {
    title: '',
    content: '',
    to: [],
    from: { _id: '', username: '', email: '' },
    sentAt: new Date()
  };

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    if(!this.viewMode) {
      //this.getTutorial(this.route.snapshot.params["id"]);
    }
  }

  getMessage(id: any): void {
    this.messageService.get(id)
      .subscribe({
        next: (data) => {
          this.currentMessage = data;
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getFromUsername(message: Message): string {
    if (typeof message.from === 'string') {
      return message.from;
    }
    if (message.from && typeof message.from === 'object') {
      return message.from.username || 'Deleted User';
    }
    return 'Unknown User';
  }

  getToUsernamesString(message: Message): string {
    if (!message.to || !Array.isArray(message.to)) return '';
    if (typeof message.to[0] === 'string') {
      return message.to.join(', ');
    }
    return message.to.map((user: any) => user.username || 'Deleted User').join(', ');
  }

  getRecipientsArray(message: Message): (User | string)[] {
    if (!message.to || !Array.isArray(message.to)) return [];
    return message.to;
  }

  isDeletedUser(user: any): boolean {
    if (!user) return false;
    return isDeletedUser(user);
  }
}
