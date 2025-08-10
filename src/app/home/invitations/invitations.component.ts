import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { InvitationsService } from '@app/home/data-access/invitations.service';
import { InvitationListItemComponent } from '@app/home/invitations/ui/invitation-list-item/invitation-list-item.component';
import { InvitationsSectionComponent } from '@app/home/invitations/ui/invitations-section/invitations-section.component';
import { Invitation } from '@app/shared/interfaces/invitation';
import { ButtonComponent } from '@app/shared/ui/button/button.component';

@Component({
  standalone: true,
  styleUrl: './invitations.component.scss',
  template: `
    <div class="invitations-page">
      <h2>Invitations</h2>
      <div class="invitations-container">
        <app-invitations-section title="Received Invitations">
          <div class="invitations-list">
            @for(invitation of invitationsService.receivedInvitations(); track
            invitation.email) {
            <app-invitation-list-item [invitation]="invitation">
              <app-button
                color="primary"
                (click)="invitationsService.acceptInvitation$.next(invitation)"
              >
                Accept
              </app-button>

              <app-button
                color="secondary"
                (click)="invitationsService.declineInvitation$.next(invitation)"
              >
                Decline
              </app-button>
            </app-invitation-list-item>
            }
          </div>
        </app-invitations-section>

        <app-invitations-section title="Sent Invitations">
          <div class="invitations-list">
            @for(invitation of invitationsService.sentInvitations(); track
            invitation.email) {
            <app-invitation-list-item [invitation]="invitation">
              <app-button
                color="primary"
                (click)="invitationsService.cancelInvitation$.next(invitation)"
              >
                Cancel
              </app-button>
            </app-invitation-list-item>
            }
          </div>
        </app-invitations-section>
      </div>
    </div>
  `,
  imports: [
    InvitationsSectionComponent,
    InvitationListItemComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InvitationsComponent {
  invitationsService = inject(InvitationsService);

  accept = output<Invitation>();
  decline = output<Invitation>();
  cancel = output<Invitation>();
}
