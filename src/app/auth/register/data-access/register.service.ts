import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FIRESTORE } from '@app/app.config';
import { AuthService } from '@app/shared/data-access/auth.service';
import { RegisterUser } from '@app/shared/interfaces/user';
import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { EMPTY, Subject, catchError, defer, switchMap } from 'rxjs';

export type RegisterStatus = 'pending' | 'creating' | 'success';

interface RegisterServiceState {
  status: RegisterStatus;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private authService = inject(AuthService);
  private firestore = inject(FIRESTORE);

  // sources
  public createAccount$ = new Subject<RegisterUser>();
  private errorCode$ = new Subject<string>();

  private accountCreated$ = this.createAccount$.pipe(
    switchMap(({ password, email, username, ...restData }) =>
      this.authService.createAccount({ password, email }).pipe(
        switchMap(() =>
          this.createUser({
            ...restData,
            email,
            username,
          })
        ),
        catchError((error: FirebaseError) => {
          this.errorCode$.next(error.code);
          return EMPTY;
        })
      )
    )
  );

  // state
  private state = signal<RegisterServiceState>({
    status: 'pending',
    error: null,
  });

  // selectors
  public status = computed(() => this.state().status);
  public error = computed(() => this.state().error);

  constructor() {
    // reducers
    this.createAccount$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, status: 'creating' }))
      );

    this.accountCreated$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.state.update((state) => ({ ...state, status: 'success' }))
      );

    this.errorCode$.pipe(takeUntilDestroyed()).subscribe((errorCode) =>
      this.state.update((state) => ({
        ...state,
        status: 'pending',
        error: this.mapErrorCodeToMessage(errorCode),
      }))
    );
  }

  public createUser(registerUser: Omit<RegisterUser, 'password'>) {
    if (!registerUser) {
      return EMPTY;
    }

    return defer(() =>
      setDoc(
        doc(collection(this.firestore, 'users'), registerUser.email),
        registerUser
      )
    );
  }

  private mapErrorCodeToMessage(errorCode: string): string {
    if (errorCode === AuthErrorCodes.EMAIL_EXISTS) {
      return 'Provided email is already taken.';
    }
    if (errorCode === AuthErrorCodes.INVALID_EMAIL) {
      return 'Provided email is invalid.';
    }
    if (errorCode === AuthErrorCodes.WEAK_PASSWORD) {
      return 'Password should be at least 6 characters';
    }
    return 'Could not register with those details.';
  }
}
