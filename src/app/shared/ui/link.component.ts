import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-link',
  styles: `
   @import 'variables';

   .link {
      display: block;
      margin-top: 20px;
      color: $secondary-color;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s;
      cursor: pointer;

      &:visited {
         color: darken($secondary-color, 15%);
      }

      &:hover {
         color: lighten($secondary-color, 15%);
      }
   }
  `,
  template: `
    <a class="link" [routerLink]="routerLink()"><ng-content></ng-content></a>
  `,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  routerLink = input.required<string>();
}
