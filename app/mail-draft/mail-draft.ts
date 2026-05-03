import { Component, ElementRef, ViewChild } from '@angular/core';
import { Message } from '../models/message.model';
import { MessageService } from '../services/messageService';
import { NgModel,FormsModule  } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-mail-draft',
  imports: [FormsModule, CommonModule],
  templateUrl: './mail-draft.html',
  styleUrl: './mail-draft.css'
})
export class MailDraft {

  message: Message = {
    title: '',
    content: '',
    to: []
  }
  
  recipientsInput: string = '';
  submitted = false;

  constructor(private messageService: MessageService) { }

  @ViewChild('contentArea') contentArea!: ElementRef<HTMLTextAreaElement>;

  ngOnInit(): void { };

  saveMessage(): void {
    // Convert comma-separated string to array
    const recipients = this.recipientsInput
      .split(',')
      .map(recipient => recipient.trim())
      .filter(recipient => recipient.length > 0);

    const data = {
      title: this.message.title,
      content: this.message.content,
      to: recipients
    };

    this.messageService.create(data)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.submitted = true;
        },
        error: (e) => console.error(e)
      });
  }

  newMessage(): void {
    this.submitted = false;
    this.message = {
      title: '',
      content: '',
      to: []
    };
    this.recipientsInput = '';
  }

  adjustHeight() {
    const textarea = this.contentArea.nativeElement;
    textarea.style.height = 'auto';  // Reset height to shrink if needed
    textarea.style.height = textarea.scrollHeight + 'px';  // Set height to scrollHeight
  }
}
