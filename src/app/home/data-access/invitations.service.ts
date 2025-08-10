import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FIRESTORE } from '@app/app.config';
import { AuthService } from '@app/shared/data-access/auth.service';
import {
  Invitation,
  InvitationStatus,
  SendInvitation,
} from '@app/shared/interfaces/invitation';
import { UserDetails } from '@app/shared/interfaces/user';
import { FIREBASE_ERROR_TOAST_HANDLER } from '@src/app/shared/utils/handle-firebase-error';
import {
  collection,
  doc,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  Subject,
  defer,
  map,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';

interface InvitationsServiceState {
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
  loading: boolean;
}

@Injectable({
  providedIn: 'any',
})
export class InvitationsService {
  private firestore = inject(FIRESTORE);
  private authService = inject(AuthService);
  private handleFirebaseError = inject(FIREBASE_ERROR_TOAST_HANDLER);

  // state
  private state = signal<InvitationsServiceState>({
    sentInvitations: [],
    receivedInvitations: [],
    loading: true,
  });

  // selectors
  public sentInvitations = computed(() =>
    this.state().sentInvitations.filter(
      (invitation) => invitation.status !== 'accepted'
    )
  );
  public receivedInvitations = computed(() =>
    this.state().receivedInvitations.filter(
      (invitation) => invitation.status !== 'accepted'
    )
  );
  public loading = computed(() => this.state().loading);

  // sources
  public sendInvitation$ = new Subject<UserDetails>();
  public acceptInvitation$ = new Subject<Invitation>();
  public declineInvitation$ = new Subject<Invitation>();
  public cancelInvitation$ = new Subject<Invitation>();

  private invitationAccepted$ = this.acceptInvitation$.pipe(
    withLatestFrom(this.authService.userDetails$),
    switchMap(([invitation, loggedUser]) =>
      this.acceptInvitation(loggedUser, invitation).pipe(
        this.handleFirebaseError()
      )
    )
  );

  private invitationCanceled$ = this.cancelInvitation$.pipe(
    withLatestFrom(this.authService.userDetails$),
    switchMap(([invitation, loggedUser]) =>
      this.cancelInvitation(loggedUser, invitation).pipe(
        this.handleFirebaseError()
      )
    )
  );

  private invitationDeclined$ = this.declineInvitation$.pipe(
    withLatestFrom(this.authService.userDetails$),
    switchMap(([invitation, loggedUser]) =>
      this.declineInvitation(loggedUser, invitation).pipe(
        this.handleFirebaseError()
      )
    )
  );

  private createInvitation$ = this.sendInvitation$.pipe(
    withLatestFrom(this.authService.userDetails$),
    switchMap(([toUser, fromUser]) =>
      this.sendInvitation(fromUser, toUser).pipe(this.handleFirebaseError())
    )
  );

  public sentInvitations$ = this.authService.userDetails$.pipe(
    switchMap(({ email }) =>
      collectionData(
        query(collection(this.firestore, 'users', email, 'sentInvitations'))
      ).pipe(
        map((value) => value as Invitation[]),
        this.handleFirebaseError()
      )
    ),
    shareReplay(1)
  );

  public receivedInvitations$ = this.authService.userDetails$.pipe(
    switchMap(({ email }) =>
      collectionData(
        query(collection(this.firestore, 'users', email, 'receivedInvitations'))
      ).pipe(
        map((value) => value as Invitation[]),
        this.handleFirebaseError()
      )
    ),
    shareReplay(1)
  );

  private cancelInvitation(loggedUser: UserDetails, invitation: Invitation) {
    const batch = writeBatch(this.firestore);

    const receivedInvitationRef = doc(
      collection(this.firestore, 'users', loggedUser.email, 'sentInvitations'),

      invitation.email
    );
    batch.delete(receivedInvitationRef);

    const sentInvitationRef = doc(
      collection(
        this.firestore,
        'users',
        invitation.email,
        'receivedInvitations'
      ),
      loggedUser.email
    );
    batch.delete(sentInvitationRef);

    return defer(() => batch.commit());
  }

  private acceptInvitation(loggedUser: UserDetails, invitation: Invitation) {
    const batch = writeBatch(this.firestore);

    batch.update(
      doc(
        collection(
          this.firestore,
          'users',
          loggedUser.email,
          'receivedInvitations'
        ),
        invitation.email
      ),
      { status: 'accepted' satisfies InvitationStatus }
    );

    batch.update(
      doc(
        collection(
          this.firestore,
          'users',
          invitation.email,
          'sentInvitations'
        ),
        loggedUser.email
      ),
      { status: 'accepted' satisfies InvitationStatus }
    );

    const userFromInvitation: UserDetails = {
      email: invitation.email,
      username: invitation.username,
      avatarUrl: invitation.avatarUrl,
    };

    batch.set(
      doc(
        collection(this.firestore, 'users', loggedUser.email, 'friends'),
        invitation.email
      ),
      userFromInvitation
    );

    batch.set(
      doc(
        collection(this.firestore, 'users', invitation.email, 'friends'),
        loggedUser.email
      ),
      loggedUser
    );

    const greetingMessage = 'Hi, i just accepted your invitation 😄';

    const chatRef = doc(
      collection(this.firestore, 'chats'),
      `${loggedUser.email}_${userFromInvitation.email}`
    );

    batch.set(chatRef, {
      users: [loggedUser, userFromInvitation],
      lastMessage: greetingMessage,
      lastMessageTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    const messageRef = doc(collection(chatRef, 'messages'));
    batch.set(messageRef, {
      authorEmail: loggedUser.email,
      content: greetingMessage,
      timestamp: serverTimestamp(),
    });

    return defer(() => batch.commit());
  }

  private declineInvitation(loggedUser: UserDetails, invitation: Invitation) {
    const batch = writeBatch(this.firestore);

    batch.delete(
      doc(
        collection(
          this.firestore,
          'users',
          loggedUser.email,
          'receivedInvitations'
        ),
        invitation.email
      )
    );

    batch.delete(
      doc(
        collection(
          this.firestore,
          'users',
          invitation.email,
          'sentInvitations'
        ),
        loggedUser.email
      )
    );

    return defer(() => batch.commit());
  }

  private sendInvitation(fromUser: UserDetails, toUser: UserDetails) {
    const batch = writeBatch(this.firestore);

    const fromInvitation: SendInvitation = {
      username: fromUser.username,
      email: fromUser.email,
      avatarUrl: fromUser.avatarUrl,
      timestamp: serverTimestamp(),
      status: 'pending',
    };

    const toInvitation: SendInvitation = {
      username: toUser.username,
      email: toUser.email,
      avatarUrl: toUser.avatarUrl,
      timestamp: serverTimestamp(),
      status: 'pending',
    };

    batch.set(
      doc(
        collection(this.firestore, 'users', fromUser.email, 'sentInvitations'),
        toInvitation.email
      ),
      toInvitation
    );

    batch.set(
      doc(
        collection(
          this.firestore,
          'users',
          toUser.email,
          'receivedInvitations'
        ),
        fromInvitation.email
      ),
      fromInvitation
    );

    return defer(() => batch.commit());
  }

  constructor() {
    // reducers
    this.receivedInvitations$
      .pipe(takeUntilDestroyed())
      .subscribe((receivedInvitations) =>
        this.state.update((state) => ({
          ...state,
          receivedInvitations,
          loading: false,
        }))
      );

    this.sentInvitations$
      .pipe(takeUntilDestroyed())
      .subscribe((sentInvitations) =>
        this.state.update((state) => ({
          ...state,
          sentInvitations,
          loading: false,
        }))
      );

    this.createInvitation$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, loading: false }))
      );

    this.acceptInvitation$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, loading: true }))
      );

    this.invitationAccepted$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, loading: false }))
      );

    this.declineInvitation$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, loading: true }))
      );

    this.invitationDeclined$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, loading: false }))
      );

    this.cancelInvitation$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, loading: true }))
      );

    this.invitationCanceled$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, loading: false }))
      );
  }
}
