import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AUTH, FIRESTORE } from '@app/app.config';
import { Credentials } from '@app/shared/interfaces/credentials';
import { UserDetails } from '@app/shared/interfaces/user';
import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { collection, limit, query, where } from 'firebase/firestore';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import {
  EMPTY,
  Observable,
  defer,
  filter,
  from,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import { FIREBASE_ERROR_TOAST_HANDLER } from '../utils/handle-firebase-error';

export type AuthUser = User | null | undefined;

interface AuthServiceState {
  authUser: AuthUser | null;
  userDetails: UserDetails | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(AUTH);
  private firestore = inject(FIRESTORE);
  private handleFirebaseError = inject(FIREBASE_ERROR_TOAST_HANDLER);

  // state
  private state = signal<AuthServiceState>({
    authUser: null,
    userDetails: null,
  });

  // sources
  private authUser$ = authState(this.auth).pipe(shareReplay(1));

  public userDetails$ = this.authUser$.pipe(
    switchMap((userAuth) => this.getUserDetails(userAuth)),
    filter((user) => user != null),
    shareReplay(1),
    this.handleFirebaseError()
  );

  // selectors
  authUser = computed(() => this.state().authUser);
  userDetails = computed(() => this.state().userDetails);

  constructor() {
    // reducers
    this.authUser$
      .pipe(takeUntilDestroyed(), this.handleFirebaseError())
      .subscribe((authUser) =>
        this.state.update((state) => ({ ...state, authUser }))
      );

    this.userDetails$
      .pipe(takeUntilDestroyed(), this.handleFirebaseError())
      .subscribe((userDetails) =>
        this.state.update((state) => ({ ...state, userDetails }))
      );
  }

  login(credentials: Credentials): Observable<UserCredential> {
    return from(
      defer(() =>
        signInWithEmailAndPassword(
          this.auth,
          credentials.email,
          credentials.password
        )
      )
    );
  }

  logout(): void {
    signOut(this.auth);
  }

  createAccount(credentials: Credentials): Observable<UserCredential> {
    return from(
      defer(() =>
        createUserWithEmailAndPassword(
          this.auth,
          credentials.email,
          credentials.password
        )
      )
    );
  }

  private getUserDetails(user: AuthUser): Observable<UserDetails> {
    if (!user?.email) {
      return EMPTY;
    }

    const userCollection = query(
      collection(this.firestore, 'users'),
      where('email', '==', user.email),
      limit(1)
    );

    return collectionData(userCollection).pipe(
      map((values) => values.find(Boolean))
    ) as Observable<UserDetails>;
  }
}
