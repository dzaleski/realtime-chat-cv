import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatListItemComponent } from '@app/home/chats/ui/chat-list-item/chat-list-item.component';
import { SearchHeaderComponent } from '@app/home/chats/ui/search-input/search-input.component';
import { Chat } from '@app/shared/interfaces/chat';

@Component({
  standalone: true,
  selector: 'app-chat-list',
  styleUrl: './chat-list.component.scss',
  template: `
    <app-search-header [searchControl]="searchControl()" />
    <div class="chats">
      @for(chat of chats(); track chat.id) {
      <app-chat-item
        [chat]="chat"
        [pinned]="pinnedChatId() === chat.id"
        (click)="pinChat.emit(chat)"
      />
      } @empty {
      <div class="no-results">
        No results found. Try searching for a friend.
      </div>
      }
    </div>
    <button class="new-chat-button" (click)="inviteModalOpen.emit()">+</button>
  `,
  imports: [SearchHeaderComponent, ChatListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  chats = input.required<Chat[]>();
  searchControl = input.required<FormControl<string>>();
  pinnedChatId = input.required<Chat['id']>();

  inviteModalOpen = output<void>();
  pinChat = output<Chat>();
}
