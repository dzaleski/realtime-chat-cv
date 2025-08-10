import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Message } from '@app/home/chats/interfaces/message';
import { ChatHeaderComponent } from '@app/home/chats/ui/chat-header.component';
import { ChatMessageComponent } from '@app/home/chats/ui/chat-message/chat-message.component';
import { NewMessageInputComponent } from '@app/home/chats/ui/new-message-input/new-message-input.component';
import { UserDetails } from '@app/shared/interfaces/user';

@Component({
  standalone: true,
  selector: 'app-chat-window',
  styleUrl: './chat-window.component.scss',
  templateUrl: './chat-window.component.html',
  imports: [
    ChatHeaderComponent,
    ChatMessageComponent,
    ReactiveFormsModule,
    NewMessageInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowComponent {
  interlocutor = input.required<UserDetails>();
  messages = input.required<Message[]>();

  sendMessage = output<Message['content']>();
  removeMessage = output<Message['id']>();

  messageComponents = viewChildren(ChatMessageComponent, { read: ElementRef });

  constructor() {
    effect(() => {
      const messages = this.messageComponents();
      if (!messages || messages.length === 0) {
        return;
      }
      const lastMessage = messages.at(0);
      lastMessage?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
