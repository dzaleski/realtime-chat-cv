import {
  ApplicationConfig,
  inject,
  InjectionToken,
  NgZone,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { routes } from '@app/app.routes';
import { FormErrorMessages } from '@app/shared/interfaces/input-error';
import { environment } from '@src/environments/environment.development';
import { initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from 'firebase/firestore';

initializeApp(environment.firebase);

export const AUTH = new InjectionToken('Firebase auth', {
  providedIn: 'root',
  factory: () => {
    const ngZone = inject(NgZone);
    let auth!: Auth;

    ngZone.runOutsideAngular(() => {
      auth = getAuth();

      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
      }
    });

    return auth;
  },
});

export const FIRESTORE = new InjectionToken('Firebase firestore', {
  providedIn: 'root',
  factory: () => {
    const ngZone = inject(NgZone);
    let firestore!: Firestore;

    ngZone.runOutsideAngular(() => {
      firestore = getFirestore();

      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
    });

    return firestore;
  },
});

export const FORM_ERRORS = new InjectionToken('Form error messages', {
  providedIn: 'root',
  factory: (): FormErrorMessages => ({
    required: () => 'This field is required',
    minlength: ({ requiredLength, actualLength }) =>
      `Minimum length is ${requiredLength} characters. You entered ${actualLength} characters.`,
    maxlength: ({ requiredLength, actualLength }) =>
      `Maximum length is ${requiredLength} characters. You entered ${actualLength} characters.`,
    email: () => 'Please enter a valid email address.',
    pattern: ({ requiredPattern, actualValue }) =>
      `The value ${actualValue} does not match the required pattern: ${requiredPattern}.`,
    min: ({ min, actual }) =>
      `The minimum value is ${min}. You entered ${actual}.`,
    max: ({ max, actual }) =>
      `The maximum value is ${max}. You entered ${actual}.`,
  }),
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideExperimentalZonelessChangeDetection(),
  ],
};
