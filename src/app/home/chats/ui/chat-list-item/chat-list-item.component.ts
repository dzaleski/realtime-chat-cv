import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Chat } from '@app/shared/interfaces/chat';

@Component({
  standalone: true,
  selector: 'app-chat-item',
  styleUrl: './chat-list-item.component.scss',
  template: `
    <div class="chat-item" [class.pinned]="pinned()">
      <div class="chat-avatar">
        <img [src]="chat().avatarUrl" [alt]="chat().username + 'chat avatar'" />
      </div>
      <div class="chat-info">
        <div class="chat-header">
          <div class="chat-name">{{ chat().username }}</div>
          <div class="chat-time">
            {{ chat().lastMessageTimestamp | date : 'H:mm' }}
          </div>
        </div>
        <div class="chat-last-message">{{ chat().lastMessage }}</div>
      </div>
    </div>
  `,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListItemComponent {
  pinned = input.required<boolean>();
  chat = input.required<Chat>();
}
