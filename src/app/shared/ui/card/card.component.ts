import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-card',
  styles: `
    @import "variables";

    .card {
      width: 400px;
      background-color: white;
      padding: 40px;
      border: 1px solid $border-color;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `,
  template: `
    <div class="card">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {}
