import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-chat-message',
  styleUrl: './chat-message.component.scss',
  template: `
    <div
      class="message"
      [class.sent]="sentByMe()"
      [class.received]="!sentByMe()"
    >
      <div class="message-content">
        {{ content() }}
      </div>
      <div class="message-time">{{ time() | date : 'H:mm' }}</div>
      @if(sentByMe()) {
      <button class="remove-button" (click)="removeMessage.emit()">
        <i class="fa fa-remove"></i>
      </button>
      }
    </div>
  `,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent {
  content = input.required<string>();
  time = input.required<Date>();
  sentByMe = input.required<boolean>();

  removeMessage = output<void>();
}
