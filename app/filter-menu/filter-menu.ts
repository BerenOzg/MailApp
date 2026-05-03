import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-menu',
  imports: [FormsModule, CommonModule],
  templateUrl: './filter-menu.html',
  styleUrl: './filter-menu.css'
})
export class FilterMenu {
  conditions: any = {};
  value: any = '';
  Object = Object; // Make Object available in template

  @Output() filtersChanged = new EventEmitter<any>();

  get hasActiveConditions(): boolean {
    return this.conditions && Object.keys(this.conditions).length > 0;
  }

  updateConditions(newCondition: string): void {
    switch (newCondition) {
      case 'dateTo':
        this.conditions.dateTo = this.value;
        break;
      case 'dateFrom':
        this.conditions.dateFrom = this.value;
        break;
      case 'sender':
        this.conditions.sender = this.value;
        break;
      case 'recipient':
        this.conditions.recipient = this.value;
        break;
      case 'title':
        this.conditions.title = this.value;
        break;
      case 'content':
        this.conditions.content = this.value;
        break;
      case 'reset':
        this.conditions = {};
        break
    }
      
    this.value = '';
      
    console.log('Updated conditions:', this.conditions);

    this.filtersChanged.emit(this.conditions);
  }

  applyFilter(): void {
    if (this.value.trim()) {
      // Apply the current value to the most common filter (title)
      this.updateConditions('title');
    }
  }

  getActiveConditions(): Array<{key: string, value: string}> {
    return Object.keys(this.conditions)
      .filter(key => this.conditions[key])
      .map(key => ({
        key: key.charAt(0).toUpperCase() + key.slice(1),
        value: this.conditions[key]
      }));
  }

  removeCondition(key: string): void {
    const conditionKey = key.toLowerCase();
    if (this.conditions[conditionKey]) {
      delete this.conditions[conditionKey];
      this.filtersChanged.emit(this.conditions);
    }
  }
}