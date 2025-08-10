import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@app/shared/data-access/auth.service';
import { Credentials } from '@app/shared/interfaces/credentials';
import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';

export type LoginStatus = 'pending' | 'authenticating' | 'success';

interface LoginServiceState {
  status: LoginStatus;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private authService = inject(AuthService);

  // sources
  public login$ = new Subject<Credentials>();
  private errorCode$ = new Subject<string>();
  private loggedIn$ = this.login$.pipe(
    switchMap((credentials) =>
      this.authService.login(credentials).pipe(
        catchError((error: FirebaseError) => {
          this.errorCode$.next(error.code);
          return EMPTY;
        })
      )
    )
  );

  // state
  private state = signal<LoginServiceState>({ status: 'pending', error: null });

  // selectors
  public status = computed(() => this.state().status);
  public error = computed(() => this.state().error);

  constructor() {
    // reducers
    this.login$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        status: 'authenticating',
        error: null,
      }))
    );

    this.loggedIn$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        status: 'success',
        error: null,
      }))
    );

    this.errorCode$.pipe(takeUntilDestroyed()).subscribe((errorCode) =>
      this.state.update((state) => ({
        ...state,
        status: 'pending',
        error: this.mapErrorCodeToMessage(errorCode),
      }))
    );
  }

  private mapErrorCodeToMessage(errorCode: string): string {
    if (errorCode === AuthErrorCodes.INVALID_EMAIL) {
      return 'Account with provided email does not exist.';
    }
    return 'Could not log in with those credentials.';
  }
}
