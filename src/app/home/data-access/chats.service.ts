import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FIRESTORE } from '@app/app.config';
import { AuthService } from '@app/shared/data-access/auth.service';
import { Chat } from '@app/shared/interfaces/chat';
import { UserDetails } from '@app/shared/interfaces/user';
import { FIREBASE_ERROR_TOAST_HANDLER } from '@src/app/shared/utils/handle-firebase-error';
import {
  Timestamp,
  collection,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, map, switchMap, tap } from 'rxjs';
import { MessagesService } from './messages.service';

interface ChatDoc {
  id: string;
  users: UserDetails[];
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
}

interface ChatsServiceState {
  chats: Chat[];
}

@Injectable({ providedIn: 'any' })
export class ChatsService {
  private authService = inject(AuthService);
  private firestore = inject(FIRESTORE);
  private messagesService = inject(MessagesService);
  private handleFirebaseError = inject(FIREBASE_ERROR_TOAST_HANDLER);
  private firstChatPinned: boolean = false;

  // state
  private state = signal<ChatsServiceState>({
    chats: [],
  });

  // sources
  private chats$ = this.authService.userDetails$.pipe(
    switchMap((loggedUser) =>
      this.getChats(loggedUser).pipe(this.handleFirebaseError())
    ),
    tap((chats) => this.pinFirstChat(chats))
  );

  // selectors
  chats = computed(() => this.state().chats);

  constructor() {
    this.chats$.pipe(takeUntilDestroyed()).subscribe((chats) =>
      this.state.update((state) => ({
        ...state,
        chats,
      }))
    );
  }

  private getChats(loggedUser: UserDetails): Observable<Chat[]> {
    const chatsQuery = query(
      collection(this.firestore, 'chats'),
      where('users', 'array-contains', loggedUser),
      orderBy('lastMessageTimestamp', 'desc')
    );

    return collectionData(chatsQuery, { idField: 'id' }).pipe(
      map((value) => value as ChatDoc[]),
      map((users) =>
        users.map<Chat>((doc) => {
          const interlocutor = doc.users.find(
            (user) => user.email != loggedUser.email
          );

          return {
            id: doc.id,
            lastMessage: doc.lastMessage,
            lastMessageTimestamp:
              doc.lastMessageTimestamp?.toDate() ?? Date.now(),
            email: interlocutor!.email,
            avatarUrl: interlocutor!.avatarUrl,
            username: interlocutor!.username,
          };
        })
      )
    );
  }

  private pinFirstChat(chats: Chat[]): void {
    if (!this.firstChatPinned && chats.length > 0) {
      this.messagesService.displayChatMessages$.next(chats[0]);
      this.firstChatPinned = true;
    }
  }
}
