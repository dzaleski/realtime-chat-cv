import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-new-message-input',
  styleUrl: './new-message-input.component.scss',
  template: `
    <form class="chat-input" [formGroup]="newMessageForm" #form="ngForm">
      <input
        formControlName="message"
        type="text"
        placeholder="Type a message..."
      />

      <button
        type="submit"
        class="send-button"
        [disabled]="form.invalid"
        (click)="
          form.valid && sendMessage.emit(form.value.message); form.reset()
        "
      >
        <i class="fa fa-send"></i>
      </button>
    </form>
  `,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewMessageInputComponent {
  fb = inject(FormBuilder);

  sendMessage = output<string>();

  newMessageForm = this.fb.nonNullable.group({
    message: ['', Validators.required],
  });
}
