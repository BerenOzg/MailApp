import { Component } from '@angular/core';
import { MessageService } from '../services/messageService';
import { StorageService } from '../services/storage';
import { Message } from '../models/message.model';
import { MailList } from '../mail-list/mail-list';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FilterMenu } from '../filter-menu/filter-menu';
import { TypeaheadSearchComponent, TypeaheadOption } from '../components/typeahead-search/typeahead-search';

@Component({
  selector: 'app-admin-box',
  imports: [MailList, FormsModule, CommonModule, FilterMenu, TypeaheadSearchComponent],
  templateUrl: './admin-box.html',
  styleUrl: './admin-box.css'
})
export class AdminBox {
  messages: Message[] = [];
  title = '';
  conditions = { };

  page = 0;
  size = 10;
  totalPages = 0;

  // Typeahead options for messages
  typeaheadOptions: TypeaheadOption[] = [];

  constructor(private messageService: MessageService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.retrievemessages();
  }

  retrievemessages(): void {
    this.messageService.getInbox({ ...this.conditions, page: this.page, size: this.size })
      .subscribe({
        next: (data) => {
          this.messages = data.messages || [];
          this.totalPages = data.totalPages;
          this.updateTypeaheadOptions();
        },
        error: (e) => console.error(e)
      });
  }

  updateTypeaheadOptions(): void {
    this.typeaheadOptions = this.messages.map(message => ({
      id: message._id || '',
      label: message.title || 'Untitled Message',
      subtitle: `From: ${this.getFromUsername(message)} | ${message.sentAt ? new Date(message.sentAt).toLocaleDateString() : 'No date'}`,
      icon: 'fas fa-envelope'
    }));
  }

  getFromUsername(message: Message): string {
    if (typeof message.from === 'string') {
      return message.from;
    }
    if (message.from && typeof message.from === 'object') {
      return message.from.username || 'Unknown User';
    }
    return 'Unknown User';
  }

  searchTitle(): void {
    this.page = 0; 
    this.messageService.getInbox({ ...{title : this.title}})
      .subscribe({
        next: (data) => {
          this.messages = data.messages || [];
          this.updateTypeaheadOptions();
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

  onTypeaheadSearch(searchTerm: string): void {
    this.title = searchTerm;
    this.searchTitle();
  }

  onTypeaheadOptionSelected(option: TypeaheadOption): void {
    this.title = option.label;
    this.searchTitle();
  }

  onFiltersChanged(updatedConditions: any): void {
    this.conditions = updatedConditions;
    console.log("Parent received filters:", this.conditions);
    this.retrievemessages();
  }

  fetchPage = (page: number) => {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.retrievemessages();
    }
  }
}
