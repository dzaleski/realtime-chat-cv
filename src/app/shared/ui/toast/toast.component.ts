import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorToastService } from '@app/shared/data-access/toast.service';

@Component({
  standalone: true,
  selector: 'app-toast',
  styleUrl: './toast.component.scss',
  template: `
    @for(toast of toastService.toasts(); track toast.id; let i = $index) {
    <div
      class="toast"
      [@toastAnimation]="i"
      [style.top.px]="60 * (toastService.toasts().length - (i + 1))"
    >
      <div class="toast-body">
        {{ toast.message }}
        <button
          class="close"
          (click)="toastService.removeToast$.next(toast.id)"
        >
          <i class="fa fa-close"></i>
        </button>
      </div>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastAnimation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition(':enter', [
        animate(
          '0.5s ease-in-out',
          keyframes([
            style({ opacity: 0, offset: 0 }),
            style({ opacity: 1, offset: 1 }),
          ])
        ),
      ]),
      transition(':leave', [
        animate(
          '0.5s ease-in-out',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({ opacity: 0, transform: 'translateY(20%)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class ToastComponent {
  toastService = inject(ErrorToastService);
}
