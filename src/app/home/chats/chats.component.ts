import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatListComponent } from '@app/home/chats/ui/chat-list/chat-list.component';
import { ChatWindowComponent } from '@app/home/chats/ui/chat-window/chat-window.component';
import { NewChatDialogFormComponent } from '@app/home/chats/ui/new-chat-dialog-form/new-chat-dialog-form.component';
import { ChatsService } from '@app/home/data-access/chats.service';
import { InvitationsService } from '@app/home/data-access/invitations.service';
import { MessagesService } from '@app/home/data-access/messages.service';
import { PeopleService } from '@app/home/data-access/people.service';
import { AuthService } from '@app/shared/data-access/auth.service';
import { Chat } from '@app/shared/interfaces/chat';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss',
  imports: [
    ChatListComponent,
    ModalComponent,
    NewChatDialogFormComponent,
    ChatWindowComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatsComponent {
  authService = inject(AuthService);
  router = inject(Router);
  messagesService = inject(MessagesService);
  chatsService = inject(ChatsService);
  invitationsService = inject(InvitationsService);
  peopleService = inject(PeopleService);

  inviteModalOpen = signal(false);

  searchControl = new FormControl<string>('', { nonNullable: true });
  private searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged()
    )
  );

  filteredChats = computed<Chat[]>(() =>
    this.chatsService
      .chats()
      .filter((chat) => chat.email.includes(this.searchTerm() ?? ''))
  );
}
