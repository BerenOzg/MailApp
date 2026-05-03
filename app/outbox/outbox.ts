import { Component } from '@angular/core';
import { Message } from '../models/message.model';
import { MessageService } from '../services/messageService';
import { MailList } from '../mail-list/mail-list';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../services/storage';
import { FilterMenu } from '../filter-menu/filter-menu';
import { TypeaheadSearchComponent, TypeaheadOption } from '../components/typeahead-search/typeahead-search';

@Component({
  selector: 'app-outbox',
  imports: [MailList, FormsModule, CommonModule, FilterMenu, TypeaheadSearchComponent],
  templateUrl: './outbox.html',
  styleUrl: './outbox.css'
})
export class Outbox {
  outboxMessages: Message[] = [];
  title = '';
  conditions = { };

  // Pagination
  page = 0;
  size = 10;
  totalPages = 0;

  // Typeahead options for messages
  typeaheadOptions: TypeaheadOption[] = [];

  constructor(private messageService: MessageService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.retrieveOutboxMessages();
  }

  retrieveOutboxMessages(): void {
    this.messageService.getOutbox({ ...this.conditions, page: this.page, size: this.size })
      .subscribe({
        next: (data) => {
          this.outboxMessages = data.messages || [];
          this.totalPages = data.totalPages;
          this.updateTypeaheadOptions();
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

  updateTypeaheadOptions(): void {
    this.typeaheadOptions = this.outboxMessages.map(message => ({
      id: message._id || '',
      label: message.title || 'Untitled Message',
      subtitle: `To: ${this.getToUsernames(message).join(', ')} | ${message.sentAt ? new Date(message.sentAt).toLocaleDateString() : 'No date'}`,
      icon: 'fas fa-envelope'
    }));
  }

  getToUsernames(message: Message): string[] {
    if (!message.to) return [];
    if (typeof message.to[0] === 'string') {
      return message.to as string[];
    }
    return (message.to as any[]).map(user => user.username || 'Deleted User');
  }

  searchTitle(): void {
    this.page = 0; // Reset to first page on new search
    this.messageService.getOutbox({ title: this.title, page: this.page, size: this.size })
      .subscribe({
        next: (data) => {
          this.outboxMessages = data.messages || [];
          this.totalPages = data.totalPages;
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
    this.page = 0; // Reset to first page on filter change
    this.retrieveOutboxMessages();
  }

  fetchPage = (page: number) => {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.retrieveOutboxMessages();
    }
  }
}
