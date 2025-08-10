import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FIRESTORE } from '@app/app.config';
import { InvitationsService } from '@app/home/data-access/invitations.service';
import { AuthService } from '@app/shared/data-access/auth.service';
import {
  Invitation,
  InvitationStatus,
} from '@app/shared/interfaces/invitation';
import { SearchResultUser, UserDetails } from '@app/shared/interfaces/user';
import { FIREBASE_ERROR_TOAST_HANDLER } from '@app/shared/utils/handle-firebase-error';
import {
  collection,
  endBefore,
  getCountFromServer,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  Observable,
  Subject,
  combineLatest,
  defer,
  map,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs';

interface PeopleServiceState {
  people: SearchResultUser[];
  loading: boolean;
  firstEmail: string | null;
  lastEmail: string | null;
  numberOfPages: number;
  currentPage: number;
}

@Injectable({ providedIn: 'any' })
export class PeopleService {
  private firestore = inject(FIRESTORE);
  private authService = inject(AuthService);
  private invitationsService = inject(InvitationsService);
  private handleFirebaseError = inject(FIREBASE_ERROR_TOAST_HANDLER);
  private pageSize: number = 4;

  // state
  private state = signal<PeopleServiceState>({
    people: [],
    loading: false,
    firstEmail: null,
    lastEmail: null,
    numberOfPages: 1,
    currentPage: 1,
  });

  // sources
  public search$ = new Subject<string>();
  private incrementPage$ = new Subject<void>();
  private decrementPage$ = new Subject<void>();
  public pagination$ = new Subject<{
    startAfterEmail: string | null;
    endBeforeEmail: string | null;
  }>();

  private peopleCount$ = this.search$.pipe(
    withLatestFrom(this.authService.userDetails$),
    switchMap(([searchNeedle, user]) =>
      defer(() =>
        getCountFromServer(
          query(
            collection(this.firestore, 'users'),
            where('email', '!=', user.email),
            where('email', '>=', searchNeedle),
            where('email', '<=', searchNeedle + '\uf8ff')
          )
        )
      ).pipe(
        map((snapshot) => snapshot.data().count),
        this.handleFirebaseError()
      )
    )
  );

  private people$ = combineLatest([
    this.authService.userDetails$,
    this.search$,
    this.pagination$.pipe(
      startWith({ endBeforeEmail: null, startAfterEmail: null })
    ),
    this.invitationsService.sentInvitations$,
    this.invitationsService.receivedInvitations$,
  ]).pipe(
    switchMap(
      ([
        userDetails,
        searchNeedle,
        { startAfterEmail, endBeforeEmail },
        sentInvitations,
        receivedInvitations,
      ]) =>
        this.searchUsers(
          userDetails.email,
          searchNeedle,
          endBeforeEmail,
          startAfterEmail
        ).pipe(
          map((usersToInvite) =>
            usersToInvite.map<SearchResultUser>((user) => ({
              ...user,
              inviteStatus: this.getSentInvitationStatus(
                user,
                sentInvitations,
                receivedInvitations
              ),
            }))
          ),
          map((people) => ({
            people,
            firstEmail: people.at(0)?.email ?? null,
            lastEmail: people.at(-1)?.email ?? null,
          })),
          this.handleFirebaseError()
        )
    )
  );

  // selectors
  people = computed(() => this.state().people);
  loading = computed(() => this.state().loading);
  lastEmail = computed(() => this.state().lastEmail);
  firstEmail = computed(() => this.state().firstEmail);
  numberOfPages = computed(() => this.state().numberOfPages);
  currentPage = computed(() => this.state().currentPage);

  constructor() {
    // reducers
    this.people$
      .pipe(takeUntilDestroyed())
      .subscribe(({ people, firstEmail, lastEmail }) =>
        this.state.update((state) => ({
          ...state,
          people,
          firstEmail,
          lastEmail,
          loading: false,
        }))
      );

    this.peopleCount$.pipe(takeUntilDestroyed()).subscribe((peopleCount) =>
      this.state.update((state) => ({
        ...state,
        numberOfPages: Math.max(Math.ceil(peopleCount / this.pageSize), 1),
      }))
    );

    this.search$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        error: null,
        lastEmail: null,
        firstEmail: null,
        loading: true,
        currentPage: 1,
      }))
    );

    this.incrementPage$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        currentPage: Math.min(state.currentPage + 1, state.numberOfPages),
      }))
    );

    this.decrementPage$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        currentPage: Math.max(state.currentPage - 1, 1),
      }))
    );
  }

  private searchUsers(
    loggedUserEmail: string,
    searchNeedle: string,
    endBeforeEmail: string | null,
    startAfterEmail: string | null
  ): Observable<SearchResultUser[]> {
    let usersQuery = query(
      collection(this.firestore, 'users'),
      where('email', '!=', loggedUserEmail),
      where('email', '>=', searchNeedle),
      where('email', '<=', searchNeedle + '\uf8ff'),
      orderBy('email', 'desc')
    );

    if (!endBeforeEmail && !startAfterEmail) {
      usersQuery = query(usersQuery, limit(this.pageSize));
    } else if (endBeforeEmail) {
      usersQuery = query(
        usersQuery,
        endBefore(endBeforeEmail),
        limitToLast(this.pageSize)
      );
      this.decrementPage$.next();
    } else if (startAfterEmail) {
      usersQuery = query(
        usersQuery,
        startAfter(startAfterEmail),
        limit(this.pageSize)
      );
      this.incrementPage$.next();
    }

    return collectionData(usersQuery) as Observable<UserDetails[]>;
  }

  private getSentInvitationStatus(
    user: UserDetails,
    sentInvitations: Invitation[],
    receivedInvitations: Invitation[]
  ): InvitationStatus | undefined {
    return [...receivedInvitations, ...sentInvitations].find(
      (invitation) => invitation.email === user.email
    )?.status;
  }
}
