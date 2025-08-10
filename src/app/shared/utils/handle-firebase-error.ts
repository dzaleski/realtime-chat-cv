import { inject, InjectionToken } from '@angular/core';
import { ErrorToastService } from '@app/shared/data-access/toast.service';
import { FirebaseError } from 'firebase/app';
import { catchError, EMPTY, Observable, OperatorFunction } from 'rxjs';

export const FIREBASE_ERROR_TOAST_HANDLER = new InjectionToken(
  'Operator function that handles Firebase errors by emitting them to the toast service',
  {
    providedIn: 'root',
    factory: () => {
      const errorToastService = inject(ErrorToastService);
      return <T>() => handleFirebaseError<T>(errorToastService);
    },
  }
);

function handleFirebaseError<T>(
  errorToastService: ErrorToastService
): OperatorFunction<T, T> {
  return (source: Observable<T>): Observable<T> => {
    return source.pipe(
      catchError((error: FirebaseError | string) => {
        if (typeof error === 'string') {
          errorToastService.appendToast$.next(error);
        } else if (error instanceof FirebaseError) {
          errorToastService.appendToast$.next(error.message);
        }
        return EMPTY;
      })
    );
  };
}
