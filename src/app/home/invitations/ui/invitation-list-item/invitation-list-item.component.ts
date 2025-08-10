import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Invitation } from '@app/shared/interfaces/invitation';

@Component({
  standalone: true,
  selector: 'app-invitation-list-item',
  styleUrl: './invitation-list-item.component.scss',
  template: `
    <div class="invitation-avatar">
      <img
        [src]="invitation().avatarUrl"
        [alt]="invitation().username + ' avatar'"
      />
    </div>
    <div class="invitation-info">
      <div class="invitation-name">
        {{ invitation().username }}
        <span class="invitation-email">({{ invitation().email }})</span>
      </div>
    </div>
    <div class="invitation-actions">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationListItemComponent {
  invitation = input.required<Invitation>();
}
