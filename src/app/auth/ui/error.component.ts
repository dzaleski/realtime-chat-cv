import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-error',
  styles: `
    @keyframes fadeIn {
      0% {
        opacity: 0;
        transform: translateY(-10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error {
      color: rgb(255, 74, 74);
      font-size: 14px;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 20px;
      padding: 10px;
      border: 1px solid rgb(255, 74, 74);
      background-color: lighten(rgb(255, 74, 74), 33%);
      border-radius: 5px;
      animation: fadeIn 0.5s ease-in-out;
    }
  `,
  template: ` @if (!!text()) {
    <div class="error">{{ text() }}</div>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  public text = input.required<string | null>();
}
