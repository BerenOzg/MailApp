import { Component } from '@angular/core';
import { MailList } from '../mail-list/mail-list';
import { Message } from '../models/message.model';
import { MessageService } from '../services/messageService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FilterMenu } from '../filter-menu/filter-menu';
import { StorageService } from '../services/storage';
import { TypeaheadSearchComponent, TypeaheadOption } from '../components/typeahead-search/typeahead-search';

@Component({
  selector: 'app-inbox',
  imports: [MailList, FormsModule, CommonModule, FilterMenu, TypeaheadSearchComponent],
  templateUrl: './inbox.html',
  styleUrl: './inbox.css'
})
export class Inbox {
  inboxMessages: Message[] = [];
  title = '';
  conditions = { };

  page = 0;
  size = 10;
  totalPages = 0;

  // Typeahead options for messages
  typeaheadOptions: TypeaheadOption[] = [];

  constructor(private messageService: MessageService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.retrieveInboxMessages();
  }

  retrieveInboxMessages(): void {
    this.messageService.getInbox({ ...this.conditions, page: this.page, size: this.size })
      .subscribe({
        next: (data) => {
          this.inboxMessages = data.messages || [];
          this.totalPages = data.totalPages;
          this.updateTypeaheadOptions();
        },
        error: (e) => {
          console.error('Inbox error:', e);
        }
      });
  }

  updateTypeaheadOptions(): void {
    this.typeaheadOptions = this.inboxMessages.map(message => ({
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
    this.messageService.getInbox({ title: this.title })
      .subscribe({
        next: (data) => {
          this.inboxMessages = data.messages || [];
          this.updateTypeaheadOptions();
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
    this.retrieveInboxMessages();
  }

  fetchPage = (page: number) => {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.retrieveInboxMessages();
    }
  }
}
