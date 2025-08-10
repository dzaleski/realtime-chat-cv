import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FIRESTORE } from '@app/app.config';
import {
  GetMessage,
  Message,
  NewMessage,
} from '@app/home/chats/interfaces/message';
import { AuthService } from '@app/shared/data-access/auth.service';
import { Chat } from '@app/shared/interfaces/chat';
import { UserDetails } from '@app/shared/interfaces/user';
import { FIREBASE_ERROR_TOAST_HANDLER } from '@app/shared/utils/handle-firebase-error';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  Observable,
  Subject,
  concatMap,
  defer,
  forkJoin,
  ignoreElements,
  map,
  shareReplay,
  switchMap,
  throwError,
  withLatestFrom,
} from 'rxjs';

export interface MessagesServiceState {
  messages: Message[];
  interlocutor: UserDetails | null;
  pinnedChatId: Chat['id'];
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private firestore = inject(FIRESTORE);
  private authService = inject(AuthService);
  private handleFirebaseError = inject(FIREBASE_ERROR_TOAST_HANDLER);

  // state
  private state = signal<MessagesServiceState>({
    interlocutor: null,
    pinnedChatId: '',
    messages: [],
  });

  // sources
  public sendMessage$ = new Subject<Message['content']>();
  public removeMessage$ = new Subject<Message['id']>();
  public displayChatMessages$ = new Subject<Chat>();

  private messageUploaded = this.sendMessage$.pipe(
    withLatestFrom(this.displayChatMessages$, this.authService.userDetails$),
    concatMap(([content, { id: chatId }, { email: authorEmail }]) =>
      this.uploadMessage(chatId, authorEmail, content).pipe(
        this.handleFirebaseError()
      )
    ),
    ignoreElements()
  );

  private messageRemoved$ = this.removeMessage$.pipe(
    withLatestFrom(this.displayChatMessages$, this.authService.userDetails$),
    concatMap(([messageId, { id: chatId }, { email: authorEmail }]) =>
      this.removeMessage(chatId, authorEmail, messageId).pipe(
        this.handleFirebaseError()
      )
    ),
    ignoreElements()
  );

  private messages$ = this.displayChatMessages$.pipe(
    switchMap(({ id }) =>
      this.getMessages(id).pipe(this.handleFirebaseError())
    ),
    shareReplay(1)
  );

  // selectors
  messages = computed(() => this.state().messages);
  pinnedChatId = computed(() => this.state().pinnedChatId);
  interlocutor = computed(() => this.state().interlocutor);

  constructor() {
    //reducers
    this.messages$.pipe(takeUntilDestroyed()).subscribe((messages) =>
      this.state.update((state) => ({
        ...state,
        messages,
      }))
    );

    this.displayChatMessages$
      .pipe(takeUntilDestroyed())
      .subscribe(({ id, avatarUrl, username, email }) =>
        this.state.update((state) => ({
          ...state,
          messages: [],
          pinnedChatId: id,
          interlocutor: { avatarUrl, username, email },
          lastMessageTimestamp: null,
        }))
      );

    this.messageUploaded.pipe(takeUntilDestroyed()).subscribe();
    this.messageRemoved$.pipe(takeUntilDestroyed()).subscribe();
  }

  private getMessages(chatId: string): Observable<Message[]> {
    let messagesQuery = query(
      collection(this.firestore, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc')
    );

    const messages$ = collectionData(messagesQuery, {
      idField: 'id',
    }) as Observable<GetMessage[]>;

    return messages$.pipe(
      map((messages) =>
        messages.map<Message>((message) => ({
          ...message,
          timestamp: message.timestamp?.toDate() ?? new Date(),
        }))
      )
    );
  }

  private uploadMessage(chatId: string, authorEmail: string, content: string) {
    const addMessage$ = defer(() =>
      addDoc(collection(this.firestore, 'chats', chatId, 'messages'), {
        authorEmail,
        content,
        timestamp: serverTimestamp(),
      } as NewMessage)
    );

    const updateChat$ = defer(() =>
      updateDoc(doc(collection(this.firestore, 'chats'), chatId), {
        lastMessage: content,
        lastMessageTimestamp: serverTimestamp(),
      })
    );

    return forkJoin([addMessage$, updateChat$]);
  }

  private removeMessage(
    chatId: string,
    authorEmail: string,
    messageId: string
  ) {
    const messageDoc$ = defer(() =>
      getDoc(doc(this.firestore, 'chats', chatId, 'messages', messageId))
    );

    const deleteMessage$ = messageDoc$.pipe(
      switchMap((messageSnap) => {
        if (!messageSnap.exists()) {
          return throwError(() => 'Message not found.');
        }

        const messageData = messageSnap.data() as Message;
        if (messageData.authorEmail !== authorEmail) {
          return throwError(() => 'You can only delete your own messages.');
        }

        return deleteDoc(messageSnap.ref);
      })
    );

    const messagesQuery = query(
      collection(this.firestore, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const updateChat$ = defer(() => getDocs(messagesQuery)).pipe(
      switchMap((messagesSnap) => {
        if (messagesSnap.empty) {
          return updateDoc(doc(this.firestore, 'chats', chatId), {
            lastMessage: null,
            lastMessageTimestamp: null,
          });
        }

        const newestMessage = messagesSnap.docs[0].data() as Message;

        return updateDoc(doc(this.firestore, 'chats', chatId), {
          lastMessage: newestMessage.content,
          lastMessageTimestamp: newestMessage.timestamp,
        });
      })
    );

    return forkJoin([deleteMessage$, updateChat$]);
  }
}
