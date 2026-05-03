import { Component, Input } from '@angular/core';
import { Message } from '../models/message.model';
import { MessageService } from '../services/messageService';
import { StorageService } from '../services/storage';
import { MailList } from '../mail-list/mail-list';
import { FormsModule } from '@angular/forms';
import { FilterMenu } from '../filter-menu/filter-menu';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-box',
  imports: [MailList, FormsModule, FilterMenu, CommonModule],
  templateUrl: './box.html',
  styleUrl: './box.css'
})
export class Box {
    messages: Message[] = [];
    title = '';
    conditions = { };
    extraOption = { };
    @Input() isInbox = false;
    @Input() isOutbox = false;

    // Pagination
    page = 0;
    size = 10;
    totalPages = 0;

    constructor(private messageService: MessageService, private storageService: StorageService) { }

    ngOnInit(): void {
      if(this.isInbox) this.extraOption = { to: [this.storageService.getUser().username] };
      if(this.isOutbox) this.extraOption = { from: this.storageService.getUser().username };
      this.retrieveMessages();
    }

    retrieveMessages(): void {
      this.messageService.getAll({ ...this.conditions, ...this.extraOption, page: this.page, size: this.size })
        .subscribe({
          next: (data) => {
            this.messages = data.messages || [];
            this.totalPages = data.totalPages;
            console.log(data);
          },
          error: (e) => console.error(e)
        });
    }

    searchTitle(): void {
      this.page = 0; // Reset to first page on new search
      this.messageService.getOutbox({ ...{title : this.title}, ...this.extraOption, page: this.page, size: this.size })
        .subscribe({
          next: (data) => {
            this.messages = data.messages || [];
            this.totalPages = data.totalPages;
            console.log(data);
          },
          error: (e) => console.error(e)
        });
    }

    onFiltersChanged(updatedConditions: any): void {
      this.conditions = updatedConditions;
      this.page = 0;
      this.retrieveMessages();
    }

    fetchPage = (page: number) => {
      if (page >= 0 && page < this.totalPages) {
        this.page = page;
        this.retrieveMessages();
      }
    }
}
