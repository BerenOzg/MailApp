import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TypeaheadOption {
  id: string;
  label: string;
  subtitle?: string;
  icon?: string;
}

@Component({
  selector: 'app-typeahead-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="position-relative">
      <div class="input-group">
        <span class="input-group-text bg-light border-end-0">
          <i class="fas fa-search text-muted"></i>
        </span>
        <input
          type="text"
          class="form-control border-start-0"
          [placeholder]="placeholder"
          [(ngModel)]="searchTerm"
          (input)="onInputChange()"
          (focus)="showDropdown = true"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
        />
        <button
          class="btn btn-primary"
          type="button"
          (click)="onSearch()"
        >
          <i class="fas fa-search me-1"></i>
          Search
        </button>
      </div>

      <!-- Typeahead Dropdown -->
      <div 
        *ngIf="showDropdown && filteredOptions.length > 0" 
        class="dropdown-menu show w-100 position-absolute"
        style="top: 100%; z-index: 1000; max-height: 300px; overflow-y: auto;"
      >
        <div 
          *ngFor="let option of filteredOptions; let i = index"
          class="dropdown-item d-flex align-items-center py-2 px-3"
          [class.active]="i === selectedIndex"
          (click)="selectOption(option)"
          (mouseenter)="selectedIndex = i"
          style="cursor: pointer;"
        >
          <i *ngIf="option.icon" [class]="option.icon + ' me-2 text-primary'"></i>
          <div class="flex-grow-1">
            <div class="fw-medium">{{ option.label }}</div>
            <small *ngIf="option.subtitle" class="text-muted">{{ option.subtitle }}</small>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div 
        *ngIf="showDropdown && searchTerm && filteredOptions.length === 0" 
        class="dropdown-menu show w-100 position-absolute"
        style="top: 100%; z-index: 1000;"
      >
        <div class="dropdown-item text-muted py-2 px-3">
          <i class="fas fa-info-circle me-2"></i>
          No results found for "{{ searchTerm }}"
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    
    .dropdown-item.active {
      background-color: #0d6efd;
      color: white;
    }
    
    .dropdown-item.active small {
      color: rgba(255, 255, 255, 0.8) !important;
    }
  `]
})
export class TypeaheadSearchComponent implements OnInit {
  @Input() options: TypeaheadOption[] = [];
  @Input() placeholder: string = 'Search...';
  @Input() minSearchLength: number = 2;
  @Input() maxResults: number = 10;
  
  @Output() search = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<TypeaheadOption>();

  searchTerm: string = '';
  filteredOptions: TypeaheadOption[] = [];
  showDropdown: boolean = false;
  selectedIndex: number = -1;

  ngOnInit() {
    this.filteredOptions = [];
  }

  onInputChange() {
    if (this.searchTerm.length >= this.minSearchLength) {
      this.filterOptions();
      this.showDropdown = true;
      this.selectedIndex = -1;
    } else {
      this.filteredOptions = [];
      this.showDropdown = false;
    }
  }

  filterOptions() {
    const term = this.searchTerm.toLowerCase();
    this.filteredOptions = this.options
      .filter(option => 
        option.label.toLowerCase().includes(term) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(term))
      )
      .slice(0, this.maxResults);
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredOptions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectOption(this.filteredOptions[this.selectedIndex]);
        } else {
          this.onSearch();
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        this.selectedIndex = -1;
        break;
    }
  }

  selectOption(option: TypeaheadOption) {
    this.searchTerm = option.label;
    this.showDropdown = false;
    this.selectedIndex = -1;
    this.optionSelected.emit(option);
  }

  onSearch() {
    this.showDropdown = false;
    this.selectedIndex = -1;
    this.search.emit(this.searchTerm);
  }

  onBlur() {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      this.showDropdown = false;
      this.selectedIndex = -1;
    }, 150);
  }
} 