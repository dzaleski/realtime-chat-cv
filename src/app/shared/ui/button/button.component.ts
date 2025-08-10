import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-button',
  styleUrl: './button.component.scss',
  template: `
    <button
      class="button"
      [class.loading]="loading()"
      [class.secondary]="color() === 'secondary'"
      [disabled]="disabled() || loading()"
      [type]="type()"
    >
      @if(loading()) {
      <div class="spinner"></div>
      } @else {
      <ng-content class="content"></ng-content>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  disabled = input<boolean>(false);
  color = input<'primary' | 'secondary'>('primary');
  type = input<'submit' | 'button'>('button');
  loading = input<boolean>(false);
}
