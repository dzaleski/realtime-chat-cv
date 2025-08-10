import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-invitations-section',
  styleUrl: './invitations-section.component.scss',
  template: `
    <div class="invitations-section">
      <h3>{{ title() }}</h3>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationsSectionComponent {
  title = input.required<string>();
}
