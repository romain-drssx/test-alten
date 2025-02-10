import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule, 
    CommonModule, 
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
 ]
})
export class ContactComponent {
  contactForm: FormGroup;
  messageSend: boolean = false;
  maxLength: number = 300;
  messageLength: number = 0;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(this.maxLength)]],
    });
  }

  updateMessageLength() {
    this.messageLength = this.contactForm.controls.message.value?.length || 0;
  }

  sendMessage() {
    if (this.contactForm.valid) {
      this.messageSend = true;
      this.contactForm.reset();
    }
  }
}
