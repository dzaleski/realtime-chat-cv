import { computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  delay,
  filter,
  map,
  mergeMap,
  of,
  shareReplay,
  Subject,
  takeUntil,
} from 'rxjs';
import { generateId } from '../utils/generate-id';

interface ToastMessage {
  id: string;
  message: string;
}

export interface ToastServiceState {
  toasts: ToastMessage[];
}

@Injectable({
  providedIn: 'root',
})
export class ErrorToastService {
  private readonly toastVisibleInSeconds = 5;

  // state
  state = signal<ToastServiceState>({ toasts: [] });

  // selectors
  toasts = computed(() => this.state().toasts);

  // sources
  public appendToast$ = new Subject<string>();
  public removeToast$ = new Subject<ToastMessage['id']>();

  private showToast$ = this.appendToast$.pipe(
    map<string, ToastMessage>((content) => ({
      id: generateId(),
      message: content,
    })),
    shareReplay(1)
  );

  private hideToastAfterTime$ = this.showToast$.pipe(
    map((toast) => toast.id),
    mergeMap((toastId) =>
      of(toastId).pipe(
        delay(this.toastVisibleInSeconds * 1000),
        takeUntil(
          // If removeToast emits first, no more waiting - prevents duplicate toasts update
          this.removeToast$.pipe(filter((emittedId) => emittedId === toastId))
        )
      )
    )
  );

  constructor() {
    // reducers
    this.showToast$.pipe(takeUntilDestroyed()).subscribe((newToast) =>
      this.state.update((state) => ({
        ...state,
        toasts: [...state.toasts, newToast],
      }))
    );

    this.removeToast$.pipe(takeUntilDestroyed()).subscribe((toastId) =>
      this.state.update((state) => ({
        ...state,
        toasts: state.toasts.filter((x) => x.id !== toastId),
      }))
    );

    this.hideToastAfterTime$.pipe(takeUntilDestroyed()).subscribe((toastId) =>
      this.state.update((state) => ({
        ...state,
        toasts: state.toasts.filter((x) => x.id !== toastId),
      }))
    );
  }
}
